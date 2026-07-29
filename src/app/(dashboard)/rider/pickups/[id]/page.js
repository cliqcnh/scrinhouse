"use client";
import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { db, storage } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import styles from '../../Rider.module.css';

export default function PickupDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);

  // OTP
  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  // Signature
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Proof photo
  const [proofUrl, setProofUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function fetch() {
      const snap = await getDoc(doc(db, 'pickups', id));
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setPickup(data);
        setOtpVerified(data.otpVerified || false);
        setProofUrl(data.proofPhoto || '');
      }
      setLoading(false);
    }
    fetch();
  }, [id]);

  // OTP handlers
  function handleOtpChange(idx, val) {
    if (val.length > 1) val = val.slice(-1);
    const next = [...otp]; next[idx] = val; setOtp(next);
    if (val && idx < 3) otpRefs[idx + 1].current?.focus();
  }

  async function verifyOtp() {
    const code = otp.join('');
    if (code.length !== 4) { setOtpError('Enter all 4 digits'); return; }
    if (code === (pickup.otpCode || '1234')) {
      setOtpVerified(true); setOtpError('');
      await updateDoc(doc(db, 'pickups', id), { otpVerified: true });
    } else {
      setOtpError('Invalid OTP code. Try again.');
    }
  }

  // Signature canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = 200 * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#111';
  }, [pickup]);

  function getPos(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches?.[0];
    const clientX = touch ? touch.clientX : e.clientX;
    const clientY = touch ? touch.clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function startDraw(e) {
    e.preventDefault();
    setIsDrawing(true); setHasSignature(true);
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y); ctx.stroke();
  }

  function endDraw() { setIsDrawing(false); }

  function clearSignature() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  }

  // Proof photo
  async function handleProofUpload(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const storageRef = ref(storage, `pickups/${id}/proof_${Date.now()}.jpg`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    setProofUrl(url);
    await updateDoc(doc(db, 'pickups', id), { proofPhoto: url });
    setUploading(false);
  }

  // Navigate to Google Maps
  function openNavigation() {
    if (!pickup?.address) return;
    const encoded = encodeURIComponent(pickup.address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}`, '_blank');
  }

  // Complete pickup
  async function completePickup() {
    if (!otpVerified) { alert('Please verify OTP first'); return; }

    let signatureUrl = '';
    if (hasSignature && canvasRef.current) {
      const blob = await new Promise(resolve => canvasRef.current.toBlob(resolve, 'image/png'));
      const storageRef = ref(storage, `pickups/${id}/signature_${Date.now()}.png`);
      await uploadBytes(storageRef, blob);
      signatureUrl = await getDownloadURL(storageRef);
    }

    await updateDoc(doc(db, 'pickups', id), {
      status: 'completed',
      completedAt: serverTimestamp(),
      signatureUrl,
      proofPhoto: proofUrl,
    });
    setPickup(prev => ({ ...prev, status: 'completed' }));
  }

  // Start transit
  async function startTransit() {
    await updateDoc(doc(db, 'pickups', id), { status: 'in_transit', startedAt: serverTimestamp() });
    setPickup(prev => ({ ...prev, status: 'in_transit' }));
  }

  if (loading) return <div className={styles.loadingScreen}><div className={styles.loadingSpinner} /><p>Loading…</p></div>;
  if (!pickup) return <div className={styles.card}><div className={styles.emptyState}><div className={styles.emptyIcon}>❌</div><p className={styles.emptyTitle}>Pickup not found</p><button className={styles.btnPrimary} onClick={() => router.push('/rider/pickups')}>Back</button></div></div>;

  const isCompleted = pickup.status === 'completed';

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <button className={styles.btnOutline} onClick={() => router.push('/rider/pickups')} style={{ marginBottom: '0.75rem', padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}>← Back</button>
          <h1 className={styles.pageTitle}>Pickup — {pickup.customerName || 'Customer'}</h1>
          <p className={styles.pageSubtitle}>{pickup.address || 'Address pending'}</p>
        </div>
        <span className={`${styles.badge} ${isCompleted ? '' : styles.badgeOrange}`} style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
          {(pickup.status || 'pending').replace('_', ' ')}
        </span>
      </div>

      {/* Customer & Device Info */}
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Details</h2>
        <div className={styles.formGrid}>
          <div><span style={{ color: '#9CA3AF', fontSize: '0.75rem', display: 'block' }}>Customer</span>{pickup.customerName || 'N/A'}</div>
          <div><span style={{ color: '#9CA3AF', fontSize: '0.75rem', display: 'block' }}>Phone</span><a href={`tel:${pickup.customerPhone}`} style={{ color: '#F97316', fontWeight: 600 }}>{pickup.customerPhone || 'N/A'}</a></div>
          <div><span style={{ color: '#9CA3AF', fontSize: '0.75rem', display: 'block' }}>Device</span>{pickup.deviceInfo || 'N/A'}</div>
          <div><span style={{ color: '#9CA3AF', fontSize: '0.75rem', display: 'block' }}>Scheduled</span>{pickup.scheduledTime?.toDate ? pickup.scheduledTime.toDate().toLocaleString() : 'ASAP'}</div>
        </div>
      </div>

      {/* GPS Navigation */}
      {!isCompleted && (
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>🗺️ Navigation</h2>
          <button className={styles.btnPrimary} onClick={openNavigation} style={{ width: '100%' }}>
            📍 Open in Google Maps
          </button>
          {pickup.address && <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#6B7280' }}>{pickup.address}</p>}
        </div>
      )}

      {/* Start Transit */}
      {!isCompleted && pickup.status === 'pending' && (
        <button className={styles.btnPrimary} onClick={startTransit} style={{ width: '100%', marginBottom: '1.5rem', padding: '0.875rem' }}>
          🏍️ Start Pickup
        </button>
      )}

      {/* OTP Verification */}
      {!isCompleted && pickup.status === 'in_transit' && (
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>🔐 OTP Verification</h2>
          {otpVerified ? (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#16A34A', fontWeight: 700 }}>✅ OTP Verified</div>
          ) : (
            <>
              <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1rem' }}>Enter the 4-digit OTP from the customer</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                {otp.map((digit, i) => (
                  <input key={i} ref={otpRefs[i]} className={styles.otpInput} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={e => handleOtpChange(i, e.target.value)} />
                ))}
              </div>
              {otpError && <p style={{ textAlign: 'center', color: '#EF4444', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{otpError}</p>}
              <button className={styles.btnPrimary} onClick={verifyOtp} style={{ width: '100%' }}>Verify OTP</button>
            </>
          )}
        </div>
      )}

      {/* Customer Signature */}
      {!isCompleted && pickup.status === 'in_transit' && otpVerified && (
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>✍️ Customer Signature</h2>
          <canvas
            ref={canvasRef}
            className={styles.signatureCanvas}
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
          />
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button className={styles.btnOutline} onClick={clearSignature} style={{ flex: 1 }}>Clear</button>
          </div>
        </div>
      )}

      {/* Proof Photo */}
      {!isCompleted && pickup.status === 'in_transit' && otpVerified && (
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>📸 Proof of Pickup</h2>
          {proofUrl ? (
            <img src={proofUrl} alt="Proof" className={styles.proofPhoto} />
          ) : (
            <label className={styles.btnOutline} style={{ width: '100%', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
              <input type="file" accept="image/*" capture="environment" onChange={handleProofUpload} style={{ display: 'none' }} />
              {uploading ? 'Uploading…' : '📷 Take Photo'}
            </label>
          )}
        </div>
      )}

      {/* Complete */}
      {!isCompleted && pickup.status === 'in_transit' && otpVerified && (
        <button className={styles.btnSuccess} onClick={completePickup} style={{ width: '100%', padding: '0.875rem', marginBottom: '2rem' }}>
          ✅ Complete Pickup
        </button>
      )}

      {isCompleted && (
        <div className={styles.card} style={{ textAlign: 'center', backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
          <h2 style={{ color: '#065F46' }}>Pickup Complete</h2>
        </div>
      )}
    </div>
  );
}

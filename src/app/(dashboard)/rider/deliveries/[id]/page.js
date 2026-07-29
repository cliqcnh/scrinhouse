"use client";
import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { db, storage } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import styles from '../../Rider.module.css';

export default function DeliveryDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [delivery, setDelivery] = useState(null);
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

  // Proof & Cash
  const [proofUrl, setProofUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [cashConfirmed, setCashConfirmed] = useState(false);

  useEffect(() => {
    async function fetch() {
      const snap = await getDoc(doc(db, 'deliveries', id));
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setDelivery(data);
        setOtpVerified(data.otpVerified || false);
        setProofUrl(data.proofPhoto || '');
        setCashConfirmed(data.cashConfirmed || false);
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
    if (code === (delivery.otpCode || '1234')) {
      setOtpVerified(true); setOtpError('');
      await updateDoc(doc(db, 'deliveries', id), { otpVerified: true });
    } else {
      setOtpError('Invalid OTP. Try again.');
    }
  }

  // Signature
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = 200 * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#111';
  }, [delivery]);

  function getPos(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches?.[0];
    return { x: (touch || e).clientX - rect.left, y: (touch || e).clientY - rect.top };
  }

  function startDraw(e) { e.preventDefault(); setIsDrawing(true); setHasSignature(true); const ctx = canvasRef.current.getContext('2d'); const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); }
  function draw(e) { if (!isDrawing) return; e.preventDefault(); const ctx = canvasRef.current.getContext('2d'); const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); }
  function endDraw() { setIsDrawing(false); }
  function clearSig() { const ctx = canvasRef.current.getContext('2d'); ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); setHasSignature(false); }

  // Proof photo
  async function handleProofUpload(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const storageRef = ref(storage, `deliveries/${id}/proof_${Date.now()}.jpg`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    setProofUrl(url);
    await updateDoc(doc(db, 'deliveries', id), { proofPhoto: url });
    setUploading(false);
  }

  // Cash
  async function confirmCash() {
    setCashConfirmed(true);
    await updateDoc(doc(db, 'deliveries', id), { cashConfirmed: true, cashCollectedAt: serverTimestamp() });
  }

  // Navigation
  function openNavigation() {
    if (!delivery?.address) return;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(delivery.address)}`, '_blank');
  }

  // Start transit
  async function startTransit() {
    await updateDoc(doc(db, 'deliveries', id), { status: 'in_transit', startedAt: serverTimestamp() });
    setDelivery(prev => ({ ...prev, status: 'in_transit' }));
  }

  // Complete
  async function completeDelivery() {
    if (!otpVerified) { alert('Please verify OTP first'); return; }
    if (delivery.cashAmount && !cashConfirmed) { alert('Please confirm cash collection first'); return; }

    let signatureUrl = '';
    if (hasSignature && canvasRef.current) {
      const blob = await new Promise(resolve => canvasRef.current.toBlob(resolve, 'image/png'));
      const storageRef = ref(storage, `deliveries/${id}/signature_${Date.now()}.png`);
      await uploadBytes(storageRef, blob);
      signatureUrl = await getDownloadURL(storageRef);
    }

    await updateDoc(doc(db, 'deliveries', id), {
      status: 'completed', completedAt: serverTimestamp(), signatureUrl, proofPhoto: proofUrl,
    });

    // Notify customer
    if (delivery.userId) {
      await addDoc(collection(db, 'notifications'), {
        userId: delivery.userId,
        title: 'Delivery Complete 📦',
        message: `Your order has been delivered successfully.`,
        type: 'delivery', read: false, createdAt: serverTimestamp(),
      });
    }

    setDelivery(prev => ({ ...prev, status: 'completed' }));
  }

  if (loading) return <div className={styles.loadingScreen}><div className={styles.loadingSpinner} /><p>Loading…</p></div>;
  if (!delivery) return <div className={styles.card}><div className={styles.emptyState}><div className={styles.emptyIcon}>❌</div><p className={styles.emptyTitle}>Delivery not found</p><button className={styles.btnPrimary} onClick={() => router.push('/rider/deliveries')}>Back</button></div></div>;

  const isCompleted = delivery.status === 'completed';

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <button className={styles.btnOutline} onClick={() => router.push('/rider/deliveries')} style={{ marginBottom: '0.75rem', padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}>← Back</button>
          <h1 className={styles.pageTitle}>Delivery — {delivery.customerName || 'Customer'}</h1>
          <p className={styles.pageSubtitle}>{delivery.address || 'Address pending'}</p>
        </div>
        <span className={`${styles.badge} ${isCompleted ? '' : styles.badgeOrange}`} style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
          {(delivery.status || 'pending').replace('_', ' ')}
        </span>
      </div>

      {/* Details */}
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Details</h2>
        <div className={styles.formGrid}>
          <div><span style={{ color: '#9CA3AF', fontSize: '0.75rem', display: 'block' }}>Customer</span>{delivery.customerName || 'N/A'}</div>
          <div><span style={{ color: '#9CA3AF', fontSize: '0.75rem', display: 'block' }}>Phone</span><a href={`tel:${delivery.customerPhone}`} style={{ color: '#F97316', fontWeight: 600 }}>{delivery.customerPhone || 'N/A'}</a></div>
          {delivery.orderRef && <div><span style={{ color: '#9CA3AF', fontSize: '0.75rem', display: 'block' }}>Order</span>#{delivery.orderRef.slice(-6).toUpperCase()}</div>}
          {delivery.cashAmount > 0 && <div><span style={{ color: '#9CA3AF', fontSize: '0.75rem', display: 'block' }}>Cash to Collect</span><span style={{ fontWeight: 700, color: '#16A34A' }}>GHS {delivery.cashAmount.toLocaleString()}</span></div>}
        </div>
      </div>

      {/* GPS */}
      {!isCompleted && (
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>🗺️ Navigation</h2>
          <button className={styles.btnPrimary} onClick={openNavigation} style={{ width: '100%' }}>📍 Open in Google Maps</button>
        </div>
      )}

      {/* Start */}
      {!isCompleted && delivery.status === 'pending' && (
        <button className={styles.btnPrimary} onClick={startTransit} style={{ width: '100%', marginBottom: '1.5rem', padding: '0.875rem' }}>
          🏍️ Start Delivery
        </button>
      )}

      {/* OTP */}
      {!isCompleted && delivery.status === 'in_transit' && (
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>🔐 OTP Verification</h2>
          {otpVerified ? (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#16A34A', fontWeight: 700 }}>✅ OTP Verified</div>
          ) : (
            <>
              <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1rem' }}>Enter the 4-digit OTP from the customer</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                {otp.map((d, i) => <input key={i} ref={otpRefs[i]} className={styles.otpInput} type="text" inputMode="numeric" maxLength={1} value={d} onChange={e => handleOtpChange(i, e.target.value)} />)}
              </div>
              {otpError && <p style={{ textAlign: 'center', color: '#EF4444', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{otpError}</p>}
              <button className={styles.btnPrimary} onClick={verifyOtp} style={{ width: '100%' }}>Verify OTP</button>
            </>
          )}
        </div>
      )}

      {/* Cash Collection */}
      {!isCompleted && delivery.status === 'in_transit' && otpVerified && delivery.cashAmount > 0 && (
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>💵 Cash Collection</h2>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#16A34A', marginBottom: '0.5rem' }}>GHS {delivery.cashAmount.toLocaleString()}</div>
            {cashConfirmed ? (
              <span style={{ color: '#16A34A', fontWeight: 700 }}>✅ Cash Confirmed</span>
            ) : (
              <button className={styles.btnSuccess} onClick={confirmCash} style={{ width: '100%' }}>Confirm Cash Received</button>
            )}
          </div>
        </div>
      )}

      {/* Signature */}
      {!isCompleted && delivery.status === 'in_transit' && otpVerified && (
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>✍️ Customer Signature</h2>
          <canvas ref={canvasRef} className={styles.signatureCanvas}
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw} />
          <button className={styles.btnOutline} onClick={clearSig} style={{ width: '100%', marginTop: '0.75rem' }}>Clear</button>
        </div>
      )}

      {/* Proof Photo */}
      {!isCompleted && delivery.status === 'in_transit' && otpVerified && (
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>📸 Proof of Delivery</h2>
          {proofUrl ? <img src={proofUrl} alt="Proof" className={styles.proofPhoto} /> : (
            <label className={styles.btnOutline} style={{ width: '100%', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
              <input type="file" accept="image/*" capture="environment" onChange={handleProofUpload} style={{ display: 'none' }} />
              {uploading ? 'Uploading…' : '📷 Take Photo'}
            </label>
          )}
        </div>
      )}

      {/* Complete */}
      {!isCompleted && delivery.status === 'in_transit' && otpVerified && (
        <button className={styles.btnSuccess} onClick={completeDelivery} style={{ width: '100%', padding: '0.875rem', marginBottom: '2rem' }}>
          ✅ Complete Delivery
        </button>
      )}

      {isCompleted && (
        <div className={styles.card} style={{ textAlign: 'center', backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
          <h2 style={{ color: '#065F46' }}>Delivery Complete</h2>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { db, storage } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import styles from '../../Technician.module.css';

const REPAIR_STATUSES = ['Pending', 'Diagnosed', 'In Progress', 'Quality Check', 'Completed'];

export default function JobDetailPage({ params }) {
  const resolvedParams = use(params);
  const jobId = resolvedParams.id;
  const router = useRouter();
  const { user, profile } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // Time tracking
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  // Parts
  const [parts, setParts] = useState([]);
  const [newPart, setNewPart] = useState({ name: '', quantity: 1, cost: 0 });

  // Notes
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Photos
  const [beforePhotos, setBeforePhotos] = useState([]);
  const [afterPhotos, setAfterPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function fetchJob() {
      const snap = await getDoc(doc(db, 'repairs', jobId));
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setJob(data);
        setParts(data.partsUsed || []);
        setNotes(data.repairNotes || '');
        setElapsed(data.timeSpent || 0);
        setBeforePhotos(data.beforePhotos || []);
        setAfterPhotos(data.afterPhotos || []);
      }
      setLoading(false);
    }
    fetchJob();
  }, [jobId]);

  // Timer
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  function formatTime(s) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }

  async function saveProgress() {
    setSaving(true);
    await updateDoc(doc(db, 'repairs', jobId), {
      partsUsed: parts,
      repairNotes: notes,
      timeSpent: elapsed,
      beforePhotos,
      afterPhotos,
      updatedAt: serverTimestamp(),
    });
    setSaving(false);
  }

  async function advanceStatus() {
    const idx = REPAIR_STATUSES.indexOf(job.status);
    if (idx < 0 || idx >= REPAIR_STATUSES.length - 1) return;
    const next = REPAIR_STATUSES[idx + 1];

    const updates = {
      status: next,
      updatedAt: serverTimestamp(),
      partsUsed: parts,
      repairNotes: notes,
      timeSpent: elapsed,
      beforePhotos,
      afterPhotos,
    };

    if (next === 'Completed') {
      updates.completedAt = serverTimestamp();
      setTimerRunning(false);
    }

    await updateDoc(doc(db, 'repairs', jobId), updates);
    setJob(prev => ({ ...prev, status: next }));

    // Issue warranty on completion
    if (next === 'Completed' && job.userId) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90);
      await addDoc(collection(db, 'warranties'), {
        userId: job.userId,
        repairId: jobId,
        deviceName: `${job.brand} ${job.model}`,
        coverage: 'Screen replacement & repair parts',
        duration: '90 days',
        terms: 'Warranty covers defects in workmanship and parts used during repair. Physical damage after repair is not covered.',
        issuedAt: serverTimestamp(),
        expiresAt: expiresAt,
        claimed: false,
        issuedBy: profile?.displayName || 'Technician',
      });
      // Send notification
      await addDoc(collection(db, 'notifications'), {
        userId: job.userId,
        title: 'Repair Completed ✅',
        message: `Your ${job.brand} ${job.model} repair is complete! A 90-day warranty has been issued.`,
        type: 'repair',
        read: false,
        createdAt: serverTimestamp(),
      });
    }
  }

  async function handlePhotoUpload(e, type) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);

    const urls = [];
    for (const file of files) {
      const storageRef = ref(storage, `repairs/${jobId}/${type}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      urls.push(url);
    }

    if (type === 'before') {
      setBeforePhotos(prev => [...prev, ...urls]);
    } else {
      setAfterPhotos(prev => [...prev, ...urls]);
    }
    setUploading(false);
  }

  function addPart() {
    if (!newPart.name.trim()) return;
    setParts(prev => [...prev, { ...newPart, cost: Number(newPart.cost) || 0, quantity: Number(newPart.quantity) || 1 }]);
    setNewPart({ name: '', quantity: 1, cost: 0 });
  }

  function removePart(idx) {
    setParts(prev => prev.filter((_, i) => i !== idx));
  }

  if (loading) {
    return <div className={styles.loadingScreen}><div className={styles.loadingSpinner} /><p>Loading job…</p></div>;
  }

  if (!job) {
    return (
      <div className={styles.card}><div className={styles.emptyState}><div className={styles.emptyIcon}>❌</div><p className={styles.emptyTitle}>Job not found</p><button className={styles.btnPrimary} onClick={() => router.push('/technician/jobs')}>Back to Jobs</button></div></div>
    );
  }

  const stepIdx = REPAIR_STATUSES.indexOf(job.status);
  const isCompleted = job.status === 'Completed';
  const partsCost = parts.reduce((s, p) => s + (p.cost * p.quantity), 0);

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <button className={styles.btnOutline} onClick={() => router.push('/technician/jobs')} style={{ marginBottom: '0.75rem', padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}>← Back to Jobs</button>
          <h1 className={styles.pageTitle}>{job.brand} {job.model}</h1>
          <p className={styles.pageSubtitle}>{job.problem}</p>
        </div>
        <span className={`${styles.badge} ${isCompleted ? '' : job.status === 'In Progress' ? styles.badgeBlue : styles.badgeWarning}`} style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
          {job.status}
        </span>
      </div>

      {/* Progress */}
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Repair Progress</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '1rem' }}>
          {REPAIR_STATUSES.map((step, i) => (
            <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                {i > 0 && <div style={{ flex: 1, height: 3, background: i <= stepIdx ? '#3B82F6' : '#E5E7EB', transition: 'background 0.3s' }} />}
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: i <= stepIdx ? '#3B82F6' : '#E5E7EB', color: i <= stepIdx ? '#fff' : '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                  {i < stepIdx ? '✓' : i + 1}
                </div>
                {i < REPAIR_STATUSES.length - 1 && <div style={{ flex: 1, height: 3, background: i < stepIdx ? '#3B82F6' : '#E5E7EB', transition: 'background 0.3s' }} />}
              </div>
              <span style={{ fontSize: '0.65rem', marginTop: '0.35rem', color: i <= stepIdx ? '#3B82F6' : '#9CA3AF', fontWeight: i === stepIdx ? 700 : 400, textAlign: 'center' }}>{step}</span>
            </div>
          ))}
        </div>
        {!isCompleted && (
          <button className={styles.btnPrimary} onClick={advanceStatus} style={{ width: '100%' }}>
            Advance to → {REPAIR_STATUSES[stepIdx + 1] || ''}
          </button>
        )}
      </div>

      {/* Customer Info */}
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Customer</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
          <div><span style={{ color: '#9CA3AF', fontSize: '0.75rem', display: 'block' }}>Name</span>{job.customerName || 'N/A'}</div>
          <div><span style={{ color: '#9CA3AF', fontSize: '0.75rem', display: 'block' }}>Phone</span>{job.customerPhone || 'N/A'}</div>
          <div><span style={{ color: '#9CA3AF', fontSize: '0.75rem', display: 'block' }}>Pickup</span>{job.pickupOption || 'N/A'}</div>
          <div><span style={{ color: '#9CA3AF', fontSize: '0.75rem', display: 'block' }}>Booked</span>{job.createdAt?.toDate ? job.createdAt.toDate().toLocaleDateString() : 'N/A'}</div>
        </div>
      </div>

      {/* Time Tracker */}
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>⏱️ Time Tracker</h2>
        <div className={`${styles.timer} ${timerRunning ? styles.timerRunning : ''}`}>
          {formatTime(elapsed)}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          {!isCompleted && (
            <button className={timerRunning ? styles.btnDanger : styles.btnPrimary} onClick={() => setTimerRunning(!timerRunning)}>
              {timerRunning ? '⏸ Pause' : '▶ Start'}
            </button>
          )}
          {!isCompleted && elapsed > 0 && !timerRunning && (
            <button className={styles.btnOutline} onClick={() => { if (confirm('Reset timer?')) setElapsed(0); }}>↺ Reset</button>
          )}
        </div>
      </div>

      {/* Before Photos */}
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>📸 Before Photos</h2>
        <div className={styles.photoGrid}>
          {beforePhotos.map((url, i) => (
            <img key={i} src={url} alt={`Before ${i + 1}`} className={styles.photoThumb} />
          ))}
          {!isCompleted && (
            <label className={styles.photoUpload}>
              <input type="file" accept="image/*" multiple capture="environment" onChange={e => handlePhotoUpload(e, 'before')} style={{ display: 'none' }} />
              {uploading ? '…' : '+'}
            </label>
          )}
        </div>
      </div>

      {/* Parts Used */}
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>🔩 Parts Used</h2>
        {parts.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            {parts.map((p, i) => (
              <div key={i} className={styles.partRow}>
                <span style={{ flex: 1, fontWeight: 500 }}>{p.name}</span>
                <span style={{ width: '60px', textAlign: 'center' }}>×{p.quantity}</span>
                <span style={{ width: '100px', textAlign: 'right', fontWeight: 600 }}>GHS {(p.cost * p.quantity).toLocaleString()}</span>
                {!isCompleted && (
                  <button className={styles.btnDanger} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', marginLeft: '0.5rem' }} onClick={() => removePart(i)}>✕</button>
                )}
              </div>
            ))}
            <div className={styles.partRow} style={{ fontWeight: 700, borderTop: '2px solid #E5E7EB', paddingTop: '0.75rem' }}>
              <span style={{ flex: 1 }}>Total Parts Cost</span>
              <span style={{ width: '160px', textAlign: 'right' }}>GHS {partsCost.toLocaleString()}</span>
            </div>
          </div>
        )}
        {!isCompleted && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end' }}>
            <div style={{ flex: 2 }}><label className={styles.formLabel}>Part Name</label><input className={styles.formInput} placeholder="e.g. OLED Screen" value={newPart.name} onChange={e => setNewPart(p => ({ ...p, name: e.target.value }))} /></div>
            <div style={{ width: '70px' }}><label className={styles.formLabel}>Qty</label><input className={styles.formInput} type="number" min="1" value={newPart.quantity} onChange={e => setNewPart(p => ({ ...p, quantity: e.target.value }))} /></div>
            <div style={{ width: '100px' }}><label className={styles.formLabel}>Cost (GHS)</label><input className={styles.formInput} type="number" min="0" value={newPart.cost} onChange={e => setNewPart(p => ({ ...p, cost: e.target.value }))} /></div>
            <button className={styles.btnPrimary} onClick={addPart} style={{ padding: '0.625rem 1rem' }}>Add</button>
          </div>
        )}
      </div>

      {/* Repair Notes */}
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>📝 Repair Notes</h2>
        <textarea
          className={styles.formInput}
          rows="5"
          placeholder="Describe the diagnosis, repair process, issues found, etc."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          readOnly={isCompleted}
          style={{ fontFamily: 'inherit', resize: 'vertical' }}
        />
      </div>

      {/* After Photos */}
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>📸 After Photos</h2>
        <div className={styles.photoGrid}>
          {afterPhotos.map((url, i) => (
            <img key={i} src={url} alt={`After ${i + 1}`} className={styles.photoThumb} />
          ))}
          {!isCompleted && (
            <label className={styles.photoUpload}>
              <input type="file" accept="image/*" multiple capture="environment" onChange={e => handlePhotoUpload(e, 'after')} style={{ display: 'none' }} />
              {uploading ? '…' : '+'}
            </label>
          )}
        </div>
      </div>

      {/* Save */}
      {!isCompleted && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
          <button className={styles.btnSuccess} onClick={saveProgress} disabled={saving} style={{ flex: 1 }}>
            {saving ? 'Saving…' : '💾 Save Progress'}
          </button>
        </div>
      )}

      {isCompleted && (
        <div className={styles.card} style={{ textAlign: 'center', backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
          <h2 style={{ color: '#065F46', marginBottom: '0.25rem' }}>Repair Complete</h2>
          <p style={{ color: '#047857', fontSize: '0.875rem' }}>A 90-day warranty has been automatically issued.</p>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import styles from '../../Account.module.css';

const BRANDS = ['Apple', 'Samsung', 'Tecno', 'Infinix', 'Huawei', 'Xiaomi', 'OnePlus', 'Other'];
const PROBLEMS = [
  'Screen Replacement',
  'Battery Replacement',
  'Charging Port Issue',
  'Camera Repair',
  'Speaker / Microphone',
  'Water Damage',
  'Back Glass Replacement',
  'Software Issue',
  'Other',
];

const inputStyle = {
  width: '100%',
  padding: '0.7rem 1rem',
  border: '1px solid #E5E7EB',
  borderRadius: '10px',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  outline: 'none',
  background: '#fff',
  boxSizing: 'border-box',
};

function EstimateCard({ estimate }) {
  if (!estimate) return null;
  return (
    <div style={{
      background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
      border: '1px solid #6EE7B7',
      borderRadius: 12,
      padding: '1rem 1.25rem',
      marginTop: '1rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
    }}>
      <div style={{ flexShrink: 0, display: 'flex', color: '#059669' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#065F46', marginBottom: '0.2rem' }}>
          Price Estimate: GHS {estimate.minPrice?.toLocaleString()} – GHS {estimate.maxPrice?.toLocaleString()}
        </div>
        {estimate.turnaround && (
          <div style={{ fontSize: '0.8rem', color: '#047857' }}>Turnaround: {estimate.turnaround}</div>
        )}
        {estimate.notes && (
          <div style={{ fontSize: '0.8rem', color: '#047857', marginTop: '0.15rem' }}>{estimate.notes}</div>
        )}
        <div style={{ fontSize: '0.75rem', color: '#6EE7B7', marginTop: '0.35rem', fontStyle: 'italic' }}>
          Final price confirmed after diagnostic.
        </div>
      </div>
    </div>
  );
}

export default function BookRepairPage() {
  const router = useRouter();
  const { user, profile } = useAuth();

  const [form, setForm] = useState({
    brand: '',
    model: '',
    problem: '',
    address: profile?.addresses?.[0] || '',
    date: '',
    contact: profile?.phone || '',
    notes: '',
  });
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  // Pricing data loaded once
  const [allPricing, setAllPricing] = useState([]);
  const [estimate, setEstimate] = useState(null);

  useEffect(() => {
    getDocs(collection(db, 'repair_pricing')).then(snap => {
      setAllPricing(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  // Update estimate whenever brand or problem changes
  useEffect(() => {
    if (!form.problem || allPricing.length === 0) { setEstimate(null); return; }
    // Try brand-specific first, then fall back to 'All'
    const brandMatch = allPricing.find(
      p => p.problem === form.problem && p.brand === form.brand
    );
    const genericMatch = allPricing.find(
      p => p.problem === form.problem && (p.brand === 'All' || !p.brand)
    );
    setEstimate(brandMatch || genericMatch || null);
  }, [form.problem, form.brand, allPricing]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function submit() {
    setSubmitting(true);
    try {
      const ref = await addDoc(collection(db, 'repairs'), {
        ...form,
        userId: user.uid,
        customerName: profile?.displayName || user?.displayName || '',
        customerEmail: user?.email || '',
        customerPhone: form.contact,
        status: 'Pending',
        estimateMin: estimate?.minPrice || null,
        estimateMax: estimate?.maxPrice || null,
        createdAt: serverTimestamp(),
      });
      setSubmitted(ref.id);
    } catch (err) {
      console.error(err);
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Booking Confirmed</h1>
        </div>
        <div className={styles.contentCard} style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '1.75rem' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Repair Booked!</h2>
          <p style={{ color: '#6B7280', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Your booking ID is:</p>
          <code style={{ display: 'block', background: '#F3F4F6', padding: '0.6rem 1rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.9rem', margin: '0.5rem auto 1rem', maxWidth: 320 }}>
            {submitted}
          </code>
          {estimate && (
            <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: 10, padding: '0.875rem 1.25rem', margin: '0 auto 1.5rem', maxWidth: 360, fontSize: '0.875rem', color: '#065F46', fontWeight: 600 }}>
              Estimated cost: GHS {estimate.minPrice?.toLocaleString()} – GHS {estimate.maxPrice?.toLocaleString()}
            </div>
          )}
          <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Our team will confirm your pickup within 2 hours. You can track progress in your Repairs dashboard.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => router.push('/account/repairs')}>
              View My Repairs
            </button>
            <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => {
              setSubmitted(null); setStep(1); setEstimate(null);
              setForm({ brand: '', model: '', problem: '', address: '', date: '', contact: profile?.phone || '', notes: '' });
            }}>
              Book Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Book a Repair</h1>
        <p className={styles.pageSubtitle}>We'll dispatch a rider to pick up your device.</p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '2rem' }}>
        {[['1', 'Device'], ['2', 'Pickup'], ['3', 'Confirm']].map(([num, label], i) => {
          const active = step === i + 1;
          const done = step > i + 1;
          return (
            <div key={num} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                {i > 0 && <div style={{ flex: 1, height: 3, background: done ? 'var(--color-accent-green)' : '#E5E7EB', transition: 'background 0.3s' }} />}
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: active || done ? 'var(--color-accent-green)' : '#E5E7EB',
                  color: active || done ? '#fff' : '#9CA3AF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.8rem', transition: 'all 0.3s',
                }}>
                  {done ? '✓' : num}
                </div>
                {i < 2 && <div style={{ flex: 1, height: 3, background: done ? 'var(--color-accent-green)' : '#E5E7EB', transition: 'background 0.3s' }} />}
              </div>
              <span style={{ fontSize: '0.7rem', marginTop: '0.3rem', fontWeight: active ? 700 : 400, color: active ? 'var(--color-accent-green)' : '#9CA3AF' }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <div className={styles.contentCard}>
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Device Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label className={styles.formLabel}>Device Brand</label>
                <select style={inputStyle} value={form.brand} onChange={e => set('brand', e.target.value)} required>
                  <option value="">Select brand</option>
                  {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className={styles.formLabel}>Device Model</label>
                <input style={inputStyle} placeholder="e.g. iPhone 14 Pro" value={form.model} onChange={e => set('model', e.target.value)} required />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className={styles.formLabel}>Problem Type</label>
                <select style={inputStyle} value={form.problem} onChange={e => set('problem', e.target.value)} required>
                  <option value="">Select problem</option>
                  {PROBLEMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {/* Estimate card appears instantly when problem is selected */}
                <EstimateCard estimate={estimate} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className={styles.formLabel}>Additional Notes (optional)</label>
                <textarea style={{ ...inputStyle, height: 90, resize: 'vertical' }} placeholder="Describe the issue in more detail…" value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => setStep(2)}
                disabled={!form.brand || !form.model || !form.problem}
              >
                Next: Pickup Details
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Pickup Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className={styles.formLabel}>Preferred Pickup Date</label>
                <input style={inputStyle} type="date" min={new Date().toISOString().split('T')[0]} value={form.date} onChange={e => set('date', e.target.value)} required />
              </div>
              <div>
                <label className={styles.formLabel}>Pickup Address</label>
                <input style={inputStyle} placeholder="Enter your full street address or landmark" value={form.address} onChange={e => set('address', e.target.value)} required />
              </div>
              <div>
                <label className={styles.formLabel}>Contact Number</label>
                <input style={inputStyle} type="tel" placeholder="e.g. 024 123 4567" value={form.contact} onChange={e => set('contact', e.target.value)} required />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => setStep(1)}>Back</button>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => setStep(3)}
                disabled={!form.date || !form.address || !form.contact}
              >
                Review Booking
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Confirm Your Booking</h2>
            <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                ['Device', `${form.brand} ${form.model}`],
                ['Problem', form.problem],
                ['Pickup Date', form.date],
                ['Address', form.address],
                ['Contact', form.contact],
                ...(form.notes ? [['Notes', form.notes]] : []),
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '0.875rem' }}>
                  <span style={{ color: '#6B7280', flexShrink: 0 }}>{k}</span>
                  <span style={{ fontWeight: 600, textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Show estimate on confirm screen too */}
            {estimate && (
              <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: 10, padding: '0.875rem 1.25rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                <div style={{ fontWeight: 700, color: '#065F46', marginBottom: '0.2rem' }}>
                  Estimated cost: GHS {estimate.minPrice?.toLocaleString()} – GHS {estimate.maxPrice?.toLocaleString()}
                </div>
                {estimate.turnaround && <div style={{ color: '#047857', fontSize: '0.8rem' }}>{estimate.turnaround}</div>}
                <div style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '0.25rem', fontStyle: 'italic' }}>Final price confirmed after diagnostic.</div>
              </div>
            )}

            <p style={{ fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '1.5rem' }}>
              No payment required until the repair is completed. By confirming, you agree to our Terms of Service.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => setStep(2)} disabled={submitting}>Back</button>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={submit} disabled={submitting}>
                {submitting ? 'Submitting…' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

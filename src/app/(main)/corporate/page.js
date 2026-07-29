"use client";
import { useState, useRef } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import styles from './Corporate.module.css';

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  border: '1px solid #E5E7EB',
  borderRadius: '10px',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  outline: 'none',
  background: '#fff',
  boxSizing: 'border-box',
};

export default function CorporatePage() {
  const formRef = useRef(null);
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', size: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'partner_enquiries'), {
        ...form,
        status: 'New',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Corporate Device Management</h1>
          <p className={styles.subtitle}>Reliable, fast, and scalable repair solutions for businesses of all sizes in Ghana.</p>
          <button
            onClick={scrollToForm}
            style={{
              marginTop: '1.5rem',
              padding: '0.875rem 2rem',
              background: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
              transition: 'transform 0.15s, box-shadow 0.15s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            Become a Partner
          </button>
        </div>

        <div className={styles.grid}>
          <Card className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <h3>Volume Discounts</h3>
            <p>Enjoy exclusive tiered pricing on repairs and parts based on your company's monthly volume.</p>
          </Card>
          
          <Card className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h3>Priority SLAs</h3>
            <p>Guaranteed turnaround times with dedicated account managers to ensure minimal downtime for your team.</p>
          </Card>

          <Card className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h3>Data Security</h3>
            <p>Strict data privacy protocols during repairs. We never access your team's sensitive information.</p>
          </Card>
        </div>

        {/* Partner Enquiry Form */}
        <div
          ref={formRef}
          style={{
            marginTop: '4rem',
            background: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '20px',
            padding: '2.5rem',
            maxWidth: 680,
            marginInline: 'auto',
            scrollMarginTop: '6rem',
          }}
        >
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Enquiry Sent!</h2>
              <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                Thanks, <strong>{form.name}</strong>! Our B2B team will reach out to <strong>{form.email}</strong> within 24 hours.
              </p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.35rem' }}>Become a Partner</h2>
              <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
                Fill in the form below and our B2B team will get back to you within one business day.
              </p>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', color: '#374151' }}>Your Name</label>
                    <input style={inputStyle} placeholder="e.g. Kofi Mensah" value={form.name} onChange={e => set('name', e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', color: '#374151' }}>Company Name</label>
                    <input style={inputStyle} placeholder="e.g. Accra Tech Ltd" value={form.company} onChange={e => set('company', e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', color: '#374151' }}>Work Email</label>
                    <input style={inputStyle} type="email" placeholder="you@company.com" value={form.email} onChange={e => set('email', e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', color: '#374151' }}>Phone Number</label>
                    <input style={inputStyle} type="tel" placeholder="e.g. 024 123 4567" value={form.phone} onChange={e => set('phone', e.target.value)} required />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', color: '#374151' }}>Fleet Size (devices)</label>
                    <select style={inputStyle} value={form.size} onChange={e => set('size', e.target.value)} required>
                      <option value="">Select range</option>
                      <option value="1–10">1 – 10 devices</option>
                      <option value="11–50">11 – 50 devices</option>
                      <option value="51–200">51 – 200 devices</option>
                      <option value="200+">200+ devices</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', color: '#374151' }}>Additional Details (optional)</label>
                    <textarea style={{ ...inputStyle, height: 90, resize: 'vertical' }} placeholder="Tell us about your device management needs…" value={form.message} onChange={e => set('message', e.target.value)} />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    background: '#111',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1,
                    fontFamily: 'inherit',
                    transition: 'opacity 0.2s',
                  }}
                >
                  {submitting ? 'Sending…' : 'Submit Enquiry'}
                </button>
              </form>
            </>
          )}
        </div>

        <div className={styles.contactSection}>
          <h2>Prefer to talk directly?</h2>
          <p>Contact our B2B team today to set up a corporate account and get your team covered.</p>
          <Link href="/contact">
            <Button variant="outline">Contact B2B Sales</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

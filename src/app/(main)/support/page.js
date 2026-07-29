"use client";
import { useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/lib/auth/AuthProvider';

export default function SupportPage() {
  const { user, profile } = useAuth();
  const [form, setForm] = useState({ subject: '', category: 'general', priority: 'medium', message: '' });
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const fieldStyle = { padding: '0.75rem 1rem', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '0.9rem', width: '100%', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s', outline: 'none' };

  async function submit(e) {
    e.preventDefault(); setStatus('submitting');
    try {
      await addDoc(collection(db, 'support_tickets'), {
        ...form,
        userId: user?.uid || null,
        customerName: profile?.displayName || user?.displayName || 'Anonymous',
        customerEmail: user?.email || '',
        customerPhone: user?.phoneNumber || '',
        status: 'open',
        createdAt: serverTimestamp(),
      });
      setStatus('success');
      setForm({ subject: '', category: 'general', priority: 'medium', message: '' });
    } catch {
      setStatus('error');
    }
  }

  const FAQS = [
    { q: 'How long does a screen repair take?', a: 'Most iPhone screen repairs are completed within 45–90 minutes while you wait at our shop, or same-day for pickup bookings.' },
    { q: 'Do you offer a warranty on repairs?', a: 'Yes — all repairs come with a 90-day warranty covering defects in workmanship and parts used during the repair.' },
    { q: 'What phones do you repair?', a: 'We specialise in iPhones (all models) and major Android brands. Contact us to confirm availability for your specific model.' },
    { q: 'Can I track my repair?', a: 'Yes! Use the "Track Repair" link in the navigation bar, or log in to your account to see real-time repair status updates.' },
    { q: 'Do you offer pickup and delivery?', a: 'Yes — we offer free pickup and delivery within Accra. Book a repair and select the pickup/delivery option.' },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>Support Centre</h1>
        <p style={{ color: '#6B7280', fontSize: '1.1rem', maxWidth: '540px', margin: '0 auto' }}>
          Have a question or issue? Browse our FAQs or send us a message — we typically respond within 2 hours.
        </p>
      </div>

      {/* Contact channels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
        {[
          { icon: '📞', label: 'Phone', value: '+233 XX XXX XXXX', href: 'tel:+233' },
          { icon: '💬', label: 'WhatsApp', value: 'Chat with us', href: 'https://wa.me/233' },
          { icon: '📧', label: 'Email', value: 'hello@scrinhouse.com', href: 'mailto:hello@scrinhouse.com' },
        ].map(c => (
          <a key={c.label} href={c.href} style={{ padding: '1.25rem', border: '1px solid #E5E7EB', borderRadius: '12px', textDecoration: 'none', color: 'inherit', textAlign: 'center', transition: 'transform 0.15s, box-shadow 0.15s', display: 'block' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{c.icon}</div>
            <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{c.label}</div>
            <div style={{ fontSize: '0.82rem', color: '#6B7280' }}>{c.value}</div>
          </a>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Frequently Asked Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {FAQS.map((faq, i) => (
            <details key={i} style={{ border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden' }}>
              <summary style={{ padding: '1rem 1.25rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}>
                {faq.q}
                <span style={{ color: '#9CA3AF', fontSize: '1.2rem', lineHeight: 1 }}>+</span>
              </summary>
              <p style={{ padding: '0 1.25rem 1rem', fontSize: '0.9rem', color: '#6B7280', lineHeight: 1.6, margin: 0 }}>{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Submit ticket */}
      <div style={{ background: '#F9FAFB', borderRadius: '16px', padding: '2rem', border: '1px solid #E5E7EB' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Submit a Ticket</h2>
        <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Didn't find an answer? Describe your issue and we'll get back to you promptly.
        </p>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '2rem', background: '#ECFDF5', borderRadius: '12px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <p style={{ fontWeight: 700, color: '#065F46', marginBottom: '0.5rem' }}>Ticket submitted!</p>
            <p style={{ color: '#047857', fontSize: '0.875rem' }}>We'll reply within 2 hours via the contact info provided.</p>
            <button style={{ marginTop: '1rem', padding: '0.6rem 1.25rem', background: '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }} onClick={() => setStatus('idle')}>Submit another</button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem', color: '#374151' }}>Category</label>
                <select style={fieldStyle} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  <option value="general">General Enquiry</option>
                  <option value="repair">Repair Issue</option>
                  <option value="order">Order Problem</option>
                  <option value="warranty">Warranty Claim</option>
                  <option value="billing">Billing</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem', color: '#374151' }}>Priority</label>
                <select style={fieldStyle} value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem', color: '#374151' }}>Subject</label>
              <input style={fieldStyle} placeholder="Brief description of your issue" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem', color: '#374151' }}>Message</label>
              <textarea style={{ ...fieldStyle, height: '140px', resize: 'vertical' }} placeholder="Describe your issue in detail…" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required />
            </div>
            {status === 'error' && <p style={{ color: '#EF4444', fontSize: '0.85rem' }}>Something went wrong. Please try again.</p>}
            <button type="submit" disabled={status === 'submitting'} style={{ padding: '0.875rem', background: '#111', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', opacity: status === 'submitting' ? 0.7 : 1 }}>
              {status === 'submitting' ? 'Submitting…' : 'Submit Ticket'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

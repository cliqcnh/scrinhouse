"use client";
import { useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import styles from '../Admin.module.css';

export default function MarketingPage() {
  const [tab, setTab] = useState('broadcast');
  const [broadcast, setBroadcast] = useState({ title: '', message: '', type: 'promo', target: 'all' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function sendBroadcast(e) {
    e.preventDefault(); setSending(true);
    try {
      await addDoc(collection(db, 'campaigns'), { ...broadcast, status: 'sent', sentAt: serverTimestamp(), createdAt: serverTimestamp() });
      // In production, this would also create notifications for each targeted user
      setSent(true); setBroadcast({ title: '', message: '', type: 'promo', target: 'all' });
      setTimeout(() => setSent(false), 3000);
    } catch (err) { console.error(err); alert('Failed to send.'); }
    finally { setSending(false); }
  }

  return (
    <div>
      <div className={styles.pageHeader}><h1 className={styles.pageTitle}>Marketing</h1></div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['broadcast', 'banners'].map(t => (
          <button key={t} className={tab === t ? styles.actionBtnPrimary : styles.actionBtnOutline} onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
        ))}
      </div>

      {tab === 'broadcast' && (
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Send Notification Broadcast</h2>
          <form onSubmit={sendBroadcast} className={styles.formGrid}>
            <div className={styles.formGroup}><label className={styles.formLabel}>Title</label><input className={styles.formInput} value={broadcast.title} onChange={e => setBroadcast(p => ({ ...p, title: e.target.value }))} required /></div>
            <div className={styles.formGroup}><label className={styles.formLabel}>Type</label><select className={styles.formInput} value={broadcast.type} onChange={e => setBroadcast(p => ({ ...p, type: e.target.value }))}><option value="promo">Promotion</option><option value="system">System</option><option value="order">Order Update</option></select></div>
            <div className={styles.formGroup}><label className={styles.formLabel}>Target</label><select className={styles.formInput} value={broadcast.target} onChange={e => setBroadcast(p => ({ ...p, target: e.target.value }))}><option value="all">All Customers</option><option value="active">Active Customers</option><option value="business">Business Customers</option></select></div>
            <div className={styles.formGroup} style={{ gridColumn: '1/-1' }}><label className={styles.formLabel}>Message</label><textarea className={styles.formInput} rows="4" value={broadcast.message} onChange={e => setBroadcast(p => ({ ...p, message: e.target.value }))} required /></div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button type="submit" className={styles.actionBtnPrimary} disabled={sending}>{sending ? 'Sending…' : '📣 Send Broadcast'}</button>
              {sent && <span style={{ color: 'var(--color-accent-green)', fontWeight: 600, fontSize: '0.85rem' }}>✓ Broadcast sent</span>}
            </div>
          </form>
        </div>
      )}

      {tab === 'banners' && (
        <div className={styles.card}>
          <div className={styles.emptyState}><div className={styles.emptyIcon}>🖼️</div><p className={styles.emptyTitle}>Banner Management</p><p className={styles.emptyText}>Upload promotional banners for the homepage. Coming soon.</p></div>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, getDocs, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import styles from '../Admin.module.css';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState({ userId: '', title: '', message: '', type: 'system' });
  const [users, setUsers] = useState([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const u1 = onSnapshot(collection(db, 'notifications'), s => setNotifications(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 50)));
    getDocs(collection(db, 'users')).then(s => setUsers(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => u1();
  }, []);

  async function send(e) {
    e.preventDefault(); setSending(true);
    await addDoc(collection(db, 'notifications'), { ...form, read: false, createdAt: serverTimestamp() });
    setForm({ userId: '', title: '', message: '', type: 'system' }); setSending(false);
  }

  return (
    <div>
      <div className={styles.pageHeader}><h1 className={styles.pageTitle}>Notifications</h1></div>
      <div className={styles.card} style={{ marginBottom: '1.5rem' }}>
        <h2 className={styles.sectionTitle}>Send Notification</h2>
        <form onSubmit={send} className={styles.formGrid}>
          <div className={styles.formGroup}><label className={styles.formLabel}>User</label><select className={styles.formInput} value={form.userId} onChange={e => setForm(p => ({ ...p, userId: e.target.value }))} required><option value="">Select user…</option>{users.map(u => <option key={u.id} value={u.uid || u.id}>{u.displayName || u.phone || u.id}</option>)}</select></div>
          <div className={styles.formGroup}><label className={styles.formLabel}>Type</label><select className={styles.formInput} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}><option value="system">System</option><option value="order">Order</option><option value="repair">Repair</option><option value="promo">Promo</option></select></div>
          <div className={styles.formGroup}><label className={styles.formLabel}>Title</label><input className={styles.formInput} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required /></div>
          <div className={styles.formGroup}><label className={styles.formLabel}>Message</label><input className={styles.formInput} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required /></div>
          <div><button type="submit" className={styles.actionBtnPrimary} disabled={sending}>{sending ? 'Sending…' : 'Send'}</button></div>
        </form>
      </div>
      <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}><table className={styles.table}><thead><tr><th>User</th><th>Title</th><th>Message</th><th>Type</th><th>Read</th><th>Date</th></tr></thead><tbody>
        {notifications.length === 0 ? <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No notifications sent</td></tr> :
          notifications.map(n => (<tr key={n.id}><td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{(n.userId || '').slice(0, 8)}</td><td style={{ fontWeight: 600 }}>{n.title}</td><td style={{ maxWidth: '200px', fontSize: '0.85rem' }}>{n.message}</td><td><span className={styles.badge}>{n.type}</span></td><td>{n.read ? '✓' : '—'}</td><td style={{ fontSize: '0.8rem' }}>{n.createdAt?.toDate ? n.createdAt.toDate().toLocaleDateString() : '—'}</td></tr>))}
      </tbody></table></div>
    </div>
  );
}

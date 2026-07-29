"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import styles from '../Admin.module.css';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

export default function SupportPage() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('open');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'support_tickets'), (snap) => {
      setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => {
        const pA = PRIORITIES.indexOf(a.priority || 'low');
        const pB = PRIORITIES.indexOf(b.priority || 'low');
        if (pB !== pA) return pB - pA;
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      }));
    });
    return () => unsub();
  }, []);

  const filtered = tickets
    .filter(t => filter === 'all' || t.status === filter)
    .filter(t => {
      const term = search.toLowerCase();
      return (t.subject || '').toLowerCase().includes(term) || (t.customerName || '').toLowerCase().includes(term) || t.id.toLowerCase().includes(term);
    });

  async function updateStatus(id, status) {
    await updateDoc(doc(db, 'support_tickets', id), { status, updatedAt: serverTimestamp() });
  }

  async function updatePriority(id, priority) {
    await updateDoc(doc(db, 'support_tickets', id), { priority, updatedAt: serverTimestamp() });
  }

  return (
    <div>
      <div className={styles.pageHeader}><h1 className={styles.pageTitle}>Support Tickets</h1></div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Open</h3><p className={styles.statValue} style={{ color: '#F59E0B' }}>{tickets.filter(t => t.status === 'open').length}</p></div>
        <div className={styles.statCard}><h3 className={styles.statTitle}>In Progress</h3><p className={styles.statValue} style={{ color: '#3B82F6' }}>{tickets.filter(t => t.status === 'in_progress').length}</p></div>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Resolved</h3><p className={styles.statValue} style={{ color: 'var(--color-accent-green)' }}>{tickets.filter(t => t.status === 'resolved').length}</p></div>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Urgent</h3><p className={styles.statValue} style={{ color: '#EF4444' }}>{tickets.filter(t => t.priority === 'urgent').length}</p></div>
      </div>

      <div className={styles.toolbar}>
        <input className={styles.searchInput} placeholder="Search tickets…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className={styles.filterSelect} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All</option><option value="open">Open</option><option value="in_progress">In Progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
        </select>
      </div>

      <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
        <table className={styles.table}>
          <thead><tr><th>ID</th><th>Subject</th><th>Customer</th><th>Priority</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No tickets found</td></tr> :
              filtered.map(t => (
                <tr key={t.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600 }}>#{t.id.slice(-6).toUpperCase()}</td>
                  <td style={{ fontWeight: 500, maxWidth: '220px' }}>{t.subject || 'No subject'}</td>
                  <td>{t.customerName || 'N/A'}<br /><span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>{t.customerEmail || t.customerPhone || ''}</span></td>
                  <td>
                    <select className={styles.formInput} style={{ width: '100px', padding: '0.25rem 0.4rem', fontSize: '0.78rem' }} value={t.priority || 'low'} onChange={e => updatePriority(t.id, e.target.value)}>
                      {PRIORITIES.map(p => <option key={p} value={p} style={{ textTransform: 'capitalize' }}>{p}</option>)}
                    </select>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${t.status === 'open' ? styles.badgeWarning : t.status === 'in_progress' ? styles.badgeBlue : t.status === 'resolved' ? '' : styles.badgeError}`}>
                      {(t.status || 'open').replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>{t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}</td>
                  <td>
                    <select className={styles.formInput} style={{ width: '110px', padding: '0.25rem 0.4rem', fontSize: '0.78rem' }} value={t.status || 'open'} onChange={e => updateStatus(t.id, e.target.value)}>
                      {STATUSES.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

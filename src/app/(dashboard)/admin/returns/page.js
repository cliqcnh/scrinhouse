"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import styles from '../Admin.module.css';

export default function ReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'returns'), (snap) => {
      setReturns(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });
    return () => unsubscribe();
  }, []);

  const filtered = returns.filter(r => filter === 'all' || r.status === filter);

  async function updateReturnStatus(id, status) {
    await updateDoc(doc(db, 'returns', id), { status, updatedAt: serverTimestamp() });
  }

  return (
    <div>
      <div className={styles.pageHeader}><h1 className={styles.pageTitle}>Returns</h1></div>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Total Returns</h3><p className={styles.statValue}>{returns.length}</p></div>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Pending</h3><p className={styles.statValue} style={{ color: '#F59E0B' }}>{returns.filter(r => r.status === 'pending').length}</p></div>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Approved</h3><p className={styles.statValue} style={{ color: 'var(--color-accent-green)' }}>{returns.filter(r => r.status === 'approved').length}</p></div>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Refund Amount</h3><p className={styles.statValue}>GHS {returns.filter(r => r.status === 'approved').reduce((s, r) => s + (r.refundAmount || 0), 0).toLocaleString()}</p></div>
      </div>
      <div className={styles.toolbar}>
        <select className={styles.filterSelect} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="restocked">Restocked</option>
        </select>
      </div>
      <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
        <table className={styles.table}>
          <thead><tr><th>Return ID</th><th>Order</th><th>Customer</th><th>Reason</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No returns found</td></tr> :
              filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600 }}>{r.id.slice(-6).toUpperCase()}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>#{(r.orderId || '').slice(-6).toUpperCase()}</td>
                  <td>{r.customerName || 'N/A'}</td>
                  <td style={{ maxWidth: '200px' }}>{r.reason || '—'}</td>
                  <td style={{ fontWeight: 600 }}>GHS {(r.refundAmount || 0).toLocaleString()}</td>
                  <td><span className={`${styles.badge} ${r.status === 'approved' ? '' : r.status === 'rejected' ? styles.badgeError : styles.badgeWarning}`}>{r.status}</span></td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    {r.status === 'pending' && (<>
                      <button className={styles.actionBtnPrimary} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => updateReturnStatus(r.id, 'approved')}>Approve</button>
                      <button className={styles.actionBtnDanger} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => updateReturnStatus(r.id, 'rejected')}>Reject</button>
                    </>)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

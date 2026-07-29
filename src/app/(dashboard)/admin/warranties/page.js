"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';
import styles from '../Admin.module.css';

export default function WarrantiesPage() {
  const [warranties, setWarranties] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'warranties'), (snap) => {
      setWarranties(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.issuedAt?.seconds || 0) - (a.issuedAt?.seconds || 0)));
    });
    return () => unsubscribe();
  }, []);

  const now = new Date();
  const active = warranties.filter(w => w.expiresAt?.toDate && w.expiresAt.toDate() > now);
  const expired = warranties.filter(w => w.expiresAt?.toDate && w.expiresAt.toDate() <= now);
  const filtered = filter === 'active' ? active : filter === 'expired' ? expired : warranties;

  return (
    <div>
      <div className={styles.pageHeader}><h1 className={styles.pageTitle}>Warranties</h1></div>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Total</h3><p className={styles.statValue}>{warranties.length}</p></div>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Active</h3><p className={styles.statValue} style={{ color: 'var(--color-accent-green)' }}>{active.length}</p></div>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Expired</h3><p className={styles.statValue} style={{ color: '#EF4444' }}>{expired.length}</p></div>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Claims</h3><p className={styles.statValue}>{warranties.filter(w => w.claimed).length}</p></div>
      </div>
      <div className={styles.toolbar}>
        <select className={styles.filterSelect} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All</option><option value="active">Active</option><option value="expired">Expired</option>
        </select>
      </div>
      <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
        <table className={styles.table}>
          <thead><tr><th>ID</th><th>Customer</th><th>Device</th><th>Coverage</th><th>Issued</th><th>Expires</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No warranties</td></tr> :
              filtered.map(w => {
                const isExpired = w.expiresAt?.toDate && w.expiresAt.toDate() <= now;
                return (
                  <tr key={w.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600 }}>{w.id.slice(-8).toUpperCase()}</td>
                    <td>{w.customerName || 'N/A'}</td>
                    <td>{w.deviceName || '—'}</td>
                    <td>{w.coverage || 'Screen'}</td>
                    <td style={{ fontSize: '0.8rem' }}>{w.issuedAt?.toDate ? w.issuedAt.toDate().toLocaleDateString() : '—'}</td>
                    <td style={{ fontSize: '0.8rem' }}>{w.expiresAt?.toDate ? w.expiresAt.toDate().toLocaleDateString() : '—'}</td>
                    <td><span className={`${styles.badge} ${isExpired ? styles.badgeError : ''}`}>{isExpired ? 'Expired' : 'Active'}</span></td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

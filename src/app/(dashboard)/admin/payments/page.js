"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';
import styles from '../Admin.module.css';

export default function PaymentsPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'orders'), (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });
    return () => unsubscribe();
  }, []);

  const filtered = orders.filter(o => {
    if (filter === 'paid') return o.paymentStatus === 'paid' || (o.paymentRef && o.status !== 'cancelled');
    if (filter === 'pending') return !o.paymentRef && o.status !== 'cancelled';
    if (filter === 'refunded') return o.status === 'cancelled';
    return true;
  });

  const totalPaid = orders.filter(o => o.paymentRef && o.status !== 'cancelled').reduce((s, o) => s + (o.totalAmount || 0), 0);

  return (
    <div>
      <div className={styles.pageHeader}><h1 className={styles.pageTitle}>Payments</h1></div>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Total Collected</h3><p className={styles.statValue}>GHS {totalPaid.toLocaleString()}</p></div>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Transactions</h3><p className={styles.statValue}>{orders.length}</p></div>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Paid</h3><p className={styles.statValue} style={{ color: 'var(--color-accent-green)' }}>{orders.filter(o => o.paymentRef).length}</p></div>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Refunded</h3><p className={styles.statValue} style={{ color: '#EF4444' }}>{orders.filter(o => o.status === 'cancelled').length}</p></div>
      </div>
      <div className={styles.toolbar}>
        <select className={styles.filterSelect} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="refunded">Refunded</option>
        </select>
      </div>
      <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
        <table className={styles.table}>
          <thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Reference</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No payments found</td></tr> :
              filtered.map(o => (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600 }}>#{o.id.slice(-6).toUpperCase()}</td>
                  <td>{o.customerName || 'N/A'}</td>
                  <td style={{ fontWeight: 600 }}>GHS {(o.totalAmount || 0).toLocaleString()}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{o.paymentRef || '—'}</td>
                  <td>{o.paymentMethod || 'Paystack'}</td>
                  <td><span className={`${styles.badge} ${o.status === 'cancelled' ? styles.badgeError : o.paymentRef ? '' : styles.badgeWarning}`}>{o.status === 'cancelled' ? 'Refunded' : o.paymentRef ? 'Paid' : 'Pending'}</span></td>
                  <td style={{ fontSize: '0.8rem' }}>{o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

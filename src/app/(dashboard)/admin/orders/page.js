"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import styles from '../Admin.module.css';

const STATUS_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'orders'), (snap) => {
      setOrders(
        snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      );
    });
    return () => unsubscribe();
  }, []);

  const filtered = orders
    .filter(o => filter === 'all' || o.status === filter)
    .filter(o => {
      const term = search.toLowerCase();
      return o.id.toLowerCase().includes(term) ||
        (o.customerName || '').toLowerCase().includes(term) ||
        (o.customerPhone || '').toLowerCase().includes(term);
    });

  async function advanceStatus(order) {
    const idx = STATUS_FLOW.indexOf(order.status);
    if (idx < 0 || idx >= STATUS_FLOW.length - 1) return;
    const next = STATUS_FLOW[idx + 1];
    await updateDoc(doc(db, 'orders', order.id), { status: next });
  }

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const todayRevenue = orders
    .filter(o => {
      if (o.status === 'cancelled') return false;
      const d = o.createdAt?.toDate ? o.createdAt.toDate() : null;
      if (!d) return false;
      const today = new Date();
      return d.toDateString() === today.toDateString();
    })
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Orders</h1>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Total Orders</h3>
          <p className={styles.statValue}>{orders.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Pending</h3>
          <p className={styles.statValue} style={{ color: '#F59E0B' }}>{pendingCount}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Today&apos;s Revenue</h3>
          <p className={styles.statValue}>GHS {todayRevenue.toLocaleString()}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Delivered</h3>
          <p className={styles.statValue} style={{ color: 'var(--color-accent-green)' }}>
            {orders.filter(o => o.status === 'delivered').length}
          </p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input className={styles.searchInput} placeholder="Search by ID, name, phone…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className={styles.filterSelect} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          {STATUS_FLOW.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No orders found</td></tr>
            ) : filtered.map(order => (
              <tr key={order.id}>
                <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  #{order.id.slice(-6).toUpperCase()}
                </td>
                <td>
                  <div>{order.customerName || 'N/A'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{order.customerPhone || ''}</div>
                </td>
                <td>{order.items?.length || 0} item(s)</td>
                <td style={{ fontWeight: 600 }}>GHS {(order.totalAmount || 0).toLocaleString()}</td>
                <td style={{ fontSize: '0.8rem' }}>
                  {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'N/A'}
                </td>
                <td>
                  <span className={`${styles.badge} ${
                    order.status === 'delivered' ? '' :
                    order.status === 'cancelled' ? styles.badgeError :
                    order.status === 'pending' ? styles.badgeWarning :
                    styles.badgeBlue
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <button
                      className={styles.actionBtnPrimary}
                      style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                      onClick={() => advanceStatus(order)}
                    >
                      → {STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1] || ''}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

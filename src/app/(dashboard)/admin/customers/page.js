"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import styles from '../Admin.module.css';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const users = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role === 'customer' || !u.role);

        // Fetch order counts per customer
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const orderCounts = {};
        const orderTotals = {};
        ordersSnap.docs.forEach(d => {
          const data = d.data();
          orderCounts[data.userId] = (orderCounts[data.userId] || 0) + 1;
          if (data.status !== 'cancelled') orderTotals[data.userId] = (orderTotals[data.userId] || 0) + (data.totalAmount || 0);
        });

        setCustomers(users.map(u => ({
          ...u, orderCount: orderCounts[u.uid || u.id] || 0, totalSpent: orderTotals[u.uid || u.id] || 0,
        })).sort((a, b) => b.totalSpent - a.totalSpent));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  const filtered = customers.filter(c => {
    const t = search.toLowerCase();
    return (c.displayName || '').toLowerCase().includes(t) || (c.phone || '').includes(t) || (c.email || '').toLowerCase().includes(t);
  });

  return (
    <div>
      <div className={styles.pageHeader}><h1 className={styles.pageTitle}>Customers</h1></div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Total Customers</h3><p className={styles.statValue}>{customers.length}</p></div>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Total Revenue</h3><p className={styles.statValue}>GHS {customers.reduce((s, c) => s + c.totalSpent, 0).toLocaleString()}</p></div>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Avg. Spend</h3><p className={styles.statValue}>GHS {customers.length ? Math.round(customers.reduce((s, c) => s + c.totalSpent, 0) / customers.length).toLocaleString() : 0}</p></div>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Active (30d)</h3><p className={styles.statValue}>{customers.filter(c => c.orderCount > 0).length}</p></div>
      </div>

      <div className={styles.toolbar}>
        <input className={styles.searchInput} placeholder="Search by name, phone, email…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>Loading…</div>
      ) : (
        <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
          <table className={styles.table}>
            <thead><tr><th>Customer</th><th>Phone</th><th>Email</th><th>Orders</th><th>Total Spent</th><th>Loyalty Pts</th><th>Joined</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No customers found</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.displayName || 'N/A'}</td>
                  <td>{c.phone || '—'}</td>
                  <td>{c.email || '—'}</td>
                  <td>{c.orderCount}</td>
                  <td style={{ fontWeight: 600 }}>GHS {c.totalSpent.toLocaleString()}</td>
                  <td style={{ color: 'var(--color-accent-green)', fontWeight: 600 }}>{c.loyaltyPoints || 0}</td>
                  <td style={{ fontSize: '0.8rem' }}>{c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

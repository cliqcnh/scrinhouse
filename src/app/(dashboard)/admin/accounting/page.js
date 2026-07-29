"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import styles from '../Admin.module.css';

export default function AccountingPage() {
  const [data, setData] = useState({ revenue: 0, repairRevenue: 0, orders: [], repairs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const repairsSnap = await getDocs(collection(db, 'repairs'));
      const repairs = repairsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const revenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.totalAmount || 0), 0);
      const repairRevenue = repairs.filter(r => r.status === 'Completed').reduce((s, r) => s + (r.cost || 0), 0);
      setData({ revenue, repairRevenue, orders, repairs });
      setLoading(false);
    }
    fetch();
  }, []);

  const totalRevenue = data.revenue + data.repairRevenue;
  const cancelledOrders = data.orders.filter(o => o.status === 'cancelled');
  const refundAmount = cancelledOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);

  function exportCSV() {
    const rows = [['Type', 'ID', 'Amount', 'Status', 'Date']];
    data.orders.forEach(o => rows.push(['Order', o.id.slice(-6).toUpperCase(), o.totalAmount || 0, o.status, o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString() : '']));
    data.repairs.filter(r => r.cost).forEach(r => rows.push(['Repair', r.id.slice(-6).toUpperCase(), r.cost || 0, r.status, r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : '']));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'scrinhouse_accounting.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Accounting</h1>
        <button className={styles.actionBtnOutline} onClick={exportCSV}>📥 Export CSV</button>
      </div>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Total Revenue</h3><p className={styles.statValue}>GHS {totalRevenue.toLocaleString()}</p></div>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Product Sales</h3><p className={styles.statValue}>GHS {data.revenue.toLocaleString()}</p></div>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Repair Income</h3><p className={styles.statValue}>GHS {data.repairRevenue.toLocaleString()}</p></div>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Refunds/Cancelled</h3><p className={styles.statValue} style={{ color: '#EF4444' }}>GHS {refundAmount.toLocaleString()}</p></div>
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}>Loading…</div> : (
        <div className={styles.card}><h2 className={styles.sectionTitle}>Net Profit Summary</h2><p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-accent-green)' }}>GHS {(totalRevenue - refundAmount).toLocaleString()}</p><p style={{ color: '#6B7280', marginTop: '0.5rem', fontSize: '0.875rem' }}>Total revenue minus cancelled orders/refunds. Export CSV for detailed breakdown.</p></div>
      )}
    </div>
  );
}

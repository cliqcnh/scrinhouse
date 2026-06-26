"use client";
import { useState, useEffect } from 'react';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import styles from './Admin.module.css';

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeRepairs: 0,
    totalOrders: 0,
    revenue: 0
  });
  
  const [recentRepairs, setRecentRepairs] = useState([]);

  useEffect(() => {
    // Fetch Products count
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snap) => {
      setStats(prev => ({ ...prev, totalProducts: snap.size }));
    });

    // Fetch Repairs
    const unsubscribeRepairs = onSnapshot(collection(db, 'repairs'), (snap) => {
      const repairs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const active = repairs.filter(r => r.status !== 'Completed').length;
      
      // Sort for recent
      repairs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setRecentRepairs(repairs.slice(0, 5));
      setStats(prev => ({ ...prev, activeRepairs: active }));
    });

    // Fetch Orders
    const unsubscribeOrders = onSnapshot(collection(db, 'orders'), (snap) => {
      let revenue = 0;
      snap.docs.forEach(doc => {
        const orderData = doc.data();
        if (orderData.status !== 'cancelled') {
          revenue += orderData.totalAmount || 0;
        }
      });
      setStats(prev => ({ ...prev, totalOrders: snap.size, revenue }));
    });

    return () => {
      unsubscribeProducts();
      unsubscribeRepairs();
      unsubscribeOrders();
    };
  }, []);

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard Overview</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/admin/products" style={{ background: '#111', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem' }}>
            + Add Product
          </Link>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Total Revenue</h3>
          <p className={styles.statValue}>GHS {stats.revenue.toLocaleString()}</p>
          <span className={`${styles.statChange} ${styles.statChangePositive}`}>+12% from last month</span>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Active Repairs</h3>
          <p className={styles.statValue}>{stats.activeRepairs}</p>
          <span className={`${styles.statChange} ${styles.statChangePositive}`}>Needs attention</span>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Total Orders</h3>
          <p className={styles.statValue}>{stats.totalOrders}</p>
          <span className={`${styles.statChange} ${styles.statChangePositive}`}>+5% from last month</span>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Products in Catalog</h3>
          <p className={styles.statValue}>{stats.totalProducts}</p>
          <span className={`${styles.statChange} ${styles.statChangePositive}`}>Live in shop</span>
        </div>
      </div>

      <div className={styles.dashboardSection}>
        <h2 className={styles.sectionTitle}>Recent Repair Bookings</h2>
        <Card className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Device</th>
                <th>Issue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRepairs.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No recent repairs</td>
                </tr>
              ) : (
                recentRepairs.map(repair => (
                  <tr key={repair.id}>
                    <td style={{ fontWeight: 600 }}>{repair.id.slice(0, 8).toUpperCase()}</td>
                    <td>{repair.brand} {repair.model}</td>
                    <td>{repair.problem}</td>
                    <td>
                      <span className={`${styles.badge} ${repair.status === 'Completed' ? '' : styles.badgeWarning}`}>
                        {repair.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

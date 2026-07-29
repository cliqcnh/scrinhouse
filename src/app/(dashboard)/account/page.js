"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import styles from './Account.module.css';

export default function AccountOverview() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ orders: 0, repairs: 0, wishlist: 0, notifications: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentRepairs, setRecentRepairs] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      try {
        // Fetch orders
        const ordersQ = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        let ordersDocs = [];
        try {
          const snap = await getDocs(ordersQ);
          ordersDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch {
          const fallback = query(collection(db, 'orders'), where('userId', '==', user.uid));
          const snap = await getDocs(fallback);
          ordersDocs = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
            .slice(0, 3);
        }

        // Fetch repairs
        const repairsQ = query(
          collection(db, 'repairs'),
          where('userId', '==', user.uid)
        );
        let repairsDocs = [];
        try {
          const snap = await getDocs(repairsQ);
          repairsDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch {
          repairsDocs = [];
        }

        // Fetch notifications count
        let notifCount = 0;
        try {
          const notifQ = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid),
            where('read', '==', false)
          );
          const notifSnap = await getDocs(notifQ);
          notifCount = notifSnap.size;
        } catch {
          notifCount = 0;
        }

        setStats({
          orders: ordersDocs.length,
          repairs: repairsDocs.length,
          wishlist: 0,
          notifications: notifCount,
        });
        setRecentOrders(ordersDocs);
        setRecentRepairs(repairsDocs.slice(0, 3));
      } catch (err) {
        console.error('Error fetching account data:', err);
      } finally {
        setLoadingData(false);
      }
    }

    fetchData();
  }, [user]);

  if (loadingData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>
        Loading your dashboard…
      </div>
    );
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Welcome back, {profile?.displayName || user?.displayName || 'Customer'} 👋</h1>
        <p className={styles.pageSubtitle}>Here's a summary of your account activity.</p>
      </div>

      {/* Quick Stats */}
      <div className={styles.statsRow}>
        <Link href="/account/orders" className={styles.statCard}>
          <div className={styles.statLabel}>Total Orders</div>
          <div className={styles.statValue}>{stats.orders}</div>
        </Link>
        <Link href="/account/repairs" className={styles.statCard}>
          <div className={styles.statLabel}>Repairs</div>
          <div className={styles.statValue}>{stats.repairs}</div>
        </Link>
        <Link href="/account/wishlist" className={styles.statCard}>
          <div className={styles.statLabel}>Wishlist</div>
          <div className={styles.statValue}>{stats.wishlist}</div>
        </Link>
        <Link href="/account/notifications" className={styles.statCard}>
          <div className={styles.statLabel}>Unread Notifications</div>
          <div className={styles.statValue}>{stats.notifications}</div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className={styles.contentCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Recent Orders</h2>
          <Link href="/account/orders" className={styles.btnOutline} style={{ fontSize: '0.78rem', padding: '0.4rem 0.875rem' }}>View All</Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🛒</div>
            <p className={styles.emptyTitle}>No orders yet</p>
            <p className={styles.emptyText}>Start shopping for quality iPhone screens and parts.</p>
            <Link href="/shop" className={styles.btnPrimary}>Shop Now</Link>
          </div>
        ) : (
          <div className={styles.itemList}>
            {recentOrders.map(order => (
              <div key={order.id} className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <div>
                    <div className={styles.itemId}>Order #{order.id.slice(-6).toUpperCase()}</div>
                    <div className={styles.itemDate}>
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Just now'}
                    </div>
                  </div>
                  <span className={`${styles.badge} ${
                    order.status === 'delivered' ? styles.badgeGreen :
                    order.status === 'cancelled' ? styles.badgeRed :
                    order.status === 'processing' ? styles.badgeBlue :
                    styles.badgeYellow
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className={styles.itemFooter}>
                  <span style={{ fontWeight: 600 }}>GHS {order.totalAmount?.toLocaleString()}</span>
                  <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                    {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Repairs */}
      <div className={styles.contentCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Recent Repairs</h2>
          <Link href="/account/repairs" className={styles.btnOutline} style={{ fontSize: '0.78rem', padding: '0.4rem 0.875rem' }}>View All</Link>
        </div>
        {recentRepairs.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔧</div>
            <p className={styles.emptyTitle}>No repairs booked</p>
            <p className={styles.emptyText}>Book a repair for your device and track it here.</p>
            <Link href="/repair-booking" className={styles.btnPrimary}>Book a Repair</Link>
          </div>
        ) : (
          <div className={styles.itemList}>
            {recentRepairs.map(repair => (
              <div key={repair.id} className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <div>
                    <div className={styles.itemId}>{repair.brand} {repair.model}</div>
                    <div className={styles.itemDate}>{repair.problem}</div>
                  </div>
                  <span className={`${styles.badge} ${
                    repair.status === 'Completed' ? styles.badgeGreen :
                    repair.status === 'In Progress' ? styles.badgeBlue :
                    styles.badgeYellow
                  }`}>
                    {repair.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

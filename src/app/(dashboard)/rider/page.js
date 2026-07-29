"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import styles from './Rider.module.css';

export default function RiderOverview() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ pendingPickups: 0, pendingDeliveries: 0, completedToday: 0, cashCollected: 0 });
  const [todayTasks, setTodayTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const riderId = user.uid;

    const qPickups = query(collection(db, 'pickups'), where('riderId', '==', riderId));
    const qDeliveries = query(collection(db, 'deliveries'), where('riderId', '==', riderId));

    const unsub1 = onSnapshot(qPickups, (pickSnap) => {
      const pickups = pickSnap.docs.map(d => ({ id: d.id, ...d.data(), type: 'pickup' }));

      const unsub2 = onSnapshot(qDeliveries, (delSnap) => {
        const deliveries = delSnap.docs.map(d => ({ id: d.id, ...d.data(), type: 'delivery' }));
        const all = [...pickups, ...deliveries];
        const today = new Date().toDateString();

        const todayCompleted = all.filter(t => {
          const d = t.completedAt?.toDate?.();
          return d && d.toDateString() === today;
        });

        const cashToday = todayCompleted
          .filter(t => t.cashAmount)
          .reduce((s, t) => s + (t.cashAmount || 0), 0);

        setStats({
          pendingPickups: pickups.filter(p => p.status !== 'completed').length,
          pendingDeliveries: deliveries.filter(d => d.status !== 'completed').length,
          completedToday: todayCompleted.length,
          cashCollected: cashToday,
        });

        setTodayTasks(all
          .filter(t => t.status !== 'completed')
          .sort((a, b) => (a.scheduledTime?.seconds || a.createdAt?.seconds || 0) - (b.scheduledTime?.seconds || b.createdAt?.seconds || 0))
          .slice(0, 5)
        );
        setLoading(false);
      }, () => setLoading(false));

      return () => unsub2();
    }, () => setLoading(false));

    return () => unsub1();
  }, [user]);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Today's Overview</h1>
          <p className={styles.pageSubtitle}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Pending Pickups</h3>
          <p className={styles.statValue} style={{ color: '#F97316' }}>{stats.pendingPickups}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Pending Deliveries</h3>
          <p className={styles.statValue} style={{ color: '#3B82F6' }}>{stats.pendingDeliveries}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Completed Today</h3>
          <p className={styles.statValue} style={{ color: '#16A34A' }}>{stats.completedToday}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Cash Collected</h3>
          <p className={styles.statValue}>GHS {stats.cashCollected.toLocaleString()}</p>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Upcoming Tasks</h2>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>Loading tasks…</div>
      ) : todayTasks.length === 0 ? (
        <div className={styles.card}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏍️</div>
            <p className={styles.emptyTitle}>No pending tasks</p>
            <p className={styles.emptyText}>All caught up! New assignments will appear here automatically.</p>
          </div>
        </div>
      ) : (
        todayTasks.map(task => (
          <Link
            key={task.id}
            href={task.type === 'pickup' ? `/rider/pickups/${task.id}` : `/rider/deliveries/${task.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className={styles.taskCard}>
              <div className={styles.taskHeader}>
                <div>
                  <div className={styles.taskTitle}>
                    {task.type === 'pickup' ? '📥 Pickup' : '📤 Delivery'} — {task.customerName || 'Customer'}
                  </div>
                  <div className={styles.taskSub}>{task.address || 'Address pending'}</div>
                </div>
                <span className={`${styles.badge} ${task.type === 'pickup' ? styles.badgeOrange : styles.badgeBlue}`}>
                  {task.status || 'pending'}
                </span>
              </div>
              <div className={styles.taskMeta}>
                <div className={styles.taskMetaItem}>📞 {task.customerPhone || 'N/A'}</div>
                {task.scheduledTime?.toDate && (
                  <div className={styles.taskMetaItem}>⏰ {task.scheduledTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                )}
                {task.cashAmount > 0 && <div className={styles.taskMetaItem}>💵 GHS {task.cashAmount}</div>}
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}

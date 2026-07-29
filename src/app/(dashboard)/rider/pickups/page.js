"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import styles from '../Rider.module.css';

export default function PickupsPage() {
  const { user } = useAuth();
  const [pickups, setPickups] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'pickups'), where('riderId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setPickups(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.scheduledTime?.seconds || a.createdAt?.seconds || 0) - (b.scheduledTime?.seconds || b.createdAt?.seconds || 0)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [user]);

  const filtered = filter === 'all' ? pickups : pickups.filter(p => p.status === filter);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Pickups</h1>
          <p className={styles.pageSubtitle}>{filtered.length} pickup{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['pending', 'in_transit', 'completed', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={filter === f ? styles.btnPrimary : styles.btnOutline} style={{ padding: '0.4rem 0.875rem', fontSize: '0.78rem', textTransform: 'capitalize' }}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div className={styles.card}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📥</div>
            <p className={styles.emptyTitle}>No {filter !== 'all' ? filter.replace('_', ' ') : ''} pickups</p>
            <p className={styles.emptyText}>Assigned pickups will appear here.</p>
          </div>
        </div>
      ) : (
        filtered.map(pickup => (
          <Link key={pickup.id} href={`/rider/pickups/${pickup.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={styles.taskCard}>
              <div className={styles.taskHeader}>
                <div>
                  <div className={styles.taskTitle}>📥 {pickup.customerName || 'Customer'}</div>
                  <div className={styles.taskSub}>{pickup.address || 'Address pending'}</div>
                </div>
                <span className={`${styles.badge} ${pickup.status === 'completed' ? '' : pickup.status === 'in_transit' ? styles.badgeBlue : styles.badgeOrange}`}>
                  {(pickup.status || 'pending').replace('_', ' ')}
                </span>
              </div>
              <div className={styles.taskMeta}>
                <div className={styles.taskMetaItem}>📞 {pickup.customerPhone || 'N/A'}</div>
                {pickup.scheduledTime?.toDate && <div className={styles.taskMetaItem}>⏰ {pickup.scheduledTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
                {pickup.deviceInfo && <div className={styles.taskMetaItem}>📱 {pickup.deviceInfo}</div>}
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}

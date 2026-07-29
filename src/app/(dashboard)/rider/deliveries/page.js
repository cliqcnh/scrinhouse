"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import styles from '../Rider.module.css';

export default function DeliveriesPage() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'deliveries'), where('riderId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setDeliveries(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.scheduledTime?.seconds || a.createdAt?.seconds || 0) - (b.scheduledTime?.seconds || b.createdAt?.seconds || 0)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [user]);

  const filtered = filter === 'all' ? deliveries : deliveries.filter(d => d.status === filter);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Deliveries</h1>
          <p className={styles.pageSubtitle}>{filtered.length} delivery{filtered.length !== 1 ? 'ies' : 'y'}</p>
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
            <div className={styles.emptyIcon}>📤</div>
            <p className={styles.emptyTitle}>No {filter !== 'all' ? filter.replace('_', ' ') : ''} deliveries</p>
            <p className={styles.emptyText}>Assigned deliveries will appear here.</p>
          </div>
        </div>
      ) : (
        filtered.map(del => (
          <Link key={del.id} href={`/rider/deliveries/${del.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={styles.taskCard}>
              <div className={styles.taskHeader}>
                <div>
                  <div className={styles.taskTitle}>📤 {del.customerName || 'Customer'}</div>
                  <div className={styles.taskSub}>{del.address || 'Address pending'}</div>
                </div>
                <span className={`${styles.badge} ${del.status === 'completed' ? '' : del.status === 'in_transit' ? styles.badgeBlue : styles.badgeOrange}`}>
                  {(del.status || 'pending').replace('_', ' ')}
                </span>
              </div>
              <div className={styles.taskMeta}>
                <div className={styles.taskMetaItem}>📞 {del.customerPhone || 'N/A'}</div>
                {del.cashAmount > 0 && <div className={styles.taskMetaItem}>💵 GHS {del.cashAmount}</div>}
                {del.orderRef && <div className={styles.taskMetaItem}>📦 #{del.orderRef.slice(-6).toUpperCase()}</div>}
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}

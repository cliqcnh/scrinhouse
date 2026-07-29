"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import styles from '../Account.module.css';

const STATUS_STEPS = ['Pending', 'Diagnosed', 'In Progress', 'Quality Check', 'Completed'];

export default function RepairsPage() {
  const { user } = useAuth();
  const [repairs, setRepairs] = useState([]);
  const [filter, setFilter] = useState('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'repairs'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      setRepairs(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      );
      setLoading(false);
    }, () => {
      // Fallback
      getDocs(q).then(snap => {
        setRepairs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });
    });

    return () => unsubscribe();
  }, [user]);

  const filtered = filter === 'all'
    ? repairs
    : filter === 'active'
    ? repairs.filter(r => r.status !== 'Completed')
    : repairs.filter(r => r.status === 'Completed');

  function getStepIndex(status) {
    const idx = STATUS_STEPS.findIndex(s => s === status);
    return idx >= 0 ? idx : 0;
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>My Repairs</h1>
        <p className={styles.pageSubtitle}>Track your current repairs and view repair history.</p>
        <a href="/account/repairs/book" className={`${styles.btn} ${styles.btnPrimary}`} style={{ marginTop: '0.75rem', display: 'inline-block' }}>+ Book a Repair</a>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['active', 'completed', 'all'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`${styles.btn} ${filter === f ? styles.btnPrimary : styles.btnOutline}`}
            style={{ padding: '0.4rem 0.875rem', fontSize: '0.78rem', textTransform: 'capitalize' }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>Loading repairs…</div>
      ) : filtered.length === 0 ? (
        <div className={styles.contentCard}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
            <p className={styles.emptyTitle}>No {filter !== 'all' ? filter : ''} repairs</p>
            <p className={styles.emptyText}>Book a repair to get started.</p>
            <Link href="/account/repairs/book" className={styles.btnPrimary}>Book a Repair</Link>
          </div>
        </div>
      ) : (
        <div className={styles.itemList}>
          {filtered.map(repair => {
            const stepIdx = getStepIndex(repair.status);
            return (
              <div key={repair.id} className={styles.contentCard}>
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

                {/* Progress Timeline */}
                {repair.status !== 'Completed' && (
                  <div style={{ margin: '1.25rem 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0' }}>
                    {STATUS_STEPS.map((step, i) => (
                      <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: '100%', display: 'flex', alignItems: 'center',
                        }}>
                          {i > 0 && (
                            <div style={{
                              flex: 1, height: '3px',
                              background: i <= stepIdx ? 'var(--color-accent-green)' : '#E5E7EB',
                              transition: 'background 0.3s',
                            }} />
                          )}
                          <div style={{
                            width: 24, height: 24, borderRadius: '50%',
                            background: i <= stepIdx ? 'var(--color-accent-green)' : '#E5E7EB',
                            color: i <= stepIdx ? '#fff' : '#9CA3AF',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.65rem', fontWeight: 700, flexShrink: 0,
                            transition: 'all 0.3s',
                          }}>
                            {i < stepIdx ? '✓' : i + 1}
                          </div>
                          {i < STATUS_STEPS.length - 1 && (
                            <div style={{
                              flex: 1, height: '3px',
                              background: i < stepIdx ? 'var(--color-accent-green)' : '#E5E7EB',
                              transition: 'background 0.3s',
                            }} />
                          )}
                        </div>
                        <span style={{
                          fontSize: '0.6rem', marginTop: '0.35rem',
                          color: i <= stepIdx ? 'var(--color-accent-green)' : '#9CA3AF',
                          fontWeight: i === stepIdx ? 700 : 400,
                          textAlign: 'center',
                        }}>
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.itemFooter} style={{ marginTop: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                    Booked: {repair.createdAt?.toDate ? repair.createdAt.toDate().toLocaleDateString() : 'Recently'}
                  </span>
                  <Link
                    href={`/track-repair?id=${repair.id}`}
                    className={`${styles.btnOutline} ${styles.btnSmall}`}
                  >
                    Track Status
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

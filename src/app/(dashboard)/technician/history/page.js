"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import styles from '../Technician.module.css';

export default function HistoryPage() {
  const { user, profile } = useAuth();
  const [repairs, setRepairs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile?.displayName) { setLoading(false); return; }
    async function fetch() {
      const q = query(collection(db, 'repairs'), where('assignedTechnician', '==', profile.displayName));
      const snap = await getDocs(q);
      setRepairs(
        snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .filter(r => r.status === 'Completed')
          .sort((a, b) => (b.completedAt?.seconds || b.createdAt?.seconds || 0) - (a.completedAt?.seconds || a.createdAt?.seconds || 0))
      );
      setLoading(false);
    }
    fetch();
  }, [user, profile]);

  const filtered = repairs.filter(r => {
    const t = search.toLowerCase();
    return (r.brand || '').toLowerCase().includes(t) || (r.model || '').toLowerCase().includes(t) || (r.problem || '').toLowerCase().includes(t) || (r.customerName || '').toLowerCase().includes(t);
  });

  const totalTime = repairs.reduce((s, r) => s + (r.timeSpent || 0), 0);
  const totalParts = repairs.reduce((s, r) => s + (r.partsUsed || []).reduce((ps, p) => ps + (p.cost * p.quantity), 0), 0);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Repair History</h1>
          <p className={styles.pageSubtitle}>{repairs.length} completed repair{repairs.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Total Repairs</h3>
          <p className={styles.statValue}>{repairs.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Total Time</h3>
          <p className={styles.statValue}>{Math.round(totalTime / 3600)}h {Math.round((totalTime % 3600) / 60)}m</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Avg. Time</h3>
          <p className={styles.statValue}>{repairs.length ? Math.round(totalTime / repairs.length / 60) : 0}min</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Parts Used</h3>
          <p className={styles.statValue}>GHS {totalParts.toLocaleString()}</p>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <input className={styles.formInput} placeholder="Search by device, problem, customer…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: '400px' }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>Loading history…</div>
      ) : filtered.length === 0 ? (
        <div className={styles.card}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📜</div>
            <p className={styles.emptyTitle}>No completed repairs</p>
            <p className={styles.emptyText}>Your repair history will appear here after completing jobs.</p>
          </div>
        </div>
      ) : (
        filtered.map(repair => (
          <Link key={repair.id} href={`/technician/jobs/${repair.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={styles.jobCard}>
              <div className={styles.jobHeader}>
                <div>
                  <div className={styles.jobDevice}>{repair.brand} {repair.model}</div>
                  <div className={styles.jobProblem}>{repair.problem}</div>
                </div>
                <span className={styles.badge}>Completed</span>
              </div>
              <div className={styles.jobMeta}>
                <div className={styles.jobMetaItem}>👤 {repair.customerName || 'Customer'}</div>
                <div className={styles.jobMetaItem}>⏱️ {repair.timeSpent ? `${Math.round(repair.timeSpent / 60)}min` : 'N/A'}</div>
                <div className={styles.jobMetaItem}>🔩 {(repair.partsUsed || []).length} parts</div>
                <div className={styles.jobMetaItem}>📅 {repair.completedAt?.toDate ? repair.completedAt.toDate().toLocaleDateString() : repair.createdAt?.toDate ? repair.createdAt.toDate().toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}

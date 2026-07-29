"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import styles from '../Technician.module.css';

export default function JobsPage() {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile?.displayName) { setLoading(false); return; }
    const q = query(collection(db, 'repairs'), where('assignedTechnician', '==', profile.displayName));
    const unsub = onSnapshot(q, (snap) => {
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [user, profile]);

  const filtered = filter === 'all' ? jobs
    : filter === 'active' ? jobs.filter(j => j.status !== 'Completed')
    : jobs.filter(j => j.status === 'Completed');

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Assigned Jobs</h1>
          <p className={styles.pageSubtitle}>{filtered.length} job{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['active', 'completed', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={filter === f ? styles.btnPrimary : styles.btnOutline} style={{ padding: '0.4rem 0.875rem', fontSize: '0.78rem', textTransform: 'capitalize' }}>
            {f} ({f === 'active' ? jobs.filter(j => j.status !== 'Completed').length : f === 'completed' ? jobs.filter(j => j.status === 'Completed').length : jobs.length})
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>Loading jobs…</div>
      ) : filtered.length === 0 ? (
        <div className={styles.card}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔧</div>
            <p className={styles.emptyTitle}>No {filter !== 'all' ? filter : ''} jobs</p>
            <p className={styles.emptyText}>Jobs assigned to you will appear here.</p>
          </div>
        </div>
      ) : (
        filtered.map(job => (
          <Link key={job.id} href={`/technician/jobs/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={styles.jobCard}>
              <div className={styles.jobHeader}>
                <div>
                  <div className={styles.jobDevice}>{job.brand} {job.model}</div>
                  <div className={styles.jobProblem}>{job.problem}</div>
                </div>
                <span className={`${styles.badge} ${
                  job.status === 'Completed' ? '' :
                  job.status === 'In Progress' ? styles.badgeBlue :
                  job.status === 'Quality Check' ? styles.badgePurple :
                  styles.badgeWarning
                }`}>
                  {job.status}
                </span>
              </div>
              <div className={styles.jobMeta}>
                <div className={styles.jobMetaItem}>👤 {job.customerName || 'Customer'}</div>
                <div className={styles.jobMetaItem}>📅 {job.createdAt?.toDate ? job.createdAt.toDate().toLocaleDateString() : 'N/A'}</div>
                {job.timeSpent && <div className={styles.jobMetaItem}>⏱️ {Math.round(job.timeSpent / 60)}min</div>}
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}

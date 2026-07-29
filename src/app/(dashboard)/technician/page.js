"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import styles from './Technician.module.css';

export default function TechnicianOverview() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ assigned: 0, inProgress: 0, completedToday: 0, totalCompleted: 0 });
  const [activeJobs, setActiveJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const techName = profile?.displayName || user?.displayName || '';
    if (!techName) { setLoading(false); return; }

    const q = query(collection(db, 'repairs'), where('assignedTechnician', '==', techName));
    const unsub = onSnapshot(q, (snap) => {
      const jobs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const today = new Date().toDateString();
      const completedToday = jobs.filter(j => {
        if (j.status !== 'Completed') return false;
        const d = j.completedAt?.toDate?.();
        return d && d.toDateString() === today;
      });

      setStats({
        assigned: jobs.filter(j => j.status === 'Pending' || j.status === 'Diagnosed').length,
        inProgress: jobs.filter(j => j.status === 'In Progress' || j.status === 'Quality Check').length,
        completedToday: completedToday.length,
        totalCompleted: jobs.filter(j => j.status === 'Completed').length,
      });
      setActiveJobs(jobs.filter(j => j.status !== 'Completed').sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)));
      setLoading(false);
    }, () => setLoading(false));

    return () => unsub();
  }, [user, profile]);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubtitle}>
            Welcome back, {profile?.displayName || 'Technician'}. Here's your workday overview.
          </p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Assigned</h3>
          <p className={styles.statValue} style={{ color: '#F59E0B' }}>{stats.assigned}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>In Progress</h3>
          <p className={styles.statValue} style={{ color: '#3B82F6' }}>{stats.inProgress}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Completed Today</h3>
          <p className={styles.statValue} style={{ color: '#16A34A' }}>{stats.completedToday}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Total Completed</h3>
          <p className={styles.statValue}>{stats.totalCompleted}</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>Loading jobs…</div>
      ) : (
        <div>
          <h2 className={styles.sectionTitle}>Active Jobs</h2>
          {activeJobs.length === 0 ? (
            <div className={styles.card}>
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>✅</div>
                <p className={styles.emptyTitle}>All clear!</p>
                <p className={styles.emptyText}>No active jobs right now. New assignments will appear here.</p>
              </div>
            </div>
          ) : (
            activeJobs.map(job => (
              <Link key={job.id} href={`/technician/jobs/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={styles.jobCard}>
                  <div className={styles.jobHeader}>
                    <div>
                      <div className={styles.jobDevice}>{job.brand} {job.model}</div>
                      <div className={styles.jobProblem}>{job.problem}</div>
                    </div>
                    <span className={`${styles.badge} ${
                      job.status === 'In Progress' ? styles.badgeBlue :
                      job.status === 'Quality Check' ? styles.badgePurple :
                      styles.badgeWarning
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <div className={styles.jobMeta}>
                    <div className={styles.jobMetaItem}>
                      👤 {job.customerName || 'Customer'}
                    </div>
                    <div className={styles.jobMetaItem}>
                      📞 {job.customerPhone || 'N/A'}
                    </div>
                    <div className={styles.jobMetaItem}>
                      📅 {job.createdAt?.toDate ? job.createdAt.toDate().toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import styles from '../Admin.module.css';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'audit_logs'), (snap) => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)).slice(0, 200));
    });
    return () => unsub();
  }, []);

  const actions = [...new Set(logs.map(l => l.action))].filter(Boolean);

  const filtered = logs
    .filter(l => filterAction === 'all' || l.action === filterAction)
    .filter(l => {
      const term = search.toLowerCase();
      return (l.action || '').toLowerCase().includes(term) || (l.userName || '').toLowerCase().includes(term) || (l.details || '').toLowerCase().includes(term) || (l.target || '').toLowerCase().includes(term);
    });

  return (
    <div>
      <div className={styles.pageHeader}><h1 className={styles.pageTitle}>Audit Logs</h1></div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Total Entries</h3><p className={styles.statValue}>{logs.length}</p></div>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Today</h3><p className={styles.statValue}>{logs.filter(l => { const d = l.timestamp?.toDate?.(); return d && d.toDateString() === new Date().toDateString(); }).length}</p></div>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Unique Users</h3><p className={styles.statValue}>{new Set(logs.map(l => l.userId)).size}</p></div>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Action Types</h3><p className={styles.statValue}>{actions.length}</p></div>
      </div>

      <div className={styles.toolbar}>
        <input className={styles.searchInput} placeholder="Search logs…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className={styles.filterSelect} value={filterAction} onChange={e => setFilterAction(e.target.value)}>
          <option value="all">All Actions</option>
          {actions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
        <table className={styles.table}>
          <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Target</th><th>Details</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No audit logs found. Actions performed in the admin panel will be recorded here.</td></tr>
            ) : filtered.map(l => (
              <tr key={l.id}>
                <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{l.timestamp?.toDate ? l.timestamp.toDate().toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                <td style={{ fontWeight: 500 }}>{l.userName || l.userId?.slice(0, 8) || 'System'}</td>
                <td><span className={`${styles.badge} ${l.action?.includes('delete') ? styles.badgeError : l.action?.includes('create') ? '' : styles.badgeBlue}`} style={{ textTransform: 'capitalize' }}>{l.action || '—'}</span></td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{l.target || '—'}</td>
                <td style={{ fontSize: '0.8rem', maxWidth: '250px', color: '#6B7280' }}>{l.details || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

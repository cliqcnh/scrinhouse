"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import styles from '../Admin.module.css';

const REPAIR_STATUSES = ['Pending', 'Diagnosed', 'In Progress', 'Quality Check', 'Completed'];

export default function RepairQueuePage() {
  const [repairs, setRepairs] = useState([]);
  const [filter, setFilter] = useState('active');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'repairs'), (snap) => {
      setRepairs(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });
    return () => unsubscribe();
  }, []);

  const filtered = repairs
    .filter(r => filter === 'all' ? true : filter === 'active' ? r.status !== 'Completed' : r.status === 'Completed')
    .filter(r => {
      const term = search.toLowerCase();
      return (r.brand || '').toLowerCase().includes(term) || (r.model || '').toLowerCase().includes(term) || (r.customerName || '').toLowerCase().includes(term) || r.id.toLowerCase().includes(term);
    });

  async function advanceRepair(repair) {
    const idx = REPAIR_STATUSES.indexOf(repair.status);
    if (idx < 0 || idx >= REPAIR_STATUSES.length - 1) return;
    await updateDoc(doc(db, 'repairs', repair.id), { status: REPAIR_STATUSES[idx + 1] });
  }

  async function assignTechnician(repairId, techName) {
    await updateDoc(doc(db, 'repairs', repairId), { assignedTechnician: techName });
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Repair Queue</h1>
      </div>

      <div className={styles.statsGrid}>
        {REPAIR_STATUSES.map(status => (
          <div key={status} className={styles.statCard}>
            <h3 className={styles.statTitle}>{status}</h3>
            <p className={styles.statValue}>{repairs.filter(r => r.status === status).length}</p>
          </div>
        ))}
      </div>

      <div className={styles.toolbar}>
        <input className={styles.searchInput} placeholder="Search by device, customer…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className={styles.filterSelect} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="all">All</option>
        </select>
      </div>

      <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Device</th>
              <th>Issue</th>
              <th>Customer</th>
              <th>Technician</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No repairs found</td></tr>
            ) : filtered.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.id.slice(0, 8).toUpperCase()}</td>
                <td>{r.brand} {r.model}</td>
                <td style={{ maxWidth: '200px' }}>{r.problem}</td>
                <td>
                  <div>{r.customerName || 'N/A'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{r.customerPhone || ''}</div>
                </td>
                <td>
                  <input
                    className={styles.formInput}
                    style={{ width: '120px', padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                    placeholder="Assign…"
                    defaultValue={r.assignedTechnician || ''}
                    onBlur={e => assignTechnician(r.id, e.target.value)}
                  />
                </td>
                <td>
                  <span className={`${styles.badge} ${r.status === 'Completed' ? '' : r.status === 'Pending' ? styles.badgeWarning : styles.badgeBlue}`}>
                    {r.status}
                  </span>
                </td>
                <td>
                  {r.status !== 'Completed' && (
                    <button className={styles.actionBtnPrimary} style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }} onClick={() => advanceRepair(r)}>
                      → {REPAIR_STATUSES[REPAIR_STATUSES.indexOf(r.status) + 1] || ''}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

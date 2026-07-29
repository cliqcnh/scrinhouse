"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import styles from '../Admin.module.css';

export default function RidersPage() {
  const [riders, setRiders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', zone: '', vehicleType: 'motorcycle', status: 'active' });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'riders'), (snap) => {
      setRiders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  async function saveRider(e) {
    e.preventDefault();
    const id = form.id || `rider_${Date.now()}`;
    await setDoc(doc(db, 'riders', id), { ...form, updatedAt: serverTimestamp(), ...(form.id ? {} : { createdAt: serverTimestamp(), totalDeliveries: 0, cashCollected: 0 }) }, { merge: true });
    setForm({ name: '', phone: '', zone: '', vehicleType: 'motorcycle', status: 'active' });
    setShowForm(false);
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Riders</h1>
        <button className={styles.actionBtnPrimary} onClick={() => { setForm({ name: '', phone: '', zone: '', vehicleType: 'motorcycle', status: 'active' }); setShowForm(true); }}>+ Add Rider</button>
      </div>

      {showForm && (
        <div className={styles.card} style={{ marginBottom: '1.5rem' }}>
          <form onSubmit={saveRider} className={styles.formGrid}>
            <div className={styles.formGroup}><label className={styles.formLabel}>Name</label><input className={styles.formInput} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
            <div className={styles.formGroup}><label className={styles.formLabel}>Phone</label><input className={styles.formInput} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required /></div>
            <div className={styles.formGroup}><label className={styles.formLabel}>Zone</label><input className={styles.formInput} placeholder="Accra Central" value={form.zone} onChange={e => setForm(p => ({ ...p, zone: e.target.value }))} /></div>
            <div className={styles.formGroup}><label className={styles.formLabel}>Vehicle</label>
              <select className={styles.formInput} value={form.vehicleType} onChange={e => setForm(p => ({ ...p, vehicleType: e.target.value }))}>
                <option value="motorcycle">Motorcycle</option><option value="car">Car</option><option value="bicycle">Bicycle</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'end' }}>
              <button type="submit" className={styles.actionBtnPrimary}>Save</button>
              <button type="button" className={styles.actionBtnOutline} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
        <table className={styles.table}>
          <thead><tr><th>Name</th><th>Phone</th><th>Zone</th><th>Vehicle</th><th>Deliveries</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {riders.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No riders added</td></tr>
            ) : riders.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600 }}>{r.name}</td>
                <td>{r.phone}</td>
                <td>{r.zone || '—'}</td>
                <td style={{ textTransform: 'capitalize' }}>{r.vehicleType}</td>
                <td>{r.totalDeliveries || 0}</td>
                <td><span className={`${styles.badge} ${r.status === 'active' ? '' : styles.badgeWarning}`}>{r.status}</span></td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className={styles.actionBtnOutline} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => { setForm(r); setShowForm(true); }}>Edit</button>
                  <button className={styles.actionBtnDanger} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={async () => { if (confirm('Remove?')) await deleteDoc(doc(db, 'riders', r.id)); }}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

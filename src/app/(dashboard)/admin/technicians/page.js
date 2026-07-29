"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import styles from '../Admin.module.css';

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', skills: '', status: 'active' });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'technicians'), (snap) => {
      setTechnicians(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  async function saveTechnician(e) {
    e.preventDefault();
    const id = form.id || `tech_${Date.now()}`;
    await setDoc(doc(db, 'technicians', id), {
      ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean), updatedAt: serverTimestamp(),
      ...(form.id ? {} : { createdAt: serverTimestamp() }),
    }, { merge: true });
    setForm({ name: '', phone: '', email: '', skills: '', status: 'active' });
    setShowForm(false);
  }

  async function removeTechnician(id) {
    if (!confirm('Remove this technician?')) return;
    await deleteDoc(doc(db, 'technicians', id));
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Technicians</h1>
        <button className={styles.actionBtnPrimary} onClick={() => { setForm({ name: '', phone: '', email: '', skills: '', status: 'active' }); setShowForm(true); }}>+ Add Technician</button>
      </div>

      {showForm && (
        <div className={styles.card} style={{ marginBottom: '1.5rem' }}>
          <form onSubmit={saveTechnician} className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Name</label>
              <input className={styles.formInput} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Phone</label>
              <input className={styles.formInput} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email</label>
              <input className={styles.formInput} type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Skills (comma-separated)</label>
              <input className={styles.formInput} placeholder="Screen repair, Battery, etc." value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Status</label>
              <select className={styles.formInput} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
          <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Skills</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {technicians.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No technicians added</td></tr>
            ) : technicians.map(t => (
              <tr key={t.id}>
                <td style={{ fontWeight: 600 }}>{t.name}</td>
                <td>{t.phone || '—'}</td>
                <td>{t.email || '—'}</td>
                <td>{Array.isArray(t.skills) ? t.skills.join(', ') : t.skills || '—'}</td>
                <td><span className={`${styles.badge} ${t.status === 'active' ? '' : styles.badgeWarning}`}>{t.status}</span></td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className={styles.actionBtnOutline} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => { setForm({ ...t, skills: Array.isArray(t.skills) ? t.skills.join(', ') : t.skills || '' }); setShowForm(true); }}>Edit</button>
                  <button className={styles.actionBtnDanger} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => removeTechnician(t.id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

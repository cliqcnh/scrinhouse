"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import styles from '../Admin.module.css';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', contact: '', phone: '', email: '', location: '', notes: '' });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'suppliers'), s => setSuppliers(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, []);

  async function save(e) { e.preventDefault(); const id = form.id || `sup_${Date.now()}`; await setDoc(doc(db, 'suppliers', id), { ...form, updatedAt: serverTimestamp(), ...(form.id ? {} : { createdAt: serverTimestamp() }) }, { merge: true }); setForm({ name: '', contact: '', phone: '', email: '', location: '', notes: '' }); setShowForm(false); }

  return (
    <div>
      <div className={styles.pageHeader}><h1 className={styles.pageTitle}>Suppliers</h1><button className={styles.actionBtnPrimary} onClick={() => { setForm({ name: '', contact: '', phone: '', email: '', location: '', notes: '' }); setShowForm(true); }}>+ Add Supplier</button></div>
      {showForm && (<div className={styles.card} style={{ marginBottom: '1.5rem' }}><form onSubmit={save} className={styles.formGrid}>
        <div className={styles.formGroup}><label className={styles.formLabel}>Company Name</label><input className={styles.formInput} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
        <div className={styles.formGroup}><label className={styles.formLabel}>Contact Person</label><input className={styles.formInput} value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} /></div>
        <div className={styles.formGroup}><label className={styles.formLabel}>Phone</label><input className={styles.formInput} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
        <div className={styles.formGroup}><label className={styles.formLabel}>Email</label><input className={styles.formInput} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
        <div className={styles.formGroup}><label className={styles.formLabel}>Location</label><input className={styles.formInput} value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
        <div className={styles.formGroup}><label className={styles.formLabel}>Notes</label><input className={styles.formInput} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
        <div style={{ display: 'flex', gap: '0.75rem' }}><button type="submit" className={styles.actionBtnPrimary}>Save</button><button type="button" className={styles.actionBtnOutline} onClick={() => setShowForm(false)}>Cancel</button></div>
      </form></div>)}
      <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}><table className={styles.table}><thead><tr><th>Company</th><th>Contact</th><th>Phone</th><th>Email</th><th>Location</th><th>Actions</th></tr></thead><tbody>
        {suppliers.length === 0 ? <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No suppliers</td></tr> :
          suppliers.map(s => (<tr key={s.id}><td style={{ fontWeight: 600 }}>{s.name}</td><td>{s.contact || '—'}</td><td>{s.phone || '—'}</td><td>{s.email || '—'}</td><td>{s.location || '—'}</td><td style={{ display: 'flex', gap: '0.5rem' }}><button className={styles.actionBtnOutline} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => { setForm(s); setShowForm(true); }}>Edit</button><button className={styles.actionBtnDanger} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={async () => { if (confirm('Remove?')) await deleteDoc(doc(db, 'suppliers', s.id)); }}>Remove</button></td></tr>))}
      </tbody></table></div>
    </div>
  );
}

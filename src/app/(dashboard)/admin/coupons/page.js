"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import styles from '../Admin.module.css';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', discount: '', type: 'percentage', minOrder: '', maxUses: '', expiresAt: '', active: true });

  useEffect(() => { const u = onSnapshot(collection(db, 'coupons'), s => setCoupons(s.docs.map(d => ({ id: d.id, ...d.data() })))); return () => u(); }, []);

  async function save(e) { e.preventDefault(); const id = form.id || form.code.toUpperCase().replace(/\s/g, ''); await setDoc(doc(db, 'coupons', id), { ...form, code: form.code.toUpperCase(), discount: Number(form.discount), minOrder: Number(form.minOrder) || 0, maxUses: Number(form.maxUses) || 0, usedCount: form.usedCount || 0, updatedAt: serverTimestamp(), ...(form.id ? {} : { createdAt: serverTimestamp() }) }, { merge: true }); setForm({ code: '', discount: '', type: 'percentage', minOrder: '', maxUses: '', expiresAt: '', active: true }); setShowForm(false); }

  return (
    <div>
      <div className={styles.pageHeader}><h1 className={styles.pageTitle}>Coupons</h1><button className={styles.actionBtnPrimary} onClick={() => { setForm({ code: '', discount: '', type: 'percentage', minOrder: '', maxUses: '', expiresAt: '', active: true }); setShowForm(true); }}>+ Create Coupon</button></div>
      {showForm && (<div className={styles.card} style={{ marginBottom: '1.5rem' }}><form onSubmit={save} className={styles.formGrid}>
        <div className={styles.formGroup}><label className={styles.formLabel}>Code</label><input className={styles.formInput} placeholder="SAVE10" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} required style={{ textTransform: 'uppercase' }} /></div>
        <div className={styles.formGroup}><label className={styles.formLabel}>Discount</label><input className={styles.formInput} type="number" placeholder="10" value={form.discount} onChange={e => setForm(p => ({ ...p, discount: e.target.value }))} required /></div>
        <div className={styles.formGroup}><label className={styles.formLabel}>Type</label><select className={styles.formInput} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}><option value="percentage">Percentage (%)</option><option value="fixed">Fixed (GHS)</option></select></div>
        <div className={styles.formGroup}><label className={styles.formLabel}>Min Order (GHS)</label><input className={styles.formInput} type="number" value={form.minOrder} onChange={e => setForm(p => ({ ...p, minOrder: e.target.value }))} /></div>
        <div className={styles.formGroup}><label className={styles.formLabel}>Max Uses</label><input className={styles.formInput} type="number" placeholder="0 = unlimited" value={form.maxUses} onChange={e => setForm(p => ({ ...p, maxUses: e.target.value }))} /></div>
        <div className={styles.formGroup}><label className={styles.formLabel}>Expires</label><input className={styles.formInput} type="date" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} /></div>
        <div style={{ display: 'flex', gap: '0.75rem' }}><button type="submit" className={styles.actionBtnPrimary}>Save</button><button type="button" className={styles.actionBtnOutline} onClick={() => setShowForm(false)}>Cancel</button></div>
      </form></div>)}
      <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}><table className={styles.table}><thead><tr><th>Code</th><th>Discount</th><th>Min Order</th><th>Uses</th><th>Expires</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        {coupons.length === 0 ? <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No coupons</td></tr> :
          coupons.map(c => (<tr key={c.id}><td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{c.code}</td><td>{c.discount}{c.type === 'percentage' ? '%' : ' GHS'}</td><td>GHS {c.minOrder || 0}</td><td>{c.usedCount || 0}{c.maxUses ? ` / ${c.maxUses}` : ''}</td><td style={{ fontSize: '0.8rem' }}>{c.expiresAt || 'Never'}</td><td><span className={`${styles.badge} ${c.active ? '' : styles.badgeWarning}`}>{c.active ? 'Active' : 'Inactive'}</span></td><td style={{ display: 'flex', gap: '0.5rem' }}><button className={styles.actionBtnOutline} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => { setForm(c); setShowForm(true); }}>Edit</button><button className={styles.actionBtnDanger} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={async () => { if (confirm('Delete?')) await deleteDoc(doc(db, 'coupons', c.id)); }}>Delete</button></td></tr>))}
      </tbody></table></div>
    </div>
  );
}

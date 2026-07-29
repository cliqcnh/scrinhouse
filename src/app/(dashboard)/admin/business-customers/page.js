"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import styles from '../Admin.module.css';

export default function BusinessCustomersPage() {
  const [businesses, setBusinesses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ companyName: '', contactPerson: '', phone: '', email: '', creditLimit: '', discountTier: 'standard', notes: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const snap = await getDocs(collection(db, 'users'));
      setBusinesses(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role === 'business_customer'));
      setLoading(false);
    }
    fetch();
  }, []);

  async function save(e) {
    e.preventDefault();
    const id = form.id || `biz_${Date.now()}`;
    await setDoc(doc(db, 'users', id), {
      ...form, role: 'business_customer', creditLimit: Number(form.creditLimit) || 0,
      updatedAt: serverTimestamp(), ...(form.id ? {} : { createdAt: serverTimestamp(), loyaltyPoints: 0, addresses: [] }),
    }, { merge: true });
    const snap = await getDocs(collection(db, 'users'));
    setBusinesses(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role === 'business_customer'));
    setForm({ companyName: '', contactPerson: '', phone: '', email: '', creditLimit: '', discountTier: 'standard', notes: '' });
    setShowForm(false);
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Business Customers</h1>
        <button className={styles.actionBtnPrimary} onClick={() => { setForm({ companyName: '', contactPerson: '', phone: '', email: '', creditLimit: '', discountTier: 'standard', notes: '' }); setShowForm(true); }}>+ Add Business</button>
      </div>

      {showForm && (
        <div className={styles.card} style={{ marginBottom: '1.5rem' }}>
          <form onSubmit={save} className={styles.formGrid}>
            <div className={styles.formGroup}><label className={styles.formLabel}>Company Name</label><input className={styles.formInput} value={form.companyName} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))} required /></div>
            <div className={styles.formGroup}><label className={styles.formLabel}>Contact Person</label><input className={styles.formInput} value={form.contactPerson} onChange={e => setForm(p => ({ ...p, contactPerson: e.target.value }))} /></div>
            <div className={styles.formGroup}><label className={styles.formLabel}>Phone</label><input className={styles.formInput} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required /></div>
            <div className={styles.formGroup}><label className={styles.formLabel}>Email</label><input className={styles.formInput} type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
            <div className={styles.formGroup}><label className={styles.formLabel}>Credit Limit (GHS)</label><input className={styles.formInput} type="number" value={form.creditLimit} onChange={e => setForm(p => ({ ...p, creditLimit: e.target.value }))} /></div>
            <div className={styles.formGroup}><label className={styles.formLabel}>Discount Tier</label>
              <select className={styles.formInput} value={form.discountTier} onChange={e => setForm(p => ({ ...p, discountTier: e.target.value }))}>
                <option value="standard">Standard (0%)</option><option value="silver">Silver (5%)</option><option value="gold">Gold (10%)</option><option value="platinum">Platinum (15%)</option>
              </select>
            </div>
            <div className={styles.formGroup} style={{ gridColumn: '1/-1' }}><label className={styles.formLabel}>Notes</label><textarea className={styles.formInput} rows="2" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
            <div style={{ display: 'flex', gap: '0.75rem' }}><button type="submit" className={styles.actionBtnPrimary}>Save</button><button type="button" className={styles.actionBtnOutline} onClick={() => setShowForm(false)}>Cancel</button></div>
          </form>
        </div>
      )}

      {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}>Loading…</div> : (
        <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
          <table className={styles.table}>
            <thead><tr><th>Company</th><th>Contact</th><th>Phone</th><th>Email</th><th>Credit Limit</th><th>Tier</th><th>Actions</th></tr></thead>
            <tbody>
              {businesses.length === 0 ? <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No business customers</td></tr> :
                businesses.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600 }}>{b.companyName || b.displayName || 'N/A'}</td>
                    <td>{b.contactPerson || '—'}</td>
                    <td>{b.phone || '—'}</td>
                    <td>{b.email || '—'}</td>
                    <td>GHS {(b.creditLimit || 0).toLocaleString()}</td>
                    <td><span className={`${styles.badge} ${b.discountTier === 'platinum' ? styles.badgeBlue : b.discountTier === 'gold' ? styles.badgeWarning : ''}`} style={{ textTransform: 'capitalize' }}>{b.discountTier || 'standard'}</span></td>
                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className={styles.actionBtnOutline} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => { setForm(b); setShowForm(true); }}>Edit</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

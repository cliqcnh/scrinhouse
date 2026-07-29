"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import styles from '../Account.module.css';

export default function AddressesPage() {
  const { user, profile } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  const [form, setForm] = useState({ label: '', line1: '', line2: '', city: '', region: '', phone: '', isDefault: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.addresses) {
      setAddresses(profile.addresses);
    }
  }, [profile]);

  function resetForm() {
    setForm({ label: '', line1: '', line2: '', city: '', region: '', phone: '', isDefault: false });
    setEditIndex(-1);
    setShowForm(false);
  }

  async function saveAddress(e) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      let updated = [...addresses];

      if (form.isDefault) {
        updated = updated.map(a => ({ ...a, isDefault: false }));
      }

      if (editIndex >= 0) {
        updated[editIndex] = { ...form };
      } else {
        if (updated.length === 0) form.isDefault = true;
        updated.push({ ...form });
      }

      await updateDoc(doc(db, 'users', user.uid), { addresses: updated });
      setAddresses(updated);
      resetForm();
    } catch (err) {
      console.error('Error saving address:', err);
      alert('Failed to save address. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteAddress(index) {
    if (!confirm('Delete this address?')) return;
    const updated = addresses.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some(a => a.isDefault)) {
      updated[0].isDefault = true;
    }
    await updateDoc(doc(db, 'users', user.uid), { addresses: updated });
    setAddresses(updated);
  }

  async function setDefault(index) {
    const updated = addresses.map((a, i) => ({ ...a, isDefault: i === index }));
    await updateDoc(doc(db, 'users', user.uid), { addresses: updated });
    setAddresses(updated);
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Saved Addresses</h1>
        <p className={styles.pageSubtitle}>Manage your delivery and pickup addresses.</p>
      </div>

      {!showForm && (
        <button
          className={styles.btnPrimary}
          onClick={() => { resetForm(); setShowForm(true); }}
          style={{ marginBottom: '1.5rem' }}
        >
          + Add New Address
        </button>
      )}

      {showForm && (
        <div className={styles.contentCard} style={{ marginBottom: '1.5rem' }}>
          <h2 className={styles.sectionTitle}>{editIndex >= 0 ? 'Edit Address' : 'Add New Address'}</h2>
          <form onSubmit={saveAddress} className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Label</label>
              <input className={styles.formInput} placeholder="Home, Office, etc." value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Phone</label>
              <input className={styles.formInput} type="tel" placeholder="+233 24 xxx xxxx" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className={styles.formGroupFull}>
              <label className={styles.formLabel}>Address Line 1</label>
              <input className={styles.formInput} placeholder="Street address" value={form.line1} onChange={e => setForm(p => ({ ...p, line1: e.target.value }))} required />
            </div>
            <div className={styles.formGroupFull}>
              <label className={styles.formLabel}>Address Line 2</label>
              <input className={styles.formInput} placeholder="Apartment, suite, etc. (optional)" value={form.line2} onChange={e => setForm(p => ({ ...p, line2: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>City / Town</label>
              <input className={styles.formInput} placeholder="Accra" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Region</label>
              <select className={styles.formInput} value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))} required>
                <option value="">Select region</option>
                {['Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern', 'Northern', 'Volta', 'Upper East', 'Upper West', 'Brong-Ahafo', 'Bono East', 'Ahafo', 'Western North', 'Oti', 'North East', 'Savannah'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroupFull}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isDefault} onChange={e => setForm(p => ({ ...p, isDefault: e.target.checked }))} />
                <span className={styles.formLabel} style={{ marginBottom: 0 }}>Set as default address</span>
              </label>
            </div>
            <div className={styles.formGroupFull} style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className={styles.btnPrimary} disabled={saving}>
                {saving ? 'Saving…' : editIndex >= 0 ? 'Update Address' : 'Save Address'}
              </button>
              <button type="button" className={styles.btnOutline} onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className={styles.contentCard}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📍</div>
            <p className={styles.emptyTitle}>No saved addresses</p>
            <p className={styles.emptyText}>Add an address for faster checkout and pickup/delivery.</p>
          </div>
        </div>
      ) : (
        <div className={styles.itemList}>
          {addresses.map((addr, i) => (
            <div key={i} className={styles.itemCard}>
              <div className={styles.itemHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className={styles.itemId}>{addr.label || 'Address'}</div>
                  {addr.isDefault && <span className={`${styles.badge} ${styles.badgeGreen}`}>Default</span>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className={`${styles.btnOutline} ${styles.btnSmall}`}
                    onClick={() => { setForm(addr); setEditIndex(i); setShowForm(true); }}
                  >
                    Edit
                  </button>
                  <button className={`${styles.btnDanger} ${styles.btnSmall}`} onClick={() => deleteAddress(i)}>
                    Delete
                  </button>
                </div>
              </div>
              <div className={styles.itemBody}>
                <div>{addr.line1}</div>
                {addr.line2 && <div>{addr.line2}</div>}
                <div>{addr.city}{addr.region ? `, ${addr.region}` : ''}</div>
                {addr.phone && <div style={{ marginTop: '0.25rem', color: '#6B7280' }}>{addr.phone}</div>}
              </div>
              {!addr.isDefault && (
                <button
                  className={`${styles.btnOutline} ${styles.btnSmall}`}
                  onClick={() => setDefault(i)}
                  style={{ marginTop: '0.5rem' }}
                >
                  Set as Default
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import styles from '../Admin.module.css';

const DEFAULT_PROBLEMS = [
  'Screen Replacement',
  'Battery Replacement',
  'Charging Port Issue',
  'Camera Repair',
  'Speaker / Microphone',
  'Water Damage',
  'Back Glass Replacement',
  'Software Issue',
  'Other',
];

export default function RepairPricingPage() {
  const [prices, setPrices] = useState([]);
  const [form, setForm] = useState({ problem: '', brand: 'All', minPrice: '', maxPrice: '', turnaround: '', notes: '' });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const u = onSnapshot(collection(db, 'repair_pricing'), snap => {
      setPrices(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.problem?.localeCompare(b.problem)));
    });
    return () => u();
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function save(e) {
    e.preventDefault();
    if (!form.problem) return;
    setSaving(true);
    try {
      const id = editing || `${form.brand}_${form.problem}`.replace(/\s+/g, '_').toLowerCase();
      await setDoc(doc(db, 'repair_pricing', id), {
        problem: form.problem,
        brand: form.brand || 'All',
        minPrice: Number(form.minPrice) || 0,
        maxPrice: Number(form.maxPrice) || 0,
        turnaround: form.turnaround || '',
        notes: form.notes || '',
        updatedAt: new Date().toISOString(),
      });
      setForm({ problem: '', brand: 'All', minPrice: '', maxPrice: '', turnaround: '', notes: '' });
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(p) {
    setEditing(p.id);
    setForm({ problem: p.problem, brand: p.brand || 'All', minPrice: p.minPrice, maxPrice: p.maxPrice, turnaround: p.turnaround || '', notes: p.notes || '' });
  }

  async function remove(id) {
    if (confirm('Delete this pricing entry?')) await deleteDoc(doc(db, 'repair_pricing', id));
  }

  const inputStyle = { padding: '0.6rem 0.875rem', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: '0.875rem', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Repair Pricing</h1>
        <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.25rem' }}>
          Set price estimates shown to customers when booking repairs.
        </p>
      </div>

      {/* Form */}
      <div className={styles.card} style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>
          {editing ? 'Edit Pricing' : 'Add Pricing'}
        </h2>
        <form onSubmit={save}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className={styles.formLabel}>Problem Type</label>
              <select style={inputStyle} value={form.problem} onChange={e => set('problem', e.target.value)} required>
                <option value="">Select problem</option>
                {DEFAULT_PROBLEMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className={styles.formLabel}>Device Brand</label>
              <select style={inputStyle} value={form.brand} onChange={e => set('brand', e.target.value)}>
                <option value="All">All Brands</option>
                <option value="Apple">Apple</option>
                <option value="Samsung">Samsung</option>
                <option value="Tecno">Tecno</option>
                <option value="Infinix">Infinix</option>
                <option value="Huawei">Huawei</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={styles.formLabel}>Min Price (GHS)</label>
              <input style={inputStyle} type="number" min="0" placeholder="e.g. 200" value={form.minPrice} onChange={e => set('minPrice', e.target.value)} required />
            </div>
            <div>
              <label className={styles.formLabel}>Max Price (GHS)</label>
              <input style={inputStyle} type="number" min="0" placeholder="e.g. 400" value={form.maxPrice} onChange={e => set('maxPrice', e.target.value)} required />
            </div>
            <div>
              <label className={styles.formLabel}>Turnaround Time</label>
              <input style={inputStyle} placeholder="e.g. 45–90 minutes" value={form.turnaround} onChange={e => set('turnaround', e.target.value)} />
            </div>
            <div>
              <label className={styles.formLabel}>Notes (optional)</label>
              <input style={inputStyle} placeholder="e.g. Includes 90-day warranty" value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className={styles.actionBtnPrimary} disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Update' : 'Add Pricing'}
            </button>
            {editing && (
              <button type="button" className={styles.actionBtnOutline} onClick={() => { setEditing(null); setForm({ problem: '', brand: 'All', minPrice: '', maxPrice: '', turnaround: '', notes: '' }); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Problem</th>
              <th>Brand</th>
              <th>Min (GHS)</th>
              <th>Max (GHS)</th>
              <th>Turnaround</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {prices.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>No pricing set yet. Add your first entry above.</td></tr>
            ) : prices.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.problem}</td>
                <td>{p.brand || 'All'}</td>
                <td>GHS {p.minPrice?.toLocaleString()}</td>
                <td>GHS {p.maxPrice?.toLocaleString()}</td>
                <td style={{ fontSize: '0.8rem', color: '#6B7280' }}>{p.turnaround || '—'}</td>
                <td style={{ fontSize: '0.8rem', color: '#6B7280', maxWidth: 160 }}>{p.notes || '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className={styles.actionBtnOutline} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => startEdit(p)}>Edit</button>
                    <button className={styles.actionBtnDanger} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => remove(p.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

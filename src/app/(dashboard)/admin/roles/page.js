"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import styles from '../Admin.module.css';

const DEFAULT_PERMISSIONS = [
  'dashboard.view', 'products.view', 'products.edit', 'orders.view', 'orders.edit',
  'repairs.view', 'repairs.edit', 'customers.view', 'customers.edit',
  'inventory.view', 'inventory.edit', 'accounting.view', 'analytics.view',
  'technicians.manage', 'riders.manage', 'blog.manage', 'coupons.manage',
  'support.manage', 'chat.manage', 'settings.manage', 'audit_logs.view',
];

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', permissions: [] });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'roles_permissions'), (snap) => {
      setRoles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  function togglePermission(perm) {
    setForm(p => ({
      ...p,
      permissions: p.permissions.includes(perm)
        ? p.permissions.filter(x => x !== perm)
        : [...p.permissions, perm],
    }));
  }

  async function save(e) {
    e.preventDefault();
    const id = form.id || form.name.toLowerCase().replace(/\s+/g, '_');
    await setDoc(doc(db, 'roles_permissions', id), {
      ...form, updatedAt: serverTimestamp(),
      ...(form.id ? {} : { createdAt: serverTimestamp() }),
    }, { merge: true });
    setForm({ name: '', description: '', permissions: [] });
    setShowForm(false);
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Roles & Permissions</h1>
        <button className={styles.actionBtnPrimary} onClick={() => { setForm({ name: '', description: '', permissions: [] }); setShowForm(true); }}>+ Create Role</button>
      </div>

      {showForm && (
        <div className={styles.card} style={{ marginBottom: '1.5rem' }}>
          <h2 className={styles.sectionTitle}>{form.id ? 'Edit Role' : 'Create Role'}</h2>
          <form onSubmit={save}>
            <div className={styles.formGrid} style={{ marginBottom: '1.5rem' }}>
              <div className={styles.formGroup}><label className={styles.formLabel}>Role Name</label><input className={styles.formInput} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
              <div className={styles.formGroup}><label className={styles.formLabel}>Description</label><input className={styles.formInput} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className={styles.formLabel} style={{ marginBottom: '0.75rem', display: 'block' }}>Permissions</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                {DEFAULT_PERMISSIONS.map(perm => (
                  <label key={perm} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', cursor: 'pointer', padding: '0.375rem 0.5rem', borderRadius: '6px', backgroundColor: form.permissions.includes(perm) ? '#ECFDF5' : 'transparent', border: '1px solid', borderColor: form.permissions.includes(perm) ? '#16A34A' : '#E5E7EB', transition: 'all 0.15s' }}>
                    <input type="checkbox" checked={form.permissions.includes(perm)} onChange={() => togglePermission(perm)} />
                    <span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{perm}</span>
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className={styles.actionBtnPrimary}>Save Role</button>
              <button type="button" className={styles.actionBtnOutline} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
        <table className={styles.table}>
          <thead><tr><th>Role</th><th>Description</th><th>Permissions</th><th>Actions</th></tr></thead>
          <tbody>
            {roles.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No custom roles defined. Default roles (admin, technician, rider, customer) are built-in.</td></tr>
            ) : roles.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight: 700, textTransform: 'capitalize' }}>{r.name}</td>
                <td>{r.description || '—'}</td>
                <td style={{ maxWidth: '300px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {(r.permissions || []).slice(0, 5).map(p => (
                      <span key={p} className={styles.badge} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>{p}</span>
                    ))}
                    {(r.permissions || []).length > 5 && <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>+{r.permissions.length - 5} more</span>}
                  </div>
                </td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className={styles.actionBtnOutline} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => { setForm(r); setShowForm(true); }}>Edit</button>
                  <button className={styles.actionBtnDanger} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={async () => { if (confirm('Delete this role?')) await deleteDoc(doc(db, 'roles_permissions', r.id)); }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

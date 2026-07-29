"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import styles from '../Admin.module.css';

export default function APISettingsPage() {
  const [keys, setKeys] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', permissions: 'read', rateLimit: '100' });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'api_keys'), (snap) => {
      setKeys(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  function generateKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'sk_live_';
    for (let i = 0; i < 32; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
    return key;
  }

  async function createKey(e) {
    e.preventDefault();
    const apiKey = generateKey();
    const id = `key_${Date.now()}`;
    await setDoc(doc(db, 'api_keys', id), {
      ...form, key: apiKey, rateLimit: Number(form.rateLimit) || 100,
      active: true, createdAt: serverTimestamp(), lastUsed: null, requestCount: 0,
    });
    setForm({ name: '', permissions: 'read', rateLimit: '100' });
    setShowForm(false);
  }

  async function toggleKey(id, active) {
    await setDoc(doc(db, 'api_keys', id), { active: !active }, { merge: true });
  }

  async function revokeKey(id) {
    if (!confirm('Revoke this API key? This cannot be undone.')) return;
    await deleteDoc(doc(db, 'api_keys', id));
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>API Settings</h1>
        <button className={styles.actionBtnPrimary} onClick={() => { setForm({ name: '', permissions: 'read', rateLimit: '100' }); setShowForm(true); }}>+ Generate Key</button>
      </div>

      <div className={styles.card} style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <h2 className={styles.sectionTitle}>API Endpoint</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <code style={{ padding: '0.5rem 1rem', backgroundColor: '#F3F4F6', borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'monospace', flex: 1 }}>
            https://api.scrinhouse.com/v1
          </code>
          <button className={styles.actionBtnOutline} style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }} onClick={() => navigator.clipboard.writeText('https://api.scrinhouse.com/v1')}>
            Copy
          </button>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Use this base URL with your API key in the <code>Authorization: Bearer &lt;key&gt;</code> header.</p>
      </div>

      {showForm && (
        <div className={styles.card} style={{ marginBottom: '1.5rem' }}>
          <h2 className={styles.sectionTitle}>Generate New API Key</h2>
          <form onSubmit={createKey} className={styles.formGrid}>
            <div className={styles.formGroup}><label className={styles.formLabel}>Key Name</label><input className={styles.formInput} placeholder="My Integration" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
            <div className={styles.formGroup}><label className={styles.formLabel}>Permissions</label>
              <select className={styles.formInput} value={form.permissions} onChange={e => setForm(p => ({ ...p, permissions: e.target.value }))}>
                <option value="read">Read Only</option><option value="write">Read & Write</option><option value="full">Full Access</option>
              </select>
            </div>
            <div className={styles.formGroup}><label className={styles.formLabel}>Rate Limit (req/min)</label><input className={styles.formInput} type="number" value={form.rateLimit} onChange={e => setForm(p => ({ ...p, rateLimit: e.target.value }))} /></div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'end' }}>
              <button type="submit" className={styles.actionBtnPrimary}>Generate</button>
              <button type="button" className={styles.actionBtnOutline} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
        <table className={styles.table}>
          <thead><tr><th>Name</th><th>Key</th><th>Permissions</th><th>Rate Limit</th><th>Requests</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {keys.length === 0 ? <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No API keys generated</td></tr> :
              keys.map(k => (
                <tr key={k.id}>
                  <td style={{ fontWeight: 600 }}>{k.name}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{k.key?.slice(0, 12)}…{k.key?.slice(-4)}</td>
                  <td><span className={`${styles.badge} ${k.permissions === 'full' ? styles.badgeError : k.permissions === 'write' ? styles.badgeWarning : ''}`} style={{ textTransform: 'capitalize' }}>{k.permissions}</span></td>
                  <td>{k.rateLimit}/min</td>
                  <td>{k.requestCount || 0}</td>
                  <td><span className={`${styles.badge} ${k.active ? '' : styles.badgeError}`}>{k.active ? 'Active' : 'Disabled'}</span></td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className={styles.actionBtnOutline} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => toggleKey(k.id, k.active)}>
                      {k.active ? 'Disable' : 'Enable'}
                    </button>
                    <button className={styles.actionBtnDanger} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => revokeKey(k.id)}>Revoke</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

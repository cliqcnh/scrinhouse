"use client";
import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import styles from '../Account.module.css';

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const [form, setForm] = useState({
    displayName: profile?.displayName || user?.displayName || '',
    email: profile?.email || user?.email || '',
    phone: profile?.phone || user?.phoneNumber || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaved(false);

    try {
      // Update Firestore profile
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: form.displayName,
        email: form.email,
        phone: form.phone,
      });

      // Update Firebase Auth display name
      if (form.displayName !== user.displayName) {
        await updateProfile(user, { displayName: form.displayName });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Account Settings</h1>
        <p className={styles.pageSubtitle}>Update your profile information.</p>
      </div>

      <div className={styles.contentCard}>
        <form onSubmit={handleSave} className={styles.formGrid}>
          <div className={styles.formGroupFull}>
            <label className={styles.formLabel}>Full Name</label>
            <input
              className={styles.formInput}
              type="text"
              value={form.displayName}
              onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))}
              placeholder="Your name"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email Address</label>
            <input
              className={styles.formInput}
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="email@example.com"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Phone Number</label>
            <input
              className={styles.formInput}
              type="tel"
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              placeholder="+233 24 xxx xxxx"
            />
          </div>
          <div className={styles.formGroupFull} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button type="submit" className={styles.btnPrimary} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            {saved && (
              <span style={{ color: 'var(--color-accent-green)', fontWeight: 600, fontSize: '0.85rem' }}>
                ✓ Saved successfully
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Account Info Card */}
      <div className={styles.contentCard} style={{ marginTop: '1.5rem' }}>
        <h2 className={styles.sectionTitle}>Account Info</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
          <div>
            <span style={{ color: '#9CA3AF', fontSize: '0.75rem', display: 'block' }}>Account ID</span>
            <span style={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '0.8rem' }}>{user?.uid?.slice(0, 12)}…</span>
          </div>
          <div>
            <span style={{ color: '#9CA3AF', fontSize: '0.75rem', display: 'block' }}>Loyalty Points</span>
            <span style={{ fontWeight: 700, color: 'var(--color-accent-green)' }}>{profile?.loyaltyPoints || 0} pts</span>
          </div>
          <div>
            <span style={{ color: '#9CA3AF', fontSize: '0.75rem', display: 'block' }}>Member Since</span>
            <span style={{ fontWeight: 500 }}>
              {profile?.createdAt?.toDate
                ? profile.createdAt.toDate().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
                : 'N/A'}
            </span>
          </div>
          <div>
            <span style={{ color: '#9CA3AF', fontSize: '0.75rem', display: 'block' }}>Auth Provider</span>
            <span style={{ fontWeight: 500 }}>{user?.phoneNumber ? 'Phone (OTP)' : 'Email'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

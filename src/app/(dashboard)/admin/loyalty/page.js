"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import styles from '../Admin.module.css';

export default function LoyaltyPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pointsPerGHS, setPointsPerGHS] = useState(1);
  const [redeemRate, setRedeemRate] = useState(100); // 100 points = 1 GHS

  useEffect(() => {
    async function fetch() {
      const snap = await getDocs(collection(db, 'users'));
      setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role === 'customer' || !u.role).sort((a, b) => (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0)));
      setLoading(false);
    }
    fetch();
  }, []);

  async function adjustPoints(userId, amount) {
    const val = parseInt(prompt(`Enter points to ${amount > 0 ? 'add' : 'deduct'}:`, Math.abs(amount)));
    if (isNaN(val)) return;
    const customer = customers.find(c => c.id === userId);
    const newPoints = Math.max(0, (customer?.loyaltyPoints || 0) + (amount > 0 ? val : -val));
    await updateDoc(doc(db, 'users', userId), { loyaltyPoints: newPoints });
    setCustomers(prev => prev.map(c => c.id === userId ? { ...c, loyaltyPoints: newPoints } : c));
  }

  const totalPoints = customers.reduce((s, c) => s + (c.loyaltyPoints || 0), 0);

  return (
    <div>
      <div className={styles.pageHeader}><h1 className={styles.pageTitle}>Loyalty Points</h1></div>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Total Points Issued</h3><p className={styles.statValue}>{totalPoints.toLocaleString()}</p></div>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Earn Rate</h3><p className={styles.statValue}>{pointsPerGHS} pt/GHS</p></div>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Redeem Rate</h3><p className={styles.statValue}>{redeemRate} pts = GHS 1</p></div>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Liability (GHS)</h3><p className={styles.statValue}>GHS {Math.round(totalPoints / redeemRate).toLocaleString()}</p></div>
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}>Loading…</div> : (
        <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}><table className={styles.table}><thead><tr><th>Customer</th><th>Phone</th><th>Points Balance</th><th>GHS Value</th><th>Actions</th></tr></thead><tbody>
          {customers.map(c => (<tr key={c.id}><td style={{ fontWeight: 600 }}>{c.displayName || 'N/A'}</td><td>{c.phone || '—'}</td><td style={{ fontWeight: 700, color: 'var(--color-accent-green)' }}>{(c.loyaltyPoints || 0).toLocaleString()}</td><td>GHS {Math.round((c.loyaltyPoints || 0) / redeemRate)}</td><td style={{ display: 'flex', gap: '0.5rem' }}>
            <button className={styles.actionBtnPrimary} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => adjustPoints(c.id, 1)}>+ Add</button>
            <button className={styles.actionBtnOutline} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => adjustPoints(c.id, -1)}>− Deduct</button>
          </td></tr>))}
        </tbody></table></div>
      )}
    </div>
  );
}

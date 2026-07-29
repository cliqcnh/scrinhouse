"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import styles from '../Account.module.css';

export default function WarrantyPage() {
  const { user } = useAuth();
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchWarranties() {
      try {
        const q = query(collection(db, 'warranties'), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        setWarranties(
          snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (b.issuedAt?.seconds || 0) - (a.issuedAt?.seconds || 0))
        );
      } catch {
        setWarranties([]);
      } finally {
        setLoading(false);
      }
    }

    fetchWarranties();
  }, [user]);

  function getWarrantyStatus(warranty) {
    if (!warranty.expiresAt) return { label: 'Unknown', style: styles.badgeGray };
    const expiry = warranty.expiresAt.toDate ? warranty.expiresAt.toDate() : new Date(warranty.expiresAt);
    const now = new Date();
    const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return { label: 'Expired', style: styles.badgeRed };
    if (daysLeft < 30) return { label: `${daysLeft}d left`, style: styles.badgeYellow };
    return { label: 'Active', style: styles.badgeGreen };
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Warranty Information</h1>
        <p className={styles.pageSubtitle}>View warranty coverage for your repairs and purchases.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>Loading warranties…</div>
      ) : warranties.length === 0 ? (
        <div className={styles.contentCard}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🛡️</div>
            <p className={styles.emptyTitle}>No warranties found</p>
            <p className={styles.emptyText}>Warranties are issued after completed repairs. They'll appear here automatically.</p>
          </div>
        </div>
      ) : (
        <div className={styles.itemList}>
          {warranties.map(w => {
            const status = getWarrantyStatus(w);
            return (
              <div key={w.id} className={styles.contentCard}>
                <div className={styles.itemHeader}>
                  <div>
                    <div className={styles.itemId}>{w.deviceName || 'Device Repair'}</div>
                    <div className={styles.itemDate}>Warranty #{w.id.slice(-8).toUpperCase()}</div>
                  </div>
                  <span className={`${styles.badge} ${status.style}`}>{status.label}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1rem 0', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#9CA3AF', fontSize: '0.75rem', display: 'block' }}>Coverage</span>
                    <span style={{ fontWeight: 500 }}>{w.coverage || 'Screen replacement'}</span>
                  </div>
                  <div>
                    <span style={{ color: '#9CA3AF', fontSize: '0.75rem', display: 'block' }}>Duration</span>
                    <span style={{ fontWeight: 500 }}>{w.duration || '90 days'}</span>
                  </div>
                  <div>
                    <span style={{ color: '#9CA3AF', fontSize: '0.75rem', display: 'block' }}>Issued</span>
                    <span style={{ fontWeight: 500 }}>
                      {w.issuedAt?.toDate ? w.issuedAt.toDate().toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#9CA3AF', fontSize: '0.75rem', display: 'block' }}>Expires</span>
                    <span style={{ fontWeight: 500 }}>
                      {w.expiresAt?.toDate ? w.expiresAt.toDate().toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {w.terms && (
                  <div style={{ fontSize: '0.8rem', color: '#6B7280', padding: '0.75rem', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                    <strong>Terms:</strong> {w.terms}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

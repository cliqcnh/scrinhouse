"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot, orderBy } from 'firebase/firestore';
import styles from '../Account.module.css';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setNotifications(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      );
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  async function markAsRead(id) {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  }

  async function markAllAsRead() {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(
      unread.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true }))
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  const typeIcons = {
    order: '📦',
    repair: '🔧',
    warranty: '🛡️',
    promo: '🎉',
    system: '⚙️',
    delivery: '🏍️',
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Notifications</h1>
        <p className={styles.pageSubtitle}>
          {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}.` : 'All caught up!'}
        </p>
      </div>

      {unreadCount > 0 && (
        <button
          className={`${styles.btnOutline} ${styles.btnSmall}`}
          onClick={markAllAsRead}
          style={{ marginBottom: '1.5rem' }}
        >
          Mark all as read
        </button>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>Loading notifications…</div>
      ) : notifications.length === 0 ? (
        <div className={styles.contentCard}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔔</div>
            <p className={styles.emptyTitle}>No notifications</p>
            <p className={styles.emptyText}>You're all caught up! We'll notify you about orders, repairs, and promotions.</p>
          </div>
        </div>
      ) : (
        <div className={styles.itemList}>
          {notifications.map(notif => (
            <div
              key={notif.id}
              className={styles.itemCard}
              style={{
                borderLeftWidth: '3px',
                borderLeftColor: notif.read ? '#E5E7EB' : 'var(--color-accent-green)',
                backgroundColor: notif.read ? '#FFFFFF' : '#FAFFFE',
                cursor: notif.read ? 'default' : 'pointer',
              }}
              onClick={() => !notif.read && markAsRead(notif.id)}
            >
              <div className={styles.itemHeader}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.5rem' }}>{typeIcons[notif.type] || '📬'}</span>
                  <div>
                    <div className={styles.itemId} style={{ fontWeight: notif.read ? 500 : 700 }}>
                      {notif.title}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#4B5563', marginTop: '0.25rem' }}>
                      {notif.message}
                    </div>
                  </div>
                </div>
                <div className={styles.itemDate}>
                  {notif.createdAt?.toDate
                    ? notif.createdAt.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                    : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

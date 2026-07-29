"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import styles from '../Account.module.css';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchOrders() {
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {
        // Fallback without orderBy (index may not exist)
        const q2 = query(collection(db, 'orders'), where('userId', '==', user.uid));
        const snap = await getDocs(q2);
        setOrders(
          snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        );
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user]);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Order History</h1>
        <p className={styles.pageSubtitle}>View and manage all your orders.</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`${styles.btn} ${filter === status ? styles.btnPrimary : styles.btnOutline}`}
            style={{ padding: '0.4rem 0.875rem', fontSize: '0.78rem', textTransform: 'capitalize' }}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>Loading orders…</div>
      ) : filtered.length === 0 ? (
        <div className={styles.contentCard}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📦</div>
            <p className={styles.emptyTitle}>No {filter === 'all' ? '' : filter} orders found</p>
            <p className={styles.emptyText}>
              {filter === 'all' ? "You haven't placed any orders yet." : `No orders with status "${filter}".`}
            </p>
            <Link href="/shop" className={styles.btnPrimary}>Shop Now</Link>
          </div>
        </div>
      ) : (
        <div className={styles.itemList}>
          {filtered.map(order => (
            <div key={order.id} className={styles.itemCard}>
              <div className={styles.itemHeader}>
                <div>
                  <div className={styles.itemId}>Order #{order.id.slice(-6).toUpperCase()}</div>
                  <div className={styles.itemDate}>
                    {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Just now'}
                  </div>
                </div>
                <span className={`${styles.badge} ${
                  order.status === 'delivered' ? styles.badgeGreen :
                  order.status === 'cancelled' ? styles.badgeRed :
                  order.status === 'processing' || order.status === 'shipped' ? styles.badgeBlue :
                  styles.badgeYellow
                }`}>
                  {order.status}
                </span>
              </div>

              <div className={styles.itemBody}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {order.items?.map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span>{item.quantity}× {item.name}</span>
                      <span style={{ color: '#6B7280' }}>GHS {(item.price * item.quantity).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.itemFooter}>
                <span style={{ fontWeight: 700 }}>Total: GHS {order.totalAmount?.toLocaleString()}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {order.status === 'pending' && (
                    <button
                      className={`${styles.btnDanger} ${styles.btnSmall}`}
                      onClick={async () => {
                        if (!confirm('Cancel this order?')) return;
                        const { doc, updateDoc, increment } = await import('firebase/firestore');
                        await updateDoc(doc(db, 'orders', order.id), { status: 'cancelled' });
                        for (const item of order.items || []) {
                          try { await updateDoc(doc(db, 'products', item.id), { stock: increment(item.quantity) }); } catch {}
                        }
                        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o));
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

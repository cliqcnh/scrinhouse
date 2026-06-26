"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import OTPForm from '@/components/auth/OTPForm';
import { auth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';
import styles from './Account.module.css';

function AccountContent() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          
          if (currentUser.email === 'scrinhouse@gmail.com') {
            router.push('/admin');
          } else {
            // Fetch Orders
            const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
            const { db } = await import('@/lib/firebase/config');
            const q = query(collection(db, 'orders'), where('userId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
            try {
              const querySnapshot = await getDocs(q);
              setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch(e) {
              console.error("Error fetching orders:", e);
              // if index is missing, just fetch without orderBy
              const qFallback = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
              const snap = await getDocs(qFallback);
              setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
            }

            const redirectUrl = searchParams.get('redirect');
            if (redirectUrl) {
              router.push(redirectUrl);
            } else if (sessionStorage.getItem('justLoggedIn') === 'true') {
              sessionStorage.removeItem('justLoggedIn');
              router.push('/shop');
            }
          }
        }
      });
      return () => unsubscribe();
    });
  }, [router, searchParams]);

  if (!user) {
    return (
      <div className={styles.page}>
        <OTPForm onLoginSuccess={(u) => setUser(u)} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Account</h1>
          <p className={styles.subtitle}>Welcome back, {user.displayName || 'Customer'}.</p>
        </div>

        <div className={styles.layout}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <ul className={styles.navMenu}>
              <li>
                <button 
                  className={`${styles.navBtn} ${activeTab === 'orders' ? styles.activeNav : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  Orders & Parts
                </button>
              </li>
              <li>
                <button 
                  className={`${styles.navBtn} ${activeTab === 'repairs' ? styles.activeNav : ''}`}
                  onClick={() => setActiveTab('repairs')}
                >
                  Repair History
                </button>
              </li>
              <li>
                <button 
                  className={`${styles.navBtn} ${activeTab === 'settings' ? styles.activeNav : ''}`}
                  onClick={() => setActiveTab('settings')}
                >
                  Account Settings
                </button>
              </li>
              <li>
                <button 
                  className={styles.navBtn}
                  onClick={() => {
                    signOut(auth).then(() => setUser(null));
                  }}
                  style={{ color: '#ef4444', marginTop: '1rem' }}
                >
                  Log Out
                </button>
              </li>
            </ul>
          </aside>

          {/* Main Content */}
          <main className={styles.main}>
            {activeTab === 'orders' && (
              <Card className={styles.contentCard}>
                <h2 className={styles.sectionTitle}>Recent Orders</h2>
                {orders.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>You haven't ordered any parts yet.</p>
                    <Link href="/shop" style={{ display: 'inline-block' }}>
                      <Button variant="outline" className={styles.shopBtn}>Shop Now</Button>
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {orders.map(order => (
                      <div key={order.id} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: '500' }}>Order #{order.id.slice(-6).toUpperCase()}</span>
                          <span className={styles.statusBadge}>{order.status}</span>
                        </div>
                        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                          {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Just now'}
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          {order.items?.map((item, idx) => (
                            <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                              <span>{item.quantity}x {item.name}</span>
                              <span>GHS {(item.price * item.quantity).toLocaleString()}</span>
                            </li>
                          ))}
                        </ul>
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
                          <div>
                            <span>Total: GHS {order.totalAmount?.toLocaleString()}</span>
                          </div>
                          {order.status === 'pending' && (
                            <Button 
                              variant="outline" 
                              style={{ borderColor: 'red', color: 'red', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                              onClick={async () => {
                                if (confirm('Are you sure you want to cancel this order?')) {
                                  try {
                                    const { doc, updateDoc, increment } = await import('firebase/firestore');
                                    const { db } = await import('@/lib/firebase/config');
                                    
                                    // Update status to cancelled
                                    await updateDoc(doc(db, 'orders', order.id), { status: 'cancelled' });
                                    
                                    // Restore inventory
                                    for (const item of order.items || []) {
                                      try {
                                        await updateDoc(doc(db, 'products', item.id), { stock: increment(item.quantity) });
                                      } catch (e) {
                                        console.error("Failed to restore stock for item", item.id, e);
                                      }
                                    }
                                    alert('Order has been cancelled.');
                                  } catch(e) {
                                    console.error("Error cancelling order", e);
                                    alert('Could not cancel order. Please try again.');
                                  }
                                }
                              }}
                            >
                              Cancel Order
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {activeTab === 'repairs' && (
              <Card className={styles.contentCard}>
                <h2 className={styles.sectionTitle}>Repair History</h2>
                <div className={styles.repairItem}>
                  <div className={styles.repairHeader}>
                    <div>
                      <h4 className={styles.repairId}>REP-123456</h4>
                      <p className={styles.repairDevice}>iPhone 14 Pro Max - Screen Replacement</p>
                    </div>
                    <span className={styles.statusBadge}>In Progress</span>
                  </div>
                  <div className={styles.repairFooter}>
                    <p className={styles.repairDate}>Started: Oct 24, 2023</p>
                    <Button variant="outline" className={styles.trackBtn}>Track Status</Button>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'settings' && (
              <Card className={styles.contentCard}>
                <h2 className={styles.sectionTitle}>Account Settings</h2>
                <form className={styles.settingsForm}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Full Name</label>
                    <input type="text" className={styles.input} defaultValue="Kwame Mensah" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Email Address</label>
                    <input type="email" className={styles.input} defaultValue="kwame@example.com" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Phone Number</label>
                    <input type="tel" className={styles.input} defaultValue="+233 24 123 4567" />
                  </div>
                  <Button variant="primary">Save Changes</Button>
                </form>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

import React from 'react';

export default function AccountPage() {
  return (
    <React.Suspense fallback={<div style={{ padding: '6rem', textAlign: 'center' }}>Loading...</div>}>
      <AccountContent />
    </React.Suspense>
  );
}

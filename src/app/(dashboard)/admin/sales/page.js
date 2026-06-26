"use client";
import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import styles from '../Admin.module.css';
import { db } from '@/lib/firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function AdminSales() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching admin sales:", error);
      // fallback without orderBy if index is missing
      const qFallback = query(collection(db, 'orders'));
      onSnapshot(qFallback, (snap) => {
        setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
        setLoading(false);
      });
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <div className={styles.pageHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className={styles.pageTitle}>Sales Tracking</h1>
        <Button variant="outline">Export CSV</Button>
      </div>

      <Card className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>Loading orders...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No orders found.</td></tr>
            ) : (
              orders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id.slice(-6).toUpperCase()}</td>
                  <td>{order.userEmail}</td>
                  <td>{order.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}</td>
                  <td>GHS {order.totalAmount?.toLocaleString()}</td>
                  <td>{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Just now'}</td>
                  <td>
                    <select 
                      style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #e5e5e5' }}
                      value={order.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        const previousStatus = order.status;
                        if (newStatus === previousStatus) return;

                        if (newStatus === 'cancelled') {
                          if (!confirm('Are you sure you want to cancel this order? This will restore the items to inventory.')) {
                            e.target.value = previousStatus; // revert select UI
                            return;
                          }
                        }

                        try {
                          const { doc, updateDoc, increment } = await import('firebase/firestore');
                          await updateDoc(doc(db, 'orders', order.id), { status: newStatus });

                          // Revert inventory if cancelled
                          if (newStatus === 'cancelled' && previousStatus !== 'cancelled') {
                            for (const item of order.items || []) {
                              try {
                                await updateDoc(doc(db, 'products', item.id), { stock: increment(item.quantity) });
                              } catch(err) {
                                console.error('Failed to revert stock for', item.id);
                              }
                            }
                          }
                          
                          // Deduct inventory if un-cancelled
                          if (previousStatus === 'cancelled' && newStatus !== 'cancelled') {
                            for (const item of order.items || []) {
                              try {
                                await updateDoc(doc(db, 'products', item.id), { stock: increment(-item.quantity) });
                              } catch(err) {
                                console.error('Failed to deduct stock for', item.id);
                              }
                            }
                          }

                        } catch (error) {
                          console.error("Error updating status:", error);
                          alert("Failed to update status.");
                        }
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

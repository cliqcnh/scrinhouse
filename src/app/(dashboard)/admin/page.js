"use client";
import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, onSnapshot, query, orderBy, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import styles from './Admin.module.css';

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeRepairs: 0,
    totalOrders: 0,
    revenue: 0
  });
  
  const [recentRepairs, setRecentRepairs] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [enquiryMessages, setEnquiryMessages] = useState([]);
  const [adminReply, setAdminReply] = useState('');
  const messagesEndRef = useRef(null);

  // Listen to messages of selected enquiry
  useEffect(() => {
    if (!selectedEnquiry) {
      setEnquiryMessages([]);
      return;
    }

    if (selectedEnquiry.unreadCount > 0) {
      updateDoc(doc(db, 'enquiries', selectedEnquiry.id), {
        unreadCount: 0
      }).catch(err => console.error("Error resetting unread count:", err));
    }

    const unsub = onSnapshot(
      query(collection(db, 'enquiries', selectedEnquiry.id, 'messages'), orderBy('createdAt', 'asc')),
      (snap) => {
        setEnquiryMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      },
      (err) => {
        console.error("Error listening to enquiry messages:", err);
      }
    );

    return () => unsub();
  }, [selectedEnquiry]);

  useEffect(() => {
    // Fetch Products count
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snap) => {
      setStats(prev => ({ ...prev, totalProducts: snap.size }));
    });

    // Fetch Repairs
    const unsubscribeRepairs = onSnapshot(collection(db, 'repairs'), (snap) => {
      const repairs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const active = repairs.filter(r => r.status !== 'Completed').length;
      
      // Sort for recent
      repairs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setRecentRepairs(repairs.slice(0, 5));
      setStats(prev => ({ ...prev, activeRepairs: active }));
    });

    // Fetch Orders
    const unsubscribeOrders = onSnapshot(collection(db, 'orders'), (snap) => {
      let revenue = 0;
      snap.docs.forEach(doc => {
        const orderData = doc.data();
        if (orderData.status !== 'cancelled') {
          revenue += orderData.totalAmount || 0;
        }
      });
      setStats(prev => ({ ...prev, totalOrders: snap.size, revenue }));
    });

    // Fetch Enquiries
    const unsubscribeEnquiries = onSnapshot(
      query(collection(db, 'enquiries'), orderBy('lastMessageAt', 'desc')),
      (snap) => {
        setEnquiries(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (err) => {
        console.error("Error fetching enquiries:", err);
      }
    );

    return () => {
      unsubscribeProducts();
      unsubscribeRepairs();
      unsubscribeOrders();
      unsubscribeEnquiries();
    };
  }, []);

  const handleSendAdminReply = async (e) => {
    e.preventDefault();
    if (!adminReply.trim() || !selectedEnquiry) return;

    const replyText = adminReply.trim();
    setAdminReply('');

    try {
      await addDoc(collection(db, 'enquiries', selectedEnquiry.id, 'messages'), {
        text: replyText,
        sender: 'admin',
        senderName: 'ScrinHouse Support',
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'enquiries', selectedEnquiry.id), {
        lastMessage: replyText,
        lastMessageAt: serverTimestamp(),
        status: 'replied'
      });
    } catch (err) {
      console.error("Error sending admin reply:", err);
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard Overview</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/admin/products" style={{ background: '#111', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem' }}>
            + Add Product
          </Link>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Total Revenue</h3>
          <p className={styles.statValue}>GHS {stats.revenue.toLocaleString()}</p>
          <span className={`${styles.statChange} ${styles.statChangePositive}`}>+12% from last month</span>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Active Repairs</h3>
          <p className={styles.statValue}>{stats.activeRepairs}</p>
          <span className={`${styles.statChange} ${styles.statChangePositive}`}>Needs attention</span>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Total Orders</h3>
          <p className={styles.statValue}>{stats.totalOrders}</p>
          <span className={`${styles.statChange} ${styles.statChangePositive}`}>+5% from last month</span>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Products in Catalog</h3>
          <p className={styles.statValue}>{stats.totalProducts}</p>
          <span className={`${styles.statChange} ${styles.statChangePositive}`}>Live in shop</span>
        </div>
      </div>

      <div className={styles.dashboardSection}>
        <h2 className={styles.sectionTitle}>Recent Repair Bookings</h2>
        <Card className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Device</th>
                <th>Issue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRepairs.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No recent repairs</td>
                </tr>
              ) : (
                recentRepairs.map(repair => (
                  <tr key={repair.id}>
                    <td style={{ fontWeight: 600 }}>{repair.id.slice(0, 8).toUpperCase()}</td>
                    <td>{repair.brand} {repair.model}</td>
                    <td>{repair.problem}</td>
                    <td>
                      <span className={`${styles.badge} ${repair.status === 'Completed' ? '' : styles.badgeWarning}`}>
                        {repair.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      </div>

      <div className={styles.dashboardSection} style={{ marginTop: '3rem' }}>
        <h2 className={styles.sectionTitle}>Product Enquiries</h2>
        <div style={{ display: 'flex', gap: '1.5rem', height: '500px' }}>
          {/* Enquiries List */}
          <div className={styles.card} style={{ width: '320px', flexShrink: 0, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #E5E7EB', fontWeight: 700, fontSize: '0.9rem', backgroundColor: '#F9FAFB' }}>
              Customer Enquiries ({enquiries.length})
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {enquiries.length === 0 ? (
                <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#9CA3AF', fontSize: '0.85rem' }}>
                  No enquiries yet. Product enquiries from customers will appear here.
                </div>
              ) : (
                enquiries.map((enq) => {
                  const isSelected = selectedEnquiry?.id === enq.id;
                  const hasUnread = enq.unreadCount > 0;
                  return (
                    <div
                      key={enq.id}
                      onClick={() => setSelectedEnquiry(enq)}
                      style={{
                        padding: '1rem 1.25rem',
                        cursor: 'pointer',
                        borderBottom: '1px solid #F3F4F6',
                        backgroundColor: isSelected ? '#F3F4F6' : 'transparent',
                        borderLeft: hasUnread ? '4px solid var(--color-accent-green)' : '4px solid transparent',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111' }}>{enq.customerName}</span>
                        <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>
                          {enq.lastMessageAt?.seconds ? new Date(enq.lastMessageAt.seconds * 1000).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                        </span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--color-accent-green)', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        📦 {enq.productName}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: hasUnread ? '#111' : '#6B7280', fontWeight: hasUnread ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                          {enq.lastMessage}
                        </span>
                        {hasUnread && (
                          <span style={{ backgroundColor: '#EF4444', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '9999px' }}>
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Enquiries Chat Box */}
          <div className={styles.card} style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {!selectedEnquiry ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                  <p style={{ fontWeight: 600, color: '#4B5563' }}>Select a customer enquiry</p>
                  <p style={{ fontSize: '0.85rem' }}>Choose an enquiry thread from the left pane to start chatting.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Box Header */}
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111', margin: 0 }}>
                      {selectedEnquiry.customerName}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: '0.2rem 0 0 0' }}>
                      Contact: {selectedEnquiry.customerContact}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Link
                      href={`/product/${selectedEnquiry.productId}`}
                      target="_blank"
                      style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-accent-green)', textDecoration: 'none' }}
                    >
                      View Product Page ↗
                    </Link>
                    <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '0.2rem 0 0 0' }}>
                      Product: {selectedEnquiry.productName}
                    </p>
                  </div>
                </div>

                {/* Messages List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#FAFAFA' }}>
                  {enquiryMessages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '2rem', fontSize: '0.85rem' }}>No messages yet</div>
                  ) : (
                    enquiryMessages.map((m) => {
                      const isAdmin = m.sender === 'admin';
                      return (
                        <div key={m.id} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start' }}>
                          <div style={{
                            maxWidth: '70%',
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            fontSize: '0.875rem',
                            backgroundColor: isAdmin ? '#111' : '#fff',
                            color: isAdmin ? '#fff' : '#374151',
                            border: isAdmin ? 'none' : '1px solid #E5E7EB',
                            boxShadow: isAdmin ? 'none' : '0 2px 4px rgba(0,0,0,0.02)'
                          }}>
                            <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{m.text}</div>
                            <div style={{ fontSize: '0.65rem', marginTop: '0.3rem', opacity: 0.6, textAlign: 'right' }}>
                              {m.createdAt?.toDate ? m.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Box */}
                <form onSubmit={handleSendAdminReply} style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '0.75rem', backgroundColor: '#fff' }}>
                  <input
                    className={styles.formInput}
                    style={{ flex: 1, borderRadius: '8px', padding: '0.625rem 0.875rem', border: '1px solid #D1D5DB' }}
                    placeholder={`Reply to ${selectedEnquiry.customerName}...`}
                    value={adminReply}
                    onChange={(e) => setAdminReply(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#111',
                      color: '#fff',
                      border: 'none',
                      padding: '0.625rem 1.25rem',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    Send
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

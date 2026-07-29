"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import { db } from '@/lib/firebase/config';
import { collection, doc, getDocs, deleteDoc, setDoc } from 'firebase/firestore';
import { useCart } from '@/lib/context/CartContext';
import styles from '../Account.module.css';

export default function WishlistPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchWishlist() {
      try {
        const snap = await getDocs(collection(db, 'users', user.uid, 'wishlist'));
        setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    fetchWishlist();
  }, [user]);

  async function removeItem(itemId) {
    await deleteDoc(doc(db, 'users', user.uid, 'wishlist', itemId));
    setItems(prev => prev.filter(i => i.id !== itemId));
  }

  function handleAddToCart(item) {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    });
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Wishlist</h1>
        <p className={styles.pageSubtitle}>Products you've saved for later.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>Loading wishlist…</div>
      ) : items.length === 0 ? (
        <div className={styles.contentCard}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>❤️</div>
            <p className={styles.emptyTitle}>Your wishlist is empty</p>
            <p className={styles.emptyText}>Browse our shop and save items you love!</p>
            <Link href="/shop" className={styles.btnPrimary}>Browse Shop</Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {items.map(item => (
            <div key={item.id} className={styles.contentCard} style={{ padding: '1rem' }}>
              {item.image && (
                <div style={{
                  width: '100%', aspectRatio: '1', borderRadius: '10px', overflow: 'hidden',
                  backgroundColor: '#F3F4F6', marginBottom: '0.75rem',
                }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
              <div className={styles.itemId} style={{ marginBottom: '0.25rem' }}>{item.name}</div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem' }}>
                GHS {item.price?.toLocaleString()}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className={`${styles.btnPrimary} ${styles.btnSmall}`} style={{ flex: 1 }} onClick={() => handleAddToCart(item)}>
                  Add to Cart
                </button>
                <button className={`${styles.btnDanger} ${styles.btnSmall}`} onClick={() => removeItem(item.id)}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

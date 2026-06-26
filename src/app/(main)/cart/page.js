"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/context/CartContext';
import { auth, db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import Button from '@/components/ui/Button';
import styles from './page.module.css';
import dynamic from 'next/dynamic';

const CheckoutButton = dynamic(() => import('@/components/checkout/CheckoutButton'), { ssr: false });

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart, isLoaded } = useCart();
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    });
  }, []);

  if (!isLoaded) return <div className={styles.page} style={{ padding: '6rem', textAlign: 'center' }}>Loading...</div>;

  if (cartItems.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <h1 className={styles.emptyTitle}>Your Cart is Empty</h1>
            <p>Looks like you haven't added any screens to your cart yet.</p>
            <Link href="/shop" style={{ display: 'inline-block' }}>
              <Button variant="primary" className={styles.shopBtn}>Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Paystack config uses total
  // Remove reference to let Paystack auto-generate a stable one
  // Sanitize cartTotal to ensure it's a valid integer amount in kobo
  const safeTotal = parseFloat(cartTotal?.toString().replace(/,/g, '') || 0);
  const config = {
    email: user?.email || "guest@scrinhouse.com",
    amount: Math.round(safeTotal * 100), 
    currency: "GHS",
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_202c70c5c62a5ede0f0a77fc84023659ce44103f',
  };

  const onSuccess = async (reference) => {
    if (user) {
      try {
        const orderData = {
          userId: user.uid,
          userEmail: user.email,
          items: cartItems,
          totalAmount: cartTotal,
          paymentReference: reference.reference,
          status: 'pending',
          createdAt: serverTimestamp()
        };
        await addDoc(collection(db, 'orders'), orderData);
        
        // Decrement inventory stock
        for (const item of cartItems) {
          try {
            const productRef = doc(db, 'products', item.id);
            await updateDoc(productRef, {
              stock: increment(-item.quantity)
            });
          } catch (err) {
            console.error("Failed to decrement stock for item:", item.id, err);
          }
        }
      } catch (error) {
        console.error("Error saving batch order to Firestore: ", error);
      }
    }
    
    // Clear cart and redirect
    clearCart();
    alert('Payment Successful! Thank you for your purchase.');
    if (user) {
      router.push('/account');
    } else {
      router.push('/');
    }
  };

  const onClose = () => {
    console.log('Payment modal closed');
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Shopping Cart</h1>
        
        <div className={styles.grid}>
          {/* Cart Items List */}
          <div className={styles.cartItems}>
            {cartItems.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemImageWrapper}>
                  {item.images && item.images[0] ? (
                    <Image 
                      src={item.images[0]} 
                      alt={item.name} 
                      fill 
                      className={styles.itemImage} 
                    />
                  ) : (
                    <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className={styles.itemDetails}>
                  <div className={styles.itemHeader}>
                    <div>
                      <h3 className={styles.itemName}>{item.name}</h3>
                      <p className={styles.itemPrice}>GHS {item.price.toLocaleString()}</p>
                    </div>
                    <button 
                      className={styles.removeBtn} 
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Remove item"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                  
                  <div className={styles.quantitySelector}>
                    <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <input type="number" value={item.quantity} className={styles.qtyInput} readOnly />
                    <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>
              
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>GHS {cartTotal.toLocaleString()}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>Calculated at next step</span>
              </div>
              
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span>GHS {cartTotal.toLocaleString()}</span>
              </div>
              
              {!user ? (
                <Button 
                  variant="primary" 
                  className={styles.checkoutBtn}
                  onClick={() => router.push('/account?redirect=/cart')}
                >
                  Login to Checkout
                </Button>
              ) : (
                <CheckoutButton 
                  config={config}
                  onSuccess={onSuccess}
                  onClose={onClose}
                  className={styles.checkoutBtn}
                  text="Proceed to Checkout"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

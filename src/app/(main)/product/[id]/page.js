"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import Button from '@/components/ui/Button';
import styles from './ProductDetails.module.css';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/context/CartContext';

const CheckoutButton = dynamic(() => import('@/components/checkout/CheckoutButton'), { ssr: false });

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [id, setId] = useState(null);
  const router = useRouter();
  const { addToCart } = useCart();

  const [user, setUser] = useState(null);

  useEffect(() => {
    Promise.resolve(params).then(p => setId(p.id));
  }, [params]);

  useEffect(() => {
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    });
  }, []);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const config = {
    reference: (new Date()).getTime().toString(),
    email: user?.email || "customer@scrinhouse.com",
    amount: product ? product.price * qty * 100 : 0, // Paystack expects amount in pesewas
    publicKey: 'pk_test_202c70c5c62a5ede0f0a77fc84023659ce44103f',
    currency: 'GHS'
  };

  const onSuccess = async (reference) => {
    try {
      await addDoc(collection(db, 'orders'), {
        productId: product.id,
        productName: product.name,
        quantity: qty,
        amount: product.price * qty,
        customerEmail: user?.email || "customer@scrinhouse.com",
        customerName: user?.displayName || "Guest",
        status: "Paid",
        reference: reference.reference,
        createdAt: serverTimestamp()
      });
      alert('Payment successful! Your order has been placed.');
    } catch (err) {
      console.error("Error saving order:", err);
      alert('Payment succeeded but saving order failed. Please contact support.');
    }
  };

  const onClose = () => {
    console.log('Payment window closed');
  };

  if (loading) {
    return <div style={{ padding: '6rem', textAlign: 'center' }}>Loading product details...</div>;
  }

  if (!product) {
    return <div style={{ padding: '6rem', textAlign: 'center' }}>Product not found.</div>;
  }

  const stockStatus = product.stock > 5 ? 'In Stock' : (product.stock > 0 ? 'Low Stock' : 'Out of Stock');

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Breadcrumbs */}
        <nav className={styles.breadcrumbs}>
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link href="/shop" className={styles.breadcrumbLink}>Shop</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>{product.name}</span>
        </nav>

        <div className={styles.layout}>
          {/* Image Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainImageWrapper}>
              <Image 
                src={product.imageUrl || '/images/placeholder.png'} 
                alt={product.name} 
                fill 
                sizes="(max-width: 768px) 100vw, 50vw"
                className={styles.mainImage} 
                priority
              />
            </div>
          </div>

          {/* Product Info */}
          <div className={styles.info}>
            <div className={styles.header}>
              <div className={styles.stockStatus}>
                <span className={`${styles.statusDot} ${stockStatus === 'In Stock' ? styles.inStock : (stockStatus === 'Low Stock' ? styles.lowStock : styles.outOfStock)}`}></span>
                {stockStatus}
              </div>
              <h1 className={styles.title}>{product.name}</h1>
              <p className={styles.price}>GHS {product.price?.toLocaleString()}</p>
            </div>

            <div className={styles.description}>
              <p>{product.description || "Premium quality replacement part."}</p>
            </div>

            <div className={styles.actions}>
              <div className={styles.quantitySelector}>
                <button className={styles.qtyBtn} onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                <input type="number" value={qty} className={styles.qtyInput} readOnly />
                <button className={styles.qtyBtn} onClick={() => setQty(qty + 1)}>+</button>
              </div>
              <Button 
                variant="primary" 
                className={styles.addToCartBtn}
                disabled={stockStatus === 'Out of Stock'}
                onClick={() => {
                  addToCart(product, qty);
                  router.push('/cart');
                }}
              >
                {stockStatus === 'Out of Stock' ? 'Sold Out' : `Add to Cart - GHS ${(product.price * qty).toLocaleString()}`}
              </Button>
            </div>
            
            <div className={styles.serviceBanner}>
              <svg className={styles.serviceIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
              <div>
                <h4 className={styles.serviceTitle}>Need this part installed?</h4>
                <p className={styles.serviceText}>Book a repair with us and we'll handle the replacement.</p>
                <Link href="/repair-booking" className={styles.serviceLink}>Book Repair</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

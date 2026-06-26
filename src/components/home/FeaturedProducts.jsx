"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import Button from '../ui/Button';
import Card from '../ui/Card';
import styles from './FeaturedProducts.module.css';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'products'), where('isFeatured', '==', true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Optional: limit to 4 if there are too many featured products
      setProducts(fetchedProducts.slice(0, 4));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching featured products:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading && products.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>Featured Screens</h2>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading featured products...</div>
        </div>
      </section>
    );
  }

  if (!loading && products.length === 0) {
    return null; // Don't show the section if no featured products
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Featured Screens</h2>
          <Link href="/shop" className={styles.viewAll}>
            View All Parts
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.arrowIcon}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
        
        <div className={styles.grid}>
          {products.map((product) => {
            const stockStatus = product.stock > 5 ? 'In Stock' : (product.stock > 0 ? 'Low Stock' : 'Out of Stock');
            return (
              <Link href={`/product/${product.id}`} key={product.id} style={{ display: 'block', textDecoration: 'none' }}>
                <Card hoverable className={styles.productCard}>
                  <div className={styles.imageWrapper}>
                    <Image 
                      src={product.imageUrl || '/images/placeholder.png'} 
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className={styles.image}
                    />
                  </div>
                  <div className={styles.productInfo}>
                    <div className={styles.stockStatus}>
                      <span className={`${styles.statusDot} ${stockStatus === 'In Stock' ? styles.inStock : (stockStatus === 'Low Stock' ? styles.lowStock : styles.outOfStock)}`}></span>
                      {stockStatus}
                    </div>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <p className={styles.productPrice}>GHS {product.price?.toLocaleString() || product.price}</p>
                    <Button variant="outline" className={styles.addToCartBtn} disabled={stockStatus === 'Out of Stock'}>
                      {stockStatus === 'Out of Stock' ? 'Sold Out' : 'View Details'}
                    </Button>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

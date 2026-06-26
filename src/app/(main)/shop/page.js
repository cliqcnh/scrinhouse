"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import styles from "./Shop.module.css";

export default function Shop({ searchParams }) {
  // Read category from URL if present
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Resolve searchParams (in Next.js 15+ it's a Promise, but in 14 it's an object)
    // To be safe, we wrap it in a Promise.resolve if it's not already a promise
    Promise.resolve(searchParams).then((params) => {
      if (params?.category) {
        // Map URL query values to actual categories
        const catMap = {
          'screens': 'Screens',
          'batteries': 'Batteries',
          'cameras': 'Cameras',
          'charging': 'Charging Ports'
        };
        setActiveCategory(catMap[params.category.toLowerCase()] || "All");
      }
    });
  }, [searchParams]);

  useEffect(() => {
    // Use onSnapshot instead of getDocs for real-time updates and faster cached loads
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const fetchedProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(fetchedProducts);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products from Firestore:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const categories = ["All", "Screens", "Batteries", "Cameras", "Charging Ports"];

  const filteredProducts = activeCategory === "All" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Shop Premium Parts</h1>
          <p className={styles.subtitle}>Quality-tested replacement parts for your devices.</p>
        </header>

        <div className={styles.layout}>
          {/* Sidebar / Filters */}
          <aside className={styles.sidebar}>
            <div className={styles.filterGroup}>
              <h3 className={styles.filterTitle}>Categories</h3>
              <ul className={styles.filterList}>
                {categories.map((cat) => (
                  <li key={cat}>
                    <button 
                      className={`${styles.filterBtn} ${activeCategory === cat ? styles.activeFilter : ''}`}
                      onClick={() => setActiveCategory(cat)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '0.5rem 0',
                        color: activeCategory === cat ? 'var(--color-accent-green)' : '#525252',
                        fontWeight: activeCategory === cat ? '600' : '400',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        fontSize: '1rem'
                      }}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Product Grid */}
          <main className={styles.main}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#525252' }}>
                <h3>Loading products...</h3>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#525252' }}>
                <h3>No products found in this category.</h3>
              </div>
            ) : (
              <div className={styles.grid}>
                {filteredProducts.map((product) => {
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
                )})}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

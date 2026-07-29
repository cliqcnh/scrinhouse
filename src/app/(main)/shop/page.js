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
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.resolve(searchParams).then((params) => {
      if (params?.category) {
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

  // Filter by category, then by search query
  const filteredProducts = products
    .filter(p => activeCategory === "All" || p.category === activeCategory)
    .filter(p => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.model || '').toLowerCase().includes(q)
      );
    });

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Shop Premium Parts</h1>
          <p className={styles.subtitle}>Quality-tested replacement parts for your devices.</p>
        </header>

        {/* Search Bar */}
        <div className={styles.searchWrapper}>
          <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search products by name, model, or brand..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          {search && (
            <button className={styles.searchClear} onClick={() => setSearch('')} aria-label="Clear search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

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
            {/* Results info */}
            {search.trim() && !loading && (
              <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#6B7280' }}>
                {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
                {activeCategory !== 'All' && ` in ${activeCategory}`}
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#525252' }}>
                <h3>Loading products...</h3>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#525252' }}>
                <h3>{search.trim() ? 'No products match your search.' : 'No products found in this category.'}</h3>
                {search.trim() && (
                  <button
                    onClick={() => { setSearch(''); setActiveCategory('All'); }}
                    style={{ marginTop: '1rem', padding: '0.6rem 1.25rem', background: '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
                  >
                    Clear Filters
                  </button>
                )}
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

"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import styles from '../Admin.module.css';

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.name || '').localeCompare(b.name || '')));
    });
    return () => unsubscribe();
  }, []);

  const filtered = products
    .filter(p => {
      if (filter === 'low') return (p.stock || 0) <= (p.reorderPoint || 5);
      if (filter === 'out') return (p.stock || 0) === 0;
      return true;
    })
    .filter(p => (p.name || '').toLowerCase().includes(search.toLowerCase()));

  const totalValue = products.reduce((sum, p) => sum + (p.price || 0) * (p.stock || 0), 0);
  const lowStock = products.filter(p => (p.stock || 0) <= (p.reorderPoint || 5) && (p.stock || 0) > 0).length;
  const outOfStock = products.filter(p => (p.stock || 0) === 0).length;

  async function updateStock(id, newStock) {
    const val = parseInt(newStock, 10);
    if (isNaN(val) || val < 0) return;
    await updateDoc(doc(db, 'products', id), { stock: val });
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Inventory Management</h1>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Total Products</h3>
          <p className={styles.statValue}>{products.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Inventory Value</h3>
          <p className={styles.statValue}>GHS {totalValue.toLocaleString()}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Low Stock</h3>
          <p className={styles.statValue} style={{ color: '#F59E0B' }}>{lowStock}</p>
          <span className={styles.statChange} style={{ color: '#F59E0B' }}>Needs reorder</span>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Out of Stock</h3>
          <p className={styles.statValue} style={{ color: '#EF4444' }}>{outOfStock}</p>
          <span className={`${styles.statChange} ${styles.statChangeNegative}`}>Urgent</span>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input className={styles.searchInput} placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className={styles.filterSelect} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Products</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Reorder Point</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No products found</td></tr>
            ) : filtered.map(p => {
              const stock = p.stock || 0;
              const reorder = p.reorderPoint || 5;
              const statusBadge = stock === 0
                ? { label: 'Out of Stock', cls: styles.badgeError }
                : stock <= reorder
                ? { label: 'Low Stock', cls: styles.badgeWarning }
                : { label: 'In Stock', cls: styles.badge };

              return (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.id.slice(0, 8).toUpperCase()}</td>
                  <td>GHS {(p.price || 0).toLocaleString()}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      defaultValue={stock}
                      onBlur={e => updateStock(p.id, e.target.value)}
                      className={styles.formInput}
                      style={{ width: '80px', padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                    />
                  </td>
                  <td>{reorder}</td>
                  <td><span className={statusBadge.cls}>{statusBadge.label}</span></td>
                  <td>
                    <button
                      className={styles.actionBtnOutline}
                      style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}
                      onClick={() => updateStock(p.id, stock + 10)}
                    >
                      +10
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

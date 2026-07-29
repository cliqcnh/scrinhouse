"use client";
import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import styles from '../Admin.module.css';

export default function AdminProducts() {
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Screens');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Listen for real-time updates from Firestore
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(prods);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'products'), {
        name,
        price: Number(price),
        category,
        stock: Number(stock),
        imageUrl,
        isFeatured,
        createdAt: serverTimestamp()
      });
      alert('Product saved successfully!');
      setShowForm(false);
      // Reset form
      setName(''); setPrice(''); setStock(''); setImageUrl(''); setIsFeatured(false);
    } catch (error) {
      console.error("Error adding product: ", error);
      alert('Error saving product. Make sure Firestore rules allow writes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportToCSV = () => {
    if (products.length === 0) return alert("No products to export");
    const headers = ["ID", "Name", "Category", "Price", "Stock", "Status"];
    const rows = products.map(p => [
      p.id,
      `"${p.name || ''}"`,
      p.category,
      p.price,
      p.stock,
      p.stock > 5 ? 'In Stock' : (p.stock > 0 ? 'Low Stock' : 'Out of Stock')
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "products_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    if (products.length === 0) return alert("No products to export");
    const { jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    
    const doc = new jsPDF();
    doc.text("ScrinHouse Products Inventory", 14, 15);
    
    const tableColumn = ["ID", "Name", "Category", "Price (GHS)", "Stock"];
    const tableRows = [];
    
    products.forEach(p => {
      const row = [
        p.id.slice(0, 8),
        p.name || '',
        p.category,
        p.price,
        p.stock
      ];
      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    
    doc.save("products_inventory.pdf");
  };

  return (
    <div>
      <div className={styles.pageHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className={styles.pageTitle}>Products & Inventory</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="outline" onClick={exportToCSV} disabled={loading || products.length === 0}>Export CSV</Button>
          <Button variant="outline" onClick={exportToPDF} disabled={loading || products.length === 0}>Export PDF</Button>
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Product'}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className={styles.card}>
          <h2 style={{ marginBottom: '1.5rem', fontWeight: 700 }}>Upload New Product</h2>
          <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Product Name</label>
                <Input type="text" placeholder="e.g. iPhone 15 Screen" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Price (GHS)</label>
                <Input type="number" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Category</label>
                <select className={styles.input} value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e5e5', width: '100%' }}>
                  <option value="Screens">Screens</option>
                  <option value="Batteries">Batteries</option>
                  <option value="Cameras">Cameras</option>
                  <option value="Charging Ports">Charging Ports</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Stock Quantity</label>
                <Input type="number" placeholder="10" value={stock} onChange={e => setStock(e.target.value)} required />
              </div>
              <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                <label className={styles.label}>Product Image URL</label>
                <Input type="text" placeholder="/images/placeholder.png" value={imageUrl} onChange={e => setImageUrl(e.target.value)} required />
              </div>
              <div className={styles.formGroup} style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="isFeatured" 
                  checked={isFeatured} 
                  onChange={e => setIsFeatured(e.target.checked)} 
                  style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
                />
                <label htmlFor="isFeatured" className={styles.label} style={{ marginBottom: 0, cursor: 'pointer' }}>Feature on Homepage</label>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Product'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className={styles.toolbar} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          className={styles.searchInput} 
          placeholder="Search products by name or category..." 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
          style={{ flex: 1, maxWidth: '400px' }}
        />
      </div>

      {loading ? (
        <Card className={styles.card}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading products...</div>
        </Card>
      ) : (() => {
        const filteredProducts = products.filter(p => {
          const term = searchQuery.toLowerCase();
          return (
            (p.name || '').toLowerCase().includes(term) ||
            (p.category || '').toLowerCase().includes(term)
          );
        });

        const groupedProducts = filteredProducts.reduce((acc, prod) => {
          const cat = prod.category || 'Uncategorized';
          if (!acc[cat]) {
            acc[cat] = [];
          }
          acc[cat].push(prod);
          return acc;
        }, {});

        if (Object.keys(groupedProducts).length === 0) {
          return (
            <Card className={styles.card}>
              <div style={{ textAlign: 'center', padding: '2rem' }}>No products found matching your search.</div>
            </Card>
          );
        }

        return Object.entries(groupedProducts).map(([catName, catProducts]) => (
          <Card key={catName} className={styles.card} style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111' }}>{catName}</h3>
              <span className={styles.badge} style={{ backgroundColor: '#f3f4f6', color: '#4b5563' }}>
                {catProducts.length} {catProducts.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {catProducts.map((prod) => (
                  <tr key={prod.id}>
                    <td style={{ fontWeight: 500 }}>{prod.name}</td>
                    <td>GHS {prod.price.toLocaleString()}</td>
                    <td>{prod.stock}</td>
                    <td>
                      {prod.stock > 5 ? (
                        <span className={styles.badge}>In Stock</span>
                      ) : prod.stock > 0 ? (
                        <span className={`${styles.badge} ${styles.badgeWarning}`}>Low Stock</span>
                      ) : (
                        <span className={`${styles.badge} ${styles.badgeError}`}>Out of Stock</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ));
      })()}
    </div>
  );
}

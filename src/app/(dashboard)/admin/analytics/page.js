"use client";
import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import styles from '../Admin.module.css';

export default function AnalyticsPage() {
  const [data, setData] = useState({ orders: [], repairs: [], products: [] });
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);

  useEffect(() => {
    async function fetch() {
      const [ordersSnap, repairsSnap, productsSnap] = await Promise.all([
        getDocs(collection(db, 'orders')), getDocs(collection(db, 'repairs')), getDocs(collection(db, 'products')),
      ]);
      setData({
        orders: ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        repairs: repairsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        products: productsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      });
      setLoading(false);
    }
    fetch();
  }, []);

  // Draw bar chart on canvas
  useEffect(() => {
    if (loading || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = 600, h = 300;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    // Group orders by month
    const monthly = {};
    data.orders.filter(o => o.status !== 'cancelled').forEach(o => {
      const d = o.createdAt?.toDate ? o.createdAt.toDate() : null;
      if (!d) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthly[key] = (monthly[key] || 0) + (o.totalAmount || 0);
    });

    const keys = Object.keys(monthly).sort().slice(-6);
    const values = keys.map(k => monthly[k]);
    const max = Math.max(...values, 1);

    ctx.clearRect(0, 0, w, h);
    const barW = 60, gap = 20, startX = 60, startY = h - 40;

    // Y axis
    ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = startY - (startY - 20) * (i / 4);
      ctx.beginPath(); ctx.moveTo(startX - 5, y); ctx.lineTo(w - 20, y); ctx.stroke();
      ctx.fillStyle = '#9CA3AF'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(`GHS ${Math.round(max * i / 4).toLocaleString()}`, startX - 10, y + 3);
    }

    // Bars
    keys.forEach((key, i) => {
      const x = startX + i * (barW + gap);
      const barH = (values[i] / max) * (startY - 20);
      const gradient = ctx.createLinearGradient(x, startY - barH, x, startY);
      gradient.addColorStop(0, '#16A34A'); gradient.addColorStop(1, '#15803D');
      ctx.fillStyle = gradient;
      ctx.beginPath(); ctx.roundRect(x, startY - barH, barW, barH, [6, 6, 0, 0]); ctx.fill();
      ctx.fillStyle = '#374151'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(key.slice(5), x + barW / 2, startY + 16);
      ctx.fillStyle = '#16A34A'; ctx.font = 'bold 10px sans-serif';
      ctx.fillText(`GHS ${values[i].toLocaleString()}`, x + barW / 2, startY - barH - 8);
    });
  }, [loading, data]);

  const totalRevenue = data.orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.totalAmount || 0), 0);
  const avgOrderValue = data.orders.length ? Math.round(totalRevenue / data.orders.filter(o => o.status !== 'cancelled').length) : 0;
  const topProducts = [...data.products].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 5);

  return (
    <div>
      <div className={styles.pageHeader}><h1 className={styles.pageTitle}>Analytics</h1></div>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Total Revenue</h3><p className={styles.statValue}>GHS {totalRevenue.toLocaleString()}</p></div>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Total Orders</h3><p className={styles.statValue}>{data.orders.length}</p></div>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Avg Order Value</h3><p className={styles.statValue}>GHS {avgOrderValue.toLocaleString()}</p></div>
        <div className={styles.statCard}><h3 className={styles.statTitle}>Total Repairs</h3><p className={styles.statValue}>{data.repairs.length}</p></div>
      </div>

      <div className={styles.dashboardSection}>
        <h2 className={styles.sectionTitle}>Monthly Revenue</h2>
        <div className={styles.card}>
          {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}>Loading chart…</div> : <canvas ref={canvasRef} style={{ width: '100%', maxWidth: '600px' }} />}
        </div>
      </div>

      <div className={styles.dashboardSection}>
        <h2 className={styles.sectionTitle}>Top Products</h2>
        <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
          <table className={styles.table}>
            <thead><tr><th>Product</th><th>Price</th><th>Sold</th><th>Stock</th><th>Revenue</th></tr></thead>
            <tbody>
              {topProducts.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>GHS {(p.price || 0).toLocaleString()}</td>
                  <td>{p.sold || 0}</td>
                  <td>{p.stock || 0}</td>
                  <td style={{ fontWeight: 600 }}>GHS {((p.price || 0) * (p.sold || 0)).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

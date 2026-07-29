"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import styles from '../Account.module.css';

export default function DownloadsPage() {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchReceipts() {
      try {
        const ordersQ = query(collection(db, 'orders'), where('userId', '==', user.uid));
        const snap = await getDocs(ordersQ);
        const receiptsData = snap.docs
          .filter(d => d.data().status !== 'cancelled')
          .map(d => {
            const data = d.data();
            return {
              id: d.id,
              reference: `REC-${d.id.slice(-6).toUpperCase()}`,
              description: `${data.items?.length || 0} item(s) - ${data.items?.map(i => i.name).join(', ') || 'Order'}`,
              amount: data.totalAmount || 0,
              date: data.createdAt,
              status: data.status,
              items: data.items || [],
              customerName: data.customerName || '',
              customerPhone: data.customerPhone || '',
            };
          })
          .sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));

        setReceipts(receiptsData);
      } catch (err) {
        console.error('Error fetching receipts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchReceipts();
  }, [user]);

  async function downloadReceipt(receipt) {
    const jsPDF = (await import('jspdf')).default;
    await import('jspdf-autotable');
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('ScrinHouse', 20, 25);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('Premium iPhone Screens & Professional Repairs', 20, 32);
    doc.text('Accra, Ghana | scrinhouse@gmail.com', 20, 37);

    doc.setTextColor(0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('RECEIPT', 150, 25);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(receipt.reference, 150, 32);
    doc.text(`Date: ${receipt.date?.toDate ? receipt.date.toDate().toLocaleDateString() : 'N/A'}`, 150, 37);

    doc.setDrawColor(200);
    doc.line(20, 43, 190, 43);

    // Customer info
    doc.setFontSize(10);
    doc.text(`Customer: ${receipt.customerName || 'N/A'}`, 20, 52);
    doc.text(`Phone: ${receipt.customerPhone || 'N/A'}`, 20, 58);

    // Items table
    const tableBody = receipt.items.map(item => [
      item.name,
      item.quantity.toString(),
      `GHS ${item.price?.toLocaleString()}`,
      `GHS ${(item.price * item.quantity).toLocaleString()}`,
    ]);

    doc.autoTable({
      startY: 66,
      head: [['Item', 'Qty', 'Unit Price', 'Total']],
      body: tableBody,
      foot: [['', '', 'Grand Total', `GHS ${receipt.amount.toLocaleString()}`]],
      theme: 'grid',
      headStyles: { fillColor: [17, 17, 17], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      footStyles: { fillColor: [236, 253, 245], textColor: [6, 95, 70], fontStyle: 'bold', fontSize: 10 },
    });

    doc.setFontSize(8);
    doc.setTextColor(150);
    const y = doc.internal.pageSize.height - 20;
    doc.text('Thank you for your purchase! For warranty and support, visit scrinhouse.com', 20, y);

    doc.save(`${receipt.reference}.pdf`);
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Downloads</h1>
        <p className={styles.pageSubtitle}>Download receipts for your orders.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>Loading receipts…</div>
      ) : receipts.length === 0 ? (
        <div className={styles.contentCard}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📥</div>
            <p className={styles.emptyTitle}>No receipts available</p>
            <p className={styles.emptyText}>Receipts will appear here after you complete orders.</p>
          </div>
        </div>
      ) : (
        <div className={styles.itemList}>
          {receipts.map(rec => (
            <div key={rec.id} className={styles.itemCard}>
              <div className={styles.itemHeader}>
                <div>
                  <div className={styles.itemId}>{rec.reference}</div>
                  <div className={styles.itemDate}>
                    {rec.date?.toDate ? rec.date.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                  </div>
                </div>
                <span className={`${styles.badge} ${styles.badgeGreen}`}>Receipt</span>
              </div>
              <div className={styles.itemBody} style={{ fontSize: '0.85rem' }}>{rec.description}</div>
              <div className={styles.itemFooter}>
                <span style={{ fontWeight: 700 }}>GHS {rec.amount.toLocaleString()}</span>
                <button className={`${styles.btnPrimary} ${styles.btnSmall}`} onClick={() => downloadReceipt(rec)}>
                  📄 Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

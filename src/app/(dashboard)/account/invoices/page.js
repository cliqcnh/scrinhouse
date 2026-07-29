"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import styles from '../Account.module.css';

export default function InvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchInvoices() {
      try {
        // Invoices come from completed orders + completed repairs
        const ordersQ = query(collection(db, 'orders'), where('userId', '==', user.uid));
        const ordersSnap = await getDocs(ordersQ);
        const orderInvoices = ordersSnap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            type: 'order',
            reference: `INV-ORD-${d.id.slice(-6).toUpperCase()}`,
            description: `Order - ${data.items?.length || 0} item(s)`,
            amount: data.totalAmount || 0,
            status: data.status === 'delivered' ? 'paid' : data.status === 'cancelled' ? 'cancelled' : 'pending',
            date: data.createdAt,
          };
        });

        const repairsQ = query(collection(db, 'repairs'), where('userId', '==', user.uid));
        const repairsSnap = await getDocs(repairsQ);
        const repairInvoices = repairsSnap.docs
          .filter(d => d.data().status === 'Completed')
          .map(d => {
            const data = d.data();
            return {
              id: d.id,
              type: 'repair',
              reference: `INV-REP-${d.id.slice(-6).toUpperCase()}`,
              description: `Repair - ${data.brand} ${data.model} (${data.problem})`,
              amount: data.cost || 0,
              status: 'paid',
              date: data.createdAt,
            };
          });

        const all = [...orderInvoices, ...repairInvoices]
          .sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));
        setInvoices(all);
      } catch (err) {
        console.error('Error fetching invoices:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();
  }, [user]);

  async function downloadInvoice(invoice) {
    const jsPDF = (await import('jspdf')).default;
    await import('jspdf-autotable');
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ScrinHouse', 20, 25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Premium iPhone Screens & Repairs', 20, 32);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 150, 25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.reference, 150, 32);

    doc.line(20, 40, 190, 40);

    doc.setFontSize(10);
    doc.text(`Date: ${invoice.date?.toDate ? invoice.date.toDate().toLocaleDateString() : 'N/A'}`, 20, 50);
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 20, 57);
    doc.text(`Type: ${invoice.type === 'order' ? 'Product Order' : 'Repair Service'}`, 20, 64);

    doc.autoTable({
      startY: 75,
      head: [['Description', 'Amount (GHS)']],
      body: [[invoice.description, invoice.amount.toLocaleString()]],
      foot: [['Total', `GHS ${invoice.amount.toLocaleString()}`]],
      theme: 'striped',
      headStyles: { fillColor: [17, 17, 17] },
      footStyles: { fillColor: [236, 253, 245], textColor: [6, 95, 70], fontStyle: 'bold' },
    });

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Thank you for choosing ScrinHouse!', 20, doc.internal.pageSize.height - 20);

    doc.save(`${invoice.reference}.pdf`);
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Invoices</h1>
        <p className={styles.pageSubtitle}>View and download invoices for your orders and repairs.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>Loading invoices…</div>
      ) : invoices.length === 0 ? (
        <div className={styles.contentCard}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📄</div>
            <p className={styles.emptyTitle}>No invoices yet</p>
            <p className={styles.emptyText}>Invoices will appear here after you place orders or complete repairs.</p>
          </div>
        </div>
      ) : (
        <div className={styles.itemList}>
          {invoices.map(inv => (
            <div key={inv.id} className={styles.itemCard}>
              <div className={styles.itemHeader}>
                <div>
                  <div className={styles.itemId}>{inv.reference}</div>
                  <div className={styles.itemDate}>
                    {inv.date?.toDate ? inv.date.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                  </div>
                </div>
                <span className={`${styles.badge} ${
                  inv.status === 'paid' ? styles.badgeGreen :
                  inv.status === 'cancelled' ? styles.badgeRed :
                  styles.badgeYellow
                }`}>
                  {inv.status}
                </span>
              </div>
              <div className={styles.itemBody}>{inv.description}</div>
              <div className={styles.itemFooter}>
                <span style={{ fontWeight: 700 }}>GHS {inv.amount.toLocaleString()}</span>
                <button
                  className={`${styles.btnOutline} ${styles.btnSmall}`}
                  onClick={() => downloadInvoice(inv)}
                >
                  📥 Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

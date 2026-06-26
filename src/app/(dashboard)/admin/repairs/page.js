"use client";
import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import styles from '../Admin.module.css';

export default function AdminRepairs() {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for real-time updates from Firestore
    const unsubscribe = onSnapshot(collection(db, 'repairs'), (snapshot) => {
      const reps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort by creation date descending
      reps.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setRepairs(reps);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching repairs:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const repairRef = doc(db, 'repairs', id);
      await updateDoc(repairRef, {
        status: newStatus
      });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please check Firestore rules.");
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Repair Bookings</h1>
      </div>

      <Card className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Repair ID</th>
              <th>Customer</th>
              <th>Device & Issue</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading bookings...</td></tr>
            ) : repairs.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>No repair bookings yet.</td></tr>
            ) : (
              repairs.map((repair) => (
                <tr key={repair.id}>
                  <td style={{ fontWeight: 600 }}>{repair.id.slice(0, 8).toUpperCase()}</td>
                  <td>
                    <div>{repair.contact}</div>
                    <div style={{ fontSize: '0.75rem', color: '#737373' }}>{repair.address}</div>
                  </td>
                  <td>
                    <div>{repair.brand} {repair.model}</div>
                    <div style={{ fontSize: '0.875rem', color: '#737373' }}>{repair.problem}</div>
                  </td>
                  <td>{repair.date || (repair.createdAt ? new Date(repair.createdAt.toMillis()).toLocaleDateString() : 'N/A')}</td>
                  <td>
                    <span className={`${styles.badge} ${repair.status === 'Completed' ? '' : styles.badgeWarning}`}>
                      {repair.status}
                    </span>
                  </td>
                  <td>
                    <select 
                      style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #e5e5e5' }}
                      value={repair.status}
                      onChange={(e) => updateStatus(repair.id, e.target.value)}
                    >
                      <option value="Received">Received</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

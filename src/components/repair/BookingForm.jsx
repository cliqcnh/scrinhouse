"use client";
import { useState } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import styles from './BookingForm.module.css';

export default function BookingForm() {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    problem: '',
    address: '',
    date: '',
    contact: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase/config');
      
      const docRef = await addDoc(collection(db, 'repairs'), {
        ...formData,
        status: 'Received',
        createdAt: serverTimestamp()
      });
      
      alert(`Pickup scheduled successfully! Your Repair ID is ${docRef.id}. We will contact you shortly.`);
      setFormData({ brand: '', model: '', problem: '', address: '', date: '', contact: '' });
    } catch (error) {
      console.error('Error saving booking:', error);
      alert('There was an error scheduling your pickup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={styles.formCard}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.grid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Device Brand</label>
            <select name="brand" value={formData.brand} onChange={handleChange} required className={styles.select}>
              <option value="">Select Brand</option>
              <option value="Apple">Apple</option>
              <option value="Samsung">Samsung</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Device Model</label>
            <Input 
              type="text" 
              name="model" 
              placeholder="e.g. iPhone 13 Pro" 
              value={formData.model} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Problem Type</label>
            <select name="problem" value={formData.problem} onChange={handleChange} required className={styles.select}>
              <option value="">Select Problem</option>
              <option value="Screen Replacement">Screen Replacement</option>
              <option value="Battery Replacement">Battery Replacement</option>
              <option value="Charging Port">Charging Port Issue</option>
              <option value="Water Damage">Water Damage</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Preferred Date</label>
            <Input 
              type="date" 
              name="date" 
              value={formData.date} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>

        <div className={styles.fullWidth}>
          <label className={styles.label}>Pickup Address</label>
          <Input 
            type="text" 
            name="address" 
            placeholder="Enter your full street address or landmark" 
            value={formData.address} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className={styles.fullWidth}>
          <label className={styles.label}>Contact Number</label>
          <Input 
            type="tel" 
            name="contact" 
            placeholder="e.g. 024 123 4567" 
            value={formData.contact} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className={styles.submitContainer}>
          <Button type="submit" variant="primary" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? 'Scheduling...' : 'Schedule Pickup'}
          </Button>
          <p className={styles.disclaimer}>
            By scheduling, you agree to our Terms of Service and Privacy Policy. No payment is required until repair is completed.
          </p>
        </div>
      </form>
    </Card>
  );
}

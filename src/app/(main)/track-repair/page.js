"use client";
import { useState } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import styles from './TrackRepair.module.css';

export default function TrackRepairPage() {
  const [trackingId, setTrackingId] = useState('');
  const [status, setStatus] = useState(null);

  const handleTrack = (e) => {
    e.preventDefault();
    // Simulate tracking lookup
    if (trackingId.trim() !== '') {
      setStatus('in_progress');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Track Your Repair</h1>
          <p className={styles.subtitle}>Enter your Repair ID to see the real-time status of your device.</p>
        </div>

        <Card className={styles.trackCard}>
          <form onSubmit={handleTrack} className={styles.form}>
            <div className={styles.inputGroup}>
              <Input 
                type="text" 
                placeholder="e.g. REP-123456" 
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                required
              />
              <Button type="submit" variant="primary">Track</Button>
            </div>
          </form>

          {status && (
            <div className={styles.result}>
              <div className={styles.statusBadge}>
                <span className={styles.statusDot}></span>
                In Progress
              </div>
              <h3 className={styles.deviceInfo}>iPhone 14 Pro Max - Screen Replacement</h3>
              <p className={styles.updateText}>Your device is currently with our technicians. Expected completion time is today at 4:00 PM.</p>
              
              <div className={styles.timeline}>
                <div className={`${styles.timelineStep} ${styles.completed}`}>
                  <div className={styles.stepIndicator}></div>
                  <div className={styles.stepContent}>
                    <h4>Device Received</h4>
                    <p>Yesterday, 10:30 AM</p>
                  </div>
                </div>
                <div className={`${styles.timelineStep} ${styles.completed}`}>
                  <div className={styles.stepIndicator}></div>
                  <div className={styles.stepContent}>
                    <h4>Diagnostic Complete</h4>
                    <p>Yesterday, 2:15 PM</p>
                  </div>
                </div>
                <div className={`${styles.timelineStep} ${styles.active}`}>
                  <div className={styles.stepIndicator}></div>
                  <div className={styles.stepContent}>
                    <h4>Repair in Progress</h4>
                    <p>Today, 9:00 AM</p>
                  </div>
                </div>
                <div className={styles.timelineStep}>
                  <div className={styles.stepIndicator}></div>
                  <div className={styles.stepContent}>
                    <h4>Ready for Delivery</h4>
                    <p>Pending</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

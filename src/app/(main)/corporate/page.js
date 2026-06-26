import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import styles from './Corporate.module.css';

export const metadata = {
  title: 'Corporate Services | ScrinHouse',
};

export default function CorporatePage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Corporate Device Management</h1>
          <p className={styles.subtitle}>Reliable, fast, and scalable repair solutions for businesses of all sizes in Ghana.</p>
          <Button variant="primary" className={styles.ctaBtn}>Become a Partner</Button>
        </div>

        <div className={styles.grid}>
          <Card className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <h3>Volume Discounts</h3>
            <p>Enjoy exclusive tiered pricing on repairs and parts based on your company's monthly volume.</p>
          </Card>
          
          <Card className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h3>Priority SLAs</h3>
            <p>Guaranteed turnaround times with dedicated account managers to ensure minimal downtime for your team.</p>
          </Card>

          <Card className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h3>Data Security</h3>
            <p>Strict data privacy protocols during repairs. We never access your team's sensitive information.</p>
          </Card>
        </div>

        <div className={styles.contactSection}>
          <h2>Ready to partner with us?</h2>
          <p>Contact our B2B team today to set up a corporate account and get your team covered.</p>
          <Link href="/contact">
            <Button variant="outline">Contact B2B Sales</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

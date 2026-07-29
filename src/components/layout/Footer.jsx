import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brandInfo}>
            <Link href="/" className={styles.logo}>ScrinHouse</Link>
            <p className={styles.description}>
              Premium iPhone screens, professional repairs, and expert service in Ghana.
            </p>
          </div>
          
          <div className={styles.linkGroup}>
            <h3 className={styles.groupTitle}>Services</h3>
            <Link href="/shop" className={styles.link}>Shop</Link>
            <Link href="/repair-booking" className={styles.link}>Book a Repair</Link>
            <Link href="/corporate" className={styles.link}>Corporate Services</Link>
          </div>

          <div className={styles.linkGroup}>
            <h3 className={styles.groupTitle}>Company</h3>
            <Link href="/about" className={styles.link}>About Us</Link>
            <Link href="/contact" className={styles.link}>Contact</Link>
            <Link href="/account" className={styles.link}>My Account</Link>
          </div>

          <div className={styles.linkGroup}>
            <h3 className={styles.groupTitle}>Legal</h3>
            <Link href="/privacy" className={styles.link}>Privacy Policy</Link>
            <Link href="/terms" className={styles.link}>Terms of Service</Link>
            <Link href="/warranty" className={styles.link}>Warranty Info</Link>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <p>&copy; {new Date().getFullYear()} ScrinHouse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

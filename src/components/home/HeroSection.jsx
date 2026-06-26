import Image from 'next/image';
import Link from 'next/link';
import Button from '../ui/Button';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>Premium iPhone Screens & Professional Repairs</h1>
          <p className={styles.subtitle}>
            Quality-tested replacement screens, expert repairs, and convenient pickup services.
          </p>
          <div className={styles.actions}>
            <Link href="/shop" style={{ flex: 1, display: 'flex' }}>
              <Button variant="primary" className={styles.actionBtn}>Shop Screens</Button>
            </Link>
            <Link href="/repair-booking" style={{ flex: 1, display: 'flex' }}>
              <Button variant="secondary" className={styles.actionBtn}>Book a Repair</Button>
            </Link>
          </div>
        </div>
        <div className={styles.imageWrapper}>
          <Image 
            src="/images/hero.png" 
            alt="Expert technician repairing premium smartphone" 
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            className={styles.image}
          />
        </div>
      </div>
    </section>
  );
}

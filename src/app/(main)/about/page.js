import Image from 'next/image';
import styles from './About.module.css';

export const metadata = {
  title: 'About Us | ScrinHouse',
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Redefining Mobile Repair in Ghana</h1>
          <p className={styles.subtitle}>ScrinHouse is committed to providing premium quality parts and expert repair services to keep you connected.</p>
        </div>

        <div className={styles.content}>
          <div className={styles.imageGrid}>
            <div className={`${styles.imageWrapper} ${styles.imgMain}`}>
              <Image src="/images/product.png" alt="Lab repair" fill className={styles.image} />
            </div>
            <div className={`${styles.imageWrapper} ${styles.imgSecondary}`}>
              <Image src="/images/product.png" alt="Parts" fill className={styles.image} />
            </div>
          </div>

          <div className={styles.textSection}>
            <h2>Our Story</h2>
            <p>Founded in Accra, ScrinHouse emerged from a simple realization: finding reliable, high-quality smartphone repairs and authentic replacement parts in Ghana was incredibly difficult. We set out to change that by establishing a premium repair lab that rivals international standards.</p>
            <p>Today, we serve thousands of retail customers and corporate clients, offering a seamless repair experience, from doorstep pickup to guaranteed warranties on all replacement parts.</p>
            
            <h2>Our Commitment to Quality</h2>
            <ul className={styles.valuesList}>
              <li>
                <strong>Premium Parts:</strong> We source only the highest grade replacement screens, batteries, and components.
              </li>
              <li>
                <strong>Expert Technicians:</strong> Our team consists of highly trained professionals specializing in micro-soldering and complex repairs.
              </li>
              <li>
                <strong>Convenience:</strong> With our pickup and delivery service, you don't even have to leave your office.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

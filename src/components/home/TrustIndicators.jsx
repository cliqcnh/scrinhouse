import styles from './TrustIndicators.module.css';

const indicators = [
  {
    title: 'Same Day Repairs',
    description: 'Most devices repaired in under 2 hours.',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.icon}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    title: 'Quality Tested Parts',
    description: 'Premium parts with strict quality control.',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.icon}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    title: 'Pickup & Delivery',
    description: 'We come to you anywhere in the city.',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.icon}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    title: 'Warranty Included',
    description: '6-month warranty on all screen repairs.',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.icon}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  }
];

export default function TrustIndicators() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {indicators.map((item, idx) => (
            <div key={idx} className={styles.card}>
              <div className={styles.iconWrapper}>{item.icon}</div>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.description}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

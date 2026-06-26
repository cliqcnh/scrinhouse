import Link from 'next/link';
import Card from '../ui/Card';
import styles from './ProductCategories.module.css';

const categories = [
  { name: 'iPhone Screens', slug: 'screens', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
  ) },
  { name: 'Batteries', slug: 'batteries', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="6" width="16" height="12" rx="2" ry="2"></rect><line x1="2" y1="9" x2="2" y2="15"></line><line x1="10" y1="9" x2="10" y2="15"></line></svg>
  ) },
  { name: 'Charging Components', slug: 'charging', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
  ) },
  { name: 'Cameras', slug: 'cameras', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
  ) },
  { name: 'Accessories', slug: 'accessories', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
  ) },
];

export default function ProductCategories() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Shop by Category</h2>
        <div className={styles.grid}>
          {categories.map((cat, idx) => (
            <Link href={`/shop?category=${cat.slug}`} key={idx} className={styles.link}>
              <Card hoverable className={styles.card}>
                <div className={styles.icon}>{cat.icon}</div>
                <h3 className={styles.name}>{cat.name}</h3>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

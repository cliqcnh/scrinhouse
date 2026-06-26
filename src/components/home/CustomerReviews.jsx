import Card from '../ui/Card';
import styles from './CustomerReviews.module.css';

const reviews = [
  {
    id: 1,
    name: 'Kwame Mensah',
    date: '2 days ago',
    text: 'Incredible service. They picked up my broken iPhone 13 Pro Max from my office in East Legon and returned it looking brand new before close of business. Highly recommended!',
    rating: 5,
  },
  {
    id: 2,
    name: 'Abena Osei',
    date: '1 week ago',
    text: 'The price estimator was spot on. No hidden charges, professional communication, and the replacement screen quality is indistinguishable from the original Apple display.',
    rating: 5,
  },
  {
    id: 3,
    name: 'TechHub GH',
    date: '2 weeks ago',
    text: 'We use ScrinHouse for all our corporate device repairs. Their B2B service is unmatched in Accra for reliability and speed. The 6-month warranty gives us peace of mind.',
    rating: 5,
  }
];

export default function CustomerReviews() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Trusted by Thousands</h2>
          <p className={styles.subtitle}>Don't just take our word for it. Here's what our customers have to say.</p>
        </div>

        <div className={styles.grid}>
          {reviews.map(review => (
            <Card key={review.id} className={styles.reviewCard}>
              <div className={styles.stars}>
                {[...Array(review.rating)].map((_, i) => (
                  <svg key={i} className={styles.star} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className={styles.text}>"{review.text}"</p>
              <div className={styles.author}>
                <div className={styles.avatar}>{review.name.charAt(0)}</div>
                <div>
                  <h4 className={styles.name}>{review.name}</h4>
                  <p className={styles.date}>{review.date}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

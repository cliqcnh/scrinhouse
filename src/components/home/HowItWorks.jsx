import styles from './HowItWorks.module.css';

const steps = [
  {
    number: '01',
    title: 'Book Repair',
    description: 'Select your device and schedule a convenient pickup time online.',
  },
  {
    number: '02',
    title: 'Rider Picks Up',
    description: 'Our professional dispatch rider collects your device securely.',
  },
  {
    number: '03',
    title: 'Repair & Testing',
    description: 'Expert technicians repair and thoroughly test your device.',
  },
  {
    number: '04',
    title: 'Device Returned',
    description: 'Your fixed device is returned to you, good as new.',
  }
];

export default function HowItWorks() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>How It Works</h2>
          <p className={styles.subtitle}>A seamless repair experience from start to finish.</p>
        </div>
        
        <div className={styles.steps}>
          {steps.map((step, idx) => (
            <div key={idx} className={styles.step}>
              <div className={styles.number}>{step.number}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

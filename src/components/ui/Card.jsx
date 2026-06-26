import styles from './Card.module.css';

export default function Card({ children, className = '', hoverable = false }) {
  const baseClass = styles.card;
  const hoverClass = hoverable ? styles.hoverable : '';
  
  return (
    <div className={`${baseClass} ${hoverClass} ${className}`}>
      {children}
    </div>
  );
}

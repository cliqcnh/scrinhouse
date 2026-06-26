"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../ui/Button';
import styles from './Navbar.module.css';
import { useCart } from '@/lib/context/CartContext';
import { auth } from '@/lib/firebase/config';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { cartItemCount, isLoaded } = useCart();

  useEffect(() => {
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    });
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <Link href="/" className={styles.logo}>
            ScrinHouse
          </Link>
        </div>
        
        <nav className={`${styles.nav} ${isMobileMenuOpen ? styles.navOpen : ''}`}>
          <Link href="/shop" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Shop Screens</Link>
          <Link href="/repair-booking" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Repairs</Link>
          <Link href="/track-repair" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Track Repair</Link>
          <Link href="/corporate" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Corporate</Link>
          <div className={styles.mobileActions}>
            {user ? (
              <Link href="/account" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className={styles.loginBtnMobile}>My Account</Button>
              </Link>
            ) : (
              <Link href="/account" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className={styles.loginBtnMobile}>Log In</Button>
              </Link>
            )}
          </div>
        </nav>

        <div className={styles.actions}>
          {user ? (
            <Link href="/account">
              <Button variant="outline" className={styles.loginBtn}>My Account</Button>
            </Link>
          ) : (
            <Link href="/account">
              <Button variant="outline" className={styles.loginBtn}>Log In</Button>
            </Link>
          )}

          <Link href="/cart" className={styles.cartIconWrapper} aria-label="Shopping Cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {isLoaded && cartItemCount > 0 && (
              <span className={styles.cartBadge}>{cartItemCount}</span>
            )}
          </Link>

          <Link href="/repair-booking" className={styles.bookRepairWrapper}>
            <Button variant="primary">Book Repair</Button>
          </Link>
          <button 
            className={styles.hamburger} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isMobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </>
              )}
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

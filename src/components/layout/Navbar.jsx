"use client";
import { useState } from 'react';
import Link from 'next/link';
import Button from '../ui/Button';
import styles from './Navbar.module.css';
import { useCart } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/auth/AuthProvider';
import { getDashboardPath } from '@/lib/auth/roles';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, role } = useAuth();
  const { cartItemCount, isLoaded } = useCart();

  const dashboardPath = getDashboardPath(role);
  const dashboardLabel = role === 'admin' ? 'Admin Dashboard' : role === 'technician' ? 'Tech Dashboard' : role === 'rider' ? 'Rider Dashboard' : 'My Account';
  // Logged-in customers go straight to the account booking flow
  const bookingPath = user && (role === 'customer' || role === 'business_customer' || !role)
    ? '/account/repairs/book'
    : '/repair-booking';


  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <Link href="/" className={styles.logo}>
            ScrinHouse
          </Link>
        </div>
        
        <nav className={`${styles.nav} ${isMobileMenuOpen ? styles.navOpen : ''}`}>
          <Link href="/shop" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
          <Link href="/repair-booking" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Repairs</Link>
          <Link href="/corporate" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Corporate</Link>
          <Link href="/blog" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>

          <div className={styles.mobileActions}>
            {user ? (
              <Link href={dashboardPath} onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className={styles.loginBtnMobile}>{dashboardLabel}</Button>
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
            <Link href={dashboardPath}>
              <Button variant="outline" className={styles.loginBtn}>{dashboardLabel}</Button>
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

          <Link href={bookingPath} className={styles.bookRepairWrapper}>
            <Button variant="primary" className={styles.bookRepairBtn}>Book Repair</Button>
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

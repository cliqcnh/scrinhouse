"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Admin.module.css';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import AdminNotifier from '@/components/admin/AdminNotifier';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === 'scrinhouse@gmail.com') {
        setIsAuthorized(true);
      } else {
        router.push('/account');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading Admin Panel...</div>;
  }

  if (!isAuthorized) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'red' }}>Access Denied: You do not have admin privileges.</div>;
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/admin" className={styles.sidebarTitle}>Admin Panel</Link>
        </div>
        <nav className={styles.nav}>
          <Link 
            href="/admin" 
            className={`${styles.navLink} ${pathname === '/admin' ? styles.navLinkActive : ''}`}
          >
            Overview
          </Link>
          <Link 
            href="/admin/products" 
            className={`${styles.navLink} ${pathname === '/admin/products' ? styles.navLinkActive : ''}`}
          >
            Products & Inventory
          </Link>
          <Link 
            href="/admin/sales" 
            className={`${styles.navLink} ${pathname === '/admin/sales' ? styles.navLinkActive : ''}`}
          >
            Sales Tracking
          </Link>
          <Link 
            href="/admin/repairs" 
            className={`${styles.navLink} ${pathname === '/admin/repairs' ? styles.navLinkActive : ''}`}
          >
            Repair Bookings
          </Link>
        </nav>
        <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid #e5e5e5' }}>
          <button 
            onClick={() => {
              import('firebase/auth').then(({ signOut }) => {
                import('@/lib/firebase/config').then(({ auth }) => {
                  signOut(auth).then(() => {
                    window.location.href = '/';
                  });
                });
              });
            }}
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              background: 'none', 
              border: 'none', 
              color: '#ef4444', 
              cursor: 'pointer',
              fontWeight: 600,
              textAlign: 'left'
            }}
          >
            Log Out
          </button>
        </div>
      </aside>
      <main className={styles.main}>
        {children}
      </main>
      <AdminNotifier />
    </div>
  );
}

"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { ROLE_NAV, ROLES, getDashboardPath } from '@/lib/auth/roles';
import OTPForm from '@/components/auth/OTPForm';
import { IconHome, IconLogOut } from '@/components/ui/Icons';
import styles from './Account.module.css';

export default function AccountLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, signOut, role } = useAuth();

  // Redirect non-customer roles to their own dashboard
  useEffect(() => {
    if (loading || !user) return;
    if (role && role !== ROLES.CUSTOMER && role !== ROLES.BUSINESS_CUSTOMER) {
      router.push(getDashboardPath(role));
    }
  }, [role, loading, user, router]);

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner} />
        <p>Loading your account…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.loginPage}>
        <OTPForm onLoginSuccess={() => {}} />
      </div>
    );
  }

  const navItems = ROLE_NAV[ROLES.CUSTOMER] || [];

  return (
    <div className={styles.layout}>
      {/* ── Desktop Sidebar ─────────────────────────── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.sidebarLogo}>
            ScrinHouse
          </Link>
        </div>

        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {(profile?.displayName || user.displayName || 'U').charAt(0).toUpperCase()}
          </div>
          <div className={styles.userDetails}>
            <span className={styles.userName}>{profile?.displayName || user.displayName || 'Customer'}</span>
            <span className={styles.userPhone}>{user.phoneNumber || user.email || ''}</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map(item => {
            const isActive = pathname === item.href ||
              (item.href !== '/account' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
              >
                <item.Icon size={16} className={styles.navIcon} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/shop" className={styles.navLink}>
            <IconHome size={16} className={styles.navIcon} />
            Shop
          </Link>
          <button onClick={signOut} className={styles.logoutBtn}>
            <IconLogOut size={16} className={styles.navIcon} />
            Log Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────── */}
      <main className={styles.main}>
        {children}
      </main>

      {/* ── Mobile Bottom Tab Bar ───────────────────── */}
      <nav className={styles.mobileTabBar}>
        {/* Show first 4 items + more condensed tab */}
        {navItems.slice(0, 4).map(item => {
          const isActive = pathname === item.href ||
            (item.href !== '/account' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.mobileTab} ${isActive ? styles.mobileTabActive : ''}`}
            >
              <item.Icon size={20} />
              <span className={styles.mobileTabLabel}>{item.label}</span>
            </Link>
          );
        })}
        <button onClick={signOut} className={styles.mobileTab}>
          <IconLogOut size={20} />
          <span className={styles.mobileTabLabel}>Logout</span>
        </button>
      </nav>
    </div>
  );
}

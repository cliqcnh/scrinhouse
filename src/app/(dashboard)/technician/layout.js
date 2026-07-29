"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRequireRole } from '@/lib/hooks/useRequireRole';
import { ROLES, ROLE_NAV } from '@/lib/auth/roles';
import { useAuth } from '@/lib/auth/AuthProvider';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { IconHome, IconLogOut } from '@/components/ui/Icons';
import styles from './Technician.module.css';

export default function TechnicianLayout({ children }) {
  const { allowed, loading } = useRequireRole(ROLES.TECHNICIAN);
  const { profile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const navItems = ROLE_NAV[ROLES.TECHNICIAN] || [];

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner} />
        <p>Loading dashboard…</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className={styles.loadingScreen}>
        <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>Access Denied</p>
        <p style={{ color: '#6B7280' }}>Technician access required.</p>
        <Link href="/" className={styles.btnPrimary}>Go Home</Link>
      </div>
    );
  }

  async function handleLogout() {
    await signOut(auth);
    router.push('/');
  }

  return (
    <div className={styles.layout}>
      {/* ── Desktop Sidebar ─────────────────────────── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarBrand}>
            ScrinHouse <span className={styles.sidebarBrandTag}>Tech</span>
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{profile?.displayName || 'Technician'}</div>
            <div className={styles.userRole}>Technician</div>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/technician' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? styles.navItemActive : styles.navItem}
              >
                <item.Icon size={16} className={styles.navIcon} />
                {item.label}
              </Link>
            );
          })}
          <div className={styles.navDivider} />
          <Link href="/" className={styles.navItem}>
            <IconHome size={16} className={styles.navIcon} />
            Main Site
          </Link>
        </nav>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          <IconLogOut size={16} className={styles.navIcon} />
          Sign Out
        </button>
      </aside>

      {/* ── Main Content ────────────────────────────── */}
      <main className={styles.mainContent}>
        {children}
      </main>

      {/* ── Mobile Bottom Tab Bar ───────────────────── */}
      <nav className={styles.mobileTabBar}>
        {navItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/technician' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.mobileTab} ${isActive ? styles.mobileTabActive : ''}`}
            >
              <item.Icon size={20} />
              <span className={styles.mobileTabLabel}>{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
        <button className={styles.mobileTab} onClick={handleLogout}>
          <IconLogOut size={20} />
          <span className={styles.mobileTabLabel}>Logout</span>
        </button>
      </nav>
    </div>
  );
}

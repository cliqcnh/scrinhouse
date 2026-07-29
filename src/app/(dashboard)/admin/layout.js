"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useRequireRole } from '@/lib/hooks/useRequireRole';
import { ROLES, ROLE_NAV } from '@/lib/auth/roles';
import AdminNotifier from '@/components/admin/AdminNotifier';
import { IconHome, IconLogOut, IconChevronDown } from '@/components/ui/Icons';
import styles from './Admin.module.css';

/** Group nav items into collapsible sections for the expanded admin sidebar */
const NAV_SECTIONS = [
  { title: 'Main',                items: ['Overview', 'Analytics'] },
  { title: 'Commerce',            items: ['Products', 'Inventory', 'Orders', 'Payments', 'Returns', 'Coupons', 'Loyalty Points'] },
  { title: 'Repairs & Logistics', items: ['Repair Queue', 'Repair Pricing', 'Technicians', 'Riders', 'Warranties'] },
  { title: 'People',              items: ['Customers', 'Business Customers', 'Suppliers'] },
  { title: 'Content & Marketing', items: ['Blog', 'Marketing', 'Notifications'] },
  { title: 'Finance',             items: ['Accounting'] },
  { title: 'Support',             items: ['Support Tickets', 'Live Chat'] },
  { title: 'System',              items: ['Audit Logs', 'Roles & Permissions', 'API Settings'] },
];

// Quick-access tabs shown in mobile bottom bar (most-used pages)
const MOBILE_TABS = ['Overview', 'Orders', 'Repair Queue', 'Customers', 'Analytics'];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { authorized, loading, signOut } = useRequireRole(ROLES.ADMIN);
  const [collapsedSections, setCollapsedSections] = useState({});

  const allNavItems = ROLE_NAV[ROLES.ADMIN] || [];
  const mobileTabItems = MOBILE_TABS.map(label => allNavItems.find(i => i.label === label)).filter(Boolean);

  const toggleSection = (title) => {
    setCollapsedSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner} />
        <p>Loading Admin Panel…</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className={styles.loadingScreen}>
        <p style={{ color: '#ef4444', fontWeight: 600 }}>Access Denied</p>
        <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>You do not have admin privileges.</p>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      {/* ── Desktop Sidebar ─────────────────────────── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/admin" className={styles.sidebarTitle}>
            ScrinHouse
          </Link>
          <span className={styles.roleBadge}>Admin</span>
        </div>

        <nav className={styles.nav}>
          {NAV_SECTIONS.map(section => {
            const sectionItems = allNavItems.filter(item => section.items.includes(item.label));
            if (sectionItems.length === 0) return null;
            const isCollapsed = collapsedSections[section.title];

            return (
              <div key={section.title} className={styles.navSection}>
                <button
                  className={styles.navSectionTitle}
                  onClick={() => toggleSection(section.title)}
                  aria-expanded={!isCollapsed}
                >
                  <span>{section.title}</span>
                  <IconChevronDown
                    size={14}
                    style={{ transition: 'transform 0.2s', transform: isCollapsed ? 'rotate(-90deg)' : 'none' }}
                  />
                </button>
                {!isCollapsed && (
                  <div className={styles.navSectionItems}>
                    {sectionItems.map(item => {
                      const isActive = pathname === item.href ||
                        (item.href !== '/admin' && pathname.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                        >
                          <item.Icon size={15} className={styles.navIcon} />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/" className={styles.navLink}>
            <IconHome size={15} className={styles.navIcon} />
            View Store
          </Link>
          <button onClick={signOut} className={styles.logoutBtn}>
            <IconLogOut size={15} className={styles.navIcon} />
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
        {mobileTabItems.map(item => {
          const isActive = pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));
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
      </nav>

      <AdminNotifier />
    </div>
  );
}

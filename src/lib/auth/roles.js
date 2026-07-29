/**
 * Role-based access control constants and helpers for ScrinHouse.
 *
 * Roles hierarchy:
 *   admin > technician / rider > business_customer > customer
 */

import {
  IconGrid, IconPackage, IconShoppingBag, IconClipboard, IconTool, IconUsers,
  IconUser, IconDollar, IconCreditCard, IconRefresh, IconShield, IconBarChart,
  IconTruck, IconTag, IconStar, IconEdit, IconMegaphone, IconBell, IconBuilding,
  IconTicket, IconMessageSquare, IconList, IconLock, IconSettings, IconHome,
  IconLogOut, IconMapPin, IconHeart, IconDownload, IconFile, IconMotorbike,
  IconFactory,
} from '@/components/ui/Icons';

export const ROLES = {
  ADMIN: 'admin',
  TECHNICIAN: 'technician',
  RIDER: 'rider',
  BUSINESS_CUSTOMER: 'business_customer',
  CUSTOMER: 'customer',
};

/** Admin email(s) that are auto-promoted */
export const ADMIN_EMAILS = ['scrinhouse@gmail.com'];

/**
 * Admin phone number(s) that are auto-promoted.
 * Must be in E.164 format, e.g. '+233201234567'
 */
export const ADMIN_PHONES = [];

/**
 * Returns true if the Firebase user should be treated as an admin
 * based on their email or phone number.
 * @param {import('firebase/auth').User} firebaseUser
 * @returns {boolean}
 */
export function isAdminUser(firebaseUser) {
  if (!firebaseUser) return false;
  if (firebaseUser.email && ADMIN_EMAILS.includes(firebaseUser.email)) return true;
  if (firebaseUser.phoneNumber && ADMIN_PHONES.includes(firebaseUser.phoneNumber)) return true;
  return false;
}

/**
 * Sidebar navigation configs per role.
 * Each entry: { label, href, Icon (component) }
 */
export const ROLE_NAV = {
  [ROLES.ADMIN]: [
    { label: 'Overview',            href: '/admin',                    Icon: IconGrid },
    { label: 'Inventory',           href: '/admin/inventory',          Icon: IconPackage },
    { label: 'Products',            href: '/admin/products',           Icon: IconShoppingBag },
    { label: 'Orders',              href: '/admin/orders',             Icon: IconClipboard },
    { label: 'Repair Queue',        href: '/admin/repair-queue',       Icon: IconTool },
    { label: 'Repair Pricing',      href: '/admin/repair-pricing',     Icon: IconDollar },
    { label: 'Technicians',         href: '/admin/technicians',        Icon: IconUsers },
    { label: 'Riders',              href: '/admin/riders',             Icon: IconMotorbike },
    { label: 'Customers',           href: '/admin/customers',          Icon: IconUser },
    { label: 'Accounting',          href: '/admin/accounting',         Icon: IconDollar },
    { label: 'Payments',            href: '/admin/payments',           Icon: IconCreditCard },
    { label: 'Returns',             href: '/admin/returns',            Icon: IconRefresh },
    { label: 'Warranties',          href: '/admin/warranties',         Icon: IconShield },
    { label: 'Analytics',           href: '/admin/analytics',          Icon: IconBarChart },
    { label: 'Suppliers',           href: '/admin/suppliers',          Icon: IconFactory },
    { label: 'Coupons',             href: '/admin/coupons',            Icon: IconTag },
    { label: 'Loyalty Points',      href: '/admin/loyalty',            Icon: IconStar },
    { label: 'Blog',                href: '/admin/blog',               Icon: IconEdit },
    { label: 'Marketing',           href: '/admin/marketing',          Icon: IconMegaphone },
    { label: 'Notifications',       href: '/admin/notifications',      Icon: IconBell },
    { label: 'Business Customers',  href: '/admin/business-customers', Icon: IconBuilding },
    { label: 'Support Tickets',     href: '/admin/support',            Icon: IconTicket },
    { label: 'Live Chat',           href: '/admin/chat',               Icon: IconMessageSquare },
    { label: 'Audit Logs',          href: '/admin/audit-logs',         Icon: IconList },
    { label: 'Roles & Permissions', href: '/admin/roles',              Icon: IconLock },
    { label: 'API Settings',        href: '/admin/api',                Icon: IconSettings },
  ],
  [ROLES.TECHNICIAN]: [
    { label: 'Overview',        href: '/technician',         Icon: IconGrid },
    { label: 'Assigned Jobs',   href: '/technician/jobs',    Icon: IconTool },
    { label: 'Repair History',  href: '/technician/history', Icon: IconList },
  ],
  [ROLES.RIDER]: [
    { label: 'Overview',    href: '/rider',             Icon: IconGrid },
    { label: 'Pickups',     href: '/rider/pickups',     Icon: IconDownload },
    { label: 'Deliveries',  href: '/rider/deliveries',  Icon: IconTruck },
  ],
  [ROLES.CUSTOMER]: [
    { label: 'Overview',       href: '/account',               Icon: IconUser },
    { label: 'Orders',         href: '/account/orders',        Icon: IconClipboard },
    { label: 'Repairs',        href: '/account/repairs',       Icon: IconTool },
    { label: 'Invoices',       href: '/account/invoices',      Icon: IconFile },
    { label: 'Warranty',       href: '/account/warranty',      Icon: IconShield },
    { label: 'Addresses',      href: '/account/addresses',     Icon: IconMapPin },
    { label: 'Notifications',  href: '/account/notifications', Icon: IconBell },
    { label: 'Wishlist',       href: '/account/wishlist',      Icon: IconHeart },
    { label: 'Downloads',      href: '/account/downloads',     Icon: IconDownload },
    { label: 'Settings',       href: '/account/settings',      Icon: IconSettings },
  ],
};

/**
 * Check whether a user's role is included in the allowed set.
 * @param {string} userRole
 * @param {string|string[]} allowedRoles
 * @returns {boolean}
 */
export function hasRole(userRole, allowedRoles) {
  if (!userRole) return false;
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(userRole);
}

/**
 * Determine where a user should be redirected based on their role.
 * @param {string} role
 * @returns {string}
 */
export function getDashboardPath(role) {
  switch (role) {
    case ROLES.ADMIN:       return '/admin';
    case ROLES.TECHNICIAN:  return '/technician';
    case ROLES.RIDER:       return '/rider';
    case ROLES.BUSINESS_CUSTOMER:
    case ROLES.CUSTOMER:
    default:                return '/account';
  }
}

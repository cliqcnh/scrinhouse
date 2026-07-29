"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { hasRole, ROLES } from '@/lib/auth/roles';

/**
 * Hook that gates a page/layout to specific role(s).
 * Redirects unauthorized users to their appropriate dashboard or /account.
 *
 * @param {string|string[]} allowedRoles — role(s) permitted to access this page
 * @param {string} [redirectTo='/account'] — where to send unauthorized users
 * @returns {{ authorized: boolean, loading: boolean, user, role, profile, signOut }}
 */
export function useRequireRole(allowedRoles, redirectTo = '/account') {
  const { user, role, loading, profile, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Not logged in — send to account (login) page
      router.push('/account');
      return;
    }

    if (!hasRole(role, allowedRoles) && role !== ROLES.ADMIN) {
      // Logged in but wrong role (admins bypass all checks)
      router.push(redirectTo);
    }
  }, [user, role, loading, allowedRoles, redirectTo, router]);

  // Admins can access everything
  const authorized = !loading && !!user && (hasRole(role, allowedRoles) || role === ROLES.ADMIN);

  return { authorized, allowed: authorized, loading, user, role, profile, signOut };
}

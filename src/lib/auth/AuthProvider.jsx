"use client";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ROLES, isAdminUser } from '@/lib/auth/roles';

const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the app to provide user + role context.
 *
 * On auth state change:
 * 1. Reads the user document from Firestore `users/{uid}`
 * 2. If document doesn't exist, creates one (first login)
 * 3. Auto-promotes known admin emails OR phone numbers (via isAdminUser)
 * 4. Exposes { user, role, profile, loading, signOut }
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);

      // Determine if this user should be admin by email or phone
      const shouldBeAdmin = isAdminUser(firebaseUser);

      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();

          if (shouldBeAdmin && data.role !== ROLES.ADMIN) {
            // Firestore doc exists but role hasn't been promoted yet — promote now
            await setDoc(userRef, { role: ROLES.ADMIN }, { merge: true });
            setProfile({ ...data, role: ROLES.ADMIN });
            setRole(ROLES.ADMIN);
          } else {
            setProfile(data);
            // If shouldBeAdmin, always use ADMIN regardless of what's stored
            setRole(shouldBeAdmin ? ROLES.ADMIN : (data.role || ROLES.CUSTOMER));
          }
        } else {
          // First login — create user document
          const newProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || null,
            phone: firebaseUser.phoneNumber || null,
            displayName: firebaseUser.displayName || null,
            role: shouldBeAdmin ? ROLES.ADMIN : ROLES.CUSTOMER,
            loyaltyPoints: 0,
            addresses: [],
            createdAt: serverTimestamp(),
          };
          await setDoc(userRef, newProfile);
          setProfile(newProfile);
          setRole(newProfile.role);
        }
      } catch (err) {
        console.error('AuthProvider: error fetching user profile', err);
        // Fallback — if Firestore read fails, derive role from identifier
        setRole(shouldBeAdmin ? ROLES.ADMIN : ROLES.CUSTOMER);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
    setRole(null);
  }, []);

  const value = {
    user,
    profile,
    role,
    loading,
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to consume auth context.
 * @returns {{ user, profile, role, loading, signOut }}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

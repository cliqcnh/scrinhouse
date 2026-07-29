"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { getDashboardPath, isAdminUser, ROLES } from '@/lib/auth/roles';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import styles from './OTPForm.module.css';

export default function OTPForm({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Determine role: check isAdminUser first, then Firestore
      let role = ROLES.CUSTOMER;
      if (isAdminUser(firebaseUser)) {
        role = ROLES.ADMIN;
      } else {
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (snap.exists()) role = snap.data().role || ROLES.CUSTOMER;
        } catch {}
      }

      onLoginSuccess?.(firebaseUser);

      // Redirect to the correct dashboard
      router.push(getDashboardPath(role));
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is not enabled. Please enable it in your Firebase Console under Authentication > Sign-in method.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled.');
      } else {
        setError('Failed to sign in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={styles.authCard}>
      <div className={styles.header}>
        <h2 className={styles.title}>Welcome to ScrinHouse</h2>
        <p className={styles.subtitle}>
          Sign in or create an account to manage your repairs and orders.
        </p>
      </div>

      {error && (
        <div style={{ color: '#DC2626', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center', background: '#FEF2F2', padding: '0.75rem', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
        <Button
          type="button"
          variant="primary"
          className={styles.submitBtn}
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', backgroundColor: '#fff', color: '#111', border: '1px solid #e5e5e5', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {loading ? 'Signing in…' : 'Continue with Google'}
        </Button>
      </div>
    </Card>
  );
}

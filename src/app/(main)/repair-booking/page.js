"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';

const benefits = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    text: 'See price estimates before you commit',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
    text: 'Track your repair status in real time',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    text: 'Get notified when your device is ready',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    text: 'View your full repair history',
  },
];

export default function RepairBookingPage() {
  const { user, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && (role === 'customer' || role === 'business_customer' || !role)) {
      router.replace('/account/repairs/book');
    }
  }, [user, role, router]);

  if (user) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>

        {/* Icon */}
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #111 0%, #333 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.75rem', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem', color: '#111' }}>
          Book a Repair
        </h1>
        <p style={{ color: '#525252', fontSize: '1rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
          Sign in to book a repair, get an instant <strong>price estimate</strong>, and track your device status in real time.
        </p>

        {/* Benefits */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', margin: '1.75rem 0', textAlign: 'left' }}>
          {benefits.map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fff', border: '1px solid #F3F4F6', borderRadius: 10, padding: '0.75rem 1rem' }}>
              <span style={{ color: '#111', flexShrink: 0, display: 'flex' }}>{icon}</span>
              <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link
            href="/account"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
              padding: '0.875rem 1.5rem', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem',
              background: '#111', color: '#fff', textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Sign In to Book a Repair
          </Link>

          <Link
            href="/account"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
              padding: '0.875rem 1.5rem', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem',
              background: '#fff', color: '#111', textDecoration: 'none',
              border: '2px solid #E5E7EB',
            }}
          >
            Create a Free Account
          </Link>
        </div>

        <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#9CA3AF' }}>
          No payment required until your repair is completed.
        </p>
      </div>
    </div>
  );
}

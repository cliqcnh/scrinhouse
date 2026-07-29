"use client";
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Link from 'next/link';

export default function BlogPostPage({ params }) {
  const { slug } = use(params);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetch() {
      try {
        // Try slug first, then fall back to ID
        let snap = await getDocs(query(collection(db, 'blog_posts'), where('slug', '==', slug)));
        if (snap.empty) {
          const { getDoc, doc } = await import('firebase/firestore');
          const docSnap = await getDoc(doc(db, 'blog_posts', slug));
          if (docSnap.exists()) setPost({ id: docSnap.id, ...docSnap.data() });
        } else {
          const d = snap.docs[0];
          setPost({ id: d.id, ...d.data() });
        }
      } catch {}
      setLoading(false);
    }
    fetch();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #E5E7EB', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Post not found</h1>
        <p style={{ color: '#6B7280', marginBottom: '2rem' }}>This article may have been moved or deleted.</p>
        <Link href="/blog" style={{ padding: '0.75rem 1.5rem', background: '#111', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      {/* Back link */}
      <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: '#6B7280', textDecoration: 'none', marginBottom: '2rem' }}>
        ← Back to Blog
      </Link>

      {/* Category & Date */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        {post.category && (
          <span style={{ padding: '0.2rem 0.625rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#ECFDF5', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {post.category}
          </span>
        )}
        <span style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>
          {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
        </span>
      </div>

      {/* Title */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
        {post.title}
      </h1>

      {/* Author */}
      <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #E5E7EB' }}>
        By <strong>{post.author || 'ScrinHouse'}</strong>
      </p>

      {/* Cover Image */}
      {post.coverImage && (
        <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '2rem' }}>
          <img src={post.coverImage} alt={post.title} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
        </div>
      )}

      {/* Content */}
      <div style={{ fontSize: '1rem', lineHeight: 1.8, color: '#374151', whiteSpace: 'pre-wrap' }}>
        {post.content || post.excerpt || 'No content available.'}
      </div>

      {/* Footer */}
      <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #E5E7EB' }}>
        <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', border: '1px solid #E5E7EB', borderRadius: '8px', textDecoration: 'none', color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>
          ← More Articles
        </Link>
      </div>
    </div>
  );
}

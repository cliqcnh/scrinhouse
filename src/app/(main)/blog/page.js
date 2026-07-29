"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase/config';
import { collection, getDocs } from 'firebase/firestore';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        // Fetch ALL blog posts, then filter client-side for 'published'
        // This avoids needing a composite Firestore index
        const snap = await getDocs(collection(db, 'blog_posts'));
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const published = all
          .filter(p => p.status === 'published')
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setPosts(published);
      } catch (err) {
        console.error('Blog fetch error:', err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>Blog</h1>
      <p style={{ color: '#6B7280', marginBottom: '3rem', fontSize: '1.1rem' }}>
        Tips, guides, and news about iPhone repairs and screen care.
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>Loading posts...</div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: '#F9FAFB', borderRadius: '16px' }}>
          <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Coming Soon</h2>
          <p style={{ color: '#6B7280' }}>We are working on great content for you. Check back soon!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {posts.map(post => (
            <Link key={post.id} href={`/blog/${post.slug || post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <article style={{
                display: 'flex', gap: '1.5rem', padding: '1.5rem', borderRadius: '16px',
                border: '1px solid #E5E7EB', transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {post.coverImage && (
                  <div style={{ width: '200px', height: '140px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#F3F4F6' }}>
                    <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  {post.category && (
                    <span style={{ display: 'inline-block', padding: '0.2rem 0.625rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#ECFDF5', color: '#065F46', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {post.category}
                    </span>
                  )}
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.3 }}>{post.title}</h2>
                  <p style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                    {post.excerpt || (post.content?.slice(0, 150) + '...')}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: '#9CA3AF' }}>
                    <span>{post.author || 'ScrinHouse'}</span>
                    <span>&bull;</span>
                    <span>{post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase/config';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import styles from '../Admin.module.css';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', slug: '', content: '', excerpt: '', category: '', status: 'draft', coverImage: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => { const u = onSnapshot(collection(db, 'blog_posts'), s => setPosts(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)))); return () => u(); }, []);

  async function handleImage(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const storageRef = ref(storage, `blog/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    setForm(p => ({ ...p, coverImage: url }));
    setUploading(false);
  }

  async function save(e) { e.preventDefault(); const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); const id = form.id || slug; await setDoc(doc(db, 'blog_posts', id), { ...form, slug, updatedAt: serverTimestamp(), ...(form.id ? {} : { createdAt: serverTimestamp(), author: 'ScrinHouse' }) }, { merge: true }); setForm({ title: '', slug: '', content: '', excerpt: '', category: '', status: 'draft', coverImage: '' }); setShowForm(false); }

  return (
    <div>
      <div className={styles.pageHeader}><h1 className={styles.pageTitle}>Blog</h1><button className={styles.actionBtnPrimary} onClick={() => { setForm({ title: '', slug: '', content: '', excerpt: '', category: '', status: 'draft', coverImage: '' }); setShowForm(true); }}>+ New Post</button></div>
      {showForm && (<div className={styles.card} style={{ marginBottom: '1.5rem' }}><form onSubmit={save} className={styles.formGrid} style={{ maxWidth: '100%' }}>
        <div className={styles.formGroup}><label className={styles.formLabel}>Title</label><input className={styles.formInput} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required /></div>
        <div className={styles.formGroup}><label className={styles.formLabel}>Slug</label><input className={styles.formInput} placeholder="auto-generated" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} /></div>
        <div className={styles.formGroup}><label className={styles.formLabel}>Category</label><input className={styles.formInput} placeholder="Tips, News, etc." value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} /></div>
        <div className={styles.formGroup}><label className={styles.formLabel}>Status</label><select className={styles.formInput} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}><option value="draft">Draft</option><option value="published">Published</option></select></div>
        <div className={styles.formGroup} style={{ gridColumn: '1/-1' }}><label className={styles.formLabel}>Cover Image</label><input type="file" accept="image/*" onChange={handleImage} />{uploading && <span style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Uploading…</span>}{form.coverImage && <img src={form.coverImage} alt="" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, marginTop: '0.5rem' }} />}</div>
        <div className={styles.formGroup} style={{ gridColumn: '1/-1' }}><label className={styles.formLabel}>Excerpt</label><textarea className={styles.formInput} rows="2" value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} /></div>
        <div className={styles.formGroup} style={{ gridColumn: '1/-1' }}><label className={styles.formLabel}>Content</label><textarea className={styles.formInput} rows="10" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} required style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} /></div>
        <div style={{ display: 'flex', gap: '0.75rem' }}><button type="submit" className={styles.actionBtnPrimary}>Save</button><button type="button" className={styles.actionBtnOutline} onClick={() => setShowForm(false)}>Cancel</button></div>
      </form></div>)}
      <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}><table className={styles.table}><thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>
        {posts.length === 0 ? <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No blog posts</td></tr> :
          posts.map(p => (<tr key={p.id}><td style={{ fontWeight: 600 }}>{p.title}</td><td>{p.category || '—'}</td><td><span className={`${styles.badge} ${p.status === 'published' ? '' : styles.badgeWarning}`}>{p.status}</span></td><td style={{ fontSize: '0.8rem' }}>{p.createdAt?.toDate ? p.createdAt.toDate().toLocaleDateString() : '—'}</td><td style={{ display: 'flex', gap: '0.5rem' }}><button className={styles.actionBtnOutline} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => { setForm(p); setShowForm(true); }}>Edit</button><button className={styles.actionBtnDanger} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={async () => { if (confirm('Delete?')) await deleteDoc(doc(db, 'blog_posts', p.id)); }}>Delete</button></td></tr>))}
      </tbody></table></div>
    </div>
  );
}

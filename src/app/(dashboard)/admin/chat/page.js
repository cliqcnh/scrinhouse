"use client";
import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, addDoc, query, orderBy, serverTimestamp, getDocs } from 'firebase/firestore';
import { useAuth } from '@/lib/auth/AuthProvider';
import styles from '../Admin.module.css';

export default function ChatPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Fetch all conversations (unique chat threads)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'chat_conversations'), (snap) => {
      setConversations(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.lastMessageAt?.seconds || 0) - (a.lastMessageAt?.seconds || 0)));
    });
    return () => unsub();
  }, []);

  // Listen to messages for selected conversation
  useEffect(() => {
    if (!selectedConvo) { setMessages([]); return; }
    const unsub = onSnapshot(
      query(collection(db, 'chat_conversations', selectedConvo.id, 'messages'), orderBy('createdAt', 'asc')),
      (snap) => {
        setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      },
      () => {}
    );
    return () => unsub();
  }, [selectedConvo]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConvo) return;
    await addDoc(collection(db, 'chat_conversations', selectedConvo.id, 'messages'), {
      text: newMessage.trim(), sender: 'admin', senderName: 'ScrinHouse Support', createdAt: serverTimestamp(),
    });
    setNewMessage('');
  }

  return (
    <div>
      <div className={styles.pageHeader}><h1 className={styles.pageTitle}>Live Chat</h1></div>

      <div style={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 200px)', minHeight: '500px' }}>
        {/* Conversation List */}
        <div className={styles.card} style={{ width: '280px', flexShrink: 0, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #E5E7EB', fontWeight: 700, fontSize: '0.9rem' }}>
            Conversations ({conversations.length})
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#9CA3AF', fontSize: '0.85rem' }}>No conversations yet</div>
            ) : conversations.map(c => (
              <div
                key={c.id}
                onClick={() => setSelectedConvo(c)}
                style={{
                  padding: '0.875rem 1rem', cursor: 'pointer', borderBottom: '1px solid #F3F4F6',
                  backgroundColor: selectedConvo?.id === c.id ? '#ECFDF5' : 'transparent',
                  transition: 'background-color 0.15s',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.2rem' }}>{c.customerName || 'Customer'}</div>
                <div style={{ fontSize: '0.75rem', color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.lastMessage || 'No messages'}
                </div>
                {c.unreadCount > 0 && (
                  <span style={{ display: 'inline-block', marginTop: '0.25rem', padding: '0.1rem 0.4rem', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#EF4444', color: '#fff' }}>
                    {c.unreadCount}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className={styles.card} style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {!selectedConvo ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                <p style={{ fontWeight: 600 }}>Select a conversation</p>
                <p style={{ fontSize: '0.85rem' }}>Choose a customer chat from the left to start replying.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #E5E7EB', fontWeight: 700, fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{selectedConvo.customerName || 'Customer'}</span>
                <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 400 }}>{selectedConvo.customerPhone || selectedConvo.customerEmail || ''}</span>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '2rem', fontSize: '0.85rem' }}>No messages yet</div>
                ) : messages.map(m => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: m.sender === 'admin' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '70%', padding: '0.625rem 1rem', borderRadius: '12px', fontSize: '0.875rem',
                      backgroundColor: m.sender === 'admin' ? '#111' : '#F3F4F6',
                      color: m.sender === 'admin' ? '#fff' : '#374151',
                    }}>
                      <div>{m.text}</div>
                      <div style={{ fontSize: '0.65rem', marginTop: '0.3rem', opacity: 0.6, textAlign: 'right' }}>
                        {m.createdAt?.toDate ? m.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '0.75rem' }}>
                <input
                  className={styles.formInput}
                  style={{ flex: 1 }}
                  placeholder="Type a message…"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                />
                <button type="submit" className={styles.actionBtnPrimary} style={{ padding: '0.5rem 1.25rem' }}>Send</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

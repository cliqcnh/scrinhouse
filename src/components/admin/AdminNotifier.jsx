"use client";
import { useEffect, useState, useRef } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function AdminNotifier() {
  const [notification, setNotification] = useState(null);
  const isFirstLoadOrders = useRef(true);
  const isFirstLoadRepairs = useRef(true);

  useEffect(() => {
    // Listen for new orders
    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(10));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      if (isFirstLoadOrders.current) {
        isFirstLoadOrders.current = false;
        return;
      }
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          showNotification('New Order Received!', `Order for GHS ${data.totalAmount} from ${data.userEmail}`);
          playChime();
        }
      });
    });

    // Listen for new repairs
    const qRepairs = query(collection(db, 'repairs'), orderBy('createdAt', 'desc'), limit(10));
    const unsubRepairs = onSnapshot(qRepairs, (snapshot) => {
      if (isFirstLoadRepairs.current) {
        isFirstLoadRepairs.current = false;
        return;
      }
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          showNotification('New Repair Booking!', `${data.brand} ${data.model} from ${data.contact}`);
          playChime();
        }
      });
    });

    return () => {
      unsubOrders();
      unsubRepairs();
    };
  }, []);

  const showNotification = (title, message) => {
    setNotification({ title, message });
    
    // Request HTML5 Notification if supported
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body: message });
    } else if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, { body: message });
        }
      });
    }

    // Auto clear toast
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  const playChime = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio autoplay blocked', e));
    } catch (e) {
      console.log('Error playing chime', e);
    }
  };

  if (!notification) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: '#fff',
      borderLeft: '4px solid #10b981',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
      padding: '1rem',
      borderRadius: '8px',
      zIndex: 9999,
      minWidth: '300px',
      animation: 'slideIn 0.3s ease-out'
    }}>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h4 style={{ margin: '0 0 0.25rem 0', color: '#111827', fontSize: '1rem' }}>{notification.title}</h4>
          <p style={{ margin: 0, color: '#4b5563', fontSize: '0.875rem' }}>{notification.message}</p>
        </div>
        <button 
          onClick={() => setNotification(null)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0 0 0 1rem' }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

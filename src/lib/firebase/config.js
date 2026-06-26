import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDIfxKAKYbSVj4aiaZx578ddOdcGrKAXFs",
  authDomain: "scrinhouse-5e080.firebaseapp.com",
  projectId: "scrinhouse-5e080",
  storageBucket: "scrinhouse-5e080.firebasestorage.app",
  messagingSenderId: "406493657810",
  appId: "1:406493657810:web:d33b946c2e2fa599cccb0b",
  measurementId: "G-V0WFQF267G"
};

// Initialize Firebase (prevent multiple initializations in Next.js dev mode)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

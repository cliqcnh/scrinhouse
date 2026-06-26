const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyDIfxKAKYbSVj4aiaZx578ddOdcGrKAXFs",
  authDomain: "scrinhouse-5e080.firebaseapp.com",
  projectId: "scrinhouse-5e080",
  storageBucket: "scrinhouse-5e080.firebasestorage.app",
  messagingSenderId: "406493657810",
  appId: "1:406493657810:web:d33b946c2e2fa599cccb0b",
  measurementId: "G-V0WFQF267G"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    console.log("Fetching...");
    const snap = await getDocs(collection(db, "products"));
    console.log(`Found ${snap.docs.length} products`);
    snap.docs.forEach(doc => console.log(doc.data()));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}
test();

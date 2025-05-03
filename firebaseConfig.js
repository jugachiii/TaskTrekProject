// firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDra_1dlmvm4kfUyhvmEkdFu9OfTloyejw",
  authDomain: "tasktrek-28cbc.firebaseapp.com",
  databaseURL: "https://tasktrek-28cbc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tasktrek-28cbc",
  storageBucket: "tasktrek-28cbc.firebasestorage.app",
  messagingSenderId: "643547147420",
  appId: "1:643547147420:web:75682082eea0731e93d159",
  measurementId: "G-XGZY3JJGD1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const database = getDatabase(app);
const analytics = getAnalytics(app);

export { auth, database };

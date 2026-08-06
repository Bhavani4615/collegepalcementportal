// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAFI6djFNHFwzlE7PX2FCkZ9V1lCbsk3XA",
  authDomain: "collegepalcementportal.firebaseapp.com",
  projectId: "collegepalcementportal",
  storageBucket: "collegepalcementportal.firebasestorage.app",
  messagingSenderId: "207282569571",
  appId: "1:207282569571:web:b0c8ba8e32cd2d5f3a1356",
  measurementId: "G-TMX4BV90W6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

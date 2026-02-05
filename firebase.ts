
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * FIREBASE SETUP GUIDE:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a project and add a "Web App" (</> icon).
 * 3. REPLACE the config below with your unique keys.
 * 4. IMPORTANT: Enable "Email/Password" in Authentication > Sign-in method.
 * 5. IMPORTANT: Create a "Cloud Firestore" database in Test Mode.
 */

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD41MTRgU6xE_SCz8th_lQUzRIo_DLUyJg",
  authDomain: "flexiseat-26088.firebaseapp.com",
  projectId: "flexiseat-26088",
  storageBucket: "flexiseat-26088.firebasestorage.app",
  messagingSenderId: "546611360021",
  appId: "1:546611360021:web:8b26f7757e3a2cac00f91c",
  measurementId: "G-WZL550E72V"
};


// Initialize Firebase as a singleton to avoid "Component already registered" or "Not yet registered" errors
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);



import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';

/**
 * Official Firebase configuration provided for better-version-of-me-a7c8c
 */
export const firebaseConfig = {
  apiKey: "AIzaSyA4KDQ88zp0D6of9TZlQlvQ3Xupp7ajqoA",
  authDomain: "better-version-of-me-a7c8c.firebaseapp.com",
  projectId: "better-version-of-me-a7c8c",
  storageBucket: "better-version-of-me-a7c8c.firebasestorage.app",
  messagingSenderId: "420192789824",
  appId: "1:420192789824:web:4f59f4c3516118cadf06a5",
  measurementId: "G-HMGLRQTLEE"
};

// Initialize Firebase only once; reuse existing instance if already initialized
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth: Auth = getAuth(app);

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};

export type { User };

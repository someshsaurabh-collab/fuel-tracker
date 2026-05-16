import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCuQ49YPnhhVEjivPSFZu4OaiSMV32osnM",
  authDomain: "fuel-tracker-cb976.firebaseapp.com",
  projectId: "fuel-tracker-cb976",
  storageBucket: "fuel-tracker-cb976.firebasestorage.app",
  messagingSenderId: "598291249746",
  appId: "1:598291249746:web:18e6cbae7242bdf5363d8b",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

import { isFirebaseConfigured, isDemoMode } from './demoMode';

// Firebase instances - null when not configured
let app: any = null;
let auth: any = null;
let db: any = null;

// Only initialize Firebase if keys are configured and not in demo mode
if (isFirebaseConfigured() && !isDemoMode()) {
  try {
    const { initializeApp, getApps, getApp } = require('firebase/app');
    const { getAuth } = require('firebase/auth');
    const { getFirestore } = require('firebase/firestore');
    
    const firebaseConfig = {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
    };
    
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
} else {
  console.log('Firebase not configured - running in demo mode');
}

export { app, auth, db };

export const isFirebaseReady = (): boolean => {
  return app !== null && auth !== null;
};

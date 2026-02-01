/**
 * Demo Mode Configuration
 */

export const isDemoMode = (): boolean => {
  const demoFlag = process.env.EXPO_PUBLIC_DEMO_MODE;
  if (demoFlag === 'true') return true;
  
  const firebaseConfigured = Boolean(
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY &&
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID
  );
  
  return !firebaseConfigured;
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY &&
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID
  );
};

export const isRazorpayConfigured = (): boolean => {
  return Boolean(process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID);
};

export const features = {
  authEnabled: () => !isDemoMode() && isFirebaseConfigured(),
  paymentsEnabled: () => !isDemoMode() && isRazorpayConfigured(),
  firestoreEnabled: () => !isDemoMode() && isFirebaseConfigured(),
};

export const DEMO_MODE_MESSAGE = 'This feature is coming soon. Currently running in demo mode.';
export const DEMO_AUTH_MESSAGE = 'Authentication is not available in demo mode.';
export const DEMO_PAYMENT_MESSAGE = 'Payment processing is not available in demo mode.';

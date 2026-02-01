import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, isFirebaseReady } from '../lib/firebase';
import { isDemoMode } from '../lib/demoMode';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  isDemoMode: boolean;
  signOut: () => Promise<void>;
  setMockUser: (phone: string) => Promise<void>;
  setGuestMode: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isGuest: false,
  isDemoMode: true,
  signOut: async () => {},
  setMockUser: async () => {},
  setGuestMode: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Mock user object for demo mode
const createMockUser = (phone: string): any => ({
  uid: `mock_${phone}`,
  email: `user${phone}@sunolegal.com`,
  phoneNumber: `+91${phone}`,
  displayName: 'Demo User',
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: 'mock_token',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'mock_id_token',
  getIdTokenResult: async () => ({ token: 'mock_token', claims: {}, authTime: '', issuedAtTime: '', expirationTime: '', signInProvider: 'phone' }),
  reload: async () => {},
  toJSON: () => ({}),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const demoMode = isDemoMode();

  useEffect(() => {
    // Check for guest mode or mock user in AsyncStorage first
    const checkAuth = async () => {
      try {
        const guestMode = await AsyncStorage.getItem('isGuest');
        if (guestMode === 'true') {
          setIsGuest(true);
          setUser(null);
          setLoading(false);
          return;
        }

        const mockPhone = await AsyncStorage.getItem('mockUserPhone');
        if (mockPhone) {
          setUser(createMockUser(mockPhone));
          setIsGuest(false);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.log('AsyncStorage error:', error);
      }
      
      // Only use Firebase auth if it's ready and not in demo mode
      if (isFirebaseReady() && auth && !demoMode) {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          setUser(firebaseUser);
          setIsGuest(false);
          setLoading(false);
        });
        return unsubscribe;
      } else {
        // In demo mode, just set loading to false
        setLoading(false);
      }
    };

    checkAuth();
  }, [demoMode]);

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('mockUserPhone');
      await AsyncStorage.removeItem('isGuest');
      if (isFirebaseReady() && auth) {
        await firebaseSignOut(auth);
      }
      setUser(null);
      setIsGuest(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const setMockUser = async (phone: string) => {
    try {
      await AsyncStorage.setItem('mockUserPhone', phone);
      await AsyncStorage.removeItem('isGuest');
      setUser(createMockUser(phone));
      setIsGuest(false);
    } catch (error) {
      console.error('Error setting mock user:', error);
    }
  };

  const setGuestMode = async () => {
    try {
      await AsyncStorage.setItem('isGuest', 'true');
      await AsyncStorage.removeItem('mockUserPhone');
      setIsGuest(true);
      setUser(null);
    } catch (error) {
      console.error('Error setting guest mode:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isGuest, isDemoMode: demoMode, signOut, setMockUser, setGuestMode }}>
      {children}
    </AuthContext.Provider>
  );
};

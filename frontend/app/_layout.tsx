import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../contexts/AuthContext';
import { SavedLawsProvider } from '../contexts/SavedLawsContext';
import { SavedDocumentsProvider } from '../contexts/SavedDocumentsContext';
import { Colors } from '../constants/Colors';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const theme = {
  colors: {
    primary: Colors.primary,
    secondary: Colors.secondary,
    background: Colors.background,
    surface: Colors.surface,
    error: Colors.error,
    text: Colors.text,
    onSurface: Colors.text,
    disabled: Colors.gray400,
    placeholder: Colors.textSecondary,
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen once layout is ready
    SplashScreen.hideAsync();
  }, []);

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <SavedLawsProvider>
          <SavedDocumentsProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="auth/login" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </SavedDocumentsProvider>
        </SavedLawsProvider>
      </AuthProvider>
    </PaperProvider>
  );
}

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="welcome" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="my-pets" />
          <Stack.Screen name="add-pet" />
          <Stack.Screen name="edit-pet/[id]" />
          <Stack.Screen name="edit-profile" />
        </Stack>
        <StatusBar style="auto" />
      </AuthProvider>
    </ErrorBoundary>
  );
}
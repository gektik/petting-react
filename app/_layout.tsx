import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { PetProvider } from '@/contexts/PetContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <PetProvider>
            <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="welcome" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/register" />
            <Stack.Screen name="auth/forgot-password" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="my-pets" />
            <Stack.Screen name="add-pet" />
            <Stack.Screen name="edit-pet/[id]" />
            <Stack.Screen name="edit-profile" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="privacy-settings" />
            <Stack.Screen name="help-center" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="sha1-info" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="add-listing" />
            <Stack.Screen name="edit-listing/[id]" />
            <Stack.Screen name="health/add-record" />
            <Stack.Screen name="health/appointments" />
            <Stack.Screen name="health/book-appointment" />
            <Stack.Screen name="health/reminders" />
            <Stack.Screen name="health/add-reminder" />
            <Stack.Screen name="health/edit-record/[id]" />
            <Stack.Screen name="market/product/[id]" />
            <Stack.Screen name="market/cart" />
            <Stack.Screen name="market/checkout" />
            <Stack.Screen name="market/orders" />
            <Stack.Screen name="market/order-detail/[id]" />
          </Stack>
          <StatusBar style="auto" />
          </PetProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
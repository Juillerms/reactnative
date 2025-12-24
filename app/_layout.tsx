import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { OrderProvider } from '@/contexts/OrderContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

function RootNavigation() {
  const { userType } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    if (!navigationState?.key) return;
    setIsNavigationReady(true);
  }, [navigationState]);

  useEffect(() => {
    if (!isNavigationReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!userType && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (userType === 'company' && inAuthGroup) {
      router.replace('/(company)/(tabs)'); 
    } else if (userType === 'carrier' && inAuthGroup) {
      router.replace('/(carrier)/dashboard');
    }
  }, [userType, segments, isNavigationReady]);

  if (!isNavigationReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(company)" />
      <Stack.Screen name="(carrier)" />
      {/* Nova rota de Detalhes como Modal */}
      <Stack.Screen 
        name="order-details" 
        options={{ 
          presentation: 'modal', // Faz abrir subindo de baixo pra cima (padrão iOS)
          title: 'Detalhes'
        }} 
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <OrderProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootNavigation />
          <StatusBar style="auto" />
        </ThemeProvider>
      </OrderProvider>
    </AuthProvider>
  );
}
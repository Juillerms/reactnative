import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { OrderProvider } from '@/contexts/OrderContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage'; // <--- 1. Import necessário
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import 'react-native-reanimated';

// CONFIGURAÇÃO DO HANDLER DE NOTIFICAÇÕES
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function RootNavigation() {
  const { userType, isLoading: authLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [checkedOnboarding, setCheckedOnboarding] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isRecheckingOnboarding, setIsRecheckingOnboarding] = useState(false);
  const checkingRef = useRef(false);

  // Função para verificar se já viu o onboarding
  const checkOnboarding = useCallback(async () => {
    try {
      const hasSeen = await AsyncStorage.getItem('@logitech:hasSeenOnboarding');
      console.log('🔍 Verificando onboarding - hasSeen:', hasSeen);
      
      if (hasSeen !== 'true') {
        // Marca que precisa ver o onboarding (não chama router ainda)
        console.log('✅ Usuário precisa ver o onboarding');
        setNeedsOnboarding(true);
      } else {
        console.log('❌ Usuário já viu o onboarding');
        setNeedsOnboarding(false);
      }
    } catch (e) {
      console.error('Erro ao verificar onboarding:', e);
      // Em caso de erro, permite continuar (assume que já viu)
      setNeedsOnboarding(false);
    } finally {
      // Libera o app para continuar o fluxo normal
      setCheckedOnboarding(true);
    }
  }, []);

  // INICIALIZAÇÃO: Permissões e Checagem de Onboarding
  useEffect(() => {
    // Timeout de segurança: se algo der errado, libera após 5 segundos
    const safetyTimeout = setTimeout(() => {
      setCheckedOnboarding((prev) => {
        if (!prev) {
          console.warn('Timeout de segurança: liberando app mesmo sem verificar onboarding');
          return true;
        }
        return prev;
      });
    }, 5000);

    // Inicializa de forma assíncrona e segura
    const initialize = async () => {
      try {
        // Tenta registrar notificações (pode falhar no Expo Go, mas não deve travar)
        await registerForPushNotificationsAsync();
      } catch (e) {
        console.warn('Erro ao registrar notificações (pode ser normal no Expo Go):', e);
      }
      
      // Verifica onboarding
      await checkOnboarding();
    };
    
    initialize();

    return () => clearTimeout(safetyTimeout);
  }, [checkOnboarding]);

  useEffect(() => {
    if (!navigationState?.key) return;
    setIsNavigationReady(true);
  }, [navigationState]);

  // Re-verifica onboarding quando sai da tela de onboarding
  // Isso deve rodar ANTES da lógica de roteamento para atualizar o estado
  useEffect(() => {
    if (!isNavigationReady || !checkedOnboarding || authLoading) return;
    
    const inOnboarding = segments[0] === 'onboarding';
    
    // Se não está no onboarding e o estado ainda indica que precisa ver, re-verifica
    if (!inOnboarding && needsOnboarding && !isRecheckingOnboarding && !checkingRef.current) {
      checkingRef.current = true;
      setIsRecheckingOnboarding(true);
      const recheckOnboarding = async () => {
        try {
          const hasSeen = await AsyncStorage.getItem('@logitech:hasSeenOnboarding');
          console.log('🔄 Re-verificando onboarding - hasSeen:', hasSeen);
          if (hasSeen === 'true') {
            // Se já viu, atualiza o estado para não redirecionar mais
            console.log('✅ Onboarding já foi visto, atualizando estado');
            setNeedsOnboarding(false);
          } else {
            // Se ainda não viu, mantém o estado como precisa ver
            console.log('ℹ️ Onboarding ainda não foi visto');
            setNeedsOnboarding(true);
          }
        } catch (e) {
          console.error('Erro ao re-verificar onboarding:', e);
          // Em caso de erro, assume que já viu para não travar
          setNeedsOnboarding(false);
        } finally {
          setIsRecheckingOnboarding(false);
          checkingRef.current = false;
        }
      };
      recheckOnboarding();
    }
  }, [segments, isNavigationReady, checkedOnboarding, authLoading, needsOnboarding, isRecheckingOnboarding]);

  // LÓGICA DE ROTEAMENTO (PROTEÇÃO DE ROTAS)
  useEffect(() => {
    // Só executa se a navegação estiver pronta, onboarding checado E auth carregado
    if (!isNavigationReady || !checkedOnboarding || authLoading) return;
    
    // Se está re-verificando o onboarding, aguarda
    if (isRecheckingOnboarding) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    console.log('🧭 Roteamento - needsOnboarding:', needsOnboarding, 'inOnboarding:', inOnboarding, 'inAuthGroup:', inAuthGroup, 'segments:', segments);

    // Se estiver no onboarding, NÃO faz nada (deixa o usuário ver os slides)
    if (inOnboarding) {
      console.log('📍 Usuário está no onboarding, aguardando...');
      return;
    }

    // PRIORIDADE 1: Se precisa ver onboarding e não está nele, redireciona
    if (needsOnboarding && !inOnboarding) {
      console.log('➡️ Redirecionando para onboarding');
      router.replace('/onboarding');
      return;
    }

    // PRIORIDADE 2: Proteção de rotas baseada em autenticação
    if (!userType && !inAuthGroup) {
      // Se não tem usuário e não está no login, manda pro login
      console.log('➡️ Redirecionando para login');
      router.replace('/(auth)/login');
    } else if (userType === 'company' && inAuthGroup) {
      // Se é empresa e está no login, manda pra home
      console.log('➡️ Redirecionando para home da empresa');
      router.replace('/(company)/(tabs)'); 
    } else if (userType === 'carrier' && inAuthGroup) {
      // Se é motorista e está no login, manda pro dashboard
      console.log('➡️ Redirecionando para dashboard do motorista');
      router.replace('/(carrier)/dashboard');
    }
  }, [userType, segments, isNavigationReady, checkedOnboarding, authLoading, needsOnboarding, isRecheckingOnboarding, router]);

  // TELA DE CARREGAMENTO (Enquanto verifica Onboarding, Navegação ou Auth)
  if (!isNavigationReady || !checkedOnboarding || authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 4. Nova Rota de Onboarding */}
      <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
      
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(company)" />
      <Stack.Screen name="(carrier)" />
      
      <Stack.Screen 
        name="order-details" 
        options={{ 
          presentation: 'modal',
          title: 'Detalhes'
        }} 
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

// Função auxiliar para permissões (com tratamento de erro robusto)
async function registerForPushNotificationsAsync() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Permissão de notificação negada!');
    }
  } catch (error) {
    // No Expo Go, notificações podem não funcionar completamente
    // Não deve travar o app por isso
    console.warn('Erro ao configurar notificações (pode ser normal no Expo Go):', error);
  }
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
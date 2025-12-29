import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AuthInput from '@/components/ui/AuthInput';
import { useAuth } from '@/contexts/AuthContext';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Função para resetar onboarding (DEBUG - remover em produção)
  const handleResetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('@logitech:hasSeenOnboarding');
      Alert.alert('Onboarding Resetado', 'O onboarding será mostrado novamente na próxima vez que você abrir o app. Feche e reabra o app para ver o efeito.');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível resetar o onboarding.');
      console.error(e);
    }
  };

  // Simulação de Login
  const handleLogin = () => {
    setError('');
    
    // 1. Validação simples
    if (!email || !password) {
      setError('Preencha todos os campos.');
      return;
    }

    setLoading(true);

    // 2. Simula delay de rede (UX)
    setTimeout(() => {
      setLoading(false);
      
      // Lógica Fake de Roteamento (No futuro, o Backend decidirá isso)
      if (email.includes('empresa')) {
        signIn('company');
      } else if (email.includes('motorista')) {
        signIn('carrier');
      } else {
        // Fallback: Vamos perguntar quem ele é se o email for genérico
        signIn('carrier'); // Por padrão para teste
      }
    }, 1500);
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.scroll}>
          
          {/* Header Visual */}
          <View style={styles.header}>
            <View style={styles.logoBox}>
              <FontAwesome5 name="truck-loading" size={40} color="#fff" />
            </View>
            <ThemedText type="title" style={{marginTop: 20, color: '#fff'}}>Bem-vindo de volta!</ThemedText>
            <ThemedText style={{color: '#fff', marginTop: 5}}>Digite suas credenciais para acessar.</ThemedText>
          </View>

          {/* Formulário */}
          <View style={styles.form}>
            <AuthInput 
              label="E-mail"
              iconName="envelope"
              placeholder="ex: motorista@logitech.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              labelColor="#fff"
            />

            <AuthInput 
              label="Senha"
              iconName="lock"
              placeholder="Sua senha secreta"
              isPassword
              value={password}
              onChangeText={setPassword}
              error={error}
              labelColor="#fff"
            />

            <TouchableOpacity style={{alignSelf: 'flex-end', marginBottom: 20}}>
              <ThemedText style={{color: '#0a7ea4', fontWeight: '500'}}>Esqueceu a senha?</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btn, loading && styles.btnLoading]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ThemedText style={styles.btnText}>ENTRANDO...</ThemedText>
              ) : (
                <ThemedText style={styles.btnText}>ENTRAR</ThemedText>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer - Link para Cadastro */}
          <View style={styles.footer}>
            <ThemedText style={{color: '#666'}}>Não tem uma conta?</ThemedText>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <ThemedText style={{color: '#0a7ea4', fontWeight: 'bold'}}> Crie agora</ThemedText>
            </TouchableOpacity>
          </View>

          {/* DICA DE TESTE (Para você não esquecer) */}
          <View style={styles.devHint}>
            <ThemedText style={{fontSize: 10, color: '#999', textAlign: 'center'}}>
              Dev Hint: Use "empresa@" para logar como Empresa{'\n'}ou "motorista@" para Transportadora.
            </ThemedText>
          </View>

          {/* BOTÃO DE DEBUG - Resetar Onboarding */}
          <TouchableOpacity 
            style={styles.debugBtn} 
            onPress={handleResetOnboarding}
          >
            <ThemedText style={styles.debugBtnText}>
              🔄 Resetar Onboarding (Debug)
            </ThemedText>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 30, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logoBox: {
    width: 80, height: 80, borderRadius: 25,
    backgroundColor: '#0a7ea4', justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
    elevation: 10, shadowColor: '#0a7ea4', shadowOpacity: 0.3, shadowRadius: 10
  },
  form: { marginBottom: 30 },
  btn: {
    backgroundColor: '#0a7ea4', height: 56, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#0a7ea4', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5
  },
  btnLoading: { backgroundColor: '#7abbd1' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  devHint: { marginTop: 40, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 },
  debugBtn: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#ff9800',
    borderRadius: 8,
    alignItems: 'center'
  },
  debugBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  }
});
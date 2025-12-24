import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = (type: 'company' | 'carrier') => {
    signIn(type);
    
    if (type === 'company') {
      // O arquivo é app/(company)/(tabs)/index.tsx
      // Como os grupos () são invisíveis, a rota é apenas a raiz '/'
      router.replace('/'); 
    } else {
      // O arquivo é app/(carrier)/dashboard.tsx
      // Removemos o (carrier) da URL
      router.replace('/dashboard');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Cargo Connect</ThemedText>
      <ThemedText style={styles.subtitle}>Selecione seu perfil para entrar</ThemedText>

      <TouchableOpacity 
        style={[styles.btn, { backgroundColor: '#0a7ea4' }]} 
        onPress={() => handleLogin('company')}>
        <ThemedText style={styles.btnText}>Sou Empresa (Embarcador)</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.btn, { backgroundColor: '#2f95dc' }]} 
        onPress={() => handleLogin('carrier')}>
        <ThemedText style={styles.btnText}>Sou Transportadora</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, gap: 16 },
  title: { textAlign: 'center', marginBottom: 20 },
  subtitle: { textAlign: 'center', marginBottom: 40 },
  btn: { padding: 16, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
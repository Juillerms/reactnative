import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AuthInput from '@/components/ui/AuthInput';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function SignupScreen() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'company' | 'carrier'>('carrier'); // Estado para o tipo de conta

  const handleSignup = () => {
    // Aqui no futuro conectaremos com o Backend
    Alert.alert('Sucesso', 'Conta criada com sucesso! Faça login.', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome5 name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>

        <ThemedText type="title" style={{color: '#fff', marginBottom: 10}}>Criar Conta</ThemedText>
        <ThemedText style={{color: '#fff', marginBottom: 30}}>Preencha os dados para começar.</ThemedText>

        {/* Seletor de Tipo de Conta */}
        <View style={styles.roleSelector}>
          <TouchableOpacity 
            style={[styles.roleBtn, role === 'carrier' && styles.roleBtnActive]} 
            onPress={() => setRole('carrier')}
          >
            <FontAwesome5 name="motorcycle" size={20} color={role === 'carrier' ? '#fff' : '#666'} />
            <ThemedText style={[styles.roleText, role === 'carrier' && styles.roleTextActive]}>Sou Motorista</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.roleBtn, role === 'company' && styles.roleBtnActive]} 
            onPress={() => setRole('company')}
          >
            <FontAwesome5 name="building" size={20} color={role === 'company' ? '#fff' : '#666'} />
            <ThemedText style={[styles.roleText, role === 'company' && styles.roleTextActive]}>Sou Empresa</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <AuthInput 
            label="Nome Completo"
            iconName="user"
            placeholder="Seu nome"
            value={name}
            onChangeText={setName}
            labelColor="#fff"
          />
          <AuthInput 
            label="E-mail"
            iconName="envelope"
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            labelColor="#fff"
          />
          <AuthInput 
            label="Senha"
            iconName="lock"
            placeholder="Crie uma senha forte"
            isPassword
            value={password}
            onChangeText={setPassword}
            labelColor="#fff"
          />

          <TouchableOpacity style={styles.btn} onPress={handleSignup}>
            <ThemedText style={styles.btnText}>CADASTRAR</ThemedText>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 30, paddingTop: 60 },
  backBtn: { marginBottom: 20, width: 40 },
  
  roleSelector: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  roleBtn: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#f9f9f9'
  },
  roleBtnActive: { backgroundColor: '#0a7ea4', borderColor: '#0a7ea4' },
  roleText: { fontWeight: '600', color: '#666' },
  roleTextActive: { color: '#fff' },

  form: { gap: 10 },
  btn: {
    backgroundColor: '#0a7ea4', height: 56, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginTop: 20,
    shadowColor: '#0a7ea4', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, elevation: 5
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
});
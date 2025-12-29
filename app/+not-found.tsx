import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FontAwesome5 } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops! Esta página não existe.' }} />
      <ThemedView style={styles.container}>
        <View style={styles.content}>
          <FontAwesome5 name="exclamation-triangle" size={64} color="#ff4444" />
          <ThemedText type="title" style={styles.title}>404</ThemedText>
          <ThemedText style={styles.subtitle}>
            Página não encontrada
          </ThemedText>
          <ThemedText style={styles.description}>
            A página que você está procurando não existe ou foi movida.
          </ThemedText>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.button}>
              <ThemedText style={styles.buttonText}>Voltar para o Login</ThemedText>
            </TouchableOpacity>
          </Link>
        </View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 72,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 10,
    color: '#666',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 32,
    color: '#999',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#0a7ea4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});



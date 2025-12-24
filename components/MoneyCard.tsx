import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FontAwesome5 } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

interface Props {
  title: string;
  amount: number;
  type: 'income' | 'expense'; // Renda ou Despesa
}

export default function MoneyCard({ title, amount, type }: Props) {
  const isIncome = type === 'income';
  
  return (
    <ThemedView style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: isIncome ? '#e8f5e9' : '#ffebee' }]}>
        <FontAwesome5 
          name={isIncome ? "arrow-up" : "arrow-down"} 
          size={24} 
          color={isIncome ? "#2dbc00" : "#ff4444"} 
        />
      </View>
      
      <View>
        <ThemedText style={styles.label}>{title}</ThemedText>
        <ThemedText type="title" style={{ color: isIncome ? "#2dbc00" : "#333" }}>
          R$ {amount.toFixed(2)}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
    gap: 16,
    // Sombras
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500'
  }
});
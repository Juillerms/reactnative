import MoneyCard from '@/components/MoneyCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Order, useOrder } from '@/contexts/OrderContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { FlatList, StyleSheet, View } from 'react-native';

export default function CompanyWallet() {
  const { orders } = useOrder();

  // Regra de Negócio: Somar apenas pedidos ENTREGUES ou ACEITOS (comprometidos)
  const expenseOrders = orders.filter(o => o.status !== 'pending');
  
  // Cálculo do total usando reduce (Programação Funcional)
  const totalExpense = expenseOrders.reduce((acc, order) => acc + order.price, 0);

  const renderHistoryItem = ({ item }: { item: Order }) => (
    <View style={styles.item}>
      <View style={styles.iconBox}>
        <FontAwesome5 name="box" size={16} color="#666" />
      </View>
      <View style={{flex: 1}}>
        <ThemedText type="defaultSemiBold" style={{color: '#333'}}>{item.destination}</ThemedText>
        <ThemedText style={{fontSize: 12, color: '#888'}}>
          {new Date(item.createdAt).toLocaleDateString()} • {item.vehicle.toUpperCase()}
        </ThemedText>
      </View>
      <ThemedText type="defaultSemiBold" style={{color: '#ff4444'}}>
        - R$ {item.price.toFixed(2)}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.headerTitle}>Financeiro</ThemedText>
      
      <MoneyCard 
        title="Total Gasto em Fretes" 
        amount={totalExpense} 
        type="expense" 
      />

      <ThemedText type="subtitle" style={styles.sectionTitle}>Histórico de Pagamentos</ThemedText>
      
      <FlatList
        data={expenseOrders}
        keyExtractor={item => item.id}
        renderItem={renderHistoryItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<ThemedText style={{textAlign: 'center', color: '#999', marginTop: 20}}>Nenhum pagamento realizado.</ThemedText>}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  headerTitle: { marginBottom: 20 },
  sectionTitle: { marginBottom: 15, color: '#333' },
  list: { paddingBottom: 20 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12
  },
  iconBox: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center'
  }
});
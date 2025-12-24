import MoneyCard from '@/components/MoneyCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Order, useOrder } from '@/contexts/OrderContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function CarrierWallet() {
  const router = useRouter();
  const { orders } = useOrder();

  // Filtra apenas pedidos entregues
  const earnings = orders.filter(o => o.status === 'delivered');
  const totalEarnings = earnings.reduce((acc, order) => acc + order.price, 0);

  const renderItem = ({ item }: { item: Order }) => (
    // MUDANÇA PRINCIPAL: View virou TouchableOpacity para ser clicável
    <TouchableOpacity 
      style={styles.item}
      activeOpacity={0.7}
      onPress={() => router.push({
        pathname: '/order-details', // Rota do arquivo que criamos na raiz
        params: { id: item.id }     // Passamos o ID para buscar os dados lá
      })}
    >
      <View style={[styles.iconBox, {backgroundColor: '#e8f5e9'}]}>
        <FontAwesome5 name="check" size={14} color="#2dbc00" />
      </View>
      <View style={{flex: 1}}>
        <ThemedText type="defaultSemiBold" style={{color: '#333'}}>
          {item.destination}
        </ThemedText>
        
        <ThemedText style={{fontSize: 13, color: '#555', marginTop: 2}}>
          Finalizado às {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </ThemedText>
      </View>
      
      {/* Seta indicando que é clicável */}
      <View style={{alignItems: 'flex-end'}}>
        <ThemedText type="defaultSemiBold" style={{color: '#2dbc00'}}>
          + R$ {item.price.toFixed(2)}
        </ThemedText>
        <FontAwesome5 name="chevron-right" size={10} color="#ccc" style={{marginTop: 4}}/>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        {/* CORREÇÃO: Cor #333 para aparecer no fundo branco */}
        <ThemedText type="title" style={{color: '#333'}}>Meus Ganhos</ThemedText>
      </View>
      
      <MoneyCard 
        title="Saldo Disponível" 
        amount={totalEarnings} 
        type="income" 
      />

      {/* CORREÇÃO: Cor #333 para aparecer no fundo branco */}
      <ThemedText type="subtitle" style={styles.sectionTitle}>Corridas Realizadas</ThemedText>
      
      <FlatList
        data={earnings}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{paddingBottom: 40}}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="wallet" size={40} color="#ccc" style={{marginBottom: 10}}/>
            <ThemedText style={{textAlign: 'center', color: '#666'}}>
              Você ainda não finalizou nenhuma entrega.
            </ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20, 
    gap: 15 
  },
  backBtn: { 
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5' 
  },
  sectionTitle: { 
    marginBottom: 15, 
    color: '#333', // Garante contraste
    marginTop: 10 
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12
  },
  iconBox: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center'
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8
  }
});
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { Order, useOrder } from '@/contexts/OrderContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function CarrierDashboard() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { orders, acceptOrder } = useOrder();

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const activeOrder = orders.find(o => o.status === 'accepted');

  useEffect(() => {
    if (activeOrder) {
      router.replace('/(carrier)/ride');
    }
  }, [activeOrder]);

  const handleAccept = (id: string) => {
    acceptOrder(id);
    router.push('/(carrier)/ride');
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.badge}>
          <FontAwesome5 name="box" size={14} color="#fff" />
          <ThemedText style={styles.badgeText}>{item.vehicle.toUpperCase()}</ThemedText>
        </View>
        <ThemedText style={styles.price}>R$ {item.price.toFixed(2)}</ThemedText>
      </View>

      <View style={styles.row}>
        <FontAwesome5 name="map-marker-alt" size={16} color="#666" style={{width: 20}} />
        <ThemedText style={styles.address}>{item.destination}</ThemedText>
      </View>

      <TouchableOpacity 
        style={styles.acceptBtn} 
        onPress={() => handleAccept(item.id)}
      >
        <ThemedText style={styles.btnText}>ACEITAR CORRIDA</ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Cargas Disponíveis</ThemedText>
        <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
          <FontAwesome5 name="sign-out-alt" size={18} color="#ff4444" />
          <ThemedText style={{color: '#ff4444', fontWeight: 'bold'}}>Sair</ThemedText>
        </TouchableOpacity>
      </View>

      {/* --- BOTÃO CARTEIRA (RESTAURADO) --- */}
      <TouchableOpacity 
        style={styles.walletShortcut} 
        onPress={() => router.push('/(carrier)/wallet')}
        activeOpacity={0.8}
      >
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <View style={styles.walletIconBg}>
            <FontAwesome5 name="wallet" size={18} color="#0a7ea4" />
          </View>
          <View>
            <ThemedText type="defaultSemiBold" style={{color: '#fff'}}>Minha Carteira</ThemedText>
            <ThemedText style={{color: 'rgba(255,255,255,0.8)', fontSize: 12}}>Toque para ver ganhos</ThemedText>
          </View>
        </View>
        <FontAwesome5 name="chevron-right" size={16} color="#fff" />
      </TouchableOpacity>
      {/* ----------------------------------- */}

      <FlatList
        data={pendingOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FontAwesome5 name="clipboard-list" size={50} color="#ccc" />
            <ThemedText style={{color: '#999', marginTop: 10}}>
              Nenhuma carga disponível no momento.
            </ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff0f0' 
  },
  
  // Estilo do Botão Carteira
  walletShortcut: {
    backgroundColor: '#0a7ea4',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3
  },
  walletIconBg: {
    backgroundColor: '#fff',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },

  list: { paddingHorizontal: 20, paddingBottom: 20 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  price: { fontSize: 18, fontWeight: 'bold', color: '#2dbc00' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  address: { color: '#444', flex: 1, marginLeft: 8 },
  acceptBtn: {
    backgroundColor: '#111',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: 'bold' }
});
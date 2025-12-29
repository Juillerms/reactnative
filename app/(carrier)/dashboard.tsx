import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { Order, useOrder } from '@/contexts/OrderContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function CarrierDashboard() {
  const router = useRouter();
  
  // 1. Pegamos o userProfile aqui para mostrar a foto e o nome
  const { signOut, userProfile } = useAuth(); 
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
        {/* Título Geral da Tela */}
        <ThemedText type="title" style={{color: '#333'}}>Painel</ThemedText>
        
        <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
          <FontAwesome5 name="sign-out-alt" size={18} color="#ff4444" />
        </TouchableOpacity>
      </View>

      {/* --- NOVO: CARD DE PERFIL --- */}
      <TouchableOpacity 
        style={styles.profileCard} 
        onPress={() => router.push('/(carrier)/profile')}
        activeOpacity={0.8}
      >
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 15}}>
          {/* Lógica: Se tem foto, mostra ela. Se não, mostra ícone padrão */}
          {userProfile.photoUri ? (
            <Image source={{ uri: userProfile.photoUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <FontAwesome5 name="user" size={20} color="#fff" />
            </View>
          )}
          
          <View>
            <ThemedText type="defaultSemiBold" style={{color: '#333'}}>
              {userProfile.name}
            </ThemedText>
            <ThemedText style={{color: '#666', fontSize: 12}}>
              {userProfile.licensePlate}
            </ThemedText>
          </View>
        </View>
        
        <FontAwesome5 name="pen" size={12} color="#999" />
      </TouchableOpacity>
      {/* --------------------------- */}

      {/* --- BOTÃO CARTEIRA --- */}
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
      
      {/* Título da Seção da Lista */}
      <ThemedText type="subtitle" style={styles.sectionTitle}>Cargas Disponíveis</ThemedText>

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
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff0f0' 
  },
  
  // ESTILOS DO PERFIL (NOVOS)
  profileCard: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginHorizontal: 20, 
    marginBottom: 15, 
    padding: 15,
    backgroundColor: '#fff', 
    borderRadius: 12,
    borderWidth: 1, 
    borderColor: '#eee'
  },
  avatarImage: { 
    width: 50, 
    height: 50, 
    borderRadius: 25 
  },
  avatarPlaceholder: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: '#ccc', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },

  // ESTILOS DA CARTEIRA
  walletShortcut: {
    backgroundColor: '#0a7ea4',
    marginHorizontal: 20,
    marginBottom: 25,
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

  sectionTitle: {
    paddingHorizontal: 20,
    marginBottom: 10,
    color: '#333'
  },

  list: { paddingHorizontal: 20, paddingBottom: 20 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  
  card: {
    backgroundColor: '#fff',
    padding: 20, // Mais espaço interno
    borderRadius: 16, // Mais arredondado
    marginBottom: 20,
    // Sombra mais suave e difusa
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16, // Mais separação
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5' // Linha divisória sutil
  },
  badge: {
    backgroundColor: '#e1f5fe', // Fundo azul bem claro
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  badgeText: { color: '#0a7ea4', fontSize: 12, fontWeight: 'bold' }, // Texto azul escuro
  
  price: { fontSize: 22, fontWeight: '800', color: '#2dbc00' }, // Preço maior
  
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20,
    backgroundColor: '#f9f9f9', // Endereço com fundo destaque
    padding: 12,
    borderRadius: 8
  },
  address: { 
    flex: 1, 
    marginLeft: 8, 
    color: '#333', 
    fontSize: 14 
  },
  
  acceptBtn: {
    backgroundColor: '#0a7ea4', // Botão azul primário
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#0a7ea4',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    elevation: 3
  },
  btnText: { color: '#fff', fontWeight: 'bold' }
});
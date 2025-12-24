import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useOrder } from '@/contexts/OrderContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Platform, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';

export default function OrderDetailsModal() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { orders } = useOrder();
  const colorScheme = useColorScheme(); // Detecta se é dark ou light
  const isDark = colorScheme === 'dark';

  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <ThemedView style={[styles.container, styles.center]}>
        <ThemedText>Pedido não encontrado.</ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnBack}>
          <ThemedText style={{color: '#fff'}}>Voltar</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // Define cores dinâmicas baseadas no tema
  const iconColor = isDark ? '#fff' : '#333';
  const borderColor = isDark ? '#333' : '#eee';

  return (
    <ThemedView style={styles.container}>
      
      {/* Header Transparente/Adaptável */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <View>
          <ThemedText type="subtitle" style={{fontSize: 20}}>Pedido #{order.id}</ThemedText>
          <ThemedText style={{color: '#999', fontSize: 12}}>Detalhes da transação</ThemedText>
        </View>
        
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={[styles.closeBtn, { backgroundColor: isDark ? '#333' : '#f5f5f5' }]}
        >
          <FontAwesome5 name="times" size={20} color={isDark ? '#fff' : '#666'} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: order.status === 'delivered' ? 'rgba(45, 188, 0, 0.1)' : 'rgba(255, 152, 0, 0.1)' }]}>
          <FontAwesome5 
            name={order.status === 'delivered' ? "check-circle" : "clock"} 
            size={16} 
            color={order.status === 'delivered' ? "#2dbc00" : "#ff9800"} 
          />
          <ThemedText style={{color: order.status === 'delivered' ? "#2dbc00" : "#ff9800", fontWeight: 'bold'}}>
            {order.status === 'delivered' ? 'ENTREGA CONCLUÍDA' : 'EM ANDAMENTO'}
          </ThemedText>
        </View>

        {/* Valor e Data */}
        <View style={styles.section}>
          {/* Removemos a cor fixa, o ThemedText cuidará do Dark Mode */}
          <ThemedText type="title" style={{fontSize: 32}}>
            R$ {order.price.toFixed(2)}
          </ThemedText>
          <ThemedText style={{color: '#888', marginTop: 4}}>
            {new Date(order.createdAt).toLocaleDateString()} às {new Date(order.createdAt).toLocaleTimeString()}
          </ThemedText>
        </View>

        <View style={[styles.divider, { backgroundColor: borderColor }]} />

        {/* Mapa */}
        <View style={styles.section}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
            <FontAwesome5 name="map-marker-alt" size={18} color="#0a7ea4" style={{marginRight: 10}} />
            <ThemedText type="defaultSemiBold" style={{flex: 1}}>{order.destination}</ThemedText>
          </View>
          
          <View style={[styles.mapContainer, { borderColor: borderColor }]}>
            <MapView
              style={styles.map}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
              scrollEnabled={false}
              zoomEnabled={false}
              liteMode={true}
              initialRegion={{
                latitude: order.destinationCoords.latitude,
                longitude: order.destinationCoords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
            >
              <Marker coordinate={order.destinationCoords} />
            </MapView>
          </View>
        </View>

        {/* FOTO DO COMPROVANTE */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={{marginBottom: 10}}>
            📸 Comprovante de Entrega
          </ThemedText>
          
          {order.proofPhoto ? (
            <Image 
              source={{ uri: order.proofPhoto }} 
              style={[styles.proofImage, { borderColor: borderColor }]} 
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.missingPhotoBox, { borderColor: borderColor, backgroundColor: isDark ? '#1a1a1a' : '#f9f9f9' }]}>
              <FontAwesome5 name="image" size={30} color={isDark ? '#444' : '#ccc'} />
              <ThemedText style={{color: '#888', marginTop: 8}}>
                Nenhuma foto registrada.
              </ThemedText>
              <ThemedText style={{color: '#666', fontSize: 10, marginTop: 4}}>
                (O pedido deve ser finalizado com a câmera)
              </ThemedText>
            </View>
          )}
        </View>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20, // Padding para Notch
    borderBottomWidth: 1,
  },
  closeBtn: { 
    padding: 10,
    borderRadius: 20
  },
  scroll: { padding: 20, paddingBottom: 50 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24
  },
  section: { marginBottom: 28 },
  divider: { height: 1, marginBottom: 24 },
  mapContainer: {
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  map: { width: '100%', height: '100%' },
  proofImage: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    borderWidth: 1,
  },
  missingPhotoBox: {
    width: '100%',
    height: 150,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center'
  },
  btnBack: {
    marginTop: 20,
    backgroundColor: '#0a7ea4',
    padding: 12,
    borderRadius: 8
  }
});
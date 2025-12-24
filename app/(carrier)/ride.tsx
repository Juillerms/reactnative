import DeliveryCamera from '@/components/DeliveryCamera';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useOrder } from '@/contexts/OrderContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';

export default function RideScreen() {
  const router = useRouter();
  const { orders, finishOrder } = useOrder();
  const mapRef = useRef<MapView>(null);
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const activeOrder = orders.find(o => o.status === 'accepted');

  useEffect(() => {
    if (!activeOrder) {
      router.replace('/(carrier)/dashboard');
    }
  }, [activeOrder]);

  if (!activeOrder) return null;

  const { latitude, longitude } = activeOrder.destinationCoords;

  // --- CORREÇÃO CRÍTICA AQUI ---
  const handlePhotoConfirmed = (photoUri: string) => {
    console.log("RideScreen: Enviando foto para o contexto:", photoUri);
    
    setIsCameraOpen(false);
    
    // Passando os DOIS argumentos: ID e a FOTO
    finishOrder(activeOrder.id, photoUri); 
  };
  // -----------------------------

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        initialRegion={{
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title="Destino da Entrega"
          description={activeOrder.destination}
        >
          <View style={styles.markerContainer}>
            <FontAwesome5 name="box" size={20} color="white" />
          </View>
        </Marker>
      </MapView>

      <ThemedView style={styles.infoCard}>
        <View style={styles.header}>
          <View style={{flex: 1}}>
            <ThemedText type="subtitle" style={{color: '#333'}}>Em Trânsito</ThemedText>
            <ThemedText style={{color: '#666'}} numberOfLines={2}>{activeOrder.destination}</ThemedText>
          </View>
          <ThemedText type="title" style={{color: '#0a7ea4', fontSize: 22}}>
            R$ {activeOrder.price.toFixed(2)}
          </ThemedText>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.finishBtn} onPress={() => setIsCameraOpen(true)}>
          <FontAwesome5 name="camera" size={18} color="#fff" style={{marginRight: 10}} />
          <ThemedText style={styles.btnText}>COMPROVAR ENTREGA</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <DeliveryCamera 
        isVisible={isCameraOpen} 
        onClose={() => setIsCameraOpen(false)}
        onPhotoTaken={handlePhotoConfirmed}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  markerContainer: {
    backgroundColor: '#0a7ea4',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white'
  },
  infoCard: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 16
  },
  finishBtn: {
    backgroundColor: '#2dbc00', 
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1
  }
});
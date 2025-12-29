import DeliveryCamera from '@/components/DeliveryCamera';
import { ThemedText } from '@/components/themed-text';
import { useOrder } from '@/contexts/OrderContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Platform, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';

const { width } = Dimensions.get('window');

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

  const handlePhotoConfirmed = (photoUri: string) => {
    setIsCameraOpen(false);
    finishOrder(activeOrder.id, photoUri); 
  };

  // Simulação de Rota (Linha no mapa)
  // Cria uma linha reta entre um ponto fictício e o destino
  const routeCoordinates = [
    { latitude: latitude - 0.005, longitude: longitude - 0.005 }, // Ponto A (Motorista)
    { latitude: latitude, longitude: longitude } // Ponto B (Destino)
  ];

  return (
    <View style={styles.container}>
      {/* 1. MAPA DE FUNDO */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        initialRegion={{
          latitude: latitude - 0.0025, // Centraliza entre A e B
          longitude: longitude - 0.0025,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
      >
        <Marker coordinate={{ latitude, longitude }}>
          <View style={styles.destinationMarker}>
            <FontAwesome5 name="flag-checkered" size={20} color="#fff" />
          </View>
        </Marker>
        
        {/* Linha da Rota */}
        <Polyline 
          coordinates={routeCoordinates}
          strokeColor="#0a7ea4"
          strokeWidth={4}
          lineDashPattern={[1]}
        />
      </MapView>

      {/* 2. HEADER DE NAVEGAÇÃO (Estilo GPS) */}
      <SafeAreaView style={styles.navHeaderContainer}>
        <View style={styles.navHeader}>
          <View style={styles.turnIcon}>
            <FontAwesome5 name="arrow-right" size={24} color="#fff" />
          </View>
          <View>
            <ThemedText style={styles.navDistance}>200 m</ThemedText>
            <ThemedText style={styles.navInstruction} numberOfLines={1}>
              Vire à direita na {activeOrder.destination.split(',')[0]}
            </ThemedText>
          </View>
        </View>
      </SafeAreaView>

      {/* 3. PAINEL DE CONTROLE INFERIOR */}
      <View style={styles.bottomPanel}>
        
        {/* Barra de Puxar (Visual) */}
        <View style={styles.handleBar} />

        {/* Informações do Cliente/Destino */}
        <View style={styles.customerInfo}>
          <View style={styles.customerAvatar}>
            <FontAwesome5 name="user" size={20} color="#666" />
          </View>
          <View style={{flex: 1}}>
            <ThemedText type="defaultSemiBold" style={{color: '#333'}}>Cliente Destinatário</ThemedText>
            <ThemedText style={{color: '#666', fontSize: 12}}>Pagamento Digital • R$ {activeOrder.price.toFixed(2)}</ThemedText>
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <FontAwesome5 name="phone-alt" size={18} color="#0a7ea4" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <FontAwesome5 name="comment-alt" size={18} color="#0a7ea4" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={{marginBottom: 20}}>
          <ThemedText type="defaultSemiBold" style={{color: '#333', fontSize: 16}}>Endereço de Entrega</ThemedText>
          <ThemedText style={{color: '#666'}}>{activeOrder.destination}</ThemedText>
        </View>

        {/* Botão Principal de Ação */}
        <TouchableOpacity 
          style={styles.finishBtn} 
          onPress={() => setIsCameraOpen(true)}
          activeOpacity={0.8}
        >
          <View style={styles.cameraIconContainer}>
            <FontAwesome5 name="camera" size={20} color="#0a7ea4" />
          </View>
          <ThemedText style={styles.btnText}>COMPROVAR ENTREGA</ThemedText>
          <FontAwesome5 name="chevron-right" size={16} color="#fff" style={{opacity: 0.6}} />
        </TouchableOpacity>
      </View>

      {/* CÂMERA MODAL */}
      <DeliveryCamera 
        isVisible={isCameraOpen} 
        onClose={() => setIsCameraOpen(false)}
        onPhotoTaken={handlePhotoConfirmed}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  map: { width: '100%', height: '100%' }, // Mapa ocupa tudo, o resto fica por cima
  
  // Header de Navegação
  navHeaderContainer: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: '#2dbc00', // Verde GPS
    paddingTop: Platform.OS === 'android' ? 40 : 0,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, elevation: 8
  },
  navHeader: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 16
  },
  turnIcon: {
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center'
  },
  navDistance: { color: '#fff', fontWeight: 'bold', fontSize: 24 },
  navInstruction: { color: '#fff', fontSize: 16, opacity: 0.9, maxWidth: width - 100 },

  // Marker Customizado
  destinationMarker: {
    backgroundColor: '#ff4444', padding: 10, borderRadius: 20,
    borderWidth: 3, borderColor: '#fff'
  },

  // Painel Inferior
  bottomPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.2, elevation: 15
  },
  handleBar: {
    width: 40, height: 4, backgroundColor: '#e0e0e0', borderRadius: 2,
    alignSelf: 'center', marginBottom: 20
  },
  
  customerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  customerAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0f0f0',
    alignItems: 'center', justifyContent: 'center'
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#e1f5fe',
    alignItems: 'center', justifyContent: 'center'
  },
  
  divider: { height: 1, backgroundColor: '#eee', marginBottom: 16 },

  // Botão Principal
  finishBtn: {
    backgroundColor: '#0a7ea4', 
    height: 60,
    borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 8,
    shadowColor: '#0a7ea4', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, elevation: 5
  },
  cameraIconContainer: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center'
  },
  btnText: {
    color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1,
    flex: 1, textAlign: 'center'
  }
});
import AppMap from '@/components/MapView';
import VehicleSelector from '@/components/VehicleSelector';
import { ThemedText } from '@/components/themed-text';
import { VEHICLES } from '@/constants/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useOrder } from '@/contexts/OrderContext';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps'; // Importamos Marker e Polyline

export default function CompanyHome() {
  const [step, setStep] = useState<'idle' | 'input_address' | 'selecting'>('idle');
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [destinationText, setDestinationText] = useState('');
  const [myLocation, setMyLocation] = useState<Location.LocationObject | null>(null);
  
  const { signOut } = useAuth();
  const { createOrder, orders } = useOrder();

  // 1. VERIFICA SE EXISTE PEDIDO ATIVO (Pendente ou Aceito)
  // Pegamos o pedido mais recente que não esteja 'delivered'
  const activeOrder = orders.find(o => o.status !== 'delivered');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let location = await Location.getCurrentPositionAsync({});
      setMyLocation(location);
    })();
  }, []);

  const handleConfirmAddress = () => {
    if (destinationText.trim().length === 0) {
      Alert.alert('Atenção', 'Digite um endereço válido.');
      return;
    }
    setStep('selecting');
  };

  const handleRequest = () => {
    if (!selectedVehicle) return;
    const vehicleData = VEHICLES.find(v => v.id === selectedVehicle);
    const price = vehicleData ? vehicleData.price : 0;
    
    const baseLat = myLocation?.coords.latitude ?? -8.063169;
    const baseLng = myLocation?.coords.longitude ?? -34.871139;
    const fakeDest = { latitude: baseLat + 0.005, longitude: baseLng + 0.005 };

    createOrder(selectedVehicle, price, destinationText, fakeDest); 
    
    // Não precisamos de Alert, a UI vai mudar automaticamente por causa do 'activeOrder'
    setStep('idle');
    setSelectedVehicle(null);
    setDestinationText('');
  };

  // --- RENDERIZAÇÃO CONDICIONAL DO MAPA ---
  const renderMapContent = () => {
    // Se tiver pedido aceito, mostramos a rota e o motorista
    if (activeOrder && activeOrder.status === 'accepted') {
       return (
         <MapView
            style={StyleSheet.absoluteFill}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
            initialRegion={{
              latitude: activeOrder.destinationCoords.latitude - 0.0025,
              longitude: activeOrder.destinationCoords.longitude - 0.0025,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
         >
           {/* Marcador do Destino */}
           <Marker coordinate={activeOrder.destinationCoords}>
              <View style={styles.destMarker}><FontAwesome5 name="flag-checkered" size={16} color="#fff"/></View>
           </Marker>
           
           {/* Marcador do Motorista (Simulado um pouco antes) */}
           <Marker coordinate={{
             latitude: activeOrder.destinationCoords.latitude - 0.005,
             longitude: activeOrder.destinationCoords.longitude - 0.005
           }}>
              <View style={styles.driverMarker}>
                <FontAwesome5 name="truck" size={16} color="#0a7ea4"/>
              </View>
           </Marker>

           {/* Linha da Rota */}
           <Polyline 
              coordinates={[
                { latitude: activeOrder.destinationCoords.latitude - 0.005, longitude: activeOrder.destinationCoords.longitude - 0.005 },
                activeOrder.destinationCoords
              ]}
              strokeColor="#0a7ea4"
              strokeWidth={3}
              lineDashPattern={[5]}
           />
         </MapView>
       )
    }
    // Caso contrário, mapa padrão
    return <AppMap />;
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* MAPA */}
      <View style={styles.mapContainer}>
        {renderMapContent()}
        
        <TouchableOpacity style={styles.logoutButton} onPress={signOut} activeOpacity={0.8}>
          <FontAwesome5 name="sign-out-alt" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* BOTTOM SHEET DINÂMICO */}
      <View style={styles.bottomSheet}>
        <View style={styles.handleBar} />
        
        {/* CASO 1: TEM PEDIDO ATIVO? */}
        {activeOrder ? (
          <View>
            {/* Status: PENDENTE (Procurando) */}
            {activeOrder.status === 'pending' && (
              <View style={{alignItems: 'center', paddingVertical: 20}}>
                <View style={styles.pulseContainer}>
                  <ActivityIndicator size="large" color="#0a7ea4" />
                </View>
                <ThemedText type="title" style={{color: '#333', marginTop: 15}}>Buscando motorista...</ThemedText>
                <ThemedText style={{color: '#666', textAlign: 'center', marginTop: 5}}>
                  Estamos localizando o {activeOrder.vehicle} mais próximo para {activeOrder.destination}.
                </ThemedText>
                <TouchableOpacity style={styles.cancelBtn}>
                  <ThemedText style={{color: '#ff4444', fontWeight: 'bold'}}>CANCELAR SOLICITAÇÃO</ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {/* Status: ACEITO (A Caminho) */}
            {activeOrder.status === 'accepted' && (
              <View>
                <View style={styles.statusRow}>
                  <View style={styles.statusDot} />
                  <ThemedText style={{color: '#0a7ea4', fontWeight: 'bold', letterSpacing: 1}}>MOTORISTA A CAMINHO</ThemedText>
                </View>

                <View style={styles.driverCard}>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 15}}>
                    <View style={styles.driverAvatar}>
                      <FontAwesome5 name="user-alt" size={24} color="#ccc" />
                    </View>
                    <View>
                      <ThemedText type="defaultSemiBold" style={{color: '#333'}}>Motorista Parceiro</ThemedText>
                      <View style={{flexDirection: 'row', gap: 5}}>
                        <ThemedText style={{color: '#666', fontSize: 12}}>★ 4.9</ThemedText>
                        <ThemedText style={{color: '#666', fontSize: 12}}>• ABC-1234</ThemedText>
                      </View>
                    </View>
                  </View>
                  <View style={{alignItems: 'flex-end'}}>
                    <ThemedText type="defaultSemiBold" style={{color: '#333'}}>8 min</ThemedText>
                    <ThemedText style={{color: '#999', fontSize: 10}}>chegada</ThemedText>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={{flexDirection: 'row', justifyContent: 'space-between', gap: 15}}>
                  <TouchableOpacity style={styles.actionBtnOutline}>
                    <FontAwesome5 name="phone" size={16} color="#333" />
                    <ThemedText style={{color: '#333', fontWeight: 'bold'}}>Ligar</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtnOutline}>
                    <FontAwesome5 name="comment" size={16} color="#333" />
                    <ThemedText style={{color: '#333', fontWeight: 'bold'}}>Chat</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

        ) : (
          
          /* CASO 2: SEM PEDIDO (Fluxo Normal de Solicitação) */
          <>
            {step === 'idle' && (
              <View>
                <ThemedText type="title" style={{color: '#333', fontSize: 22, marginBottom: 5}}>
                  Olá, Empresa 👋
                </ThemedText>
                <ThemedText style={{color: '#666', marginBottom: 20}}>
                  Vamos agendar uma entrega hoje?
                </ThemedText>

                <TouchableOpacity 
                  style={styles.searchBar}
                  onPress={() => setStep('input_address')}
                  activeOpacity={0.9}
                >
                  <FontAwesome5 name="search" size={18} color="#0a7ea4" />
                  <ThemedText style={{ color: '#666', fontWeight: '500', marginLeft: 10 }}>
                    Para onde enviar?
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {step === 'input_address' && (
              <View>
                <View style={styles.headerRow}>
                  <TouchableOpacity onPress={() => setStep('idle')} style={styles.miniBackBtn}>
                    <FontAwesome5 name="arrow-left" size={16} color="#333" />
                  </TouchableOpacity>
                  <ThemedText type="defaultSemiBold" style={{color: '#333', fontSize: 18}}>
                    Endereço de Destino
                  </ThemedText>
                </View>
                
                <View style={styles.inputContainer}>
                  <FontAwesome5 name="map-marker-alt" size={18} color="#999" style={{marginRight: 10}} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Av. Boa Viagem, 1000"
                    placeholderTextColor="#ccc"
                    value={destinationText}
                    onChangeText={setDestinationText}
                    autoFocus={true}
                  />
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={handleConfirmAddress}>
                  <ThemedText style={styles.btnText}>CONTINUAR</ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {step === 'selecting' && (
              <View>
                <View style={styles.headerRow}>
                  <TouchableOpacity onPress={() => setStep('input_address')} style={styles.miniBackBtn}>
                    <FontAwesome5 name="arrow-left" size={16} color="#333" />
                  </TouchableOpacity>
                  <View style={{flex: 1}}>
                    <ThemedText type="defaultSemiBold" style={{color: '#0a7ea4', fontSize: 12}}>DESTINO</ThemedText>
                    <ThemedText style={{color: '#333', fontWeight: '500'}} numberOfLines={1}>
                      {destinationText}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.divider} />

                <VehicleSelector selectedId={selectedVehicle} onSelect={setSelectedVehicle} />

                <TouchableOpacity 
                  style={[styles.primaryBtn, !selectedVehicle && styles.disabledBtn]}
                  onPress={handleRequest}
                  disabled={!selectedVehicle}
                >
                  <ThemedText style={styles.btnText}>
                    {selectedVehicle ? 'CHAMAR TRANSPORTE' : 'ESCOLHA UM VEÍCULO'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { flex: 1 },
  
  logoutButton: {
    position: 'absolute', top: 60, right: 20,
    backgroundColor: '#ff4444', width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, elevation: 5
  },

  bottomSheet: {
    backgroundColor: 'white',
    padding: 24, paddingBottom: 40,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 15,
  },
  
  handleBar: {
    width: 40, height: 4, backgroundColor: '#e0e0e0', borderRadius: 2,
    alignSelf: 'center', marginBottom: 20
  },

  // Map Markers
  destMarker: { backgroundColor: '#ff4444', padding: 8, borderRadius: 15, borderWidth: 2, borderColor: '#fff' },
  driverMarker: { backgroundColor: '#fff', padding: 8, borderRadius: 15, borderWidth: 2, borderColor: '#0a7ea4' },

  // Tracking Styles
  pulseContainer: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#e1f5fe', justifyContent: 'center', alignItems: 'center',
    marginBottom: 10
  },
  cancelBtn: { marginTop: 30, padding: 10 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20, justifyContent: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0a7ea4' },
  driverCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#f9f9f9', padding: 16, borderRadius: 16, marginBottom: 20
  },
  driverAvatar: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#e0e0e0',
    justifyContent: 'center', alignItems: 'center'
  },
  actionBtnOutline: {
    flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#ddd'
  },

  // Normal Flow Styles (Search/Select)
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f5f5f5', padding: 16, borderRadius: 12,
    borderWidth: 1, borderColor: '#eee'
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 15 },
  miniBackBtn: { 
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#f5f5f5',
    justifyContent: 'center', alignItems: 'center'
  },
  divider: { height: 1, backgroundColor: '#eee', marginBottom: 20 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f9f9f9', paddingHorizontal: 15, height: 56,
    borderRadius: 12, borderWidth: 1, borderColor: '#eee', marginBottom: 20
  },
  input: { flex: 1, height: '100%', fontSize: 16, color: '#333' },
  primaryBtn: {
    backgroundColor: '#0a7ea4', height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#0a7ea4', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, elevation: 5
  },
  disabledBtn: { backgroundColor: '#ccc', shadowOpacity: 0 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 }
});
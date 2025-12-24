import AppMap from '@/components/MapView';
import VehicleSelector from '@/components/VehicleSelector';
import { ThemedText } from '@/components/themed-text';
import { VEHICLES } from '@/constants/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useOrder } from '@/contexts/OrderContext';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location'; // <--- Adicionado
import { useEffect, useState } from 'react'; // <--- Adicionado useEffect
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function CompanyHome() {
  const [step, setStep] = useState<'idle' | 'input_address' | 'selecting'>('idle');
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [destinationText, setDestinationText] = useState('');
  
  // Estado para guardar a localização atual para gerar o destino próximo
  const [myLocation, setMyLocation] = useState<Location.LocationObject | null>(null);
  
  const { signOut } = useAuth();
  const { createOrder } = useOrder();

  // 1. Pegar a localização atual ao abrir a tela
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      
      let location = await Location.getCurrentPositionAsync({});
      setMyLocation(location);
    })();
  }, []);

  const handleDestinationPress = () => {
    setStep('input_address');
  };

  const handleConfirmAddress = () => {
    if (destinationText.trim().length === 0) {
      Alert.alert('Atenção', 'Por favor, digite um endereço.');
      return;
    }
    setStep('selecting');
  };

  const handleRequest = () => {
    if (!selectedVehicle) return;
    
    const vehicleData = VEHICLES.find(v => v.id === selectedVehicle);
    const price = vehicleData ? vehicleData.price : 0;

    // 2. Lógica para gerar a coordenada do destino
    // Se tivermos a localização do usuário, criamos um ponto próximo (+0.005 graus)
    // Se não, usamos um fallback (Marco Zero Recife)
    const baseLat = myLocation?.coords.latitude ?? -8.063169;
    const baseLng = myLocation?.coords.longitude ?? -34.871139;

    const fakeDestinationCoords = {
      latitude: baseLat + 0.005, 
      longitude: baseLng + 0.005, 
    };

    // 3. AGORA PASSAMOS OS 4 ARGUMENTOS CORRETAMENTE
    createOrder(selectedVehicle, price, destinationText, fakeDestinationCoords); 

    Alert.alert('Sucesso', 'Seu pedido foi enviado para a rede de transportadores!');
    
    // Resetar tudo
    setStep('idle');
    setSelectedVehicle(null);
    setDestinationText('');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.mapContainer}>
        <AppMap />
        
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={signOut}
          activeOpacity={0.8}
        >
          <FontAwesome5 name="sign-out-alt" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSheet}>
        
        {step === 'idle' && (
          <>
            <ThemedText type="subtitle" style={{marginBottom: 10, color: '#333'}}>Para onde vamos?</ThemedText>
            <TouchableOpacity 
              style={styles.inputPlaceholder}
              onPress={handleDestinationPress}
              activeOpacity={0.8}
            >
              <ThemedText style={{ color: '#333', fontWeight: '500' }}>
                📍 Tocar para inserir destino...
              </ThemedText>
            </TouchableOpacity>
          </>
        )}

        {step === 'input_address' && (
          <View>
            <ThemedText type="subtitle" style={{marginBottom: 10, color: '#333'}}>Digite o endereço</ThemedText>
            
            <TextInput
              style={styles.textInput}
              placeholder="Ex: Av. Paulista, 1000"
              placeholderTextColor="#999"
              value={destinationText}
              onChangeText={setDestinationText}
              autoFocus={true}
            />

            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={handleConfirmAddress}
            >
              <ThemedText style={styles.btnText}>CONFIRMAR ENDEREÇO</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setStep('idle')} style={{marginTop: 15, alignItems: 'center'}}>
              <ThemedText style={{color: '#333', fontWeight: '500'}}>Cancelar</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {step === 'selecting' && (
          <View>
            <View style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10}}>
              <FontAwesome5 name="map-marker-alt" size={16} color="#0a7ea4" style={{marginRight: 8}} />
              <ThemedText style={{color: '#333', fontWeight: '600'}} numberOfLines={1}>
                {destinationText}
              </ThemedText>
            </View>

            <VehicleSelector 
              selectedId={selectedVehicle} 
              onSelect={setSelectedVehicle} 
            />

            <TouchableOpacity 
              style={[styles.actionBtn, !selectedVehicle && styles.disabledBtn]}
              onPress={handleRequest}
              disabled={!selectedVehicle}
            >
              <ThemedText style={styles.btnText}>
                {selectedVehicle ? 'SOLICITAR VEÍCULO' : 'SELECIONE UM TIPO'}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setStep('input_address')} style={{marginTop: 15, alignItems: 'center'}}>
              <ThemedText style={{color: '#333', fontWeight: '500'}}>Voltar</ThemedText>
            </TouchableOpacity>
          </View>
        )}

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { flex: 1, position: 'relative' },
  
  logoutButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: '#ff4444',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 999,
  },

  bottomSheet: {
    backgroundColor: 'white',
    padding: 20,
    paddingBottom: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  
  textInput: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
    color: '#333',
    marginBottom: 10
  },

  inputPlaceholder: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  actionBtn: {
    backgroundColor: '#0a7ea4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledBtn: {
    backgroundColor: '#999',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});
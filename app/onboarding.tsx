import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Conectando Cargas',
    description: 'Encontre o veículo ideal para sua carga em segundos. De motos ágeis a caminhões pesados.',
    icon: 'truck-loading',
    color: '#0a7ea4'
  },
  {
    id: '2',
    title: 'Rastreio em Tempo Real',
    description: 'Acompanhe sua entrega no mapa, do momento da coleta até a assinatura final.',
    icon: 'map-marked-alt',
    color: '#2dbc00'
  },
  {
    id: '3',
    title: 'Pagamento Seguro',
    description: 'Transparência total. Motoristas recebem rápido e empresas controlam gastos.',
    icon: 'wallet',
    color: '#ff9800'
  }
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      // Finalizar Onboarding
      try {
        // Marcamos que o usuário já viu o onboarding
        await AsyncStorage.setItem('@logitech:hasSeenOnboarding', 'true');
        // Redireciona para o Login
        router.replace('/(auth)/login');
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSkip = async () => {
    try {
      // Marca que o usuário já viu o onboarding (mesmo pulando)
      await AsyncStorage.setItem('@logitech:hasSeenOnboarding', 'true');
      router.replace('/(auth)/login');
    } catch (e) {
      console.error(e);
      router.replace('/(auth)/login');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
        <ThemedText style={{color: '#999'}}>Pular</ThemedText>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={[styles.imageContainer, { backgroundColor: item.color + '20' }]}> 
              {/* O +20 adiciona transparência hexadecimal ao final da cor */}
              <FontAwesome5 name={item.icon} size={80} color={item.color} />
            </View>
            <ThemedText type="title" style={{textAlign: 'center', marginBottom: 10, color: '#333'}}>
              {item.title}
            </ThemedText>
            <ThemedText style={{textAlign: 'center', color: '#666', paddingHorizontal: 40}}>
              {item.description}
            </ThemedText>
          </View>
        )}
      />

      <View style={styles.footer}>
        {/* Indicadores (Bolinhas) */}
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.dot, 
                currentIndex === index && styles.dotActive
              ]} 
            />
          ))}
        </View>

        {/* Botão de Ação */}
        <TouchableOpacity style={styles.btn} onPress={handleNext}>
          <ThemedText style={styles.btnText}>
            {currentIndex === SLIDES.length - 1 ? 'COMEÇAR AGORA' : 'PRÓXIMO'}
          </ThemedText>
          <FontAwesome5 
            name={currentIndex === SLIDES.length - 1 ? "check" : "arrow-right"} 
            size={16} 
            color="#fff" 
          />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  skipBtn: { position: 'absolute', top: 60, right: 30, zIndex: 10 },
  
  slide: { width: width, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 },
  imageContainer: {
    width: 200, height: 200, borderRadius: 100,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 40
  },

  footer: {
    position: 'absolute', bottom: 50, left: 0, right: 0,
    alignItems: 'center', paddingHorizontal: 30
  },
  
  pagination: { flexDirection: 'row', gap: 8, marginBottom: 30 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ddd' },
  dotActive: { width: 24, backgroundColor: '#0a7ea4' },

  btn: {
    backgroundColor: '#0a7ea4', width: '100%', height: 56, borderRadius: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
    shadowColor: '#0a7ea4', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, elevation: 5
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});
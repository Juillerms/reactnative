import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { VEHICLES } from '@/constants/mockData';
import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function VehicleSelector({ selectedId, onSelect }: Props) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.header}>Escolha o veículo</ThemedText>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
        {VEHICLES.map((vehicle) => {
          const isSelected = selectedId === vehicle.id;
          
          return (
            <TouchableOpacity 
              key={vehicle.id} 
              onPress={() => onSelect(vehicle.id)}
              activeOpacity={0.7}
              style={[
                styles.card, 
                isSelected && styles.cardSelected
              ]}
            >
              <View style={styles.iconContainer}>
                <FontAwesome5 
                  name={vehicle.icon} 
                  size={24} 
                  color={isSelected ? '#fff' : '#0a7ea4'} 
                />
              </View>
              
              <View>
                {/* Título: Usei uma cor explícita para garantir contraste */}
                <ThemedText type="defaultSemiBold" style={{color: isSelected ? '#fff' : '#111'}}>
                  {vehicle.title}
                </ThemedText>
                
                <ThemedText style={[styles.price, isSelected ? {color: '#fff'} : {color: '#0a7ea4'}]}>
                  R$ {vehicle.price.toFixed(2)}
                </ThemedText>
                
                {/* MUDANÇA AQUI: Cinza #444 muito mais escuro para leitura */}
                <ThemedText style={[styles.capacity, isSelected ? {color: '#e0e0e0'} : {color: '#444'}]}>
                  {vehicle.capacity}
                </ThemedText>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    backgroundColor: 'transparent'
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 10,
    color: '#333333',
  },
  list: {
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    width: 140,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff', 
    borderWidth: 1,
    borderColor: '#ccc', // Borda mais escura para contraste
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, // Sombra um pouco mais forte
    shadowRadius: 4,
    elevation: 4,
  },
  cardSelected: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  iconContainer: {
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  capacity: {
    fontSize: 13, // Aumentei levemente a fonte
    fontWeight: '500', // Um pouco mais de peso na fonte
  }
});
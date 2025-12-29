import { VEHICLES } from '@/constants/mockData';
import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function VehicleSelector({ selectedId, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.title}>Escolha o porte:</ThemedText>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {VEHICLES.map((vehicle) => {
          const isSelected = selectedId === vehicle.id;
          
          return (
            <TouchableOpacity
              key={vehicle.id}
              style={[
                styles.card,
                isSelected && styles.cardSelected
              ]}
              onPress={() => onSelect(vehicle.id)}
              activeOpacity={0.7}
            >
              {/* Ícone com Círculo de Fundo */}
              <View style={[styles.iconCircle, isSelected && { backgroundColor: '#e1f5fe' }]}>
                <FontAwesome5 
                  name={vehicle.id === 'moto' ? 'motorcycle' : 'truck'} 
                  size={24} 
                  color={isSelected ? '#0a7ea4' : '#999'} 
                />
              </View>

              <View style={styles.info}>
                <ThemedText style={[styles.vehicleName, isSelected && { color: '#0a7ea4', fontWeight: 'bold' }]}>
                  {vehicle.title}
                </ThemedText>
                <ThemedText style={styles.price}>
                  R$ {vehicle.price.toFixed(2)}
                </ThemedText>
                <ThemedText style={styles.capacity}>
                  até {vehicle.capacity}kg
                </ThemedText>
              </View>
              
              {/* Checkbox Visual */}
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  title: { marginBottom: 12, color: '#333', paddingHorizontal: 4 },
  scrollContent: { paddingRight: 20, paddingBottom: 10 }, // Espaço para sombra não cortar
  
  card: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    // Sombra suave
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 180
  },
  cardSelected: {
    borderColor: '#0a7ea4',
    backgroundColor: '#fbfdfd'
  },
  
  iconCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8
  },
  
  info: { alignItems: 'center' },
  vehicleName: { fontSize: 14, color: '#666', marginBottom: 4, textAlign: 'center' },
  price: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  capacity: { fontSize: 10, color: '#999', marginTop: 2 },

  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#ddd',
    marginTop: 10,
    justifyContent: 'center', alignItems: 'center'
  },
  radioSelected: { borderColor: '#0a7ea4' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0a7ea4' }
});
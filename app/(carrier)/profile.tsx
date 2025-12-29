import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // <--- Importante
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function CarrierProfile() {
  const router = useRouter();
  const { userProfile, updateProfile } = useAuth();
  
  // Estados locais para edição
  const [name, setName] = useState(userProfile.name);
  const [plate, setPlate] = useState(userProfile.licensePlate);
  const [photo, setPhoto] = useState(userProfile.photoUri);

  const pickImage = async () => {
    // Pede permissão e abre a galeria
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Força formato quadrado
      quality: 0.5,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    updateProfile({
      name,
      licensePlate: plate,
      photoUri: photo
    });
    Alert.alert("Sucesso", "Perfil atualizado!");
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome5 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <ThemedText type="title" style={{color: '#333'}}>Editar Perfil</ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Foto Avatar */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarBtn}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <FontAwesome5 name="user" size={40} color="#ccc" />
              </View>
            )}
            <View style={styles.cameraBadge}>
              <FontAwesome5 name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <ThemedText style={{color: '#666', marginTop: 10}}>Toque para alterar foto</ThemedText>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <ThemedText type="defaultSemiBold" style={{color: '#333', marginBottom: 5}}>Nome Completo</ThemedText>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Seu nome"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="defaultSemiBold" style={{color: '#333', marginBottom: 5}}>Placa do Veículo</ThemedText>
            <TextInput
              style={styles.input}
              value={plate}
              onChangeText={setPlate}
              placeholder="ABC-1234"
              placeholderTextColor="#999"
              autoCapitalize="characters"
            />
          </View>
        </View>

        {/* Botão Salvar */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <ThemedText style={styles.btnText}>SALVAR ALTERAÇÕES</ThemedText>
        </TouchableOpacity>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20, gap: 15 },
  backBtn: { padding: 8, borderRadius: 8, backgroundColor: '#f5f5f5' },
  content: { padding: 20, alignItems: 'center' },
  
  // Avatar Styles
  avatarContainer: { alignItems: 'center', marginBottom: 30 },
  avatarBtn: { position: 'relative' },
  avatarImage: { width: 120, height: 120, borderRadius: 60 },
  avatarPlaceholder: { 
    width: 120, height: 120, borderRadius: 60, 
    backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#ddd'
  },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#0a7ea4', width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#fff'
  },

  // Form Styles
  form: { width: '100%', gap: 20, marginBottom: 30 },
  inputGroup: {},
  input: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    fontSize: 16,
    color: '#333'
  },

  saveBtn: {
    backgroundColor: '#0a7ea4',
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
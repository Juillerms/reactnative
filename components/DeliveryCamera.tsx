import { FontAwesome5 } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Alert, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onPhotoTaken: (photoUri: string) => void;
}

export default function DeliveryCamera({ isVisible, onClose, onPhotoTaken }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <Modal visible={isVisible} animationType="slide">
        <View style={styles.container}>
          <Text style={styles.message}>Precisamos da sua permissão para mostrar a câmera</Text>
          <TouchableOpacity style={styles.btn} onPress={requestPermission}>
            <Text style={styles.btnText}>Conceder Permissão</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, {marginTop: 20, backgroundColor: '#666'}]} onPress={onClose}>
            <Text style={styles.btnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5,
          base64: false,
        });
        setPhoto(photo?.uri || null);
      } catch (e) {
        Alert.alert('Erro', 'Não foi possível tirar a foto');
      }
    }
  };

  const handleConfirm = () => {
    if (photo) {
      onPhotoTaken(photo);
      setPhoto(null);
    }
  };

  const handleRetake = () => {
    setPhoto(null);
  };

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        
        {photo ? (
          // --- MODO PREVIEW ---
          <View style={styles.previewContainer}>
            <Image source={{ uri: photo }} style={styles.previewImage} resizeMode="cover" />
            <View style={styles.previewControls}>
              <TouchableOpacity style={styles.retakeBtn} onPress={handleRetake}>
                <FontAwesome5 name="redo" size={20} color="#fff" />
                <Text style={styles.btnText}>Tirar Outra</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                <FontAwesome5 name="check" size={20} color="#fff" />
                <Text style={styles.btnText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // --- MODO CÂMERA (CORRIGIDO) ---
          <View style={{flex: 1}}>
            <CameraView style={StyleSheet.absoluteFill} facing="back" ref={cameraRef} />
            
            {/* Overlay agora está FORA do CameraView */}
            <View style={styles.overlay}>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <FontAwesome5 name="times" size={24} color="#fff" />
              </TouchableOpacity>
              
              <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.shutterBtn} onPress={takePicture}>
                  <View style={styles.shutterInner} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  message: { textAlign: 'center', paddingBottom: 10, color: '#fff' },
  
  // Overlay
  overlay: { 
    flex: 1, 
    justifyContent: 'space-between', 
    padding: 20,
    zIndex: 1 // Garante que fique por cima da câmera
  },
  closeBtn: { alignSelf: 'flex-end', marginTop: 40, padding: 10 },
  bottomBar: { alignItems: 'center', marginBottom: 30 },
  shutterBtn: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 5, borderColor: '#fff',
    justifyContent: 'center', alignItems: 'center'
  },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff' },

  // Preview
  previewContainer: { flex: 1, justifyContent: 'flex-end' },
  previewImage: { ...StyleSheet.absoluteFillObject },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingBottom: 50
  },
  retakeBtn: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 15 },
  confirmBtn: { 
    flexDirection: 'row', gap: 10, alignItems: 'center', 
    backgroundColor: '#2dbc00', padding: 15, borderRadius: 8 
  },
  btn: { padding: 15, backgroundColor: '#0a7ea4', borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
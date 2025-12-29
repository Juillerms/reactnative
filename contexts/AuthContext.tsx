import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

export interface UserProfile {
  name: string;
  licensePlate: string;
  photoUri: string | null;
}

interface AuthContextType {
  userType: 'company' | 'carrier' | null;
  userProfile: UserProfile;
  signIn: (type: 'company' | 'carrier') => void;
  signOut: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  isLoading: boolean; // Novo estado para evitar "flicker" na tela
}

const STORAGE_KEY = '@logitech:user_profile';

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: PropsWithChildren) {
  const [userType, setUserType] = useState<'company' | 'carrier' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Motorista Parceiro',
    licensePlate: 'ABC-1234',
    photoUri: null,
  });

  // 1. CARREGAR DO DISCO AO INICIAR
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const storedProfile = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      }
    } catch (e) {
      console.error('Falha ao carregar perfil', e);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. SALVAR NO DISCO
  const saveProfile = async (profile: UserProfile) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Falha ao salvar perfil', e);
    }
  };

  const signIn = (type: 'company' | 'carrier') => {
    setUserType(type);
  };

  const signOut = () => {
    setUserType(null);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const newProfile = { ...prev, ...data };
      saveProfile(newProfile); // Persiste a mudança
      return newProfile;
    });
  };

  return (
    <AuthContext.Provider value={{ userType, userProfile, signIn, signOut, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
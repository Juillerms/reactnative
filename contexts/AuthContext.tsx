// contexts/AuthContext.tsx
import React, { createContext, PropsWithChildren, useContext, useState } from 'react';

type UserType = 'company' | 'carrier' | null;

interface AuthContextType {
  userType: UserType;
  signIn: (type: UserType) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  userType: null,
  signIn: () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [userType, setUserType] = useState<UserType>(null);

  const signIn = (type: UserType) => {
    // Aqui viria a lógica real de API e Token
    setUserType(type);
  };

  const signOut = () => {
    setUserType(null);
  };

  return (
    <AuthContext.Provider value={{ userType, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
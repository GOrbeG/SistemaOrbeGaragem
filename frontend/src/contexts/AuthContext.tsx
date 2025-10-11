import React, { createContext, useContext, useState, ReactNode } from 'react';

// 1. Definir o formato dos dados do usuário
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  address: string;
  avatarUrl: string;
}

// 2. Definir o que o nosso contexto vai fornecer
interface AuthContextType {
  user: User | null; // O usuário pode não estar logado, por isso 'null'
  login: (userData: User) => void; // Função para simular o login
  logout: () => void; // Função para fazer logout
}

// 3. Criar o Contexto com um valor padrão
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

// 4. Criar o "Provedor" - o componente que vai envolver nosso App
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    // Tenta carregar dados do usuário do localStorage para manter o login
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  });

  // Função de login (que você chamará na sua página de Login)
  const login = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData)); // Salva no navegador
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user'); // Remove do navegador
    setUser(null);
  };
  
  // O valor que será compartilhado com todos os componentes filhos
  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 5. Criar um "Hook" customizado para facilitar o uso do contexto
export function useAuth() {
  return useContext(AuthContext);
}
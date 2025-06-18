// frontend/src/services/authService.ts
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = import.meta.env.VITE_API_URL;

// --- MUDANÇA 1: Padronizar a interface para usar 'role' ---
interface DecodedUser {
  id: number;
  nome: string;
  email: string;
  role: 'cliente' | 'funcionario' | 'administrador';
}

export interface UserData {
  id: number;
  nome: string;
  email: string;
  role: DecodedUser['role'];
}

interface LoginResponse {
  token: string;
  usuario: DecodedUser;
}

// Interface dos dados do formulário de cadastro
export interface CadastroData extends Omit<UserData, 'id'> {
  senha: string;
  cpf: string;
  foto?: File;
}

/**
 * Faz login, salva o token e os dados do usuário
 */
export const login = async (
  email: string,
  senha: string
): Promise<LoginResponse> => {
  const { data } = await axios.post<LoginResponse>(
    `${API_URL}/api/login`,
    { email, senha }
  );
  if (data.token && data.usuario) {
    salvarAuth(data.token, data.usuario);
  }
  return data;
};

/**
 * Realiza o cadastro de um novo cliente
 */
export const cadastrar = async (formData: FormData) => {
  // --- MUDANÇA 2: Corrigir a URL para a rota pública de registro ---
  const response = await axios.post(`${API_URL}/api/auth/register`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
  return response.data;
};

// Salva o token e os dados do usuário no localStorage
export const salvarAuth = (
  token: string,
  usuario: DecodedUser
): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
};

// Lê o token do localStorage
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Lê e decodifica o token para obter os dados do usuário
export const getUserDataFromToken = (): UserData | null => {
  const token = getToken();
  if (!token) return null;

  try {
    // --- MUDANÇA 3: Ler 'decoded.role' em vez de 'decoded.papel' ---
    const decoded = jwtDecode<DecodedUser>(token);
    return {
      id: decoded.id,
      nome: decoded.nome,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (err) {
    console.error('Erro ao decodificar token:', err);
    // Limpa o token inválido para evitar loops de erro
    logout();
    return null;
  }
};

// Realiza o logout, limpando o localStorage
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
};
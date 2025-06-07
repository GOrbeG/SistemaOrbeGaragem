// frontend/src/services/authService.ts
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = '/api'; // ajuste conforme seu backend

// Tipos internos para decodificação do token JWT
interface DecodedUser {
  id: number;
  nome: string;
  email: string;
  papel: 'cliente' | 'funcionario' | 'administrador';
}

/**
 * Dados de usuário expostos nas APIs do frontend
 */
export interface UserData {
  id: number;
  nome: string;
  email: string;
  role: DecodedUser['papel'];
}

/**
 * Resposta esperada do endpoint de login
 */
interface LoginResponse {
  token: string;
  usuario: DecodedUser;
}

/**
 * Faz login e retorna token + dados do usuário
 */
export const login = async (
  email: string,
  senha: string
): Promise<LoginResponse> => {
  const { data } = await axios.post<LoginResponse>(
    `${API_URL}/login`,
    { email, senha }
  );
  return data;
};

// Interface dos dados de cadastro
interface CadastroData {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  role: 'cliente' | 'funcionario' | 'administrador';
  foto?: string;
}

// Interface dos dados do usuário extraídos do token
interface DecodedToken {
  id: number;
  nome: string;
  email: string;
  role: string;
  foto?: string;
  iat: number;
  exp: number;
}

// Lê token salvo e retorna ou null
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Realiza o cadastro
export const cadastrar = async (data: CadastroData) => {
  const response = await axios.post(`${API_URL}/usuarios`, data);
  return response.data;
};

// Salva token + dados no localStorage
enum StorageKey {
  TOKEN = 'token',
  USUARIO = 'usuario'
}
export const salvarAuth = (
  token: string,
  usuario: DecodedUser
): void => {
  localStorage.setItem(StorageKey.TOKEN, token);
  localStorage.setItem(StorageKey.USUARIO, JSON.stringify(usuario));
};

// Lê token e retorna o objeto decodificado ou null
export const getUserDataFromToken = (): UserData| null => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedUser>(token);
    return {
      id: decoded.id,
      nome: decoded.nome,
      email: decoded.email,
      role: decoded.papel,
    };
  } catch (err) {
    console.error('Erro ao decodificar token:', err);
    return null;
  }
};

// Realiza logout
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
};

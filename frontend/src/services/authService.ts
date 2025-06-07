// frontend/src/services/authService.ts
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = '/api'; // ajuste conforme seu backend

// Interface dos dados de autenticação
interface LoginResponse {
  token: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
    papel: string;
  };
}

// Interface dos dados de cadastro
interface CadastroData {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  papel: 'cliente' | 'funcionario' | 'administrador';
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

// Realiza o login
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

// Realiza o cadastro
export const cadastrar = async (data: CadastroData) => {
  const response = await axios.post(`${API_URL}/usuarios`, data);
  return response.data;
};

// Salva token + dados no localStorage
export const salvarAuth = (token: string, usuario: LoginResponse['usuario']) => {
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
};

// Lê token do localStorage e retorna o objeto decodificado
export const getUserDataFromToken = (): {
  id: number;
  nome: string;
  email: string;
  papel: string;
} | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    return jwtDecode(token);
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

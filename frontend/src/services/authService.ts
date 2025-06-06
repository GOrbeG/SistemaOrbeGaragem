// frontend/src/services/authService.ts
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:3000/api'; // ajuste conforme seu backend

// Interface dos dados de autenticação
interface LoginData {
  email: string;
  senha: string;
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
export const login = async (cpf: string, senha: string) => {
  const response = await axios.post(`${API_URL}/login`, { cpf, senha });
  const token = response.data.token;
  localStorage.setItem('token', token);
  return response.data; // deve conter { token, usuario }
};

// Realiza o cadastro
export const cadastrar = async (data: CadastroData) => {
  const response = await axios.post(`${API_URL}/usuarios`, data);
  return response.data;
};

// Retorna o token armazenado
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Decodifica o token para extrair os dados do usuário
export const getUserDataFromToken = (): DecodedToken | null => {
  const token = getToken();
  if (!token) return null;

  try {
    // Note que agora chamamos jwtDecode, não jwt_decode
    const decoded = jwtDecode(token) as DecodedToken;
    return decoded;
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    return null;
  }
};

// Realiza logout
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
};

// frontend/src/services/authService.ts
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = '/api'; // ajuste conforme seu backend

// Interface dos dados retornados pelo login
type LoginResponse = {
  token: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
    papel: 'cliente' | 'funcionario' | 'administrador';
  };
};

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

// Faz login e retorna o token + usuário
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
  usuario: LoginResponse['usuario']
): void => {
  localStorage.setItem(StorageKey.TOKEN, token);
  localStorage.setItem(StorageKey.USUARIO, JSON.stringify(usuario));
};

// Lê token e retorna o objeto decodificado ou null
export const getUserDataFromToken = (): LoginResponse['usuario'] | null => {
  const token = getToken();
  if (!token) return null;

  try {
    return jwtDecode<LoginResponse['usuario']>(token);
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

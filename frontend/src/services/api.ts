// frontend/src/services/api.ts
import axios from 'axios';
import { getToken } from './authService'; // Supondo que você tenha essa função

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Sua variável de ambiente para a URL da API
});

// "Interceptador" de requisições: Este código roda ANTES de cada chamada da API
api.interceptors.request.use(
  async (config) => {
    const token = getToken(); // Pega o token do localStorage
    if (token) {
      // Se o token existir, adiciona o cabeçalho de autorização
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // Continua com a requisição
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { api };
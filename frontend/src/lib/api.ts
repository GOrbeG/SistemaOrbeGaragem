import axios from 'axios';

// Cria uma instância do axios
const api = axios.create({
  baseURL: '/api', // O proxy no vite.config.js já redireciona isso para o seu backend
});

// Isso é um "interceptor". Ele "intercepta" toda requisição antes de ela ser enviada.
api.interceptors.request.use(
  (config) => {
    // Pega o token que salvamos no localStorage durante o login
    const token = localStorage.getItem('token');
    if (token) {
      // Se o token existir, adiciona ao cabeçalho de autorização
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
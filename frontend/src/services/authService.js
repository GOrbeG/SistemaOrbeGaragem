// frontend/src/services/authService.ts
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
const API_URL = 'http://localhost:3000/api'; // ajuste conforme seu backend
// Realiza o login
export const login = async (cpf, senha) => {
    const response = await axios.post(`${API_URL}/login`, { cpf, senha });
    const token = response.data.token;
    localStorage.setItem('token', token);
    return response.data; // deve conter { token, usuario }
};
// Realiza o cadastro
export const cadastrar = async (data) => {
    const response = await axios.post(`${API_URL}/usuarios`, data);
    return response.data;
};
// Retorna o token armazenado
export const getToken = () => {
    return localStorage.getItem('token');
};
// Decodifica o token para extrair os dados do usuário
export const getUserDataFromToken = () => {
    const token = getToken();
    if (!token)
        return null;
    try {
        // Note que agora chamamos jwtDecode, não jwt_decode
        const decoded = jwtDecode(token);
        return decoded;
    }
    catch (error) {
        console.error('Erro ao decodificar token:', error);
        return null;
    }
};
// Realiza logout
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
};

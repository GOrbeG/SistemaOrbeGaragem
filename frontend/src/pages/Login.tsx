// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '@/services/authService';
import logo from '../assets/logo2.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await login(email, senha);
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      navigate('/menu');
    } catch (err: any) {
      setErro(err.response?.data?.error || 'Erro ao fazer login');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo e título */}
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Logo Orbe Garage" className="h-16 mb-2" />
          <h2 className="text-3xl font-semibold text-white">Login</h2>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleLogin}
          className="bg-gray-800 px-6 py-6 rounded-lg shadow-md space-y-4"
        >
          {erro && (
            <p className="text-red-500 text-sm text-center">{erro}</p>
          )}

          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white font-medium rounded hover:bg-blue-600 transition"
          >
            Entrar
          </button>

          <p className="text-center text-sm">
            <Link
              to="/register"
              className="text-blue-400 hover:underline"
            >
              cadastrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

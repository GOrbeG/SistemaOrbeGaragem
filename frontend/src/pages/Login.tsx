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
    <div className="flex h-screen items-center justify-center bg-[#2e2e2e]">
      <div className="w-full max-w-sm px-4">
        {/* Logo e título */}
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Logo Orbe Garage" className="h-20 mb-4" />
          <h2 className="text-4xl font-semibold text-white">Login</h2>
        </div>

        {/* Formulário */}
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg">
          {erro && <p className="text-red-600 mb-4 text-center">{erro}</p>}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-white text-[#1b75bb] font-medium py-2 rounded-full hover:bg-gray-100 transition"
          >
            Entrar
          </button>

          <p className="mt-4 text-center">
            <Link to="/register" className="text-blue-400 hover:underline">
              cadastrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

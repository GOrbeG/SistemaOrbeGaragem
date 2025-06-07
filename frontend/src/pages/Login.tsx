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
    <div className="flex items-center justify-center min-h-screen bg-[#2e2e2e] px-4">
      <div className="w-full max-w-xs">
        {/* Logo e Título */}
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Logo Orbe Garage" className="h-24 mb-4" />
          <h2 className="text-3xl font-semibold text-white">Login</h2>
        </div>

        {/* Formulário sem card branco */}
        <form onSubmit={handleLogin} className="space-y-4">
          {erro && (
            <p className="text-red-500 text-center text-sm">{erro}</p>
          )}

          <div>
            <label className="block text-sm text-white mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email"
              className="w-full h-9 px-2 bg-white rounded focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-white mb-1">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="senha"
              className="w-full h-9 px-2 bg-white rounded focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full h-9 bg-[#1b75bb] text-white font-medium rounded"
          >
            Entrar
          </button>

          <p className="text-center">
            <Link to="/register" className="text-[#1b75bb]">
              cadastrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

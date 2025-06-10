// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, salvarAuth } from '@/services/authService';
import logo from '../assets/logologin.png';
import backgroundImage from '../assets/loginpage.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { token, usuario } = await login(email, senha);
      salvarAuth(token, usuario);
      navigate('/menu');
    } catch (err: any) {
      setErro(err.response?.data?.error || 'Erro ao fazer login');
    }
  };

  return (
    // Container principal com a imagem de fundo
    <div
      className="flex min-h-screen w-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Container para todo o conteúdo da página */}
      <div className="flex flex-col flex-1 p-8 sm:p-12">
        {/* Header com a logo e o link de cadastro */}
        <header className="flex justify-between items-center w-full">
          <img src={logo} alt="Logo Orbe" className="h-10 w-auto" />
          <Link to="/cadastro" className="text-[#e7933b] text-lg font-semibold hover:underline">
            cadastrar
          </Link>
        </header>

        {/* Container do formulário, centralizado */}
        <main className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm">
            {/* Título "Login" */}
            <h2 className="text-6xl font-bold text-[#e7933b] text-center mb-10">
              Login
            </h2>

            {/* Formulário */}
            <form onSubmit={handleLogin} className="space-y-6">
              {erro && (
                <p className="text-red-500 text-center text-sm font-semibold bg-red-100 p-2 rounded">
                  {erro}
                </p>
              )}

              {/* Campo de Email */}
              <div>
                <label className="block text-lg font-medium text-[#2e2e2e] mb-1">
                  email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-60 h-12 px-4 bg-[#e7933b] text-black rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                  required
                />
              </div>

              {/* Campo de Senha */}
              <div>
                <label className="block text-lg font-medium text-[#2e2e2e] mb-1">
                  senha
                </label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-60 h-12 px-4 bg-[#ffffff] text-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#e7933b]"
                  required
                />
              </div>

              {/* Botão de Entrar */}
              <button
                type="submit"
                // Estilo do gradiente e outros
                style={{ backgroundImage: 'linear-gradient(to right, #ffde59, #ff914d)' }}
                className="w-40 h-12 text-[#2e2e2e] text-xl font-bold rounded-md hover:opacity-90 transition-opacity"
              >
                Entrar
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

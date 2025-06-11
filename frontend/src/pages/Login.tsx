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
          <img src={logo} alt="Logo Orbe" className="h-10 w-auto translate-x-[50px]" />
          <Link to="/cadastro" className="text-[#e7933b] text-lg font-semibold hover:underline -translate-x-[60px]">
            cadastrar
          </Link>
        </header>

        {/* Container do formulário, centralizado */}
        <main className="flex-1 flex items-center justify-center">
          <div className="w-100 max-w-sm">
            {/* Título "Login" */}
            <h2 className="text-[5rem] font-extrabold text-[#e7933b] text-center mb-10 -translate-y-[100px]">
              Login
            </h2>

            {/* Formulário */}
            <form onSubmit={handleLogin} className="space-y-8 flex flex-col items-center">
              {erro && (
                <p className="text-red-500 text-center text-sm font-semibold bg-red-100 p-2 rounded">
                  {erro}
                </p>
              )}

              {/* Campo de Email */}
              <div className="w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email" // <-- Palavra "email" agora está aqui
                  className="w-90 h-20 px-6 bg-[#e7933b] text-black rounded-md focus:outline-none focus:ring-2 focus:ring-white -translate-y-[120px]"
                  required
                />
              </div>

              {/* Campo de Senha */}
              <div className="w-full">
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="senha" // <-- Palavra "senha" agora está aqui
                  className="w-90 h-20 px-6 bg-[#ffffff] text-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#e7933b] -translate-y-[100px]"
                  required
                />
              </div>

              {/* Botão de Entrar */}
              <button
                type="submit"
                // Estilo do gradiente e outros
                style={{ backgroundImage: 'linear-gradient(to right, #ffde59, #ff914d)' }}
                className="w-55 h-40 text-[#2e2e2e] text-xl font-bold rounded-xl hover:opacity-90 transition-opacity -translate-y-[88px] translate-x-[50px] shadow-lg shadow-orange-400/50 hover:scale-105 hover:shadow-xl transition-all duration-300 ease-in-out"
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

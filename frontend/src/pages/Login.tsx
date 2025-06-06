// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/services/authService';


export default function Login() {
  const [email, setCpf] = useState('');
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
    <div className="flex h-screen items-center justify-center bg-[#d1d1d1]">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-[#1b75bb] text-center">Login - Orbe Garage</h2>
        {erro && <p className="text-red-600 mb-4 text-center">{erro}</p>}

        <div className="mb-4">
          <label className="block text-sm text-gray-700">CPF</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setCpf(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-700">Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#1b75bb] text-white p-2 rounded hover:bg-[#5a9ec9] transition"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}

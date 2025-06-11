// src/pages/Cadastro.tsx
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logologin.png';
import backgroundImage from '../assets/cadastropage.png';

interface FormData {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  role: 'cliente' | 'funcionario';
  foto?: FileList;
}

export default function Cadastro() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const [foto, setFoto] = useState<File | null>(null);
  const navigate = useNavigate();

  const validarCPF = (cpf: string) => {
    const regex = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;
    return regex.test(cpf);
  };

  const onSubmit = async (data: FormData) => {
    if (!validarCPF(data.cpf)) {
      alert('CPF inválido. Use o formato 000.000.000-00.');
      return;
    }

    const formData = new FormData();
    formData.append('nome', data.nome);
    formData.append('email', data.email);
    formData.append('senha', data.senha);
    formData.append('cpf', data.cpf);
    formData.append('role', data.role);
    if (foto) {
      formData.append('foto', foto);
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      await axios.post(`${API_URL}/api/usuarios/novo`, formData, { // Adicione /novo no final
      headers: { 'Content-Type': 'multipart/form-data' },
    });
      navigate('/login');
    } catch (error) {
      alert('Erro ao cadastrar.');
    }
  };

  return (
      // Container principal com imagem de fundo
      <div
        className="flex flex-col min-h-screen w-full bg-cover bg-center bg-[#2e2e2e] p-8 sm:p-12"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {/* Header */}
        <header className="flex justify-between items-center w-full shadow-md px-8 sm:px-12 py-4">
          <div className="flex items-center space-x-4">
            <img src={logo} alt="Logo Orbe" className="h-10 w-auto" />
            <span className="text-[#053255] text-[5rem] font-semibold">Orbe Garagem</span>
          </div>
          <Link to="/login">
            <button
              style={{ backgroundColor: '#e7933b' }}
              className="px-6 py-2 text-[#2e2e2e] text-lg font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              Entrar
            </button>
          </Link>
        </header>
  
        {/* Main: Título e Formulário */}
        <main className="flex-1 flex flex-col items-center justify-center text-white">
          <h2 className="text-[5rem] text-[#ffffff] font-extrabold mb-12 -translate-y-[80px]">Cadastrar</h2>
  
          <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-4xl">
            {/* Layout em Grid para os campos do formulário */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
              
              {/* Coluna da Esquerda */}
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-medium mb-1">Nome</label>
                  <input {...register('nome', { required: true })} className="w-60 h-12 px-4 bg-white text-black rounded-md" />
                </div>
                <div>
                  <label className="block text-lg font-medium mb-1">Email</label>
                  <input {...register('email', { required: true })} type="email" className="w-60 h-12 px-4 bg-white text-black rounded-md" />
                </div>
                <div>
                  <label className="block text-lg font-medium mb-1">Senha</label>
                  <input {...register('senha', { required: true })} type="password" className="w-60 h-12 px-4 bg-white text-black rounded-md" />
                </div>
                <div>
                  <label className="block text-lg font-medium mb-1">CPF</label>
                  <input {...register('cpf', { required: true })} placeholder="000.000.000-00" className="w-60 h-12 px-4 bg-white text-black rounded-md" />
                </div>
              </div>
  
              {/* Coluna da Direita */}
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-medium mb-1">Foto</label>
                  <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} className="w-60 text-sm" />
                </div>
                <div>
                  <label className="block text-lg font-medium mb-1">Função</label>
                  <select {...register('role', { required: true })} className="w-60 h-12 px-4 bg-white text-black rounded-md">
                    <option value="cliente">Cliente</option>
                    <option value="funcionario">Funcionário</option>
                  </select>
                </div>
              </div>
            </div>
  
            {/* Botão de Cadastro Centralizado */}
            <div className="flex justify-center mt-12">
              <button
                type="submit"
                style={{ backgroundColor: '#e7933b' }}
                className="px-12 py-3 text-[#2e2e2e] text-xl font-bold rounded-lg hover:opacity-90 transition-opacity"
              >
                cadastrar
              </button>
            </div>
          </form>
        </main>
      </div>
    );
  }
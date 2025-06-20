// src/pages/Cadastro.tsx
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logologin.png';
import backgroundImage from '../assets/cadastropage.png';

// --- MUDANÇA 1: A "PLANTA" DO FORMULÁRIO ---
// Altere a propriedade 'papel' para 'role' para que corresponda ao resto do código.
interface FormData {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  role: 'cliente' | 'funcionario' | 'administrador'; // <- MUDANÇA AQUI
  foto?: FileList;
}

export default function Cadastro() {
  const {
    register,
    handleSubmit,
  } = useForm<FormData>();

  const navigate = useNavigate();

  const validarCPF = (cpf: string) => {
    const regex = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;
    return regex.test(cpf);
  };

  const onSubmit = async (data: FormData) => {
    // A validação e limpeza do CPF já estão corretas!
    if (!validarCPF(data.cpf)) {
      alert('CPF inválido. Use o formato 000.000.000-00.');
      return;
    }
    const cpfLimpo = data.cpf.replace(/[^\d]/g, '');

    const formData = new FormData();
    formData.append('nome', data.nome);
    formData.append('email', data.email);
    formData.append('senha', data.senha);
    formData.append('cpf', cpfLimpo);
    formData.append('role', data.role); // Agora data.role existe e será enviado corretamente
    
    if (data.foto && data.foto[0]) {
      formData.append('foto', data.foto[0]);
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      await axios.post(`${API_URL}/api/auth/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/login');
    } catch (error) {
      // --- CORREÇÃO APLICADA AQUI ---
      if (axios.isAxiosError(error)) {
        // Se for um erro do Axios, sabemos que ele tem `error.response.data`
        console.error("Erro do servidor:", error.response?.data);
        alert(`Erro ao cadastrar: ${error.response?.data?.error || 'Verifique os dados e tente novamente.'}`);
      } else {
        // Se for um erro genérico (ex: de rede)
        console.error("Erro inesperado:", error);
        alert('Ocorreu um erro inesperado. Verifique sua conexão.');
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#2e2e2e]">
      <header className="flex justify-between items-center w-full bg-white shadow-md px-8 sm:px-12 py-4">
        <div className="flex items-center space-x-4">
          <img src={logo} alt="Logo Orbe" className="h-10 w-auto" />
          <span className="text-gray-800 text-2xl font-semibold">Orbe Garagem</span>
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

      <div
        className="flex flex-col flex-1 p-8 sm:p-12 items-center justify-start bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          height: 'calc(100vh - 88px)',
        }}
      >
        <main className="flex flex-col items-center text-white w-full max-w-4xl">
          <h2 className="text-6xl font-extrabold mb-12">Cadastrar</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-6">
              
              {/* Coluna da Esquerda */}
              <div className="space-y-6 flex flex-col">
                <div>
                  <label className="block text-lg font-medium mb-1">Nome</label>
                  <input {...register('nome', { required: true })} className="w-full h-12 px-4 bg-white text-black rounded-md" />
                </div>
                <div>
                  <label className="block text-lg font-medium mb-1">Email</label>
                  <input {...register('email', { required: true })} type="email" className="w-full h-12 px-4 bg-white text-black rounded-md" />
                </div>
                <div>
                  <label className="block text-lg font-medium mb-1">Senha</label>
                  <input {...register('senha', { required: true })} type="password" className="w-full h-12 px-4 bg-white text-black rounded-md" />
                </div>
                <div>
                  <label className="block text-lg font-medium mb-1">CPF</label>
                  <input {...register('cpf', { required: true })} placeholder="000.000.000-00" className="w-full h-12 px-4 bg-white text-black rounded-md" />
                </div>
              </div>
  
              {/* Coluna da Direita */}
              <div className="space-y-6 flex flex-col">
                <div>
                  <label className="block text-lg font-medium mb-1">Foto</label>
                  <input type="file" accept="image/*" {...register('foto')} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-200 hover:file:bg-gray-300" />
                </div>
                <div>
                  <label className="block text-lg font-medium mb-1">Função</label>
                  {/* O registro do campo 'role' agora está correto */}
                  <select {...register('role', { required: true })} className="w-full h-12 px-4 bg-white text-black rounded-md">
                    <option value="cliente">Cliente</option>
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
    </div>
  );
}
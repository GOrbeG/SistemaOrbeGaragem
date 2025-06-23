// src/pages/Cadastro.tsx - VERSÃO COMPLETA E UNIFICADA
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/services/api'; // Usando nossa API centralizada
import logo from '../assets/logologin.png';
import backgroundImage from '../assets/cadastropage.png';
import { useState } from 'react';

// Interface com TODOS os campos do formulário
interface FormData {
  nome: string;
  email: string;
  senha: string;
  cpf_cnpj: string;
  telefone: string;
  data_nascimento?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

export default function Cadastro() {
  const { register, handleSubmit } = useForm<FormData>();
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setApiError('');
    try {
      // Chama a nova rota transacional do backend
      await api.post('/api/auth/register-client', data);
      alert('Cadastro realizado com sucesso! Você será redirecionado para a página de login.');
      navigate('/login');
    } catch (error: any) {
      console.error("Erro ao cadastrar:", error);
      setApiError(error.response?.data?.error || 'Não foi possível concluir o cadastro. Verifique os dados.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#2e2e2e]">
      <header className="flex justify-between items-center w-full bg-white shadow-md px-8 py-4">
        <img src={logo} alt="Logo Orbe" className="h-10 w-auto" />
        <Link to="/login">
          <button style={{ backgroundColor: '#e7933b' }} className="px-6 py-2 text-[#2e2e2e] font-bold rounded-lg hover:opacity-90">
            Entrar
          </button>
        </Link>
      </header>

      <div className="flex justify-center p-8 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <main className="bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-xl shadow-2xl p-8 w-full max-w-4xl">
          <h2 className="text-4xl font-extrabold mb-8 text-white text-center">Crie sua Conta na Orbe</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {apiError && <p className="bg-red-500/30 text-red-300 text-center text-sm p-3 rounded-md">{apiError}</p>}
            
            {/* Seção de Dados de Acesso e Pessoais */}
            <section>
              <h3 className="text-xl font-semibold text-white border-b border-gray-600 pb-2 mb-6">Dados de Acesso e Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input {...register('nome', { required: true })} placeholder="Nome Completo" className="h-12 px-4 bg-gray-700 text-white rounded-md border border-gray-600" />
                <input {...register('cpf_cnpj', { required: true })} placeholder="CPF ou CNPJ" className="h-12 px-4 bg-gray-700 text-white rounded-md border border-gray-600" />
                <input {...register('email', { required: true })} type="email" placeholder="E-mail" className="h-12 px-4 bg-gray-700 text-white rounded-md border border-gray-600" />
                <input {...register('senha', { required: true })} type="password" placeholder="Senha" className="h-12 px-4 bg-gray-700 text-white rounded-md border border-gray-600" />
                <input {...register('telefone', { required: true })} placeholder="Telefone / WhatsApp" className="h-12 px-4 bg-gray-700 text-white rounded-md border border-gray-600" />
                <div>
                  <label className="text-xs text-gray-400">Data de Nascimento</label>
                  <input {...register('data_nascimento')} type="date" className="w-full h-12 px-4 bg-gray-700 text-white rounded-md border border-gray-600" />
                </div>
              </div>
            </section>

            {/* Seção de Endereço */}
            <section>
              <h3 className="text-xl font-semibold text-white border-b border-gray-600 pb-2 mb-6">Endereço (Opcional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <input {...register('cep')} placeholder="CEP" className="md:col-span-1 h-12 px-4 bg-gray-700 text-white rounded-md border border-gray-600" />
                <input {...register('logradouro')} placeholder="Rua, Avenida, etc." className="md:col-span-2 h-12 px-4 bg-gray-700 text-white rounded-md border border-gray-600" />
                <input {...register('numero')} placeholder="Número" className="h-12 px-4 bg-gray-700 text-white rounded-md border border-gray-600" />
                <input {...register('bairro')} placeholder="Bairro" className="h-12 px-4 bg-gray-700 text-white rounded-md border border-gray-600" />
                <input {...register('cidade')} placeholder="Cidade" className="h-12 px-4 bg-gray-700 text-white rounded-md border border-gray-600" />
                <input {...register('estado')} placeholder="UF" maxLength={2} className="h-12 px-4 bg-gray-700 text-white rounded-md border border-gray-600" />
              </div>
            </section>
            
            <div className="flex justify-center pt-4">
              <button type="submit" style={{ backgroundColor: '#e7933b' }} className="px-12 py-3 text-[#2e2e2e] text-xl font-bold rounded-lg hover:opacity-90">
                Finalizar Cadastro
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
// src/pages/Cadastro.tsx
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface FormData {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  papel: 'cliente' | 'funcionario';
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
    formData.append('papel', data.papel);
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
    <div className="min-h-screen flex items-center justify-center bg-[#1b75bb]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center text-[#2e2e2e]">
          Cadastro
        </h2>

        <div>
          <input
            {...register('nome', { required: 'Nome é obrigatório' })}
            placeholder="Nome"
            className="w-full border p-2 rounded"
          />
          {errors.nome && (
            <p className="text-red-500 text-sm">{errors.nome.message}</p>
          )}
        </div>

        <div>
          <input
            {...register('email', { required: 'Email é obrigatório' })}
            placeholder="Email"
            type="email"
            className="w-full border p-2 rounded"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            {...register('senha', { required: 'Senha é obrigatória' })}
            placeholder="Senha"
            type="password"
            className="w-full border p-2 rounded"
          />
          {errors.senha && (
            <p className="text-red-500 text-sm">{errors.senha.message}</p>
          )}
        </div>

        <div>
          <input
            {...register('cpf', { required: 'CPF é obrigatório' })}
            placeholder="CPF (000.000.000-00)"
            className="w-full border p-2 rounded"
          />
          {errors.cpf && (
            <p className="text-red-500 text-sm">{errors.cpf.message}</p>
          )}
        </div>

        <div>
          <select
            {...register('papel', { required: 'Selecione o papel' })}
            className="w-full border p-2 rounded"
          >
            <option value="">Selecione o papel</option>
            <option value="cliente">Cliente</option>
            <option value="funcionario">Funcionário</option>
          </select>
          {errors.papel && (
            <p className="text-red-500 text-sm">{errors.papel.message}</p>
          )}
        </div>

        <div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files?.[0] || null)}
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#1b75bb] text-white p-2 rounded hover:bg-[#2e2e2e]"
        >
          Cadastrar
        </button>
      </form>
    </div>
  );
}

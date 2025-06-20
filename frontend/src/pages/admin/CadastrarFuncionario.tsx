// src/pages/admin/CadastrarFuncionario.tsx
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import axios from 'axios';
import { getToken } from '@/services/authService'; // Precisamos do token do admin

// Interface para os dados do formulário do funcionário
interface FuncionarioFormData {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  foto?: FileList;
  cep: string;
  data_nascimento: string;
  cargo: string;
  setor: string;
  role: 'funcionario' | 'administrador'; // Admin pode criar outros admins ou funcionários
}

export default function CadastrarFuncionario() {
  const {
    register,
    handleSubmit,
  } = useForm<FuncionarioFormData>();

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const onSubmit = async (data: FuncionarioFormData) => {
    setErro('');
    setSucesso('');

    const formData = new FormData();
    formData.append('nome', data.nome);
    formData.append('email', data.email);
    formData.append('senha', data.senha);
    formData.append('cpf', data.cpf);
    formData.append('cep', data.cep);
    formData.append('data_nascimento', data.data_nascimento);
    formData.append('cargo', data.cargo);
    formData.append('setor', data.setor);
    formData.append('role', data.role); // O admin define o papel do novo usuário
    
    if (data.foto && data.foto[0]) {
      formData.append('foto', data.foto[0]);
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = getToken(); // Pega o token do admin logado

      await axios.post(`${API_URL}/api/usuarios/novo`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` // Envia o token para autorização
        },
      });

      setSucesso('Funcionário cadastrado com sucesso!');
      // Opcional: Redirecionar após um tempo
      // setTimeout(() => navigate('/admin/gerenciar-funcionarios'), 2000);

    } catch (error: any) {
      setErro(error.response?.data?.error || 'Erro desconhecido ao cadastrar.');
    }
  };

  // Os cargos e setores que você definiu
  const cargosDisponiveis = ['Auxiliar técnico em treinamento', 'Técnico Operacional', 'Técnico Especialista', 'Supervisor de Qualidade', 'Gestor de Unidade'];
  const setoresDisponiveis = ['Recursos Humanos', 'Serviços'];

  return (
    // Você pode criar um layout de admin aqui ou usar um simples container
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Cadastrar Novo Funcionário</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
        
        {/* Campos do formulário */}
        <input {...register('nome', { required: true })} placeholder="Nome Completo" className="w-full p-2 border rounded" />
        <input {...register('email', { required: true })} placeholder="E-mail" type="email" className="w-full p-2 border rounded" />
        <input {...register('senha', { required: true })} placeholder="Senha Provisória" type="password" className="w-full p-2 border rounded" />
        <input {...register('cpf', { required: true })} placeholder="CPF" className="w-full p-2 border rounded" />
        <input {...register('cep', { required: true })} placeholder="CEP" className="w-full p-2 border rounded" />
        <input {...register('data_nascimento', { required: true })} type="date" className="w-full p-2 border rounded" />
        
        <select {...register('cargo', { required: true })} className="w-full p-2 border rounded">
          <option value="">Selecione o Cargo</option>
          {cargosDisponiveis.map(cargo => <option key={cargo} value={cargo}>{cargo}</option>)}
        </select>

        <select {...register('setor', { required: true })} className="w-full p-2 border rounded">
          <option value="">Selecione o Setor</option>
          {setoresDisponiveis.map(setor => <option key={setor} value={setor}>{setor}</option>)}
        </select>
        
        {/* O admin pode definir o papel do novo usuário */}
        <select {...register('role', { required: true })} className="w-full p-2 border rounded">
            <option value="funcionario">Funcionário</option>
            <option value="administrador">Administrador</option>
        </select>

        <div>
          <label className="block text-sm font-medium text-gray-700">Foto de Perfil (Opcional)</label>
          <input type="file" {...register('foto')} className="w-full text-sm" />
        </div>

        {sucesso && <p className="text-green-600">{sucesso}</p>}
        {erro && <p className="text-red-600">{erro}</p>}

        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Cadastrar Funcionário
        </button>
      </form>
    </div>
  );
}
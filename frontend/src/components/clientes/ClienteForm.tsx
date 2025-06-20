// frontend/src/components/clientes/ClienteForm.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClienteFormData } from '@/pages/clientes/ClienteFormPage';

interface ClienteFormProps {
  initialData: ClienteFormData;
  onSubmit: (data: ClienteFormData) => void;
  isSubmitting: boolean;
  apiErrors: any[];
}

export default function ClienteForm({ initialData, onSubmit, isSubmitting, apiErrors }: ClienteFormProps) {
  const [formData, setFormData] = useState<ClienteFormData>(initialData);

  useEffect(() => {
    // Atualiza o formulário se os dados iniciais (para edição) forem carregados
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-8">
      {apiErrors.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erro!</strong>
          <ul className="mt-2 list-disc list-inside">
            {apiErrors.map((error, index) => <li key={index}>{error.msg}</li>)}
          </ul>
        </div>
      )}

      {/* Seção de Dados Pessoais */}
      <div className="border-b border-gray-900/10 pb-8">
        <h2 className="text-lg font-semibold leading-7 text-gray-900">Dados Pessoais</h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome Completo</label>
            <input type="text" name="nome" id="nome" value={formData.nome} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="tipo_pessoa" className="block text-sm font-medium text-gray-700">Tipo</label>
            <select name="tipo_pessoa" id="tipo_pessoa" value={formData.tipo_pessoa} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm bg-white">
              <option value="PF">Pessoa Física</option>
              <option value="PJ">Pessoa Jurídica</option>
            </select>
          </div>
          <div>
            <label htmlFor="cpf_cnpj" className="block text-sm font-medium text-gray-700">CPF/CNPJ</label>
            <input type="text" name="cpf_cnpj" id="cpf_cnpj" value={formData.cpf_cnpj} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">Telefone / WhatsApp</label>
            <input type="text" name="telefone" id="telefone" value={formData.telefone} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md shadow-sm" />
          </div>
           <div>
            <label htmlFor="data_nascimento" className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
            <input type="date" name="data_nascimento" id="data_nascimento" value={formData.data_nascimento} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm" />
          </div>
        </div>
      </div>
      
       {/* Seção de Endereço */}
       <div className="border-b border-gray-900/10 pb-8">
        <h2 className="text-lg font-semibold leading-7 text-gray-900">Endereço</h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
           <div>
            <label htmlFor="cep" className="block text-sm font-medium text-gray-700">CEP</label>
            <input type="text" name="cep" id="cep" value={formData.cep} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="logradouro" className="block text-sm font-medium text-gray-700">Logradouro (Rua, Av.)</label>
            <input type="text" name="logradouro" id="logradouro" value={formData.logradouro} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="numero" className="block text-sm font-medium text-gray-700">Número</label>
            <input type="text" name="numero" id="numero" value={formData.numero} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm" />
          </div>
           <div>
            <label htmlFor="bairro" className="block text-sm font-medium text-gray-700">Bairro</label>
            <input type="text" name="bairro" id="bairro" value={formData.bairro} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm" />
          </div>
           <div>
            <label htmlFor="cidade" className="block text-sm font-medium text-gray-700">Cidade</label>
            <input type="text" name="cidade" id="cidade" value={formData.cidade} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm" />
          </div>
           <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700">Estado (UF)</label>
            <input type="text" name="estado" id="estado" maxLength={2} value={formData.estado} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm" />
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center justify-end gap-x-6">
        <Link to="/clientes" className="text-sm font-semibold text-gray-900">
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-[#1b75bb] px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar Cliente'}
        </button>
      </div>
    </form>
  );
}
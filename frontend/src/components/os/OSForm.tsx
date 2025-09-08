// src/components/os/OSForm.tsx - VERSÃO SIMPLIFICADA E CONTROLADA
import React, { ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { Cliente, Veiculo, Usuario } from '@/types';

export interface OSFormData {
  cliente_id: string | number;
  veiculo_id: string | number;
  tecnico_id: string | number;
  status: string;
  descricao: string;
  valor_total: number;
  data_agendada?: string | null;
}

interface OSFormProps {
  formData: OSFormData;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  clientes: Cliente[];
  veiculos: Veiculo[];
  usuarios: Usuario[];
  onSubmit: () => void; // ✅ CORREÇÃO: Não precisa mais do argumento 'data'
  apiErrors: any[];
}

export default function OSForm({ formData, handleChange, clientes, veiculos, usuarios, onSubmit, apiErrors }: OSFormProps) {
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(); // ✅ CORREÇÃO: Apenas chama a função do pai
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
      {/* O resto do seu formulário JSX permanece o mesmo */}
      {apiErrors.length > 0 && (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">
    <strong className="font-bold">Ocorreram erros:</strong>
    <ul className="mt-2 list-disc list-inside">
      {apiErrors.map((error, index) => <li key={index}>{error.msg}</li>)}
    </ul>
  </div>
)}
      {/* ... */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="cliente_id" className="block text-sm font-medium text-gray-700">Cliente</label>
          <select name="cliente_id" id="cliente_id" value={formData.cliente_id} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md shadow-sm bg-white">
            <option value="">Selecione um cliente</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="veiculo_id" className="block text-sm font-medium text-gray-700">Veículo</label>
          <select name="veiculo_id" id="veiculo_id" value={formData.veiculo_id} onChange={handleChange} required disabled={!formData.cliente_id} className="mt-1 block w-full p-2 border rounded-md shadow-sm bg-white disabled:bg-gray-100">
            <option value="">Selecione um veículo</option>
            {veiculos.map(v => <option key={v.id} value={v.id}>{v.modelo} - {v.placa}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
          <select name="status" id="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md shadow-sm bg-white">
            <option>Aberta</option>
            <option>Em Andamento</option>
            <option>Aguardando Peças</option>
            <option>Agendada</option>
            <option>Concluída</option>
            <option>Cancelada</option>
          </select>
        </div>
         <div>
          <label htmlFor="tecnico_id" className="block text-sm font-medium text-gray-700">Técnico Responsável</label>
          <select name="tecnico_id" id="tecnico_id" value={formData.tecnico_id} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md shadow-sm bg-white">
            <option value="">Selecione um técnico</option>
            {usuarios.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </select>
        </div>
         <div>
          <label htmlFor="data_agendada">Data e Hora do Agendamento</label>
          {/* ✅ MUDANÇA CRÍTICA: tipo do input alterado para data e hora */}
          <input 
            type="datetime-local" 
            name="data_agendada" 
            id="data_agendada" 
            value={formData.data_agendada?.substring(0, 16) || ''} // Formata para o input datetime-local
            onChange={handleChange} 
            className="mt-1 block w-full p-2 border rounded-md shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="valor_total" className="block text-sm font-medium text-gray-700">Valor Total (R$)</label>
          <input type="number" step="0.01" name="valor_total" id="valor_total" value={formData.valor_total} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md shadow-sm" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">Descrição do Serviço</label>
          <textarea name="descricao" id="descricao" value={formData.descricao} onChange={handleChange} required rows={4} className="mt-1 block w-full p-2 border rounded-md shadow-sm"></textarea>
        </div>
      </div>

      <div className="flex items-center justify-end gap-x-6">
        <Link to="/os" className="text-sm font-semibold text-gray-900">Cancelar</Link>
        <button type="submit" className="rounded-md bg-[#1b75bb] px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">Salvar Ordem de Serviço</button>
      </div>
    </form>
  );
}
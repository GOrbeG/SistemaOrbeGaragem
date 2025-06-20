// frontend/src/pages/clientes/ClientesPage.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { api } from '@/services/api'; // Supondo que você centralizou o api.ts
import ClientesTable from '@/components/clientes/ClientesTable';

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/clientes', {
        params: { search: searchTerm },
      });
      setClientes(response.data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar clientes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []); // Carrega na montagem inicial

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClientes();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Gestão de Clientes</h1>
        <Link
          to="/clientes/novo"
          className="inline-flex items-center gap-2 bg-[#1b75bb] hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow"
        >
          <PlusCircle size={20} />
          Cadastrar Cliente
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome, e-mail ou CPF/CNPJ..."
          className="flex-grow p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold">
          Buscar
        </button>
      </form>

      {loading && <p>Carregando...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && <ClientesTable clientes={clientes} onDeleteSuccess={fetchClientes} />}
    </div>
  );
}
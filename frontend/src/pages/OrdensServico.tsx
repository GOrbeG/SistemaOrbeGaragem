// src/pages/OrdensServico.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { api } from '@/services/api';

// Interface para os dados de uma OS
export interface OrdemServico {
  id: number;
  cliente_id: number; // No futuro, podemos popular com o nome do cliente
  veiculo_id: number; // No futuro, podemos popular com os dados do veículo
  status: string;
  descricao: string;
  valor_total: number;
  data_criacao: string;
}

// Componente para exibir o status com cores
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusColors: { [key: string]: string } = {
    aberta: 'bg-blue-100 text-blue-800',
    agendada: 'bg-purple-100 text-purple-800',
    'em andamento': 'bg-yellow-100 text-yellow-800',
    concluida: 'bg-green-100 text-green-800',
    cancelada: 'bg-red-100 text-red-800',
  };

  const color = statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>
      {status}
    </span>
  );
};

export default function OrdensServicoPage() {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrdens = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/os'); // A rota de OS é '/api/os'
      setOrdens(response.data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar Ordens de Serviço.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdens();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta Ordem de Serviço?')) {
      try {
        await api.delete(`/api/os/${id}`);
        alert('OS excluída com sucesso!');
        fetchOrdens(); // Atualiza a lista
      } catch (err: any) {
        alert(err.response?.data?.error || 'Erro ao excluir OS.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Ordens de Serviço</h1>
        <Link
          to="/os/novo" // Rota para criar nova OS
          className="inline-flex items-center gap-2 bg-[#1b75bb] hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow"
        >
          <PlusCircle size={20} />
          Nova Ordem de Serviço
        </Link>
      </div>

      {/* Adicionar filtros aqui no futuro */}

      {loading && <p>Carregando...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº OS</th>
                {/* Adicionar colunas Cliente e Veículo no futuro */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Criação</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ordens.map((os) => (
                <tr key={os.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{os.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={os.status} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(os.data_criacao).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {os.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                    <Link to={`/os/${os.id}`} className="text-blue-600 hover:text-blue-900" title="Ver Detalhes">
                      <Eye size={18} className="inline-block" />
                    </Link>
                    <Link to={`/os/editar/${os.id}`} className="text-yellow-600 hover:text-yellow-900" title="Editar">
                      <Edit size={18} className="inline-block" />
                    </Link>
                    <button onClick={() => handleDelete(os.id)} className="text-red-600 hover:text-red-900" title="Excluir">
                      <Trash2 size={18} className="inline-block" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {ordens.length === 0 && <p className="text-center text-gray-500 p-4">Nenhuma Ordem de Serviço encontrada.</p>}
        </div>
      )}
    </div>
  );
}
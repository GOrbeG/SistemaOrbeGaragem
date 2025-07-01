// src/pages/clientes/ClienteDetailPage.tsx - VERSÃO FINAL E CORRIGIDA
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/services/api';
import { Cliente, Veiculo } from '@/types';
import VehicleCard from '@/components/veiculos/VehicleCard';
import VehicleForm, { VehicleFormData } from '@/components/veiculos/VehicleForm';
import { PlusCircle, Eye } from 'lucide-react';

// --- Interfaces ---
interface OrdemServico {
    id: number;
    status: string;
    data_criacao: string;
    valor_total: number;
}

// --- Componentes ---
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusColors: { [key: string]: string } = {
    aberta: 'bg-blue-100 text-blue-800',
    agendada: 'bg-purple-100 text-purple-800',
    'em andamento': 'bg-yellow-100 text-yellow-800',
    concluida: 'bg-green-100 text-green-800',
    cancelada: 'bg-red-100 text-red-800',
  };
  const color = statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  return <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>{status}</span>;
};


export default function ClienteDetailPage() {
  const { id: clienteId } = useParams<{ id: string }>();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'veiculos' | 'os'>('veiculos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Veiculo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const fetchData = () => {
    if (!clienteId) return;
    setLoading(true);
    Promise.all([
      api.get(`/api/clientes/${clienteId}`),
      api.get(`/api/veiculos?clienteId=${clienteId}`),
      api.get(`/api/os?clienteId=${clienteId}`)
    ]).then(([clienteRes, veiculosRes, osRes]) => {
      setCliente(clienteRes.data);
      setVeiculos(veiculosRes.data);
      setOrdensServico(osRes.data);
    }).catch(err => console.error("Erro ao buscar dados:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [clienteId]);
  

  const handleOpenModal = (vehicle: Veiculo | null) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
  };

  // ✅ CORREÇÃO: Usando setIsSubmitting para controlar o estado do botão
  const handleVehicleSubmit = async (data: VehicleFormData) => {
    setIsSubmitting(true); // Desativa o botão
    const apiCall = editingVehicle
      ? api.put(`/api/veiculos/${editingVehicle.id}`, { ...data, cliente_id: clienteId })
      : api.post('/api/veiculos', { ...data, cliente_id: clienteId });

    try {
     await apiCall;
     fetchData(); // Atualiza todos os dados
     handleCloseModal();
    } catch (err: any) {
     console.error("ERRO DETALHADO AO SALVAR VEÍCULO:", err.response?.data);
     const errorMessage = err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Verifique os dados e tente novamente.';
     alert(`Erro ao salvar veículo: ${errorMessage}`);
     } finally {
     setIsSubmitting(false); // Reativa o botão
     }
  };

  const handleVehicleDelete = async (vehicleId: number) => {
      if (window.confirm('Tem certeza que deseja excluir este veículo?')) {
          try {
              await api.delete(`/api/veiculos/${vehicleId}`);
              fetchData(); // Atualiza todos os dados
          } catch (err) {
              alert('Erro ao excluir veículo.');
          }
      }
  };


  if (loading) return <p>Carregando...</p>;
  if (!cliente) return <p>Cliente não encontrado.</p>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800">{cliente.nome}</h1>
        <p className="text-gray-600">{cliente.email} | {cliente.telefone}</p>
      </div>
      
      <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              <button onClick={() => setActiveTab('veiculos')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'veiculos' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                  Veículos ({veiculos.length})
              </button>
              <button onClick={() => setActiveTab('os')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'os' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                  Ordens de Serviço ({ordensServico.length})
              </button>
          </nav>
      </div>

      {activeTab === 'veiculos' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Veículos</h3>
              <button onClick={() => handleOpenModal(null)} className="inline-flex items-center gap-2 bg-[#1b75bb] text-white px-4 py-2 rounded-lg font-semibold"><PlusCircle size={20} /> Adicionar Veículo</button>
            </div>
            {veiculos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {veiculos.map(v => <VehicleCard key={v.id} vehicle={v} onEdit={() => handleOpenModal(v)} onDelete={() => handleVehicleDelete(v.id)} />)}
                </div>
            ) : <p className="text-center text-gray-500 p-4">Nenhum veículo cadastrado para este cliente.</p>}
        </div>
      )}

      {activeTab === 'os' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Histórico de Ordens de Serviço</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nº OS</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor Total</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {ordensServico.map(os => (
                            <tr key={os.id}>
                                <td className="px-4 py-4 text-sm font-medium text-gray-900">#{os.id}</td>
                                <td className="px-4 py-4 text-sm text-gray-500">{new Date(os.data_criacao).toLocaleDateString('pt-BR')}</td>
                                <td className="px-4 py-4 text-sm"><StatusBadge status={os.status} /></td>
                                <td className="px-4 py-4 text-sm text-right">{Number(os.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                <td className="px-4 py-4 text-center">
                                    <Link to={`/os/${os.id}`} className="text-blue-600 hover:text-blue-800" title="Ver Detalhes da OS"><Eye size={18} /></Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {ordensServico.length === 0 && <p className="text-center text-gray-500 py-4">Nenhuma Ordem de Serviço encontrada para este cliente.</p>}
            </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                <VehicleForm onSubmit={handleVehicleSubmit} initialData={editingVehicle} onCancel={handleCloseModal} isSubmitting={isSubmitting} />
            </div>
        </div>
      )}
    </div>
  );
}
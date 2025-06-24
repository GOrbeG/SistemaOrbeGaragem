// src/pages/clientes/ClienteDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/services/api';
import { Cliente } from './ClientesPage'; // Reutilizando interface
import { Veiculo } from '@/pages/os/OSFormPage'; // Reutilizando interface
import VehicleCard from '@/components/veiculos/VehicleCard';
import VehicleForm, { VehicleFormData } from '@/components/veiculos/VehicleForm';
import { PlusCircle } from 'lucide-react';

export default function ClienteDetailPage() {
  const { id: clienteId } = useParams<{ id: string }>();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Veiculo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchVeiculos = () => {
    api.get(`/api/veiculos?clienteId=${clienteId}`).then(res => setVeiculos(res.data));
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/api/clientes/${clienteId}`),
      api.get(`/api/veiculos?clienteId=${clienteId}`)
    ]).then(([clienteRes, veiculosRes]) => {
      setCliente(clienteRes.data);
      setVeiculos(veiculosRes.data);
    }).catch(err => console.error("Erro ao buscar dados:", err))
      .finally(() => setLoading(false));
  }, [clienteId]);

  const handleOpenModal = (vehicle: Veiculo | null) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
  };

  const handleVehicleSubmit = async (data: VehicleFormData) => {
    setIsSubmitting(true);
    const apiCall = editingVehicle
      ? api.put(`/api/veiculos/${editingVehicle.id}`, { ...data, cliente_id: clienteId })
      : api.post('/api/veiculos', { ...data, cliente_id: clienteId });

    try {
     await apiCall;
     fetchVeiculos();
     handleCloseModal();
    } catch (err: any) {
  // ✅ MUDANÇA CRÍTICA: Loga o erro completo no console do navegador
     console.error("ERRO DETALHADO AO SALVAR VEÍCULO:", err.response?.data);
  
  // ✅ MUDANÇA CRÍTICA: Exibe uma mensagem de erro mais específica
     const errorMessage = err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Verifique os dados e tente novamente.';
     alert(`Erro ao salvar veículo: ${errorMessage}`);
     } finally {
     setIsSubmitting(false);
     }
  };

  const handleVehicleDelete = async (vehicleId: number) => {
      if (window.confirm('Tem certeza que deseja excluir este veículo?')) {
          try {
              await api.delete(`/api/veiculos/${vehicleId}`);
              fetchVeiculos(); // Atualiza a lista
          } catch (err) {
              alert('Erro ao excluir veículo.');
          }
      }
  };


  if (loading) return <p>Carregando...</p>;
  if (!cliente) return <p>Cliente não encontrado.</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Detalhes do Cliente</h1>

      {/* Card com informações do cliente */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold">{cliente.nome}</h2>
        <p className="text-gray-600">{cliente.email}</p>
        <p className="text-gray-600">{cliente.telefone}</p>
      </div>

      {/* Seção de Veículos */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Veículos</h3>
          <button onClick={() => handleOpenModal(null)} className="inline-flex items-center gap-2 bg-[#1b75bb] text-white px-4 py-2 rounded-lg font-semibold">
            <PlusCircle size={20} />
            Adicionar Veículo
          </button>
        </div>

        {veiculos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {veiculos.map(v => (
                    <VehicleCard 
                        key={v.id} 
                        vehicle={v} 
                        onEdit={() => handleOpenModal(v)}
                        onDelete={() => handleVehicleDelete(v.id)}
                    />
                ))}
            </div>
        ) : (
            <p className="text-center text-gray-500 p-4">Nenhum veículo cadastrado para este cliente.</p>
        )}
      </div>

      {/* Modal para Adicionar/Editar Veículo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
            <VehicleForm 
              onSubmit={handleVehicleSubmit} 
              initialData={editingVehicle}
              onCancel={handleCloseModal}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
}
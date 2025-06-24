// src/pages/os/OSFormPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import OSForm, { OSFormData } from '@/components/os/OSForm'; // Criaremos este a seguir
import { Cliente } from '@/pages/clientes/ClientesPage'; // Reutilizando a interface

interface Usuario {
  id: number;
  nome: string;
}

export interface Veiculo {
  id: number;
  marca: string;    // ✅ ADICIONADO
  modelo: string;
  ano: number;      // ✅ ADICIONADO
  placa: string;
}

const initialState: OSFormData = {
  cliente_id: '',
  veiculo_id: '',
  usuario_id: '', // Ou pode ser o id do usuário logado
  status: 'Aberta',
  descricao: '',
  valor_total: 0,
  data_agendada: '',
};

export default function OSFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [os, setOs] = useState<OSFormData>(initialState);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<any[]>([]);

  // Efeito para buscar dados iniciais (clientes, usuários e a OS para edição)
  useEffect(() => {
    // Busca clientes
    api.get('/api/clientes').then(response => setClientes(response.data));
    // Busca usuários (supondo que exista essa rota)
    api.get('/api/usuarios').then(response => setUsuarios(response.data));

    if (isEditMode) {
      setLoading(true);
      api.get(`/api/os/${id}`)
        .then(response => {
          const data = response.data;
          // Formata a data para o input
          if (data.data_agendada) {
            data.data_agendada = new Date(data.data_agendada).toISOString().split('T')[0];
          }
          setOs(data);
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  // Efeito para buscar veículos QUANDO o cliente muda
  useEffect(() => {
    if (os.cliente_id) {
      api.get(`/api/veiculos?clienteId=${os.cliente_id}`)
         .then(response => setVeiculos(response.data));
    } else {
      setVeiculos([]); // Limpa a lista de veículos se nenhum cliente estiver selecionado
    }
  }, [os.cliente_id]);


  const handleSubmit = async (formData: OSFormData) => {
    setApiErrors([]);
    const apiCall = isEditMode
      ? api.put(`/api/os/${id}`, formData)
      : api.post('/api/os', formData);

    try {
      await apiCall;
      alert(`OS ${isEditMode ? 'atualizada' : 'criada'} com sucesso!`);
      navigate('/os');
    } catch (error: any) {
      const errors = error.response?.data?.errors || [{ msg: 'Ocorreu um erro.' }];
      setApiErrors(errors);
    }
  };

  if (loading) return <p>Carregando dados da OS...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        {isEditMode ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
      </h1>
      <OSForm
        initialData={os}
        clientes={clientes}
        veiculos={veiculos}
        usuarios={usuarios}
        onSubmit={handleSubmit}
        apiErrors={apiErrors}
      />
    </div>
  );
}
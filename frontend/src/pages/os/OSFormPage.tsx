// src/pages/os/OSFormPage.tsx - VERSÃO CORRIGIDA
import { useEffect, useState, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import OSForm, { OSFormData } from '@/components/os/OSForm';
import { Cliente, Veiculo, Usuario } from '@/types'; // ✅ IMPORTAÇÃO CENTRALIZADA

// As interfaces foram movidas para src/types/index.ts

const initialState: OSFormData = {
  cliente_id: '',
  veiculo_id: '',
  usuario_id: '',
  status: 'Aberta',
  descricao: '',
  valor_total: 0,
  data_agendada: '',
};

export default function OSFormPage() {
  // O resto do arquivo permanece EXATAMENTE IGUAL ao que te passei antes
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [formData, setFormData] = useState<OSFormData>(initialState);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<any[]>([]);

  useEffect(() => {
    api.get('/api/clientes').then(response => setClientes(response.data));
    api.get('/api/usuarios').then(response => setUsuarios(response.data));
    if (isEditMode) {
      setLoading(true);
      api.get(`/api/os/${id}`)
        .then(response => {
          const data = response.data;
          if (data.data_agendada) {
            data.data_agendada = new Date(data.data_agendada).toISOString().split('T')[0];
          }
          setFormData(data);
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  useEffect(() => {
    if (formData.cliente_id) {
      api.get(`/api/veiculos?clienteId=${formData.cliente_id}`)
         .then(response => setVeiculos(response.data));
    } else {
      setVeiculos([]);
    }
  }, [formData.cliente_id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    if (name === 'cliente_id') {
      newFormData.veiculo_id = '';
    }
    setFormData(newFormData);
  };

  const handleSubmit = async (data: OSFormData) => {
    setApiErrors([]);
    const apiCall = isEditMode
      ? api.put(`/api/os/${id}`, data)
      : api.post('/api/os', data);
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
      <h1 className="text-3xl font-bold text-gray-800">{isEditMode ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}</h1>
      <OSForm
        formData={formData}
        handleChange={handleChange}
        clientes={clientes}
        veiculos={veiculos}
        usuarios={usuarios}
        onSubmit={handleSubmit}
        apiErrors={apiErrors}
      />
    </div>
  );
}
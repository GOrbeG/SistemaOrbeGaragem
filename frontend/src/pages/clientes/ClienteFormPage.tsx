// frontend/src/pages/clientes/ClienteFormPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import ClienteForm from '@/components/clientes/ClienteForm';

// Definindo um tipo mais completo para os dados do cliente no formulário
export interface ClienteFormData {
  id?: number;
  nome: string;
  tipo_pessoa: 'PF' | 'PJ';
  cpf_cnpj: string;
  email: string;
  senha?: string;
  telefone: string;
  data_nascimento: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
}

const initialState: ClienteFormData = {
  nome: '',
  tipo_pessoa: 'PF',
  cpf_cnpj: '',
  email: '',
  senha: '',
  telefone: '',
  data_nascimento: '',
  cep: '',
  logradouro: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
};

export default function ClienteFormPage() {
  const { id } = useParams<{ id: string }>(); // Pega o 'id' da URL, se existir
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<ClienteFormData>(initialState);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiErrors, setApiErrors] = useState<any[]>([]);

  const isEditMode = Boolean(id);

  useEffect(() => {
    // Se estiver no modo de edição, busca os dados do cliente na API
    if (isEditMode) {
      setLoading(true);
      api.get(`/api/clientes/${id}`)
        .then(response => {
          // Formata a data para o formato YYYY-MM-DD que o input[type=date] espera
          const data = response.data;
          if (data.data_nascimento) {
            data.data_nascimento = new Date(data.data_nascimento).toISOString().split('T')[0];
          }
          setCliente(data);
        })
        .catch(error => console.error('Erro ao buscar cliente:', error))
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  const handleSubmit = async (formData: ClienteFormData) => {
    setIsSubmitting(true);
    setApiErrors([]);
    const apiCall = isEditMode
      ? api.put(`/api/clientes/${id}`, formData)
      : api.post('/api/clientes', formData);

    try {
      await apiCall;
      alert(`Cliente ${isEditMode ? 'atualizado' : 'cadastrado'} com sucesso!`);
      navigate('/clientes'); // Redireciona para a lista após o sucesso
    } catch (error: any) {
      const errors = error.response?.data?.errors || [{ msg: 'Ocorreu um erro. Tente novamente.' }];
      console.error('Erro ao salvar cliente:', errors);
      setApiErrors(errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <p>Carregando dados do cliente...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        {isEditMode ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
      </h1>
      <ClienteForm
        initialData={cliente}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        apiErrors={apiErrors}
        isEditMode={isEditMode}
      />
    </div>
  );
}
// src/components/financeiro/TransacaoFormModal.tsx
import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { api } from '@/services/api';

// Interface para as categorias que virão do backend
interface Categoria {
  id: number;
  nome: string;
}

// Interface para os dados do formulário
export interface TransacaoFormData {
  descricao: string;
  valor: number;
  data_transacao: string;
  categoria_id: string;
  observacoes?: string;
}

// Props que o componente receberá
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  tipo: 'entrada' | 'saida'; // Para saber se é um modal de receita ou despesa
}

export default function TransacaoFormModal({ isOpen, onClose, onSave, tipo }: Props) {
  const { register, handleSubmit, reset } = useForm<TransacaoFormData>();
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // Busca as categorias do tipo correto (entradas ou saídas) quando o modal abre
  useEffect(() => {
    if (isOpen) {
      api.get(`/api/categorias-financeiras?tipo=${tipo}`)
        .then(res => setCategorias(res.data))
        .catch(err => console.error("Erro ao buscar categorias:", err));
    }
  }, [isOpen, tipo]);

  const onSubmit: SubmitHandler<TransacaoFormData> = async (data) => {
    try {
      const payload = {
        ...data,
        valor: Number(data.valor),
        categoria_id: Number(data.categoria_id),
        tipo: tipo, // Adiciona o tipo ('entrada' ou 'saida')
      };
      await api.post('/api/transacoes-financeiras', payload);
      alert('Lançamento salvo com sucesso!');
      reset();
      onSave(); // Avisa a página principal para atualizar a lista
      onClose();
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      alert('Não foi possível salvar o lançamento.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {tipo === 'entrada' ? 'Nova Receita' : 'Nova Despesa'}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input {...register('descricao', { required: true })} placeholder="Descrição" className="w-full p-2 border rounded" />
          <input {...register('valor', { required: true, valueAsNumber: true })} type="number" step="0.01" placeholder="Valor (R$)" className="w-full p-2 border rounded" />
          <input {...register('data_transacao', { required: true })} type="date" className="w-full p-2 border rounded" />
          <select {...register('categoria_id', { required: true })} className="w-full p-2 border rounded bg-white">
            <option value="">Selecione a Categoria</option>
            {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
          </select>
          <textarea {...register('observacoes')} placeholder="Observações (opcional)" className="w-full p-2 border rounded" rows={3}></textarea>
          
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancelar</button>
            <button type="submit" className={`px-6 py-2 text-white rounded ${tipo === 'entrada' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// src/components/financeiro/TransacaoForm.tsx
import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { api } from '@/services/api';

// --- Interfaces ---
interface Categoria {
  id: number;
  nome: string;
}
export interface TransacaoFormData {
  descricao: string;
  valor: number;
  data_transacao: string;
  categoria_id: string;
  observacoes?: string;
}
interface Props {
  tipo: 'entrada' | 'saida';
  onSave: () => void;
  onCancel: () => void;
}

export default function TransacaoForm({ tipo, onSave, onCancel }: Props) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<TransacaoFormData>();
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    // Busca as categorias do tipo correto (entradas ou saídas)
    api.get(`/api/categorias-financeiras?tipo=${tipo}`)
      .then(res => setCategorias(res.data))
      .catch(err => console.error("Erro ao buscar categorias:", err));
  }, [tipo]);

  const onSubmit: SubmitHandler<TransacaoFormData> = async (data) => {
    try {
      const payload = {
        ...data,
        valor: Number(data.valor),
        categoria_id: Number(data.categoria_id),
        tipo: tipo,
      };
      await api.post('/api/transacoes-financeiras', payload);
      alert('Lançamento salvo com sucesso!');
      reset();
      onSave(); // Avisa a página principal para atualizar a lista
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      alert('Não foi possível salvar o lançamento.');
    }
  };

  return (
    // Este é o container do formulário que será exibido na página
    <div className="bg-white p-6 rounded-lg shadow-md mt-6 border-t-4 border-blue-500">
      <h3 className="text-xl font-bold mb-4">
        {tipo === 'entrada' ? 'Adicionar Nova Receita' : 'Adicionar Nova Despesa'}
      </h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('descricao', { required: true })} placeholder="Descrição" className="w-full p-2 border rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input {...register('valor', { required: true, valueAsNumber: true })} type="number" step="0.01" placeholder="Valor (R$)" className="w-full p-2 border rounded" />
          <input {...register('data_transacao', { required: true })} type="date" className="w-full p-2 border rounded" />
        </div>
        <select {...register('categoria_id', { required: true })} className="w-full p-2 border rounded bg-white">
          <option value="">Selecione a Categoria</option>
          {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
        </select>
        <textarea {...register('observacoes')} placeholder="Observações (opcional)" className="w-full p-2 border rounded" rows={3}></textarea>
        
        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className={`px-6 py-2 text-white rounded ${tipo === 'entrada' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} disabled:bg-gray-400`}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
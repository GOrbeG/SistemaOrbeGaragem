// src/components/financeiro/TransacaoForm.tsx - VERSÃO SIMPLES E CORRETA
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

  // Busca as categorias sempre que o tipo (entrada/saida) mudar
  useEffect(() => {
    api.get(`/api/categorias-financeiras?tipo=${tipo}`)
      .then(res => setCategorias(res.data))
      .catch(err => console.error("Erro ao buscar categorias:", err));
  }, [tipo]);

  const onSubmit: SubmitHandler<TransacaoFormData> = async (data) => {
    try {
      const payload = { ...data, tipo, valor: Number(data.valor), categoria_id: Number(data.categoria_id) };
      await api.post('/api/transacoes-financeiras', payload);
      alert('Lançamento salvo com sucesso!');
      reset();
      onSave(); // Avisa a página principal para fechar o modal e atualizar a lista
    } catch (error) {
      alert('Não foi possível salvar o lançamento.');
    }
  };

  return (
    // Note que aqui só temos a tag <form>, nenhuma outra div em volta.
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-center text-gray-800">
            {tipo === 'entrada' ? 'Nova Receita' : 'Nova Despesa'}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <input {...register('descricao', { required: true })} placeholder="Descrição" className="w-full p-2 border rounded" />
          <div className="grid grid-cols-2 gap-4">
            <input {...register('valor', { required: true, valueAsNumber: true })} type="number" step="0.01" placeholder="Valor (R$)" className="w-full p-2 border rounded" />
            <input {...register('data_transacao', { required: true })} type="date" className="w-full p-2 border rounded" />
          </div>
          <select {...register('categoria_id', { required: true })} className="w-full p-2 border rounded bg-white">
            <option value="">Selecione a Categoria</option>
            {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
          </select>
          <textarea {...register('observacoes')} placeholder="Observações (opcional)" className="w-full p-2 border rounded" rows={2}></textarea>
        </div>

        <div className="flex justify-end gap-4 p-6 border-t bg-gray-50">
          <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400">Cancelar</button>
          <button type="submit" disabled={isSubmitting} className={`px-6 py-2 text-white rounded-lg ${tipo === 'entrada' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} disabled:bg-gray-400`}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
    </form>
  );
}
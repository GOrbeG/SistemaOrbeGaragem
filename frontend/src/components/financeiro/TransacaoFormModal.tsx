// src/components/financeiro/TransacaoFormModal.tsx - VERSÃO FINAL CORRIGIDA
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
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  tipo: 'entrada' | 'saida';
}

export default function TransacaoFormModal({ isOpen, onClose, onSave, tipo }: Props) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<TransacaoFormData>();
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    if (isOpen) {
      api.get(`/api/categorias-financeiras?tipo=${tipo}`)
        .then(res => setCategorias(res.data))
        .catch(err => console.error("Erro ao buscar categorias:", err));
    } else {
      reset(); // Limpa o formulário quando o modal é fechado
    }
  }, [isOpen, tipo, reset]);

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
      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      alert('Não foi possível salvar o lançamento.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Cabeçalho Fixo */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-center">
            {tipo === 'entrada' ? 'Nova Receita' : 'Nova Despesa'}
          </h2>
        </div>

        {/* ✅ CORREÇÃO: A tag <form> agora envolve tanto a área rolável quanto o rodapé */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          
          {/* Área dos inputs com rolagem */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <label htmlFor="descricao" className="text-sm font-medium">Descrição</label>
              <input id="descricao" {...register('descricao', { required: true })} className="w-full p-2 border rounded mt-1" />
            </div>
            <div>
              <label htmlFor="valor" className="text-sm font-medium">Valor (R$)</label>
              <input id="valor" {...register('valor', { required: true, valueAsNumber: true })} type="number" step="0.01" className="w-full p-2 border rounded mt-1" />
            </div>
            <div>
              <label htmlFor="data_transacao" className="text-sm font-medium">Data</label>
              <input id="data_transacao" {...register('data_transacao', { required: true })} type="date" className="w-full p-2 border rounded mt-1" />
            </div>
            <div>
              <label htmlFor="categoria_id" className="text-sm font-medium">Categoria</label>
              <select id="categoria_id" {...register('categoria_id', { required: true })} className="w-full p-2 border rounded bg-white mt-1">
                <option value="">Selecione a Categoria</option>
                {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="observacoes" className="text-sm font-medium">Observações (opcional)</label>
              <textarea id="observacoes" {...register('observacoes')} className="w-full p-2 border rounded mt-1" rows={3}></textarea>
            </div>
          </div>
          
          {/* Rodapé com botões sempre visível */}
          <div className="flex justify-end gap-4 p-6 border-t bg-gray-50">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className={`px-6 py-2 text-white rounded ${tipo === 'entrada' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} disabled:bg-gray-400`}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
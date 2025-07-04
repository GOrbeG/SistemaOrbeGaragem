// src/components/financeiro/TransacaoForm.tsx - VERSÃO FINAL
import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { api } from '@/services/api';

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
      onSave();
    } catch (error) {
      alert('Não foi possível salvar o lançamento.');
    }
  };

  return (
    // A tag <form> agora envolve toda a estrutura do modal
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
        {/* Cabeçalho do Modal */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-center text-gray-800">
            {tipo === 'entrada' ? 'Nova Receita' : 'Nova Despesa'}
          </h2>
        </div>
        
        {/* Área rolável com os campos do formulário */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label htmlFor="descricao" className="text-sm font-medium text-gray-700">Descrição</label>
            <input id="descricao" {...register('descricao', { required: true })} className="w-full p-2 border rounded-md mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="valor" className="text-sm font-medium text-gray-700">Valor (R$)</label>
              <input id="valor" {...register('valor', { required: true, valueAsNumber: true })} type="number" step="0.01" className="w-full p-2 border rounded-md mt-1" />
            </div>
            <div>
              <label htmlFor="data_transacao" className="text-sm font-medium text-gray-700">Data</label>
              <input id="data_transacao" {...register('data_transacao', { required: true })} type="date" className="w-full p-2 border rounded-md mt-1" />
            </div>
          </div>
          <div>
            <label htmlFor="categoria_id" className="text-sm font-medium text-gray-700">Categoria</label>
            <select id="categoria_id" {...register('categoria_id', { required: true })} className="w-full p-2 border rounded-md bg-white mt-1">
              <option value="">Selecione a Categoria</option>
              {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="observacoes" className="text-sm font-medium text-gray-700">Observações (opcional)</label>
            <textarea id="observacoes" {...register('observacoes')} className="w-full p-2 border rounded-md mt-1" rows={2}></textarea>
          </div>
        </div>

        {/* Rodapé fixo com os botões */}
        <div className="flex justify-end gap-4 p-6 border-t bg-gray-50">
          <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold">Cancelar</button>
          <button type="submit" disabled={isSubmitting} className={`px-6 py-2 text-white rounded-lg font-semibold ${tipo === 'entrada' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} disabled:bg-gray-400`}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
    </form>
  );
}
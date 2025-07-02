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
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<TransacaoFormData>();
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
    // Container principal (overlay) - permanece o mesmo
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      
      {/* ✅ MUDANÇA: O painel do modal agora usa flexbox em coluna e tem altura máxima */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho Fixo */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-center">
            {tipo === 'entrada' ? 'Nova Receita' : 'Nova Despesa'}
          </h2>
        </div>

        {/* Formulário com a área de conteúdo rolável */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          
          {/* ✅ MUDANÇA: Área dos inputs agora tem rolagem */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <input {...register('descricao', { required: true })} placeholder="Descrição" className="w-full p-2 border rounded" />
            <input {...register('valor', { required: true, valueAsNumber: true })} type="number" step="0.01" placeholder="Valor (R$)" className="w-full p-2 border rounded" />
            <input {...register('data_transacao', { required: true })} type="date" className="w-full p-2 border rounded" />
            <select {...register('categoria_id', { required: true })} className="w-full p-2 border rounded bg-white">
              <option value="">Selecione a Categoria</option>
              {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
            </select>
            <textarea {...register('observacoes')} placeholder="Observações (opcional)" className="w-full p-2 border rounded" rows={3}></textarea>
          </div>
          
          {/* ✅ MUDANÇA: Rodapé com botões fica sempre visível */}
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
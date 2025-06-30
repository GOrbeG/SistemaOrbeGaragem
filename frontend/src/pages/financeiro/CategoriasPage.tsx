// src/pages/financeiro/CategoriasPage.tsx
import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { api } from '@/services/api';
import { Trash2 } from 'lucide-react';

// Interface para os dados do formulário de nova categoria
interface CategoriaFormData {
  nome: string;
  tipo: 'entrada' | 'saida';
}

// Interface para as categorias que vêm da API
interface Categoria {
  id: number;
  nome: string;
  tipo: 'entrada' | 'saida';
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset } = useForm<CategoriaFormData>();

  const fetchCategorias = () => {
    setLoading(true);
    api.get('/api/categorias-financeiras')
      .then(res => setCategorias(res.data))
      .catch(err => console.error("Erro ao buscar categorias:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const onSubmit: SubmitHandler<CategoriaFormData> = async (data) => {
    try {
      await api.post('/api/categorias-financeiras', data);
      alert('Categoria criada com sucesso!');
      reset(); // Limpa o formulário
      fetchCategorias(); // Atualiza a lista
    } catch (error: any) {
      alert(error.response?.data?.error || 'Não foi possível criar a categoria.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria? Ela não pode estar sendo usada em nenhuma transação.')) {
        try {
            await api.delete(`/api/categorias-financeiras/${id}`);
            alert('Categoria excluída com sucesso!');
            fetchCategorias();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Não foi possível excluir a categoria.');
        }
    }
  };

  const categoriasEntrada = categorias.filter(c => c.tipo === 'entrada');
  const categoriasSaida = categorias.filter(c => c.tipo === 'saida');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Coluna do Formulário */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Nova Categoria</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input {...register('nome', { required: true })} placeholder="Nome da Categoria" className="w-full p-2 border rounded" />
            <div className="space-y-2">
                <p className="text-sm font-medium">Tipo:</p>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                        <input {...register('tipo', { required: true })} type="radio" value="entrada" className="h-4 w-4" /> Entrada
                    </label>
                    <label className="flex items-center gap-2">
                        <input {...register('tipo', { required: true })} type="radio" value="saida" className="h-4 w-4" /> Saída
                    </label>
                </div>
            </div>
            <button type="submit" className="w-full px-4 py-2 bg-[#1b75bb] text-white rounded-lg font-semibold">Salvar Categoria</button>
          </form>
        </div>
      </div>

      {/* Coluna das Listas */}
      <div className="lg:col-span-2">
        {loading ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
            <p>Carregando categorias...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 text-green-700">Categorias de Entrada</h2>
              <ul className="space-y-2">
                {categoriasEntrada.map(cat => (
                  <li key={cat.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-100">
                    <span>{cat.nome}</span>
                    <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                  </li>
                ))}
                {categoriasEntrada.length === 0 && <li className="text-sm text-gray-400">Nenhuma categoria de entrada.</li>}
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 text-red-700">Categorias de Saída</h2>
              <ul className="space-y-2">
                {categoriasSaida.map(cat => (
                  <li key={cat.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-100">
                    <span>{cat.nome}</span>
                    <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                  </li>
                ))}
                {categoriasSaida.length === 0 && <li className="text-sm text-gray-400">Nenhuma categoria de saída.</li>}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
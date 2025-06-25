// src/pages/os/OSDetailPage.tsx - VERSÃO FINAL COM CADASTRO DE ITENS
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { api } from '@/services/api';
import { Download, Edit, PlusCircle } from 'lucide-react';
import { Cliente, Veiculo, Usuario } from '@/types';

// --- Interfaces ---
interface OSDetails {
  id: number;
  status: string;
  descricao: string;
  data_criacao: string;
  valor_total: number;
  cliente_id: number;
  veiculo_id: number;
  usuario_id: number;
}
interface ItemOS {
  id: number;
  descricao: string;
  valor: number;
}
type ItemFormData = Omit<ItemOS, 'id'>;


// ✅ --- Sub-componente para o formulário de adicionar item ---
const AddItemForm = ({ osId, onAddItem }: { osId: number, onAddItem: () => void }) => {
    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ItemFormData>();

    const onSubmit: SubmitHandler<ItemFormData> = async (data) => {
        try {
            await api.post('/api/itens-ordem', {
                ordem_id: osId,
                descricao: data.descricao,
                valor: data.valor,
            });
            reset(); // Limpa o formulário após o sucesso
            onAddItem(); // Avisa o componente pai para recarregar os dados
        } catch (error) {
            console.error("Erro ao adicionar item:", error);
            alert("Não foi possível adicionar o item.");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex items-end gap-2 p-4 border-t bg-gray-50">
            <div className="flex-grow">
                <label htmlFor="item_descricao" className="text-sm font-medium text-gray-700">Descrição do Item/Serviço</label>
                <input id="item_descricao" {...register('descricao', { required: true })} placeholder="Ex: Troca de óleo do motor" className="w-full mt-1 p-2 border rounded-md" />
            </div>
            <div className="w-40">
                <label htmlFor="item_valor" className="text-sm font-medium text-gray-700">Valor (R$)</label>
                <input id="item_valor" {...register('valor', { required: true, valueAsNumber: true })} type="number" step="0.01" placeholder="150.00" className="w-full mt-1 p-2 border rounded-md" />
            </div>
            <button type="submit" disabled={isSubmitting} className="h-10 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md inline-flex items-center gap-2 disabled:bg-gray-400">
                <PlusCircle size={18} /> {isSubmitting ? 'Adicionando...' : 'Adicionar'}
            </button>
        </form>
    );
};


// --- Componente Principal da Página ---
export default function OSDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [os, setOs] = useState<OSDetails | null>(null);
  const [itens, setItens] = useState<ItemOS[]>([]);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [tecnico, setTecnico] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para buscar TODOS os dados da OS
  const fetchOSData = async () => {
    if (!id) return;
    try {
      const osRes = await api.get(`/api/os/${id}`);
      const itensRes = await api.get(`/api/itens-ordem?ordemId=${id}`);
      
      const osData: OSDetails = osRes.data;
      setOs(osData);
      setItens(itensRes.data);

      if (osData.cliente_id && osData.veiculo_id && osData.usuario_id) {
          const [clienteRes, veiculoRes, tecnicoRes] = await Promise.all([
              api.get(`/api/clientes/${osData.cliente_id}`),
              api.get(`/api/veiculos/${osData.veiculo_id}`),
              api.get(`/api/usuarios/${osData.usuario_id}`)
          ]);
          setCliente(clienteRes.data);
          setVeiculo(veiculoRes.data);
          setTecnico(tecnicoRes.data);
      }
    } catch (error) {
      console.error("Erro ao carregar dados da OS:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchOSData().finally(() => setLoading(false));
  }, [id]);

  const handleDownloadPDF = async () => {
    try {
        const response = await api.get(`/api/os/${id}/exportar`, {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `os_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error("Erro ao baixar PDF:", error);
        alert('Não foi possível baixar o PDF.');
    }
  };


  if (loading) return <p>Carregando detalhes da Ordem de Serviço...</p>;
  if (!os) return <p>Ordem de Serviço não encontrada.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Detalhes da OS #{os.id}</h1>
        <div className="flex gap-2">
            <Link to={`/os/editar/${os.id}`} className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold"><Edit size={18} /> Editar</Link>
            <button onClick={handleDownloadPDF} className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold"><Download size={18} /> Baixar PDF</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">Informações Gerais</h3>
                <p><strong className="text-gray-600">Status:</strong> {os.status}</p>
                <p><strong className="text-gray-600">Técnico:</strong> {tecnico?.nome || 'N/A'}</p>
                <p><strong className="text-gray-600">Descrição:</strong> {os.descricao}</p>
            </div>
            
            {/* ✅ SEÇÃO DE ITENS COM O FORMULÁRIO */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4">Itens e Serviços</h3>
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-2 px-4">Descrição</th>
                                <th className="text-right py-2 px-4">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itens.map(item => (
                                <tr key={item.id} className="border-t">
                                    <td className="py-2 px-4">{item.descricao}</td>
                                    <td className="text-right py-2 px-4">{item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                </tr>
                            ))}
                             {itens.length === 0 && (
                                <tr><td colSpan={2} className="text-center text-gray-500 py-4">Nenhum item adicionado.</td></tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 font-bold bg-gray-50">
                                <td className="text-right py-2 px-4">Total:</td>
                                <td className="text-right py-2 px-4">{os.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                {/* Adicionando o formulário aqui */}
                <AddItemForm osId={os.id} onAddItem={fetchOSData} />
            </div>
        </div>
        
        {/* Coluna Lateral */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">Cliente</h3>
                <p className="font-bold">{cliente?.nome}</p>
                <p className="text-sm text-gray-500">{cliente?.email}</p>
                <p className="text-sm text-gray-500">{cliente?.telefone}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">Veículo</h3>
                <p className="font-bold">{veiculo?.placa}</p>
                <p className="text-sm text-gray-500">{veiculo?.marca} {veiculo?.modelo}</p>
                <p className="text-sm text-gray-500">Ano: {veiculo?.ano}</p>
            </div>
        </div>
      </div>
    </div>
  );
}
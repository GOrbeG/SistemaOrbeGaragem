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
  descricao_problema: string;
  data_entrada: string; // Corrigido de data_criacao
  valor_total: number;
  cliente_id: number;
  veiculo_id: number;
  tecnico_id: number; // Corrigido de usuario_id
}
interface ItemOS {
  id: number;
  descricao: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}
// Interface para o formulário de novo item
interface Servico { id: number; nome_servico: string; preco_padrao: number; }
interface Produto { id: number; nome_produto: string; preco_venda: number; }
type ItemFormData = {
    tipo: 'servico' | 'produto' | 'manual';
    servico_id?: number;
    produto_peca_id?: number;
    descricao_manual?: string;
    quantidade: number;
    preco_unitario: number;
}

// ✅ --- Sub-componente para o formulário de adicionar item ---
const AddItemForm = ({ osId, onAddItem }: { osId: number, onAddItem: () => void }) => {
    const { register, handleSubmit, reset, watch, setValue, formState: { isSubmitting } } = useForm<ItemFormData>({
        defaultValues: { tipo: 'servico', quantidade: 1 }
    });
    const [servicos, setServicos] = useState<Servico[]>([]);
    const [produtos, setProdutos] = useState<Produto[]>([]);

    useEffect(() => {
        api.get('/api/servicos').then(res => setServicos(res.data));
        api.get('/api/produtos').then(res => setProdutos(res.data));
    }, []);

    const tipoSelecionado = watch('tipo');
    const servicoIdSelecionado = watch('servico_id');
    const produtoIdSelecionado = watch('produto_peca_id');

    useEffect(() => {
        if (tipoSelecionado === 'servico' && servicoIdSelecionado) {
            const servico = servicos.find(s => s.id === Number(servicoIdSelecionado));
            if (servico) setValue('preco_unitario', servico.preco_padrao);
        }
    }, [servicoIdSelecionado, tipoSelecionado, servicos, setValue]);
    
    useEffect(() => {
        if (tipoSelecionado === 'produto' && produtoIdSelecionado) {
            const produto = produtos.find(p => p.id === Number(produtoIdSelecionado));
            if (produto) setValue('preco_unitario', produto.preco_venda);
        }
    }, [produtoIdSelecionado, tipoSelecionado, produtos, setValue]);

    const onSubmit: SubmitHandler<ItemFormData> = async (data) => {
        try {
            const payload = {
                ordem_servico_id: osId,
                quantidade: Number(data.quantidade),
                preco_unitario: Number(data.preco_unitario),
                servico_id: data.tipo === 'servico' ? data.servico_id : null,
                produto_peca_id: data.tipo === 'produto' ? data.produto_peca_id : null,
                descricao_manual: data.tipo === 'manual' ? data.descricao_manual : null,
            };
            await api.post('/api/itens-ordem', payload);
            reset({ tipo: 'servico', quantidade: 1, preco_unitario: 0 });
            onAddItem();
        } catch (error) {
            console.error("Erro ao adicionar item:", error);
            alert("Não foi possível adicionar o item.");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 p-4 border-t bg-gray-50 space-y-3">
            <div className="grid grid-cols-4 gap-3">
                {/* Seletor de Tipo */}
                <div className="col-span-1">
                    <label className="text-sm font-medium">Tipo</label>
                    <select {...register('tipo')} className="w-full mt-1 p-2 border rounded-md bg-white">
                        <option value="servico">Serviço</option>
                        <option value="produto">Peça/Produto</option>
                        <option value="manual">Item Manual</option>
                    </select>
                </div>

                {/* Seletor Dinâmico */}
                <div className="col-span-3">
                    <label className="text-sm font-medium">Item</label>
                    {tipoSelecionado === 'servico' && (
                        <select {...register('servico_id')} className="w-full mt-1 p-2 border rounded-md bg-white">
                            <option value="">Selecione um serviço...</option>
                            {servicos.map(s => <option key={s.id} value={s.id}>{s.nome_servico}</option>)}
                        </select>
                    )}
                    {tipoSelecionado === 'produto' && (
                         <select {...register('produto_peca_id')} className="w-full mt-1 p-2 border rounded-md bg-white">
                            <option value="">Selecione uma peça...</option>
                            {produtos.map(p => <option key={p.id} value={p.id}>{p.nome_produto}</option>)}
                        </select>
                    )}
                    {tipoSelecionado === 'manual' && (
                        <input {...register('descricao_manual')} placeholder="Descrição do item/serviço manual" className="w-full mt-1 p-2 border rounded-md"/>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
                <div className="w-full">
                    <label className="text-sm font-medium">Qtd.</label>
                    <input {...register('quantidade')} type="number" defaultValue={1} className="w-full mt-1 p-2 border rounded-md" />
                </div>
                <div className="w-full">
                    <label className="text-sm font-medium">Vl. Unit. (R$)</label>
                    <input {...register('preco_unitario')} type="number" step="0.01" placeholder="0.00" className="w-full mt-1 p-2 border rounded-md" />
                </div>
                <div className="col-span-2 flex items-end">
                    <button type="submit" disabled={isSubmitting} className="h-10 w-full bg-green-600 hover:bg-green-700 text-white rounded-md inline-flex items-center justify-center gap-2 disabled:bg-gray-400">
                        <PlusCircle size={18} /> {isSubmitting ? 'Adicionando...' : 'Adicionar Item'}
                    </button>
                </div>
            </div>
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
      const itensRes = await api.get(`/api/itens-ordem?ordem_servico_id=${id}`);
      
      const osData: OSDetails = osRes.data;
      setOs(osData);
      setItens(itensRes.data);

      if (osData.cliente_id && osData.veiculo_id && osData.tecnico_id) {
          const [clienteRes, veiculoRes, tecnicoRes] = await Promise.all([
              api.get(`/api/clientes/${osData.cliente_id}`),
              api.get(`/api/veiculos/${osData.veiculo_id}`),
              api.get(`/api/usuarios/${osData.tecnico_id}`)
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
                <p><strong className="text-gray-600">Descrição:</strong> {os.descricao_problema}</p>
            </div>
            
            {/* ✅ SEÇÃO DE ITENS COM O FORMULÁRIO */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4">Itens e Serviços</h3>
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-2 px-4 text-xs font-medium text-gray-500 uppercase">Descrição</th>
                                <th className="text-center py-2 px-4 text-xs font-medium text-gray-500 uppercase">Qtd</th>
                                <th className="text-right py-2 px-4 text-xs font-medium text-gray-500 uppercase">Vl. Unit.</th>
                                <th className="text-right py-2 px-4 text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itens.map(item => (
                                <tr key={item.id} className="border-t">
                                    <td className="py-2 px-4 text-sm">{item.descricao}</td>
                                    <td className="text-center py-2 px-4 text-sm">{item.quantidade}</td>
                                    <td className="text-right py-2 px-4 text-sm">{item.preco_unitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    <td className="text-right py-2 px-4 text-sm font-medium">{item.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                </tr>
                            ))}
                             {itens.length === 0 && (
                                <tr><td colSpan={4} className="text-center text-gray-500 py-4">Nenhum item adicionado.</td></tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 font-bold bg-gray-50">
                                <td colSpan={3} className="text-right py-2 px-4">Total:</td>
                                <td className="text-right py-2 px-4">{os.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
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
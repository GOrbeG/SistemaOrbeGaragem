// src/pages/os/OSDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/services/api';
import { Download, Edit } from 'lucide-react';

// Interfaces para os dados
interface OSDetails {
  id: number;
  status: string;
  descricao: string;
  data_criacao: string;
  valor_total: number;
  // Incluir IDs para buscar mais detalhes
  cliente_id: number;
  veiculo_id: number;
  usuario_id: number;
}

interface ItemOS {
  id: number;
  descricao: string;
  valor: number;
}

// Supondo que você tenha essas interfaces no seu @/types
import { Cliente, Veiculo, Usuario } from '@/types';

export default function OSDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [os, setOs] = useState<OSDetails | null>(null);
  const [itens, setItens] = useState<ItemOS[]>([]);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [tecnico, setTecnico] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchOSData = async () => {
      try {
        setLoading(true);
        // Busca os dados principais da OS e dos itens em paralelo
        const [osRes, itensRes] = await Promise.all([
          api.get(`/api/os/${id}`),
          api.get(`/api/itens-ordem?ordemId=${id}`)
        ]);

        const osData: OSDetails = osRes.data;
        setOs(osData);
        setItens(itensRes.data);

        // Com os IDs da OS, busca os detalhes do cliente, veículo e técnico
        const [clienteRes, veiculoRes, tecnicoRes] = await Promise.all([
            api.get(`/api/clientes/${osData.cliente_id}`),
            api.get(`/api/veiculos/${osData.veiculo_id}`),
            api.get(`/api/usuarios/${osData.usuario_id}`) // Supondo que essa rota exista
        ]);
        setCliente(clienteRes.data);
        setVeiculo(veiculoRes.data);
        setTecnico(tecnicoRes.data);

      } catch (error) {
        console.error("Erro ao carregar dados da OS:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOSData();
  }, [id]);

  const handleDownloadPDF = async () => {
    try {
        const response = await api.get(`/api/os/${id}/exportar`, {
            responseType: 'blob', // Importante: informa ao axios para tratar a resposta como um arquivo
        });
        // Cria um link temporário para o arquivo e simula um clique para iniciar o download
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
      {/* Cabeçalho com Título e Ações */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Detalhes da OS #{os.id}</h1>
        <div className="flex gap-2">
            <Link to={`/os/editar/${os.id}`} className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold">
                <Edit size={18} /> Editar
            </Link>
            <button onClick={handleDownloadPDF} className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold">
                <Download size={18} /> Baixar PDF
            </button>
        </div>
      </div>
      
      {/* Grid com os Detalhes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">Informações Gerais</h3>
                <p><strong className="text-gray-600">Status:</strong> {os.status}</p>
                <p><strong className="text-gray-600">Técnico:</strong> {tecnico?.nome || 'N/A'}</p>
                <p><strong className="text-gray-600">Descrição:</strong> {os.descricao}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">Itens e Serviços</h3>
                <table className="min-w-full">
                    <thead>
                        <tr>
                            <th className="text-left py-2">Descrição</th>
                            <th className="text-right py-2">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itens.map(item => (
                            <tr key={item.id} className="border-t">
                                <td className="py-2">{item.descricao}</td>
                                <td className="text-right py-2">{item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 font-bold">
                            <td className="text-right py-2">Total:</td>
                            <td className="text-right py-2">{os.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        </tr>
                    </tfoot>
                </table>
                {/* Futuramente, um botão para adicionar novos itens aqui */}
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
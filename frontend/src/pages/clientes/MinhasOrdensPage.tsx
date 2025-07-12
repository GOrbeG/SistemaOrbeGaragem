// src/pages/cliente/MinhasOrdensPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';
import { getUserDataFromToken } from '@/services/authService';
import { Eye } from 'lucide-react';

interface OrdemServico {
    id: number;
    status: string;
    data_criacao: string;
    valor_total: number;
    descricao: string;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const statusColors: { [key: string]: string } = {
      aberta: 'bg-blue-100 text-blue-800',
      agendada: 'bg-purple-100 text-purple-800',
      'em andamento': 'bg-yellow-100 text-yellow-800',
      concluida: 'bg-green-100 text-green-800',
      cancelada: 'bg-red-100 text-red-800',
      finalizada: 'bg-gray-500 text-white'
    };
    const color = statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    return <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>{status}</span>;
};

export default function MinhasOrdensPage() {
    const [ordens, setOrdens] = useState<OrdemServico[]>([]);
    const [loading, setLoading] = useState(true);
    const userData = getUserDataFromToken();

    useEffect(() => {
        if (userData?.id) {
            setLoading(true);
            api.get(`/api/os?clienteId=${userData.id}`)
                .then(res => setOrdens(res.data))
                .catch(err => console.error("Erro ao buscar ordens de serviço:", err))
                .finally(() => setLoading(false));
        }
    }, [userData?.id]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Minhas Ordens de Serviço</h1>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nº OS</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading && <tr><td colSpan={5} className="text-center p-4">Carregando...</td></tr>}
                        {!loading && ordens.length === 0 && <tr><td colSpan={5} className="text-center p-4 text-gray-500">Nenhuma ordem de serviço encontrada.</td></tr>}
                        {!loading && ordens.map(os => (
                            <tr key={os.id}>
                                <td className="px-6 py-4 font-medium">#{os.id}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{new Date(os.data_criacao).toLocaleDateString('pt-BR')}</td>
                                <td className="px-6 py-4 text-sm text-gray-800 truncate" style={{ maxWidth: '300px' }}>{os.descricao}</td>
                                <td className="px-6 py-4 text-sm"><StatusBadge status={os.status} /></td>
                                <td className="px-6 py-4 text-center">
                                    <Link to={`/os/${os.id}`} className="text-blue-600 hover:text-blue-800" title="Ver Detalhes e Acompanhar">
                                        <Eye size={20} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
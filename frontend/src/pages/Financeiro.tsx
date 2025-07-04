// src/pages/Financeiro.tsx - VERSÃO FINAL COM NAVEGAÇÃO
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Importa o useNavigate
import { api } from '@/services/api';
import { PlusCircle, MinusCircle } from 'lucide-react';
import CategoriasPage from './financeiro/CategoriasPage';
import RelatoriosView from './financeiro/RelatoriosView';

// --- Interface da Transacao ---
interface Transacao {
    id: number;
    descricao: string;
    valor: string;
    tipo: 'entrada' | 'saida';
    data_transacao: string;
    categoria_nome: string;
}

// --- Sub-componente para a visão de Lançamentos ---
const LancamentosView = () => {
    const [transacoes, setTransacoes] = useState<Transacao[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // ✅ Hook para navegação

    useEffect(() => {
        setLoading(true);
        api.get('/api/transacoes-financeiras')
            .then(res => setTransacoes(res.data))
            .catch(err => console.error("Erro ao buscar transações:", err))
            .finally(() => setLoading(false));
    }, []);
    
    const { totalEntradas, totalSaidas, saldo } = useMemo(() => {
        const entradas = transacoes.reduce((acc, t) => t.tipo === 'entrada' ? acc + Number(t.valor) : acc, 0);
        const saidas = transacoes.reduce((acc, t) => t.tipo === 'saida' ? acc + Number(t.valor) : acc, 0);
        return { totalEntradas: entradas, totalSaidas: saidas, saldo: entradas - saidas };
    }, [transacoes]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-100 p-6 rounded-lg shadow"><h3 className="text-lg font-semibold text-green-800">Receitas</h3><p className="text-3xl font-bold text-green-700">{totalEntradas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></div>
                <div className="bg-red-100 p-6 rounded-lg shadow"><h3 className="text-lg font-semibold text-red-800">Despesas</h3><p className="text-3xl font-bold text-red-700">{totalSaidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></div>
                <div className="bg-blue-100 p-6 rounded-lg shadow"><h3 className="text-lg font-semibold text-blue-800">Saldo</h3><p className="text-3xl font-bold text-blue-700">{saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
                <h2 className="text-xl font-semibold">Últimos Lançamentos</h2>
                <div className="flex gap-4">
                    {/* ✅ BOTÕES AGORA NAVEGAM PARA A NOVA PÁGINA */}
                    <button onClick={() => navigate('/financeiro/lancamento/novo?tipo=entrada')} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"><PlusCircle size={20} /> Nova Receita</button>
                    <button onClick={() => navigate('/financeiro/lancamento/novo?tipo=saida')} className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"><MinusCircle size={20} /> Nova Despesa</button>
                </div>
            </div>
            
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={4} className="text-center p-4 text-gray-500">Carregando...</td></tr>
                        ) : transacoes.length === 0 ? (
                             <tr><td colSpan={4} className="text-center p-4 text-gray-500">Nenhum lançamento encontrado.</td></tr>
                        ) : transacoes.map(t => (
                            <tr key={t.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(t.data_transacao).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{t.descricao}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{t.categoria_nome}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${t.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                                    {t.tipo === 'saida' && '- '}{Number(t.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Componente principal da página Financeiro ---
export default function FinanceiroPage() {
    const [activeTab, setActiveTab] = useState<'lancamentos' | 'categorias' | 'relatorios'>('lancamentos');

    const renderContent = () => {
        switch(activeTab) {
            case 'lancamentos': return <LancamentosView />;
            case 'categorias': return <CategoriasPage />;
            case 'relatorios': return <RelatoriosView />;
            default: return <LancamentosView />;
        }
    };
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Gestão Financeira</h1>
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('lancamentos')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'lancamentos' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Lançamentos</button>
                    <button onClick={() => setActiveTab('categorias')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'categorias' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Gerenciar Categorias</button>
                    <button onClick={() => setActiveTab('relatorios')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'relatorios' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Relatórios</button>
                </nav>
            </div>
            <div className="pt-4">{renderContent()}</div>
        </div>
    );
}
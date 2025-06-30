// src/pages/Financeiro.tsx
import { useState, useEffect, useMemo } from 'react';
import { api } from '@/services/api';
import TransacaoFormModal from '@/components/financeiro/TransacaoFormModal';
import { PlusCircle, MinusCircle } from 'lucide-react';

interface Transacao {
    id: number;
    descricao: string;
    valor: number;
    tipo: 'entrada' | 'saida';
    data_transacao: string;
    categoria_nome: string;
}

export default function FinanceiroPage() {
    const [transacoes, setTransacoes] = useState<Transacao[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'entrada' | 'saida'>('entrada');

    // Função para buscar as transações
    const fetchTransacoes = () => {
        setLoading(true);
        api.get('/api/transacoes-financeiras')
            .then(res => setTransacoes(res.data))
            .catch(err => console.error("Erro ao buscar transações:", err))
            .finally(() => setLoading(false));
    };

    // Busca os dados quando a página carrega
    useEffect(() => {
        fetchTransacoes();
    }, []);
    
    // Calcula os totais para os cards de resumo
    const { totalEntradas, totalSaidas, saldo } = useMemo(() => {
        const entradas = transacoes.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + Number(t.valor), 0);
        const saidas = transacoes.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + Number(t.valor), 0);
        return {
            totalEntradas: entradas,
            totalSaidas: saidas,
            saldo: entradas - saidas
        };
    }, [transacoes]);

    const handleOpenModal = (tipo: 'entrada' | 'saida') => {
        setModalType(tipo);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Gestão Financeira</h1>
            
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-100 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-green-800">Receitas no Período</h3>
                    <p className="text-3xl font-bold text-green-700">{totalEntradas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
                <div className="bg-red-100 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-red-800">Despesas no Período</h3>
                    <p className="text-3xl font-bold text-red-700">{totalSaidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
                <div className="bg-blue-100 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-blue-800">Saldo Final</h3>
                    <p className="text-3xl font-bold text-blue-700">{saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
            </div>

            {/* Barra de Ações e Filtros */}
            <div className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
                <div>{/* Filtros podem ser adicionados aqui no futuro */}</div>
                <div className="flex gap-4">
                    <button onClick={() => handleOpenModal('entrada')} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold">
                        <PlusCircle size={20} /> Nova Receita
                    </button>
                    <button onClick={() => handleOpenModal('saida')} className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold">
                        <MinusCircle size={20} /> Nova Despesa
                    </button>
                </div>
            </div>
            
            {/* Tabela de Transações */}
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
                            <tr><td colSpan={4} className="text-center p-4">Carregando...</td></tr>
                        ) : transacoes.map(t => (
                            <tr key={t.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(t.data_transacao).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{t.descricao}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{t.categoria_nome}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${t.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                                    {t.tipo === 'saida' && '- '}{t.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                            </tr>
                        ))}
                         {!loading && transacoes.length === 0 && (
                            <tr><td colSpan={4} className="text-center p-4 text-gray-500">Nenhum lançamento encontrado.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* O Modal de Formulário */}
            <TransacaoFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchTransacoes}
                tipo={modalType}
            />
        </div>
    );
}
// src/pages/financeiro/RelatoriosView.tsx - VERSÃO FINAL E CORRIGIDA
import { useState, useEffect, ChangeEvent } from 'react';
import { api } from '@/services/api';
// ✅ MUDANÇA: Removidos os imports de gráficos de barra que não são usados
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend as PieLegend } from 'recharts';

// ✅ MUDANÇA: Criadas as "plantas" (interfaces) para os dados dos relatórios
interface ResumoData {
  total_receitas: number;
  total_despesas: number;
  lucro_prejuizo: number;
}
interface CategoriaData {
    nome_categoria: string;
    total: number;
}
interface DistribuicaoData {
  entradas: CategoriaData[];
  saidas: CategoriaData[];
}

// Funções para formatar datas
const getFirstDayOfMonth = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
};
const getLastDayOfMonth = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

export default function RelatoriosView() {
    const [filtro, setFiltro] = useState({ data_inicio: getFirstDayOfMonth(), data_fim: getLastDayOfMonth() });
    
    // ✅ MUDANÇA: Estados agora têm tipos definidos
    const [resumo, setResumo] = useState<ResumoData | null>(null);
    const [distribuicao, setDistribuicao] = useState<DistribuicaoData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const fetchReports = async () => {
            try {
                const [resumoRes, distribuicaoRes] = await Promise.all([
                    api.get<ResumoData>('/api/relatorios/resumo-periodo', { params: filtro }),
                    api.get<DistribuicaoData>('/api/relatorios/distribuicao-categorias', { params: filtro })
                ]);
                setResumo(resumoRes.data);
                setDistribuicao(distribuicaoRes.data);
            } catch (error) {
                console.error("Erro ao buscar relatórios:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, [filtro]);

    // ✅ MUDANÇA: Adicionado o tipo para o parâmetro 'e'
    const handleFiltroChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFiltro(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    if (loading) return <p className="text-center p-10">Carregando relatórios...</p>;
    if (!resumo || !distribuicao) return <p className="text-center p-10 text-red-500">Não foi possível carregar os dados dos relatórios.</p>;

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4">
                <label>De: <input type="date" name="data_inicio" value={filtro.data_inicio} onChange={handleFiltroChange} className="p-2 border rounded" /></label>
                <label>Até: <input type="date" name="data_fim" value={filtro.data_fim} onChange={handleFiltroChange} className="p-2 border rounded" /></label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-100 p-6 rounded-lg shadow"><h3 className="text-lg font-semibold text-green-800">Total de Receitas</h3><p className="text-3xl font-bold text-green-700">{resumo.total_receitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></div>
                <div className="bg-red-100 p-6 rounded-lg shadow"><h3 className="text-lg font-semibold text-red-800">Total de Despesas</h3><p className="text-3xl font-bold text-red-700">{resumo.total_despesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></div>
                <div className={`p-6 rounded-lg shadow ${resumo.lucro_prejuizo >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}><h3 className={`text-lg font-semibold ${resumo.lucro_prejuizo >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>Lucro / Prejuízo</h3><p className={`text-3xl font-bold ${resumo.lucro_prejuizo >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>{resumo.lucro_prejuizo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-4">Receitas por Categoria</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={distribuicao.entradas} dataKey="total" nameKey="nome_categoria" cx="50%" cy="50%" outerRadius={80} label>
                                {/* ✅ MUDANÇA: Removido 'entry' e adicionado tipo para 'index' */}
                                {distribuicao.entradas.map((_, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                            <PieLegend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-4">Despesas por Categoria</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={distribuicao.saidas} dataKey="total" nameKey="nome_categoria" cx="50%" cy="50%" outerRadius={80} label>
                                {/* ✅ MUDANÇA: Removido 'entry' e adicionado tipo para 'index' */}
                                {distribuicao.saidas.map((_, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                            <PieLegend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
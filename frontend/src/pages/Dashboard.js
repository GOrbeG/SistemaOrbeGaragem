import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '@/services/authService';
export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchDashboard = async () => {
            const token = getToken();
            if (!token) {
                setError('Token não encontrado. Faça login novamente.');
                setLoading(false);
                return;
            }
            try {
                // Ajuste a URL abaixo conforme o seu app.use('/dashboard', dashboardRoutes) no backend
                const response = await axios.get('http://localhost:3000/dashboard', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setData(response.data);
            }
            catch (err) {
                console.error(err);
                setError(err.response?.data?.error || 'Erro ao carregar dados do dashboard');
            }
            finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("span", { className: "text-xl", children: "Carregando dashboard..." }) }));
    }
    if (error) {
        return (_jsxs("div", { className: "p-6 text-center text-red-600", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Erro" }), _jsx("p", { className: "mt-2", children: error })] }));
    }
    if (!data) {
        return null;
    }
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsx("h1", { className: "text-3xl font-bold text-[#1b75bb]", children: "Dashboard" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-white p-4 rounded shadow", children: [_jsx("h2", { className: "text-lg font-medium text-gray-700", children: "Usu\u00E1rios" }), _jsx("p", { className: "text-2xl font-bold", children: data.total_usuarios })] }), _jsxs("div", { className: "bg-white p-4 rounded shadow", children: [_jsx("h2", { className: "text-lg font-medium text-gray-700", children: "Clientes" }), _jsx("p", { className: "text-2xl font-bold", children: data.total_clientes })] }), _jsxs("div", { className: "bg-white p-4 rounded shadow", children: [_jsx("h2", { className: "text-lg font-medium text-gray-700", children: "Ve\u00EDculos" }), _jsx("p", { className: "text-2xl font-bold", children: data.total_veiculos })] }), _jsxs("div", { className: "bg-white p-4 rounded shadow", children: [_jsx("h2", { className: "text-lg font-medium text-gray-700", children: "Ordens Totais" }), _jsx("p", { className: "text-2xl font-bold", children: data.total_ordens })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-white p-4 rounded shadow", children: [_jsx("h2", { className: "text-lg font-medium text-gray-700", children: "Ordens Abertas" }), _jsx("p", { className: "text-2xl font-bold text-yellow-500", children: data.ordens_abertas })] }), _jsxs("div", { className: "bg-white p-4 rounded shadow", children: [_jsx("h2", { className: "text-lg font-medium text-gray-700", children: "Ordens Fechadas" }), _jsx("p", { className: "text-2xl font-bold text-green-500", children: data.ordens_fechadas })] }), _jsxs("div", { className: "bg-white p-4 rounded shadow", children: [_jsx("h2", { className: "text-lg font-medium text-gray-700", children: "Receita Total" }), _jsxs("p", { className: "text-2xl font-bold text-blue-600", children: ["R$ ", data.receita_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })] })] })] }), _jsxs("div", { className: "bg-white p-4 rounded shadow", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-700 mb-2", children: "Ordens por M\u00EAs (\u00FAltimos 6 meses)" }), _jsx("ul", { className: "space-y-1", children: data.ordens_por_mes.map((item) => (_jsxs("li", { className: "flex justify-between", children: [_jsx("span", { children: item.mes }), _jsx("span", { children: item.total })] }, item.mes))) })] }), _jsxs("div", { className: "bg-white p-4 rounded shadow", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-700 mb-2", children: "Top 5 Funcion\u00E1rios (Ordens)" }), _jsx("ul", { className: "space-y-1", children: data.ordens_por_funcionario.map((item) => (_jsxs("li", { className: "flex justify-between", children: [_jsx("span", { children: item.nome }), _jsx("span", { children: item.total })] }, item.nome))) })] }), _jsxs("div", { className: "bg-white p-4 rounded shadow", children: [_jsx("h2", { className: "text-lg font-medium text-gray-700", children: "Total de Agendamentos" }), _jsx("p", { className: "text-2xl font-bold", children: data.total_agendamentos })] })] }));
}

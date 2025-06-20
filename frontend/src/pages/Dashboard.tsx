// src/pages/Dashboard.tsx - VERSÃO MELHORADA
import { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '@/services/authService';
import DashboardCard from '@/components/DashboardCard'; // Importando nosso novo card

// Ícones da Lucide
import { BookUser, Car, Wrench, DollarSign } from 'lucide-react';

// Componentes da Recharts
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Configuração do Axios (como você já tinha)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
api.interceptors.request.use(async (config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interfaces (como você já tinha)
interface OrdemPorMes { mes: string; total: number; }
interface OrdemPorFuncionario { nome: string; total: number; }
interface DashboardData {
  total_usuarios: number;
  total_clientes: number;
  total_veiculos: number;
  total_ordens: number;
  ordens_abertas: number;
  ordens_fechadas: number;
  receita_total: number;
  ordens_por_mes: OrdemPorMes[];
  ordens_por_funcionario: OrdemPorFuncionario[];
  total_agendamentos: number;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get<DashboardData>('/api/dashboard');
        setData(response.data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.error || 'Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="text-center p-10">Carregando dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600"><h2 className="text-2xl font-bold">Erro</h2><p className="mt-2">{error}</p></div>;
  }

  if (!data) {
    return null;
  }

  // Dados para o gráfico de Pizza/Rosca
  const statusData = [
    { name: 'Abertas', value: data.ordens_abertas },
    { name: 'Fechadas', value: data.ordens_fechadas },
  ];
  const COLORS = ['#f59e0b', '#22c55e']; // Amarelo para abertas, Verde para fechadas

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 text-left">Dashboard</h1>

      {/* Seção de Cards de KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <DashboardCard
          title="Receita Total"
          value={data.receita_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon={<DollarSign className="text-green-600" />}
          iconBgColor="bg-green-100"
        />
        <DashboardCard
          title="Ordens de Serviço"
          value={data.total_ordens}
          icon={<Wrench className="text-blue-600" />}
          iconBgColor="bg-blue-100"
        />
        <DashboardCard
          title="Clientes"
          value={data.total_clientes}
          icon={<BookUser className="text-purple-600" />}
          iconBgColor="bg-purple-100"
        />
         <DashboardCard
          title="Veículos"
          value={data.total_veiculos}
          icon={<Car className="text-red-600" />}
          iconBgColor="bg-red-100"
        />
      </div>

      {/* Seção de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Barras - Ordens por Mês */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-lg text-gray-800 mb-4 text-left">Ordens de Serviço por Mês</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.ordens_por_mes} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="mes" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: 'rgba(229, 231, 235, 0.5)' }}
                contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
              />
              <Legend wrapperStyle={{ fontSize: '14px' }}/>
              <Bar dataKey="total" name="Nº de Ordens" fill="#1b75bb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Rosca - Status das Ordens */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-lg text-gray-800 mb-4 text-left">Status das Ordens</h3>
           <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}/>
              <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
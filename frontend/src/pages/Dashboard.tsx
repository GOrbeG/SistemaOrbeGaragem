// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '@/services/authService';

interface OrdemPorMes {
  mes: string;
  total: number;
}

interface OrdemPorFuncionario {
  nome: string;
  total: number;
}

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
      const token = getToken();
      if (!token) {
        setError('Token não encontrado. Faça login novamente.');
        setLoading(false);
        return;
      }

      try {
        // Ajuste a URL abaixo conforme o seu app.use('/dashboard', dashboardRoutes) no backend
        const response = await axios.get<DashboardData>('http://localhost:3000/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
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
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-xl">Carregando dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <h2 className="text-2xl font-bold">Erro</h2>
        <p className="mt-2">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-[#1b75bb]">Dashboard</h1>

      {/* 1) Cards resumo geral */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-medium text-gray-700">Usuários</h2>
          <p className="text-2xl font-bold">{data.total_usuarios}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-medium text-gray-700">Clientes</h2>
          <p className="text-2xl font-bold">{data.total_clientes}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-medium text-gray-700">Veículos</h2>
          <p className="text-2xl font-bold">{data.total_veiculos}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-medium text-gray-700">Ordens Totais</h2>
          <p className="text-2xl font-bold">{data.total_ordens}</p>
        </div>
      </div>

      {/* 2) Status de ordens e receita */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-medium text-gray-700">Ordens Abertas</h2>
          <p className="text-2xl font-bold text-yellow-500">{data.ordens_abertas}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-medium text-gray-700">Ordens Fechadas</h2>
          <p className="text-2xl font-bold text-green-500">{data.ordens_fechadas}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-medium text-gray-700">Receita Total</h2>
          <p className="text-2xl font-bold text-blue-600">
            R$ {data.receita_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* 3) Ordens por mês */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Ordens por Mês (últimos 6 meses)
        </h2>
        <ul className="space-y-1">
          {data.ordens_por_mes.map((item) => (
            <li key={item.mes} className="flex justify-between">
              <span>{item.mes}</span>
              <span>{item.total}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 4) Top 5 funcionários */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Top 5 Funcionários (Ordens)
        </h2>
        <ul className="space-y-1">
          {data.ordens_por_funcionario.map((item) => (
            <li key={item.nome} className="flex justify-between">
              <span>{item.nome}</span>
              <span>{item.total}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 5) Total de agendamentos */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-medium text-gray-700">Total de Agendamentos</h2>
        <p className="text-2xl font-bold">{data.total_agendamentos}</p>
      </div>
    </div>
  );
}

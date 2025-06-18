// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { getToken } from '@/services/authService';
// Importe a instância configurada do Axios que criamos para chamadas autenticadas// Supondo que você criou o arquivo api.js/ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// "Interceptador" de requisições: Este código roda ANTES de cada chamada da API
api.interceptors.request.use(
  async (config) => {
    const token = getToken(); // Pega o token do localStorage
    if (token) {
      // Se o token existir, adiciona o cabeçalho de autorização
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // Continua com a requisição
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
        // --- MUDANÇA 2: Usar a variável de ambiente para a URL da API ---
        const API_URL = import.meta.env.VITE_API_URL;
        
        // O caminho da rota é '/api/dashboard' conforme seu app.js
        const response = await axios.get<DashboardData>(`${API_URL}/api/dashboard`, {
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
    return null; // Não renderiza nada se não houver dados
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-[#1b75bb]">Dashboard</h1>

      {/* Cards resumo geral */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card de Usuários */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-700">Usuários</h2>
          <p className="text-3xl font-bold">{data.total_usuarios}</p>
        </div>
        {/* Card de Clientes */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-700">Clientes</h2>
          <p className="text-3xl font-bold">{data.total_clientes}</p>
        </div>
        {/* Card de Veículos */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-700">Veículos</h2>
          <p className="text-3xl font-bold">{data.total_veiculos}</p>
        </div>
        {/* Card de Ordens Totais */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-700">Ordens Totais</h2>
          <p className="text-3xl font-bold">{data.total_ordens}</p>
        </div>
      </div>

      {/* Status de ordens e receita */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-700">Ordens Abertas</h2>
          <p className="text-3xl font-bold text-yellow-500">{data.ordens_abertas}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-700">Ordens Fechadas</h2>
          <p className="text-3xl font-bold text-green-500">{data.ordens_fechadas}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-700">Receita Total</h2>
          <p className="text-3xl font-bold text-blue-600">
            R$ {data.receita_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
      
      {/* ... o resto do seu código para os outros gráficos continua igual ... */}
      
    </div>
  );
}
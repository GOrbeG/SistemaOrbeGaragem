// src/routes/Router.tsx - VERSÃO CORRIGIDA
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import AppLayout from '../components/layout/AppLayout';
import LancamentoFormPage from '@/pages/financeiro/LancamentoFormPage';

// Importe suas páginas
import SplashScreen from '../pages/SplashScreen';
import Login from '../pages/Login';
import Cadastro from '../pages/Cadastro';
import SetupAdminPage from '@/pages/SetupAdminPage';
import Dashboard from '../pages/Dashboard';
import Financeiro from '../pages/Financeiro';
import Agendamentos from '../pages/Agendamentos';
import OrdensServico from '../pages/OrdensServico';
import OSFormPage from '@/pages/os/OSFormPage'; // ✅ IMPORTAÇÃO ADICIONADA
import Historico from '../pages/Historico';
import Favoritos from '../pages/Favoritos';
import Perfil from '../pages/Perfil';
import CadastrarFuncionario from '../pages/admin/CadastrarFuncionario';
import ClientesPage from '@/pages/clientes/ClientesPage';
import ClienteFormPage from '@/pages/clientes/ClienteFormPage';
import ClienteDetailPage from '@/pages/clientes/ClienteDetailPage';
import OSDetailPage from '@/pages/os/OSDetailPage';

// Componente que une a proteção e o layout
const ProtectedLayout = () => {
  return (
    // ✅ CORREÇÃO CRÍTICA DAS PERMISSÕES
    <PrivateRoute allowedRoles={['administrador', 'funcionario', 'cliente']}>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </PrivateRoute>
  );
};

const AppContent = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000); 
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return (
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/setup-admin" element={<SetupAdminPage />} />

        <Route element={<ProtectedLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="financeiro" element={<Financeiro />} />
          <Route path="agendamentos" element={<Agendamentos />} />
          <Route path="clientes/:id" element={<ClienteDetailPage />} />
          <Route path="os" element={<OrdensServico />} />
          <Route path="os/novo" element={<OSFormPage />} />
          <Route path="os/editar/:id" element={<OSFormPage />} />
          <Route path="os/:id" element={<OSDetailPage />} />
          <Route path="historico" element={<Historico />} />
          <Route path="favoritos" element={<Favoritos />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="admin/funcionarios/novo" element={<CadastrarFuncionario />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="clientes/novo" element={<ClienteFormPage />} />
          <Route path="clientes/editar/:id"element={<ClienteFormPage />} />
          <Route path="financeiro/lancamento/novo" element={<LancamentoFormPage />} />
        </Route>
      </Routes>
  );
};

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
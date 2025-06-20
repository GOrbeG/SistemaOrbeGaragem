// src/routes/Router.tsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import AppLayout from '../components/layout/AppLayout';

// Importe suas páginas
import SplashScreen from '../pages/SplashScreen';
import Login from '../pages/Login';
import Cadastro from '../pages/Cadastro';
import Dashboard from '../pages/Dashboard';
import Financeiro from '../pages/Financeiro';
import Agendamentos from '../pages/Agendamentos';
import OrdensServico from '../pages/OrdensServico';
import Historico from '../pages/Historico';
import Favoritos from '../pages/Favoritos';
import Perfil from '../pages/Perfil';
import CadastrarFuncionario from '../pages/admin/CadastrarFuncionario';
import ClientesPage from '@/pages/clientes/ClientesPage';
import ClienteFormPage from '@/pages/clientes/ClienteFormPage';

// Componente que une a proteção e o layout
const ProtectedLayout = () => {
  return (
    <PrivateRoute allowedRoles={[]}>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </PrivateRoute>
  );
};

const AppContent = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lógica da SplashScreen movida para cá
    const timer = setTimeout(() => setLoading(false), 3000); // 3 segundos
    return () => clearTimeout(timer);
  }, []);

  // Se estiver carregando, mostra a SplashScreen em qualquer rota
  if (loading) {
    return <SplashScreen />;
  }

  // Após o carregamento, renderiza as rotas normais
  return (
      <Routes>
        {/* === ROTAS PÚBLICAS === */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* === AGRUPADOR DE ROTAS PROTEGIDAS === */}
        {/* Todas as rotas aqui dentro usarão o layout principal */}
        <Route element={<ProtectedLayout />}>
          
          {/* --- MUDANÇA PRINCIPAL: Remova a barra "/" do início de todas as rotas filhas --- */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="financeiro" element={<Financeiro />} />
          <Route path="agendamentos" element={<Agendamentos />} />
          <Route path="os" element={<OrdensServico />} />
          <Route path="historico" element={<Historico />} />
          <Route path="favoritos" element={<Favoritos />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="admin/funcionarios/novo" element={<CadastrarFuncionario />} />
          <Route path="/clientes" element={<PrivateRoute allowedRoles={['administrador', 'funcionario']}><ClientesPage /></PrivateRoute>} />
          <Route path="/clientes/novo" element={<PrivateRoute allowedRoles={['administrador', 'funcionario']}><ClienteFormPage /></PrivateRoute>} />
          <Route path="/clientes/editar/:id" element={<PrivateRoute allowedRoles={['administrador', 'funcionario']}><ClienteFormPage /></PrivateRoute>} />
          {/* Adicione outras rotas protegidas aqui com caminhos relativos */}

        </Route>
        
        {/* Você pode adicionar uma rota de "Não encontrado" aqui se desejar */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
  );
};
    export default function AppRoutes() {
  // O componente principal agora só tem a responsabilidade de iniciar o BrowserRouter
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
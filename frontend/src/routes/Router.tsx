// src/routes/Router.tsx
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
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

export default function AppRoutes() {
  return (
    <BrowserRouter>
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
          {/* Adicione outras rotas protegidas aqui com caminhos relativos */}

        </Route>
        
        {/* Você pode adicionar uma rota de "Não encontrado" aqui se desejar */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
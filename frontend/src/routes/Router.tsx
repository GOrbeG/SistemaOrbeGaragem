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

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Agrupador de Rotas Protegidas com o Layout Principal */}
        <Route
          element={
            <PrivateRoute allowedRoles={[]}> {/* Protege todas as rotas filhas */}
              <AppLayout>
                <Outlet /> {/* Onde as páginas filhas serão renderizadas */}
              </AppLayout>
            </PrivateRoute>
          }
        >
          {/* Coloque aqui todas as rotas que devem ter o layout com sidebar */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/agendamentos" element={<Agendamentos />} />
          <Route path="/os" element={<OrdensServico />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/favoritos" element={<Favoritos />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/admin/funcionarios/novo" element={<CadastrarFuncionario />} />
          {/* Adicione outras rotas protegidas aqui */}
        </Route>
        
        {/* Você pode adicionar uma rota de "Não encontrado" ou "Acesso Negado" aqui */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
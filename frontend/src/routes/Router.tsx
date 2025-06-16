// src/routes/Router.tsx

// --- PASSO 1: Adicione 'Outlet' à lista de importações ---
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';

import SplashScreen from '../pages/SplashScreen';
import Login from '../pages/Login';
import Cadastro from '../pages/Cadastro';
import PrivateRoute from '../components/PrivateRoute';
import AppLayout from '../components/layout/AppLayout';

// Importe suas páginas protegidas
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

        {/* --- PASSO 2: Crie um grupo de rotas que usarão o layout principal --- */}
        <Route
          path="/"
          element={
            <PrivateRoute allowedRoles={[]}> {/* Protege o layout inteiro */}
              <AppLayout>
                <Outlet /> {/* O <Outlet> renderiza a rota filha correspondente */}
              </AppLayout>
            </PrivateRoute>
          }
        >
          {/* --- PASSO 3: Coloque todas as rotas protegidas AQUI, como filhas --- */}
          {/* O `path` aqui é relativo ao pai. Como o pai é "/", o path continua o mesmo. */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="financeiro" element={<Financeiro />} />
          <Route path="agendamentos" element={<Agendamentos />} />
          <Route path="os" element={<OrdensServico />} />
          <Route path="historico" element={<Historico />} />
          <Route path="favoritos" element={<Favoritos />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="admin/funcionarios/novo" element={<CadastrarFuncionario />} />
          {/* Adicione outras rotas protegidas aqui */}
        </Route>

        {/* Você pode adicionar uma rota de "Não encontrado" ou "Acesso Negado" aqui se desejar */}
        {/* <Route path="/forbidden" element={<AcessoNegado />} /> */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
// src/routes/Router.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import SplashScreen from '../pages/SplashScreen';
import Login from '../pages/Login';

import PrivateRoute from '../components/PrivateRoute';

// Crie (ou importe) as páginas protegidas—por enquanto, apenas placeholders
import Dashboard from '../pages/Dashboard';
import Financeiro from '../pages/Financeiro';
import Agendamentos from '../pages/Agendamentos';
import OrdensServico from '../pages/OrdensServico';
import Historico from '../pages/Historico';
import Favoritos from '../pages/Favoritos';
import Perfil from '../pages/Perfil';

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Rota pública */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<Login />} />

        {/** ROTAS PROTEGIDAS **/}
        {/* Se o usuário não estiver logado, vai para /login */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={['administrador', 'funcionario']}>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/financeiro"
          element={
            <PrivateRoute allowedRoles={['administrador']}>
              <Financeiro />
            </PrivateRoute>
          }
        />

        <Route
          path="/agendamentos"
          element={
            <PrivateRoute allowedRoles={['administrador', 'funcionario', 'cliente']}>
              <Agendamentos />
            </PrivateRoute>
          }
        />

        <Route
          path="/os"
          element={
            <PrivateRoute allowedRoles={['administrador', 'funcionario']}>
              <OrdensServico />
            </PrivateRoute>
          }
        />

        <Route
          path="/historico"
          element={
            <PrivateRoute allowedRoles={['cliente', 'funcionario']}>
              <Historico />
            </PrivateRoute>
          }
        />

        <Route
          path="/favoritos"
          element={
            <PrivateRoute allowedRoles={['cliente']}>
              <Favoritos />
            </PrivateRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <PrivateRoute allowedRoles={[]} /* qualquer usuário autenticado */>
              <Perfil />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/routes/Router.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SplashScreen from '../pages/SplashScreen';
import Login from '../pages/Login';
import Cadastro from '../pages/Cadastro';
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
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(SplashScreen, {}) }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/cadastro", element: _jsx(Cadastro, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(PrivateRoute, { allowedRoles: ['administrador', 'funcionario'], children: _jsx(Dashboard, {}) }) }), _jsx(Route, { path: "/financeiro", element: _jsx(PrivateRoute, { allowedRoles: ['administrador'], children: _jsx(Financeiro, {}) }) }), _jsx(Route, { path: "/agendamentos", element: _jsx(PrivateRoute, { allowedRoles: ['administrador', 'funcionario', 'cliente'], children: _jsx(Agendamentos, {}) }) }), _jsx(Route, { path: "/os", element: _jsx(PrivateRoute, { allowedRoles: ['administrador', 'funcionario'], children: _jsx(OrdensServico, {}) }) }), _jsx(Route, { path: "/historico", element: _jsx(PrivateRoute, { allowedRoles: ['cliente', 'funcionario'], children: _jsx(Historico, {}) }) }), _jsx(Route, { path: "/favoritos", element: _jsx(PrivateRoute, { allowedRoles: ['cliente'], children: _jsx(Favoritos, {}) }) }), _jsx(Route, { path: "/perfil", element: _jsx(PrivateRoute, { allowedRoles: [], children: _jsx(Perfil, {}) }) })] }) }));
}

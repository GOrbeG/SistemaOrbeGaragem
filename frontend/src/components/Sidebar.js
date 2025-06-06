import { jsx as _jsx } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { getUserDataFromToken } from '@/services/authService';
const menuItems = [
    { label: 'Dashboard', path: '/dashboard', allowedRoles: ['administrador', 'funcionario'] },
    { label: 'Financeiro', path: '/financeiro', allowedRoles: ['administrador'] },
    { label: 'Agendamentos', path: '/agendamentos', allowedRoles: ['administrador', 'funcionario', 'cliente'] },
    { label: 'OS', path: '/os', allowedRoles: ['administrador', 'funcionario'] },
    { label: 'Histórico', path: '/historico', allowedRoles: ['cliente', 'funcionario'] },
    { label: 'Favoritos', path: '/favoritos', allowedRoles: ['cliente'] },
    { label: 'Perfil', path: '/perfil', allowedRoles: [] }, // todos autenticados
];
export default function Sidebar() {
    const userData = getUserDataFromToken();
    if (!userData)
        return null;
    return (_jsx("nav", { className: "w-60 bg-white border-r", children: _jsx("ul", { className: "flex flex-col p-4 gap-2", children: menuItems.map((item) => {
                // Se allowedRoles estiver vazio => qualquer usuário autenticado vê
                if (item.allowedRoles.length === 0 ||
                    item.allowedRoles.includes(userData.role)) {
                    return (_jsx("li", { children: _jsx(Link, { to: item.path, className: "block px-3 py-2 rounded hover:bg-gray-200", children: item.label }) }, item.path));
                }
                return null;
            }) }) }));
}

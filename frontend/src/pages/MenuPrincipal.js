import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
// frontend/src/pages/MenuPrincipal.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserDataFromToken, logout } from '@/services/authService';
// Card tem default export, então importamos desta forma:
import Card from '@/components/ui/Card';
export default function MenuPrincipal() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    useEffect(() => {
        const decoded = getUserDataFromToken(); // retorna DecodedToken | null
        if (decoded) {
            // Garante que o valor em decoded.role corresponde a uma das três opções
            const safeRole = decoded.role;
            setUserData({
                id: decoded.id,
                nome: decoded.nome,
                role: safeRole,
            });
        }
        else {
            // Se não houver token ou for inválido, redireciona para login
            logout();
            navigate('/login');
        }
    }, [navigate]);
    const renderMenuItems = () => {
        if (!userData)
            return null;
        switch (userData.role) {
            case 'cliente':
                return (_jsxs(_Fragment, { children: [_jsx(MenuCard, { label: "Meus Agendamentos", onClick: () => navigate('/agendamentos') }), _jsx(MenuCard, { label: "Minhas OS", onClick: () => navigate('/ordens') }), _jsx(MenuCard, { label: "Favoritos", onClick: () => navigate('/favoritos') }), _jsx(MenuCard, { label: "Hist\u00F3rico", onClick: () => navigate('/historico') }), _jsx(MenuCard, { label: "Perfil", onClick: () => navigate('/perfil') })] }));
            case 'funcionario':
                return (_jsxs(_Fragment, { children: [_jsx(MenuCard, { label: "Dashboard", onClick: () => navigate('/dashboard') }), _jsx(MenuCard, { label: "OS em andamento", onClick: () => navigate('/ordens') }), _jsx(MenuCard, { label: "Agenda", onClick: () => navigate('/agendamentos') }), _jsx(MenuCard, { label: "Hist\u00F3rico", onClick: () => navigate('/historico') }), _jsx(MenuCard, { label: "Perfil", onClick: () => navigate('/perfil') })] }));
            case 'administrador':
                return (_jsxs(_Fragment, { children: [_jsx(MenuCard, { label: "Dashboard", onClick: () => navigate('/dashboard') }), _jsx(MenuCard, { label: "Financeiro", onClick: () => navigate('/financeiro') }), _jsx(MenuCard, { label: "Agendamentos", onClick: () => navigate('/agendamentos') }), _jsx(MenuCard, { label: "Gest\u00E3o de OS", onClick: () => navigate('/ordens') }), _jsx(MenuCard, { label: "Usu\u00E1rios", onClick: () => navigate('/usuarios') }), _jsx(MenuCard, { label: "Hist\u00F3rico", onClick: () => navigate('/historico') }), _jsx(MenuCard, { label: "Perfil", onClick: () => navigate('/perfil') })] }));
            default:
                return null;
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-[#f5f5f5] p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsxs("h1", { className: "text-2xl font-bold text-[#1b75bb]", children: ["Bem-vindo, ", userData?.nome] }), _jsx("button", { onClick: () => {
                            logout();
                            navigate('/login');
                        }, className: "bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600", children: "Logout" })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4", children: renderMenuItems() })] }));
}
function MenuCard({ label, onClick }) {
    return (_jsx(Card, { onClick: onClick, className: "cursor-pointer hover:shadow-lg transition", children: _jsx("div", { className: "p-4 text-center text-[#2e2e2e] font-medium", children: label }) }));
}

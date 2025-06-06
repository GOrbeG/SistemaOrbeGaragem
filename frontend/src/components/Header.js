import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getUserDataFromToken, logout } from '@/services/authService';
import { useNavigate } from 'react-router-dom';
export default function Header() {
    const navigate = useNavigate();
    const userData = getUserDataFromToken();
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    if (!userData)
        return null;
    return (_jsxs("header", { className: "flex items-center justify-between bg-[#1b75bb] text-white p-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "font-bold", children: userData.nome }), _jsx("span", { className: "capitalize bg-[#ffffff33] px-2 py-1 rounded", children: userData.role })] }), _jsx("button", { onClick: handleLogout, className: "bg-red-500 hover:bg-red-600 px-3 py-1 rounded", children: "Logout" })] }));
}

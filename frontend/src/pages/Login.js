import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '@/services/authService';
import logo from '../assets/logo2.png';
export default function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const navigate = useNavigate();
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const data = await login(email, senha);
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            navigate('/menu');
        }
        catch (err) {
            setErro(err.response?.data?.error || 'Erro ao fazer login');
        }
    };
    return (_jsx("div", { className: "flex items-center justify-center w-screen min-h-screen bg-[#2e2e2e]", children: _jsxs("div", { className: "w-full max-w-xs", children: [_jsxs("div", { className: "flex flex-col items-center mb-6", children: [_jsx("img", { src: logo, alt: "Logo Orbe Garage", className: "h-24 mb-4" }), _jsx("h2", { className: "text-3xl font-montserrat text-[#ffffff]", children: "Login" })] }), _jsxs("form", { onSubmit: handleLogin, className: "space-y-4", children: [erro && (_jsx("p", { className: "text-red-500 text-center text-sm", children: erro })), _jsxs("div", { className: "w-full flex flex-col items-center", children: [_jsx("label", { className: "block text-sm text-[#ffffff] mb-1", children: "Email" }), _jsx("input", { type: "email", value: email, onChange: e => setEmail(e.target.value), placeholder: "email", className: "w-60 h-6 px-4 bg-[#ffffff] rounded focus:outline-none", required: true })] }), _jsxs("div", { className: "w-full flex flex-col items-center", children: [_jsx("label", { className: "block text-sm text-[#ffffff] mb-1", children: "Senha" }), _jsx("input", { type: "password", value: senha, onChange: e => setSenha(e.target.value), placeholder: "senha", className: "w-60 h-6 px-4 bg-[#ffffff] rounded focus:outline-none", required: true })] }), _jsx("button", { type: "submit", className: "w-40 h-9 bg-[#1b75bb] text-white font-medium rounded self-center", children: "Entrar" }), _jsx("p", { className: "text-center", children: _jsx(Link, { to: "/Cadastro", className: "text-[#1b75bb] hover:underline", children: "cadastrar" }) })] })] }) }));
}

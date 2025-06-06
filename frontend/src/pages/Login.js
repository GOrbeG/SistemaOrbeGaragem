import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/services/authService';
export default function Login() {
    const [email, setCpf] = useState('');
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
    return (_jsx("div", { className: "flex h-screen items-center justify-center bg-[#d1d1d1]", children: _jsxs("form", { onSubmit: handleLogin, className: "bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm", children: [_jsx("h2", { className: "text-2xl font-bold mb-6 text-[#1b75bb] text-center", children: "Login - Orbe Garage" }), erro && _jsx("p", { className: "text-red-600 mb-4 text-center", children: erro }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm text-gray-700", children: "CPF" }), _jsx("input", { type: "text", value: email, onChange: (e) => setCpf(e.target.value), className: "w-full p-2 border border-gray-300 rounded mt-1", required: true })] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm text-gray-700", children: "Senha" }), _jsx("input", { type: "password", value: senha, onChange: (e) => setSenha(e.target.value), className: "w-full p-2 border border-gray-300 rounded mt-1", required: true })] }), _jsx("button", { type: "submit", className: "w-full bg-[#1b75bb] text-white p-2 rounded hover:bg-[#5a9ec9] transition", children: "Entrar" })] }) }));
}

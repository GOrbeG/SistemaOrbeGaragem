import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/Cadastro.tsx
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import InputMask from 'react-input-mask';
export default function Cadastro() {
    const { register, handleSubmit, formState: { errors }, } = useForm();
    const [foto, setFoto] = useState(null);
    const navigate = useNavigate();
    const validarCPF = (cpf) => {
        const regex = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;
        return regex.test(cpf);
    };
    const onSubmit = async (data) => {
        if (!validarCPF(data.cpf)) {
            alert('CPF inválido. Use o formato 000.000.000-00.');
            return;
        }
        const formData = new FormData();
        formData.append('nome', data.nome);
        formData.append('email', data.email);
        formData.append('senha', data.senha);
        formData.append('cpf', data.cpf);
        formData.append('papel', data.papel);
        if (foto) {
            formData.append('foto', foto);
        }
        try {
            await axios.post('/api/usuarios', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            navigate('/login');
        }
        catch (error) {
            alert('Erro ao cadastrar.');
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-[#1b75bb]", children: _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "bg-white p-8 rounded shadow-md w-full max-w-md space-y-4", children: [_jsx("h2", { className: "text-2xl font-semibold text-center text-[#2e2e2e]", children: "Cadastro" }), _jsx("input", { ...register('nome', { required: 'Nome é obrigatório' }), placeholder: "Nome", className: "w-full border p-2 rounded" }), errors.nome && _jsx("p", { className: "text-red-500 text-sm", children: errors.nome.message }), _jsx("input", { ...register('email', { required: 'Email é obrigatório' }), placeholder: "Email", type: "email", className: "w-full border p-2 rounded" }), errors.email && _jsx("p", { className: "text-red-500 text-sm", children: errors.email.message }), _jsx("input", { ...register('senha', { required: 'Senha é obrigatória' }), placeholder: "Senha", type: "password", className: "w-full border p-2 rounded" }), errors.senha && _jsx("p", { className: "text-red-500 text-sm", children: errors.senha.message }), _jsx(InputMask, { ...register('cpf', { required: 'CPF é obrigatório' }), mask: "999.999.999-99", placeholder: "CPF", className: "w-full border p-2 rounded" }), errors.cpf && _jsx("p", { className: "text-red-500 text-sm", children: errors.cpf.message }), _jsxs("select", { ...register('papel', { required: 'Selecione o papel' }), className: "w-full border p-2 rounded", children: [_jsx("option", { value: "", children: "Selecione o papel" }), _jsx("option", { value: "cliente", children: "Cliente" }), _jsx("option", { value: "funcionario", children: "Funcion\u00E1rio" })] }), errors.papel && _jsx("p", { className: "text-red-500 text-sm", children: errors.papel.message }), _jsx("input", { type: "file", accept: "image/*", onChange: (e) => setFoto(e.target.files?.[0] || null), className: "w-full border p-2 rounded" }), _jsx("button", { type: "submit", className: "w-full bg-[#1b75bb] text-white p-2 rounded hover:bg-[#2e2e2e]", children: "Cadastrar" })] }) }));
}

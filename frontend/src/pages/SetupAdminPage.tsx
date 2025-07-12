// frontend/src/pages/SetupAdminPage.tsx
import { useForm, SubmitHandler } from 'react-hook-form';
import { useState } from 'react';
import axios from 'axios';

type FormData = { nome: string; email: string; senha: string; cpf: string; };

export default function SetupAdminPage() {
    const { register, handleSubmit } = useForm<FormData>();
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        setMessage('');
        setError('');
        try {
            const API_URL = import.meta.env.VITE_API_URL;
            await axios.post(`${API_URL}/api/setup/create-first-admin`, data);
            setMessage('Administrador criado com sucesso! Você pode fechar esta página e ir para a tela de login.');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Não foi possível criar o administrador.');
        }
    };

    return (
        <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
            <h1>Criação do Primeiro Administrador</h1>
            <p>Use este formulário apenas uma vez para criar a conta principal do sistema.</p>
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', marginTop: '20px' }}>
                <input {...register('nome', { required: true })} placeholder="Nome Completo" style={{ padding: '8px' }}/>
                <input {...register('email', { required: true })} type="email" placeholder="E-mail" style={{ padding: '8px' }}/>
                <input {...register('senha', { required: true })} type="password" placeholder="Senha" style={{ padding: '8px' }}/>
                <input {...register('cpf', { required: true })} placeholder="CPF" style={{ padding: '8px' }}/>
                <button type="submit" style={{ padding: '10px', background: '#1b75bb', color: 'white', border: 'none', cursor: 'pointer' }}>Criar Administrador</button>
            </form>
            {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </div>
    );
}
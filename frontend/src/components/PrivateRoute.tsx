// src/components/PrivateRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getToken, getUserDataFromToken } from '@/services/authService';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // ex: ['administrador', 'funcionario']
}

export default function PrivateRoute({ children, allowedRoles = [] }: PrivateRouteProps) {
  const location = useLocation();

  // 1) Verifica se existe token
  const token = getToken();
  if (!token) {
    // Não logado: redireciona para /login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2) Decodifica o token para pegar o papel (role)
  const userData = getUserDataFromToken();
  if (!userData) {
    // Token inválido/expirado: redireciona para /login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3) Se allowedRoles estiver vazio => qualquer usuário autenticado vê a rota
  if (allowedRoles.length === 0) {
    return children;
  }

  // 4) Se allowedRoles não está vazio, checa se role do usuário está contido
  if (!allowedRoles.includes(userData.role)) {
    // Papel não autorizado:
    // Redireciona para “403” ou para "/" com mensagem de acesso negado
    // Aqui, por simplicidade, redirecionamos ao login (você pode criar uma rota de “/403”)
    return <Navigate to="/forbidden" replace />;
  }

  // Tudo certo: exibe o componente filho
  return children;
}

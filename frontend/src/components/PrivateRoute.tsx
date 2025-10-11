import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // 1. Importe o useAuth

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function PrivateRoute({ children, allowedRoles = [] }: PrivateRouteProps) {
  const { user } = useAuth(); // 2. Use o hook para pegar o usuário do contexto
  const location = useLocation();

  // 1) Verifica se o usuário existe no nosso contexto
  if (!user) {
    // Não logado: redireciona para /login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2) Se allowedRoles estiver vazio => qualquer usuário autenticado vê a rota
  if (allowedRoles.length === 0) {
    return children;
  }

  // 3) Se allowedRoles não está vazio, checa se o papel (role) do usuário está na lista
  if (!allowedRoles.includes(user.role)) {
    // Papel não autorizado: redireciona para uma página de "acesso negado"
    // (Você pode criar essa página ou redirecionar para o dashboard)
    return <Navigate to="/dashboard" replace />; // Ou para uma página '/acesso-negado'
  }

  // 4) Tudo certo: exibe o componente filho (a página protegida)
  return children;
}
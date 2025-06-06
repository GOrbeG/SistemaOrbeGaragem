// src/components/Sidebar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { getUserDataFromToken } from '@/services/authService';

interface MenuItem {
  label: string;
  path: string;
  allowedRoles: string[];
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', path: '/dashboard', allowedRoles: ['administrador', 'funcionario'] },
  { label: 'Financeiro', path: '/financeiro', allowedRoles: ['administrador'] },
  { label: 'Agendamentos', path: '/agendamentos', allowedRoles: ['administrador','funcionario','cliente'] },
  { label: 'OS', path: '/os', allowedRoles: ['administrador', 'funcionario'] },
  { label: 'Histórico', path: '/historico', allowedRoles: ['cliente','funcionario'] },
  { label: 'Favoritos', path: '/favoritos', allowedRoles: ['cliente'] },
  { label: 'Perfil', path: '/perfil', allowedRoles: [] }, // todos autenticados
];

export default function Sidebar() {
  const userData = getUserDataFromToken();
  if (!userData) return null;

  return (
    <nav className="w-60 bg-white border-r">
      <ul className="flex flex-col p-4 gap-2">
        {menuItems.map((item) => {
          // Se allowedRoles estiver vazio => qualquer usuário autenticado vê
          if (
            item.allowedRoles.length === 0 ||
            item.allowedRoles.includes(userData.role)
          ) {
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="block px-3 py-2 rounded hover:bg-gray-200"
                >
                  {item.label}
                </Link>
              </li>
            );
          }
          return null;
        })}
      </ul>
    </nav>
  );
}

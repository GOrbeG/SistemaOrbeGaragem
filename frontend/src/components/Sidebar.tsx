// src/components/Sidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getUserDataFromToken } from '@/services/authService';
import { Home, Users, Settings, Wrench, Calendar, FileText, DollarSign, BookUser, PlusSquare } from 'lucide-react';
import logo from '../assets/logologin.png'; // Sua logo

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  allowedRoles: string[];
}

// Lista centralizada e completa de todos os itens de menu
const menuItems: MenuItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <Home size={20} />, allowedRoles: ['administrador', 'funcionario'] },
  { label: 'Agendamentos', path: '/agendamentos', icon: <Calendar size={20} />, allowedRoles: ['administrador', 'funcionario', 'cliente'] },
  { label: 'Ordens de Serviço', path: '/os', icon: <Wrench size={20} />, allowedRoles: ['administrador', 'funcionario'] },
  { label: 'Meu Histórico', path: '/historico', icon: <FileText size={20} />, allowedRoles: ['cliente'] },
  { label: 'Clientes', path: '/clientes', icon: <BookUser size={20} />, allowedRoles: ['administrador', 'funcionario'] },
  { label: 'Financeiro', path: '/financeiro', icon: <DollarSign size={20} />, allowedRoles: ['administrador'] },
  { label: 'Cadastrar Funcionário', path: '/admin/funcionarios/novo', icon: <PlusSquare size={20} />, allowedRoles: ['administrador'] },
  { label: 'Meu Perfil', path: '/perfil', icon: <Settings size={20} />, allowedRoles: [] },
];

export default function Sidebar() {
  const userData = getUserDataFromToken();
  const location = useLocation();

  if (!userData) return null;

  // Filtra os itens do menu com base no 'role' do usuário
  const filteredMenuItems = menuItems.filter(item => 
    item.allowedRoles.length === 0 || item.allowedRoles.includes(userData.role)
  );

  return (
    <aside className="w-64 bg-[#2e2e2e] text-gray-200 flex flex-col">
      <div className="flex items-center gap-3 p-4 text-2xl font-bold border-b border-gray-700">
        <img src={logo} alt="Logo Orbe" className="h-10 w-auto" />
        <span>Orbe</span>
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#1b75bb] text-white font-semibold' // Estilo do item ativo
                      : 'hover:bg-gray-700'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
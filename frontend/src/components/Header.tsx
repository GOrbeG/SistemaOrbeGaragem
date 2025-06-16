// src/components/Header.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserDataFromToken, logout } from '@/services/authService';
import { LogOut } from 'lucide-react'; // Ícone para o botão

export default function Header() {
  const navigate = useNavigate();
  const userData = getUserDataFromToken();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!userData) {
    // Retorna um esqueleto de layout enquanto os dados do usuário carregam
    // para evitar que a tela "pule"
    return <header className="h-[72px] bg-white"></header>;
  }

  return (
    <header className="flex h-[72px] items-center justify-end bg-white text-gray-800 p-4 shadow-sm border-b">
      <div className="flex items-center gap-4">
        <div className="text-right">
          <span className="font-bold block">{userData.nome}</span>
          <span className="capitalize text-sm text-gray-500">{userData.role}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          title="Sair do sistema"
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </header>
  );
}
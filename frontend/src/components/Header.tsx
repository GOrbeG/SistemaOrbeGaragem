// src/components/Header.tsx
import React from 'react';
import { getUserDataFromToken, logout } from '@/services/authService';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const userData = getUserDataFromToken();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!userData) return null;

  return (
    <header className="flex items-center justify-between bg-[#1b75bb] text-white p-4">
      <div className="flex items-center gap-3">
        <span className="font-bold">{userData.nome}</span>
        <span className="capitalize bg-[#ffffff33] px-2 py-1 rounded">
          {userData.role}
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
      >
        Logout
      </button>
    </header>
  );
}

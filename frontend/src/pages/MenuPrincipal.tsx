// frontend/src/pages/MenuPrincipal.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserDataFromToken, logout } from '@/services/authService';
// Card tem default export, então importamos desta forma:
import Card from '@/components/ui/Card';

interface UserData {
  id: number;
  nome: string;
  role: 'cliente' | 'funcionario' | 'administrador';
}

export default function MenuPrincipal() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const decoded = getUserDataFromToken(); // retorna DecodedToken | null
    if (decoded) {
      // Garante que o valor em decoded.role corresponde a uma das três opções
      const safeRole = decoded.role as 'cliente' | 'funcionario' | 'administrador';
      setUserData({
        id: decoded.id,
        nome: decoded.nome,
        role: safeRole,
      });
    } else {
      // Se não houver token ou for inválido, redireciona para login
      logout();
      navigate('/login');
    }
  }, [navigate]);

  const renderMenuItems = () => {
    if (!userData) return null;

    switch (userData.role) {
      case 'cliente':
        return (
          <>
            <MenuCard label="Meus Agendamentos" onClick={() => navigate('/agendamentos')} />
            <MenuCard label="Minhas OS" onClick={() => navigate('/ordens')} />
            <MenuCard label="Meus Veículos" onClick={() => navigate('/meus-veiculos')} />
            <MenuCard label="Favoritos" onClick={() => navigate('/favoritos')} />
            <MenuCard label="Histórico" onClick={() => navigate('/historico')} />
            <MenuCard label="Perfil" onClick={() => navigate('/perfil')} />
          </>
        );
      case 'funcionario':
        return (
          <>
            <MenuCard label="Dashboard" onClick={() => navigate('/dashboard')} />
            <MenuCard label="OS em andamento" onClick={() => navigate('/ordens')} />
            <MenuCard label="Agenda" onClick={() => navigate('/agendamentos')} />
            <MenuCard label="Histórico" onClick={() => navigate('/historico')} />
            <MenuCard label="Perfil" onClick={() => navigate('/perfil')} />
            <MenuCard label="Clientes" onClick={() => navigate('/clientes')} />
          </>
        );
      case 'administrador':
        return (
          <>
            <MenuCard label="Dashboard" onClick={() => navigate('/dashboard')} />
            <MenuCard label="Financeiro" onClick={() => navigate('/financeiro')} />
            <MenuCard label="Agendamentos" onClick={() => navigate('/agendamentos')} />
            <MenuCard label="Gestão de OS" onClick={() => navigate('/ordens')} />
            <MenuCard label="Usuários" onClick={() => navigate('/usuarios')} />
            <MenuCard label="Histórico" onClick={() => navigate('/historico')} />
            <MenuCard label="Perfil" onClick={() => navigate('/perfil')} />
            <MenuCard label="Cadastrar Funcionário" onClick={() => navigate('/admin/funcionarios/novo')} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#1b75bb]">
          Bem-vindo, {userData?.nome}
        </h1>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {renderMenuItems()}
      </div>
    </div>
  );
}

interface MenuCardProps {
  label: string;
  onClick: () => void;
}

function MenuCard({ label, onClick }: MenuCardProps) {
  return (
    <Card onClick={onClick} className="cursor-pointer hover:shadow-lg transition">
      <div className="p-4 text-center text-[#2e2e2e] font-medium">
        {label}
      </div>
    </Card>
  );
}

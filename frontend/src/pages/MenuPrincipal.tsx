// frontend/src/pages/MenuPrincipal.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserDataFromToken } from '@/services/authService';
// Como Card.tsx só possui default export, importamos assim:
import Card from '@/components/ui/Card';

interface UserData {
  id: number;
  nome: string;
  papel: 'cliente' | 'funcionario' | 'administrador';
}

export default function MenuPrincipal() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const decoded = await getUserDataFromToken(); // retorna DecodedToken | null

      if (decoded) {
        // assumimos que decoded.papel é uma string compatível
        const safePapel = decoded.papel as 'cliente' | 'funcionario' | 'administrador';

        setUserData({
          id: decoded.id,
          nome: decoded.nome,
          papel: safePapel,
        });
      } else {
        setUserData(null);
      }
    };

    fetchData();
  }, []);

  const renderMenuItems = () => {
    if (!userData) return null;

    switch (userData.papel) {
      case 'cliente':
        return (
          <>
            <MenuCard label="Meus Agendamentos" onClick={() => navigate('/agendamentos')} />
            <MenuCard label="Minhas OS" onClick={() => navigate('/ordens')} />
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
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#1b75bb]">
          Bem-vindo, {userData?.nome}
        </h1>
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

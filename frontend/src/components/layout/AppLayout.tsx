// src/components/layout/AppLayout.tsx - VERSÃO FINAL
import React from 'react';
import Header from '../Header';
import Sidebar from '../Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    // Este container ocupa a tela inteira e organiza a sidebar e o conteúdo
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      {/* Este container garante que o conteúdo não transborde e controla a rolagem interna */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        {/* A área de 'main' é a única parte que terá rolagem, se necessário */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
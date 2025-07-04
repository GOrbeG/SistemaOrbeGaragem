// src/components/layout/AppLayout.tsx - VERSÃO SIMPLIFICADA
import React from 'react';
import Header from '../Header';
import Sidebar from '../Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    // ✅ MUDANÇA: Usa 'min-h-screen' para garantir altura mínima, mas permite crescer.
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      
      {/* ✅ MUDANÇA: 'overflow-hidden' removido para não travar a rolagem. */}
      <div className="flex-1 flex flex-col">
        <Header />
        
        {/* ✅ MUDANÇA: 'overflow-y-auto' removido. A rolagem agora será da página inteira. */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
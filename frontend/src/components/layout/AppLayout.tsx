// src/components/layout/AppLayout.tsx - VERSÃO SIMPLIFICADA FINAL
import React from 'react';
import Header from '../Header';
import Sidebar from '../Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    // Usa 'min-h-screen' para garantir que o layout ocupe pelo menos a altura
    // total da tela, mas permite que ele cresça e ative a rolagem natural do navegador.
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      
      {/* Removemos as classes de overflow para deixar o navegador controlar a rolagem */}
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
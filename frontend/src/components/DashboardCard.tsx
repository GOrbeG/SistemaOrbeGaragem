// src/components/DashboardCard.tsx
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor?: string; // Cor de fundo opcional para o ícone
}

export default function DashboardCard({ title, value, icon, iconBgColor = 'bg-gray-200' }: DashboardCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-6 transition-transform hover:scale-105">
      <div className={`rounded-full p-3 ${iconBgColor}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
// frontend/src/components/clientes/ClientesTable.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Cliente } from '@/pages/clientes/ClientesPage';
import { api } from '@/services/api';

interface ClientesTableProps {
  clientes: Cliente[];
  onDeleteSuccess: () => void;
}

export default function ClientesTable({ clientes, onDeleteSuccess }: ClientesTableProps) {
  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
      try {
        await api.delete(`/api/clientes/${id}`);
        alert('Cliente excluído com sucesso!');
        onDeleteSuccess();
      } catch (error: any) {
        alert(error.response?.data?.error || 'Erro ao excluir cliente.');
        console.error(error);
      }
    }
  };

  if (clientes.length === 0) {
    return <p className="text-center text-gray-500 mt-8">Nenhum cliente encontrado.</p>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clientes.map((cliente) => (
            <tr key={cliente.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cliente.nome}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.telefone}</td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                <Link to={`/clientes/${cliente.id}`} className="text-blue-600 hover:text-blue-900" title="Ver Detalhes">
                  <Eye size={18} className="inline-block" />
                </Link>
                <Link to={`/clientes/editar/${cliente.id}`} className="text-yellow-600 hover:text-yellow-900" title="Editar">
                  <Edit size={18} className="inline-block" />
                </Link>
                <button onClick={() => handleDelete(cliente.id)} className="text-red-600 hover:text-red-900" title="Excluir">
                  <Trash2 size={18} className="inline-block" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
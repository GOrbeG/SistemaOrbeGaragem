// src/components/veiculos/VehicleCard.tsx
import { Car, Edit, Trash2 } from 'lucide-react';
import { Veiculo } from '@/pages/os/OSFormPage'; // Reutilizando a interface

interface VehicleCardProps {
  vehicle: Veiculo;
  onEdit: () => void;
  onDelete: () => void;
}

export default function VehicleCard({ vehicle, onEdit, onDelete }: VehicleCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Car className="text-gray-500" />
          <p className="text-lg font-bold text-gray-800">{vehicle.placa}</p>
        </div>
        <p className="text-gray-600">{vehicle.marca} {vehicle.modelo}</p>
        <p className="text-sm text-gray-500">Ano: {vehicle.ano}</p>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onEdit} className="text-yellow-600 hover:text-yellow-900 p-2" title="Editar"><Edit size={18} /></button>
        <button onClick={onDelete} className="text-red-600 hover:text-red-900 p-2" title="Excluir"><Trash2 size={18} /></button>
      </div>
    </div>
  );
}
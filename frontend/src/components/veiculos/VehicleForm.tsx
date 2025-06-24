// src/components/veiculos/VehicleForm.tsx
import { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

export interface VehicleFormData {
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  observacoes?: string;
}

interface VehicleFormProps {
  onSubmit: SubmitHandler<VehicleFormData>;
  initialData?: VehicleFormData | null;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function VehicleForm({ onSubmit, initialData, onCancel, isSubmitting }: VehicleFormProps) {
  const { register, handleSubmit, reset } = useForm<VehicleFormData>({
    defaultValues: initialData || {},
  });

  useEffect(() => {
    // Reseta o formulário com os novos dados iniciais quando eles mudam (para edição)
    reset(initialData || {});
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-xl font-bold mb-4">{initialData ? 'Editar Veículo' : 'Adicionar Novo Veículo'}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input {...register('marca', { required: true })} placeholder="Marca (ex: Fiat)" className="w-full p-2 border rounded" />
        <input {...register('modelo', { required: true })} placeholder="Modelo (ex: Cronos)" className="w-full p-2 border rounded" />
        <input {...register('ano', { required: true, valueAsNumber: true })} placeholder="Ano" type="number" className="w-full p-2 border rounded" />
        <input {...register('placa', { required: true })} placeholder="Placa" className="w-full p-2 border rounded" />
      </div>

      <textarea {...register('observacoes')} placeholder="Observações (opcional)" className="w-full p-2 border rounded" rows={3}></textarea>

      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-[#1b75bb] text-white rounded hover:bg-blue-700 disabled:bg-gray-400">
          {isSubmitting ? 'Salvando...' : 'Salvar Veículo'}
        </button>
      </div>
    </form>
  );
}
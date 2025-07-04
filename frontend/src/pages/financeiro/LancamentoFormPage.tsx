// src/pages/financeiro/LancamentoFormPage.tsx
import { useLocation, useNavigate } from 'react-router-dom';
import TransacaoForm from '@/components/financeiro/TransacaoForm';
import { ArrowLeft } from 'lucide-react';

export default function LancamentoFormPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Lê o 'tipo' da URL para saber se é entrada ou saída
    const params = new URLSearchParams(location.search);
    const tipo = params.get('tipo') as 'entrada' | 'saida' || 'entrada';

    const handleSave = () => {
        alert('Lançamento salvo com sucesso!');
        navigate('/financeiro'); // Volta para a página principal do financeiro
    };

    const handleCancel = () => {
        navigate('/financeiro'); // Volta para a página principal do financeiro
    };

    return (
        <div className="space-y-6">
            <button onClick={() => navigate('/financeiro')} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft size={18} />
                Voltar para Financeiro
            </button>
            
            {/* O formulário agora vive dentro desta página */}
            <TransacaoForm
                tipo={tipo}
                onSave={handleSave}
                onCancel={handleCancel}
            />
        </div>
    );
}
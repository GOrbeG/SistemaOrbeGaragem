// src/components/os/StatusTracker.tsx
import { CheckCircle, CircleDashed, CircleDot } from 'lucide-react';

interface Props {
  statusAtual: string;
  historico: { status: string; data_mudanca: string }[];
}

const ETAPAS = [
    'Agendada',
    'Veículo na Oficina',
    'Em Análise',
    'Aguardando Aprovação',
    'Serviço em Andamento',
    'Serviço Concluído',
    'Pronto para Retirada',
    'Finalizada'
];

export default function StatusTracker({ statusAtual, historico }: Props) {
    const indiceAtual = ETAPAS.findIndex(e => e.toLowerCase() === statusAtual.toLowerCase());

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Acompanhamento do Serviço</h3>
            <div className="flex items-center">
                {ETAPAS.map((etapa, index) => {
                    const isCompleta = index < indiceAtual;
                    const isAtual = index === indiceAtual;
                    const historicoEtapa = historico.find(h => h.status.toLowerCase() === etapa.toLowerCase());

                    return (
                        <div key={etapa} className="flex-1 flex items-center">
                            {/* O nó e o texto da etapa */}
                            <div className="flex flex-col items-center text-center w-24">
                                {isCompleta ? (
                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                ) : isAtual ? (
                                    <CircleDot className="h-8 w-8 text-blue-500 animate-pulse" />
                                ) : (
                                    <CircleDashed className="h-8 w-8 text-gray-300" />
                                )}
                                <p className={`mt-2 text-xs font-semibold ${isAtual ? 'text-blue-600' : isCompleta ? 'text-gray-700' : 'text-gray-400'}`}>{etapa}</p>
                                {historicoEtapa && <p className="text-xs text-gray-400">{new Date(historicoEtapa.data_mudanca).toLocaleDateString('pt-BR')}</p>}
                            </div>

                            {/* A linha conectora (não aparece depois do último item) */}
                            {index < ETAPAS.length - 1 && (
                                <div className={`flex-1 h-1 ${isCompleta ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
// src/pages/Agendamentos.tsx - VERSÃO COM CALENDÁRIO FUNCIONAL
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // Plugin para interações como clique em datas
import { api } from '@/services/api';

// Interface para os eventos que vêm da API
interface AgendamentoEvento {
  id: number;
  data_agendada: string;
  cliente_nome: string;
  veiculo_modelo: string;
  // Adicione mais campos se sua API retornar
}

export default function Agendamentos() {
  const [eventos, setEventos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Busca os agendamentos (OS com status 'agendada') do backend
    api.get('/api/agenda/agendamentos') // Usando a rota do seu agendaRoutes.js
      .then(response => {
        // Mapeia os dados da API para o formato que o FullCalendar entende
        const eventosFormatados = response.data.map((ag: AgendamentoEvento) => ({
          id: ag.id.toString(),
          title: `${ag.cliente_nome} - ${ag.veiculo_modelo}`,
          start: ag.data_agendada,
        }));
        setEventos(eventosFormatados);
      })
      .catch(error => console.error("Erro ao buscar agendamentos:", error));
  }, []);

  // Função para lidar com o clique em um evento existente
  const handleEventClick = (clickInfo: any) => {
    // Navega para a página de detalhes da OS correspondente
    navigate(`/os/${clickInfo.event.id}`);
  };

  // Função para lidar com o clique em uma data vazia no calendário
  const handleDateClick = (arg: any) => {
    // Navega para a página de nova OS, passando a data clicada
    navigate(`/os/novo?data=${arg.dateStr}`);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Agenda de Serviços</h1>
      </div>
      
      {/* Renderiza o componente do calendário */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth" // Visão inicial
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay' // Botões para mudar de visão
        }}
        events={eventos}
        eventClick={handleEventClick} // Ação ao clicar em um evento
        dateClick={handleDateClick}   // Ação ao clicar em um dia
        editable={true} // Permite arrastar eventos (funcionalidade futura)
        droppable={true}
        locale='pt-br' // Traduz para português
        buttonText={{
            today:    'Hoje',
            month:    'Mês',
            week:     'Semana',
            day:      'Dia',
        }}
      />
    </div>
  );
}
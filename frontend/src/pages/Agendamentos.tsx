// src/pages/Agendamentos.tsx - VERSÃO FINAL E DINÂMICA
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { api } from '@/services/api';

interface AgendamentoEvento {
  id: number;
  data_agendada: string;
  cliente_nome: string;
  veiculo_modelo: string;
}

export default function Agendamentos() {
  const navigate = useNavigate();
  const calendarRef = useRef<FullCalendar>(null);

  // ✅ FUNÇÃO DINÂMICA PARA BUSCAR EVENTOS
  // Esta função é chamada pelo FullCalendar sempre que a visão muda (ex: próximo mês)
  const fetchEventos = (fetchInfo: any, successCallback: any, failureCallback: any) => {
    api.get('/api/agenda/agendamentos', {
      params: {
        // Envia as datas de início e fim da visão atual do calendário para o backend
        data_inicio: fetchInfo.startStr,
        data_fim: fetchInfo.endStr,
      }
    })
    .then(response => {
      const eventosFormatados = response.data.map((ag: AgendamentoEvento) => ({
        id: ag.id.toString(),
        title: `${ag.cliente_nome} - ${ag.veiculo_modelo}`,
        start: ag.data_agendada,
        allDay: true // Considera o evento como dia inteiro para simplificar
      }));
      successCallback(eventosFormatados); // Informa ao calendário sobre os novos eventos
    })
    .catch(error => {
      console.error("Erro ao buscar agendamentos:", error);
      failureCallback(error); // Informa ao calendário que a busca falhou
    });
  };

  const handleEventClick = (clickInfo: any) => {
    navigate(`/os/${clickInfo.event.id}`);
  };

  const handleDateClick = (arg: any) => {
    navigate(`/os/novo?data=${arg.dateStr}`);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Agenda de Serviços</h1>
      </div>
      
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek'
        }}
        // ✅ A MUDANÇA MAIS IMPORTANTE: Usa a função para buscar eventos
        events={fetchEventos}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        locale='pt-br'
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
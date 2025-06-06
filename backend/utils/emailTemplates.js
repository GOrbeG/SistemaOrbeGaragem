// backend/utils/emailTemplates.js

const confirmacaoAgendamento = (clienteNome, dataHora, veiculo) => {
  return `
    <div style="font-family: Arial, sans-serif;">
      <h2>Agendamento Confirmado - Orbe Garage</h2>
      <p>Olá <strong>${clienteNome}</strong>,</p>
      <p>Seu agendamento foi confirmado com sucesso.</p>
      <p><strong>Data e Hora:</strong> ${dataHora}</p>
      <p><strong>Veículo:</strong> ${veiculo}</p>
      <br>
      <p>Se precisar reagendar, entre em contato conosco.</p>
      <p>Atenciosamente,</p>
      <p><strong>Equipe Orbe Garage</strong></p>
    </div>
  `;
};

module.exports = { confirmacaoAgendamento };

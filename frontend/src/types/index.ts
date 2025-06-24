// src/types/index.ts

// Molde para os dados de Usuário (login)
export interface Usuario {
  id: number;
  nome: string;
  role: 'administrador' | 'funcionario' | 'cliente';
}

// Molde para os dados de Cliente (perfil)
export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  // Adicione outros campos se necessário
}

// Molde para os dados de Veículo
export interface Veiculo {
  id: number;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
}

// Adicione outras interfaces compartilhadas aqui no futuro...
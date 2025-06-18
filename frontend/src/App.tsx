// src/App.tsx - VERSÃO CORRIGIDA E SIMPLIFICADA
import AppRoutes from './routes/Router'; // Importa nosso roteador principal

function App() {
  // O App.tsx agora só tem a responsabilidade de renderizar o roteador.
  // Toda a lógica de rotas, splash screen, etc., fica no AppRoutes.
  return <AppRoutes />;
}

export default App;
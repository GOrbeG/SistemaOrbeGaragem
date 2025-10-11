// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext'; // 1. Importe o AuthProvider

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider> {/* 2. Envolva o App com o AuthProvider */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
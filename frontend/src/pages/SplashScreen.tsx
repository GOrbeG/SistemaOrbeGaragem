// src/pages/SplashScreen.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png'; // substitua com o caminho correto

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000); // 3 segundos

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#053255] to-[#1b75bb]">
      <motion.img
        src={logo}
        alt="Logo Orbe Garage"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        className="w-52 h-auto"
      />
    </div>
  );
}

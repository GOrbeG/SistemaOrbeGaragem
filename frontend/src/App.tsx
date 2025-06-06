// src/App.tsx
import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import SplashScreen from './pages/SplashScreen'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import MenuPrincipal from './pages/MenuPrincipal'

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 3000) // 3 segundos de splash
    return () => clearTimeout(timer)
  }, [])

  return (
    <Router>
      <Routes>
        {loading ? (
          <Route path="*" element={<SplashScreen />} />
        ) : (
          <>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/menu" element={<MenuPrincipal />} />
            {/* Adicione mais rotas conforme o desenvolvimento */}
          </>
        )}
      </Routes>
    </Router>
  )
}

export default App

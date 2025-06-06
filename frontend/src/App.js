import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
// src/App.tsx
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from './pages/SplashScreen';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import MenuPrincipal from './pages/MenuPrincipal';
function App() {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 3000); // 3 segundos de splash
        return () => clearTimeout(timer);
    }, []);
    return (_jsx(Router, { children: _jsx(Routes, { children: loading ? (_jsx(Route, { path: "*", element: _jsx(SplashScreen, {}) })) : (_jsxs(_Fragment, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/login" }) }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/cadastro", element: _jsx(Cadastro, {}) }), _jsx(Route, { path: "/menu", element: _jsx(MenuPrincipal, {}) })] })) }) }));
}
export default App;

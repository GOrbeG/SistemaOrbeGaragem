// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // 1. Importe o nosso hook useAuth
import axios from 'axios'; // 2. Usaremos o axios diretamente para o login
import logo from '../assets/logologin.png';
import backgroundImage from '../assets/loginpage.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // 3. Pegue a função 'login' do nosso contexto

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(''); // Limpa erros anteriores
    try {
      // 4. Faz a chamada POST para a sua API de backend
      //    (Substitua '/api/auth/login' pela sua rota real, se for diferente)
      const response = await axios.post('/api/auth/login', {
        email,
        senha, // Certifique-se que o backend espera 'senha' e não 'password'
      });

      // 5. Extrai o token e os dados do usuário da resposta
      //    (Ajuste se o seu backend retornar uma estrutura diferente)
      const { token, usuario } = response.data;

      // 6. Salva o token no localStorage para ser usado pelo nosso cliente API
      localStorage.setItem('token', token);

      // 7. Usa a função 'login' do AuthContext para salvar os dados do usuário
      //    no estado global da aplicação.
      login(usuario);

      // 8. Redireciona para a dashboard em caso de sucesso
      navigate('/dashboard');

    } catch (err: any) {
      console.error('Falha no login:', err);
      // Pega a mensagem de erro da resposta da API ou usa uma mensagem padrão
      setErro(err.response?.data?.error || 'Email ou senha inválidos.');
    }
  };

  return (
    // Seu JSX (a parte visual) permanece exatamente o mesmo.
    // Nenhuma alteração é necessária aqui.
    <div
      className="flex min-h-screen w-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="flex flex-col flex-1 p-8 sm:p-12">
        <header className="flex justify-between items-center w-full">
          <img src={logo} alt="Logo Orbe" className="h-10 w-auto translate-x-[50px]" />
          <Link to="/cadastro" className="text-[#e7933b] text-lg font-semibold hover:underline -translate-x-[80px] text-[1rem]">
            cadastrar
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center">
          <div className="w-100 max-w-sm">
            <h2 className="text-[5rem] font-extrabold text-[#e7933b] text-center mb-10 -translate-y-[150px]">
              Login
            </h2>
            <form onSubmit={handleLogin} className="space-y-8 flex flex-col items-center">
              {erro && (
                <p className="text-red-500 text-center text-sm font-semibold bg-red-100 p-2 rounded">
                  {erro}
                </p>
              )}
              <div className="w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email"
                  className="w-90 h-20 px-6 bg-[#e7933b] text-black rounded-md focus:outline-none focus:ring-2 focus:ring-white -translate-y-[120px]"
                  required
                />
              </div>
              <div className="w-full">
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="senha"
                  className="w-90 h-20 px-6 bg-[#ffffff] text-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#e7933b] -translate-y-[100px]"
                  required
                />
              </div>
              <button
                type="submit"
                style={{ backgroundImage: 'linear-gradient(to right, #ffde59, #ff914d)' }}
                className="w-55 h-40 text-[#2e2e2e] text-xl font-bold rounded-xl hover:opacity-90 transition-opacity -translate-y-[88px] translate-x-[50px] shadow-lg shadow-orange-400/50 hover:scale-105 hover:shadow-xl transition-all duration-300 ease-in-out"
              >
                Entrar
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
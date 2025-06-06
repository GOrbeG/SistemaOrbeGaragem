import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function VisualizarOS() {
  const { token } = useParams();
  const [ordem, setOrdem] = useState(null);
  const [itens, setItens] = useState([]);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const fetchOS = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/os/visualizar/${token}`);
        setOrdem(res.data.ordem);
        setItens(res.data.itens);
      } catch (err) {
        setErro('Link expirado ou inválido.');
      }
    };
    fetchOS();
  }, [token]);

  if (erro) return <div className="p-4 text-red-600 font-semibold">{erro}</div>;
  if (!ordem) return <div className="p-4">Carregando ordem de serviço...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-xl">
      <h1 className="text-2xl font-bold text-center mb-4">Ordem de Serviço #{ordem.id}</h1>

      <div className="mb-4">
        <p><strong>Status:</strong> {ordem.status}</p>
        <p><strong>Data:</strong> {new Date(ordem.data_criacao).toLocaleDateString()}</p>
        <p><strong>Descrição:</strong> {ordem.descricao}</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Serviços Realizados:</h2>
        <ul className="list-disc list-inside space-y-1">
          {itens.map((item, index) => (
            <li key={item.id}>{item.descricao} - <strong>R$ {item.valor.toFixed(2)}</strong></li>
          ))}
        </ul>
        <div className="mt-4 text-right font-bold text-lg">
          Total: R$ {itens.reduce((acc, item) => acc + parseFloat(item.valor), 0).toFixed(2)}
        </div>
      </div>
    </div>
  );
}

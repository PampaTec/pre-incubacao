import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [times, setTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/admin/teams', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar times');
        return res.json();
      })
      .then(data => {
        setTimes(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pampa-green"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-pampa-gray">Painel de Controle</h1>
          <p className="text-gray-500 mt-1">Gerencie todos os times de pré-incubação</p>
        </div>
        <Link
          to="/novo-time"
          className="btn-pampa inline-flex items-center gap-2"
        >
          <span>+</span> Novo Time
        </Link>
      </div>

      {times.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <p className="text-xl text-pampa-gray mb-4">Nenhum time cadastrado ainda</p>
          <Link to="/novo-time" className="btn-pampa inline-block">
            Criar primeiro time
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {times.map(time => (
            <Link
              key={time.id_time}
              to={`/gerenciar-time/${time.id_time}`}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-pampa-green transition-all"
            >
              <h3 className="text-xl font-bold text-pampa-green mb-2">{time.nome_projeto}</h3>
              <p className="text-sm text-gray-500 mb-3">
                <span className="font-medium">ID:</span> {time.id_time}
              </p>
              <p className="text-sm text-gray-500 mb-3">
                <span className="font-medium">Membros:</span> {time.membros}
              </p>
              <p className="text-sm text-gray-400">
                <span className="font-medium">Criado em:</span> {time.data_criacao}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-pampa-green text-sm font-medium">Ver detalhes →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

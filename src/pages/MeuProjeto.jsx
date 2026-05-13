import React, { useState, useEffect } from 'react';
import ChatConsultor from '../components/ChatConsultor';

export default function MeuProjeto() {
  const [team, setTeam] = useState(null);
  const [progresso, setProgresso] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarDados = () => {
    fetch('http://localhost:3001/api/teams/meu-time', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.time) {
          setTeam(data.time);
          setProgresso(data.progresso || []);
        }
      })
      .catch(err => console.error('Erro ao buscar dados do time:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregarDados();
  }, []);

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (!team) return <div className="p-8 text-center text-red-500">Nenhum time encontrado para o seu usuário. Solicite ao administrador que adicione seu e-mail a um time.</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Coluna Esquerda: Progresso */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h2 className="text-2xl font-bold font-pampa text-pampa-green mb-2">{team.nome_projeto || team.Nome_Projeto || 'Meu Projeto'}</h2>
          <p className="text-gray-600 text-sm mb-4">
            Acompanhe o progresso do seu Business Model Canvas.
          </p>
          <div className="flex gap-2">
            {team.pasta_drive_id && (
              <a href={`https://drive.google.com/drive/folders/${team.pasta_drive_id}`} target="_blank" rel="noopener noreferrer" className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
                📁 Pasta no Drive
              </a>
            )}
            {team.doc_modelo_id && (
              <a href={`https://docs.google.com/document/d/${team.doc_modelo_id}/edit`} target="_blank" rel="noopener noreferrer" className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
                📄 Doc Modelo
              </a>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">Progresso BMC</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(etapa => {
              const p = progresso.find(pr => parseInt(pr.etapa || pr.Etapa) === etapa);
              const status = p ? (p.status || p.Status) : 'Pendente';
              const isConcluido = status.includes('Concluído');
              
              return (
                <div key={etapa} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Etapa {etapa}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${isConcluido ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Coluna Direita: Chat */}
      <div className="lg:col-span-2">
        <ChatConsultor 
          id_time={team.id_time || team.ID_Time} 
          doc_modelo_id={team.doc_modelo_id || team.Doc_Modelo_ID}
          onProgressUpdate={carregarDados}
        />
      </div>

    </div>
  );
}

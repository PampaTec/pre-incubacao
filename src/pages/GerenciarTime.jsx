import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const ETAPAS_BMC = [
  { id: 1, nome: 'Proposta de Valor' },
  { id: 2, nome: 'Segmento de Clientes' },
  { id: 3, nome: 'Relacionamento com Clientes' },
  { id: 4, nome: 'Canais' },
  { id: 5, nome: 'Fontes de Receita' },
  { id: 6, nome: 'Parcerias Principais' },
  { id: 7, nome: 'Recursos Principais' },
  { id: 8, nome: 'Atividades-Chave' },
  { id: 9, nome: 'Estrutura de Custos' }
];

export default function GerenciarTime() {
  const { id } = useParams();
  const [time, setTime] = useState(null);
  const [progresso, setProgresso] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3001/api/admin/teams/${id}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar time');
        return res.json();
      })
      .then(data => {
        console.log('Dados do time recebidos:', data.time);
        setTime(data.time);
        setProgresso(data.progresso);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  function getField(obj, ...keys) {
    for (const key of keys) {
      const val = obj[key];
      if (val !== undefined && val !== null && val !== '') return val;
    }
    return '';
  }

  const membrosRaw = getField(time || {}, 'membros', 'Membros', 'MEMBROS', 'Membros_Time', 'membros_time', 'email_membros', 'Emails');

  function getStatusEtapa(etapaId) {
    const registro = progresso.find(p => p.etapa === String(etapaId));
    return registro ? registro.status : '⬜ Pendente';
  }

  function getRespostaEtapa(etapaId) {
    const registro = progresso.find(p => p.etapa === String(etapaId));
    return registro ? registro.resposta_time : '-';
  }

  function getDataConclusao(etapaId) {
    const registro = progresso.find(p => p.etapa === String(etapaId));
    return registro && registro.status === '✅ Concluído' ? registro.data_conclusao : '-';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pampa-green"></div>
      </div>
    );
  }

  if (error || !time) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 text-lg">{error || 'Time não encontrado'}</p>
        <Link to="/dashboard" className="text-pampa-green hover:underline mt-4 inline-block">
          Voltar ao painel
        </Link>
      </div>
    );
  }

  const etapasConcluidas = progresso.filter(p => p.status === '✅ Concluído').length;
  const progressoPercentual = Math.round((etapasConcluidas / 9) * 100);

  return (
    <div>
      <div className="mb-8">
        <Link to="/dashboard" className="text-pampa-green hover:underline text-sm">
          ← Voltar ao painel
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-pampa-green mb-2">{getField(time, 'nome_projeto', 'Nome_Projeto', 'NOME_PROJETO', 'nome_proyecto', 'nomeTime')}</h1>
            <p className="text-sm text-gray-500">
              <span className="font-medium">ID:</span> {getField(time, 'id_time', 'ID_Time', 'idTime', 'ID')}
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Criado em:</span> {getField(time, 'data_criacao', 'Data_Criacao', 'dataCriacao', 'criado_em')}
            </p>
          </div>
          <div className="text-center md:text-right">
            <div className="text-4xl font-bold text-pampa-green">{progressoPercentual}%</div>
            <p className="text-sm text-gray-500">{etapasConcluidas} de 9 etapas concluídas</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <h2 className="text-xl font-bold text-pampa-gray mb-4">Membros do Time</h2>
        <div className="flex flex-wrap gap-2">
          {membrosRaw.split(',').filter(Boolean).map((email, i) => (
            <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm">
              {email.trim()}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <h2 className="text-xl font-bold text-pampa-gray p-8 pb-4">Progresso BMC</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-4 text-sm font-semibold text-pampa-gray">#</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-pampa-gray">Etapa</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-pampa-gray">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-pampa-gray">Conclusão</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-pampa-gray">Resposta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ETAPAS_BMC.map(etapa => (
                <tr key={etapa.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500">{etapa.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{etapa.nome}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                      ${getStatusEtapa(etapa.id).includes('Concluído') ? 'bg-green-100 text-green-800' : ''}
                      ${getStatusEtapa(etapa.id).includes('Em andamento') ? 'bg-blue-100 text-blue-800' : ''}
                      ${getStatusEtapa(etapa.id).includes('Pendente') ? 'bg-gray-100 text-gray-600' : ''}
                    `}>
                      {getStatusEtapa(etapa.id)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{getDataConclusao(etapa.id)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{getRespostaEtapa(etapa.id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

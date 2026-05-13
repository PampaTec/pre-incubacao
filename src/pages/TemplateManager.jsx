import { useState, useEffect } from 'react';

export default function TemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/templates/lista', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setTemplates(data))
      .catch(() => setMessage({ type: 'error', text: 'Erro ao carregar templates' }))
      .finally(() => setLoading(false));
  }, []);

  async function handleSync() {
    if (!confirm('Isso copiará o Tutorial atualizado para TODOS os times. O Template Modelo de Negócio NÃO será afetado. Continuar?')) return;

    setSyncing(true);
    setMessage(null);
    try {
      const res = await fetch('http://localhost:3001/api/templates/sync', {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `${data.timesAtualizados} de ${data.total} times atualizados` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro na sincronização' });
    } finally {
      setSyncing(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pampa-green"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-pampa-gray mb-2">Gerenciador de Templates</h1>
      <p className="text-gray-500 mb-8">Gerencie os arquivos-template do Programa de Pré-Incubação</p>

      <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-8 animate-pulse">
        <p className="text-red-700 font-bold text-sm flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          Atenção: edições nos templates do Drive não se propagam automaticamente para os times.
          Use "Sincronizar para equipes" para replicar as alterações.
        </p>
      </div>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-pampa-gray mb-4">Templates do Drive</h2>
          <div className="space-y-3">
            {templates.map((t, i) => (
              <div key={i} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{t.nome}</p>
                  <p className="text-sm text-gray-500">{t.tipo}</p>
                </div>
                <a
                  href={`https://drive.google.com/open?id=${t.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-200 transition-colors"
                >
                  Abrir no Drive
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-pampa-gray mb-1">Sincronizar para equipes</h3>
              <p className="text-sm text-gray-500">Replica o Tutorial atualizado para todos os times (Modelo de Negócio não é replicado)</p>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="btn-pampa px-6 py-2.5 disabled:opacity-50 whitespace-nowrap"
            >
              {syncing ? 'Sincronizando...' : 'Sincronizar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

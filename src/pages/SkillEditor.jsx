import { useState, useEffect } from 'react';

const ETAPAS_BMC = [
  'Proposta de Valor',
  'Segmento de Clientes',
  'Relacionamento com Clientes',
  'Canais',
  'Fontes de Receita',
  'Parcerias Principais',
  'Recursos Principais',
  'Atividades-Chave',
  'Estrutura de Custos'
];

const TABS = [
  { id: 'perfil', label: 'Perfil' },
  ...ETAPAS_BMC.map((nome, i) => ({ id: `etapa_${i + 1}`, label: `Etapa ${i + 1}` })),
  { id: 'analise', label: 'Análise Final' },
  { id: 'exemplos', label: 'Exemplos' }
];

function ListEditor({ items, onChange, placeholder }) {
  const handleChange = (index, value) => {
    const novos = [...items];
    novos[index] = value;
    onChange(novos);
  };

  const adicionar = () => onChange([...items, '']);
  const remover = (index) => {
    if (items.length <= 1) return;
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={e => handleChange(i, e.target.value)}
            placeholder={placeholder || 'Item...'}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-pampa-green focus:border-pampa-green outline-none"
          />
          {items.length > 1 && (
            <button type="button" onClick={() => remover(i)} className="text-red-500 hover:bg-red-50 px-2 rounded transition-colors">
              ✕
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={adicionar} className="text-sm text-pampa-green hover:text-green-700 font-medium">
        + Adicionar item
      </button>
    </div>
  );
}

export default function SkillEditor() {
  const [activeTab, setActiveTab] = useState('perfil');
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [timesAtivos, setTimesAtivos] = useState(0);
  const [versoes, setVersoes] = useState([]);

  const API = 'http://localhost:3001/api/skill';

  useEffect(() => {
    carregarSkill();
    carregarVersoes();
    fetch(`${API}/times-ativos`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setTimesAtivos(d.count))
      .catch(() => {});
  }, []);

  function carregarSkill() {
    setLoading(true);
    fetch(API, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setSkill(data))
      .catch(() => setMessage({ type: 'error', text: 'Erro ao carregar skill' }))
      .finally(() => setLoading(false));
  }

  function carregarVersoes() {
    fetch(`${API}/versoes`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setVersoes(data))
      .catch(() => {});
  }

  function handlePerfilChange(campo, valor) {
    setSkill(prev => ({ ...prev, perfil: { ...prev.perfil, [campo]: valor } }));
  }

  function handleEtapaChange(index, campo, valor) {
    const etapas = [...skill.etapas];
    etapas[index] = { ...etapas[index], [campo]: valor };
    setSkill(prev => ({ ...prev, etapas }));
  }

  function handlePerguntaChange(etapaIndex, perguntas) {
    const etapas = [...skill.etapas];
    etapas[etapaIndex] = { ...etapas[etapaIndex], perguntas };
    setSkill(prev => ({ ...prev, etapas }));
  }

  function handleAnaliseChange(campo, valor) {
    setSkill(prev => ({ ...prev, analiseCritica: { ...prev.analiseCritica, [campo]: valor } }));
  }

  function handleExemplosChange(exemplos) {
    setSkill(prev => ({ ...prev, exemplos }));
  }

  async function handleSave() {
    if (!confirm(`${timesAtivos} time(s) ativo(s) usam esta skill. Deseja salvar mesmo assim?`)) return;

    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(API, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skill)
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Skill salva com sucesso! (${data.alteracoes} alterações)` });
        carregarVersoes();
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    } finally {
      setSaving(false);
    }
  }

  async function handleRollback(versaoId) {
    if (!confirm('Restaurar esta versão anterior? A versão atual será salva como backup.')) return;
    try {
      const res = await fetch(`${API}/rollback/${versaoId}`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Versão restaurada!' });
        carregarSkill();
        carregarVersoes();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao restaurar versão' });
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pampa-green"></div></div>;
  }

  if (!skill) {
    return <div className="text-center py-20 text-red-500">Erro ao carregar editor de skill</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-pampa-gray">Editor de Skill BMC</h1>
          <p className="text-gray-500 text-sm mt-1">{timesAtivos} time(s) ativo(s) usam esta skill</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSave} disabled={saving} className="btn-pampa px-6 py-2.5 disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar Skill'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex space-x-1 px-4">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-pampa-green text-pampa-green'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Perfil */}
          {activeTab === 'perfil' && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-pampa-gray mb-4">Perfil do Agente</h2>
              <Campo label="Nome" value={skill.perfil.nome} onChange={v => handlePerfilChange('nome', v)} />
              <Campo label="Role" value={skill.perfil.role} onChange={v => handlePerfilChange('role', v)} />
              <CampoArea label="Objetivo" value={skill.perfil.objetivo} onChange={v => handlePerfilChange('objetivo', v)} />
              <Campo label="Tom de Voz" value={skill.perfil.tom_de_voz} onChange={v => handlePerfilChange('tom_de_voz', v)} />
            </div>
          )}

          {/* Etapas */}
          {activeTab.startsWith('etapa_') && (
            <EtapaEditor
              index={parseInt(activeTab.split('_')[1]) - 1}
              etapa={skill.etapas[parseInt(activeTab.split('_')[1]) - 1]}
              nome={ETAPAS_BMC[parseInt(activeTab.split('_')[1]) - 1]}
              onObjectiveChange={v => handleEtapaChange(parseInt(activeTab.split('_')[1]) - 1, 'objetivo', v)}
              onPerguntasChange={p => handlePerguntaChange(parseInt(activeTab.split('_')[1]) - 1, p)}
              onAtividadeChange={v => handleEtapaChange(parseInt(activeTab.split('_')[1]) - 1, 'atividadePratica', v)}
            />
          )}

          {/* Análise Crítica */}
          {activeTab === 'analise' && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-pampa-gray mb-4">Análise Crítica Final</h2>
              <CampoArea label="Visão Sistêmica e Coerência" value={skill.analiseCritica.visao_sistemica} onChange={v => handleAnaliseChange('visao_sistemica', v)} />
              <CampoArea label="O Elo Mais Fraco" value={skill.analiseCritica.elo_mais_fraco} onChange={v => handleAnaliseChange('elo_mais_fraco', v)} />
              <CampoArea label="Prototipação Lean (O MVP)" value={skill.analiseCritica.prototipacao_mvp} onChange={v => handleAnaliseChange('prototipacao_mvp', v)} />
            </div>
          )}

          {/* Exemplos de Contexto */}
          {activeTab === 'exemplos' && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-pampa-gray mb-4">Exemplos de Contexto</h2>
              <p className="text-sm text-gray-500 mb-3">Exemplos que o Consultor usa para inspirar o empreendedor em cada etapa.</p>
              <ListEditor
                items={skill.exemplos}
                onChange={handleExemplosChange}
                placeholder="Ex.: Segmento de Clientes: ..."
              />
            </div>
          )}
        </div>
      </div>

      {/* Versões Anteriores */}
      {versoes.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-pampa-gray mb-4">Versões Anteriores (Rollback)</h2>
          <div className="space-y-2">
            {versoes.map(v => (
              <div key={v.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">{v.name}</span>
                <button onClick={() => handleRollback(v.id)} className="text-sm text-pampa-green hover:text-green-700 font-medium">
                  Restaurar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Campo({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-pampa-gray mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-pampa-green focus:border-pampa-green outline-none transition-all"
      />
    </div>
  );
}

function CampoArea({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-pampa-gray mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={3}
        className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-pampa-green focus:border-pampa-green outline-none transition-all resize-y"
      />
    </div>
  );
}

function EtapaEditor({ index, etapa, nome, onObjectiveChange, onPerguntasChange, onAtividadeChange }) {
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-pampa-gray mb-4">Etapa {index + 1}: {nome}</h2>

      <CampoArea label="Objetivo da Etapa" value={etapa.objetivo || ''} onChange={onObjectiveChange} />

      <div>
        <label className="block text-sm font-medium text-pampa-gray mb-1.5">Perguntas Base</label>
        <ListEditor items={etapa.perguntas || ['']} onChange={onPerguntasChange} placeholder="Pergunta..." />
      </div>

      <CampoArea label="Atividade Prática Sugerida" value={etapa.atividadePratica || ''} onChange={onAtividadeChange} />
    </div>
  );
}

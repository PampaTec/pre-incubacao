import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NovoTime() {
  const navigate = useNavigate();
  const [nomeProjeto, setNomeProjeto] = useState('');
  const [emails, setEmails] = useState(['']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function handleEmailChange(index, value) {
    const novos = [...emails];
    novos[index] = value;
    setEmails(novos);
  }

  function adicionarEmail() {
    setEmails([...emails, '']);
  }

  function removerEmail(index) {
    if (emails.length <= 1) return;
    setEmails(emails.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const emailsValidos = emails.filter(e => e.trim() !== '');
    if (!nomeProjeto.trim() || emailsValidos.length === 0) {
      setError('Preencha o nome do projeto e pelo menos um e-mail');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:3001/api/admin/teams', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome_projeto: nomeProjeto.trim(),
          membros: emailsValidos
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao criar time');
      }

      const data = await res.json();
      navigate(`/gerenciar-time/${data.id_time}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-pampa-gray mb-2">Novo Time</h1>
      <p className="text-gray-500 mb-8">Crie um novo time de pré-incubação</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-pampa-gray mb-2">
            Nome do Projeto
          </label>
          <input
            type="text"
            value={nomeProjeto}
            onChange={e => setNomeProjeto(e.target.value)}
            placeholder="Ex.: StartupX"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pampa-green focus:border-pampa-green outline-none transition-all"
            disabled={submitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-pampa-gray mb-2">
            Membros (e-mails)
          </label>
          <div className="space-y-3">
            {emails.map((email, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => handleEmailChange(index, e.target.value)}
                  placeholder="email@exemplo.com"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pampa-green focus:border-pampa-green outline-none transition-all"
                  disabled={submitting}
                />
                {emails.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removerEmail(index)}
                    className="px-3 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    disabled={submitting}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={adicionarEmail}
            className="mt-3 text-sm text-pampa-green hover:text-green-700 font-medium transition-colors"
            disabled={submitting}
          >
            + Adicionar membro
          </button>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="btn-pampa px-8 py-3 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? 'Criando...' : 'Criar Time'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 text-pampa-gray border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
            disabled={submitting}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

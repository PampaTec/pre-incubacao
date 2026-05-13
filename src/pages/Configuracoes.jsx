import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Configuracoes() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [adminEmail, setAdminEmail] = useState(import.meta.env.VITE_ADMIN_EMAIL || '');

  useEffect(() => {
    fetch('http://localhost:3001/auth/status', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setUser(data))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-pampa-gray mb-2">Configurações</h1>
      <p className="text-gray-500 mb-8">Preferências e informações da conta</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-pampa-gray mb-4">Sua Conta</h2>
        <div className="space-y-3">
          <div>
            <span className="text-sm text-gray-500">Status:</span>
            <span className="ml-2 text-sm font-medium text-green-700">Conectado</span>
          </div>
          <div>
            <span className="text-sm text-gray-500">Papel:</span>
            <span className="ml-2 text-sm font-medium text-pampa-green capitalize">
              {user?.role === 'admin' ? 'Administrador' : 'Empreendedor'}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-500">E-mail:</span>
            <span className="ml-2 text-sm font-medium">{user?.email || '-'}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-pampa-gray mb-4">Administrador</h2>
        <div>
          <label className="block text-sm font-medium text-pampa-gray mb-1.5">E-mail do Admin Principal</label>
          <input
            type="email"
            value={adminEmail}
            onChange={e => setAdminEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-pampa-green focus:border-pampa-green outline-none"
            placeholder="admin@exemplo.com"
          />
          <p className="text-xs text-gray-400 mt-1">Definido via variável de ambiente ADMIN_EMAIL</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-pampa-gray mb-4">Sobre o Sistema</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Versão:</strong> 2.0.0</p>
          <p><strong>Plataforma:</strong> Pré-Incubação PampaTec</p>
          <p><strong>IA:</strong> Google Gemini</p>
          <p><strong>Armazenamento:</strong> Google Drive / Sheets</p>
        </div>
      </div>
    </div>
  );
}

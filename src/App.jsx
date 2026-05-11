import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import './index.css';

// Componentes temporários (Mocks) para as páginas
const Home = () => (
  <div className="text-center py-20">
    <h1 className="text-4xl font-bold font-pampa text-pampa-green mb-4">Bem-vindo à Pré-Incubação PampaTec</h1>
    <p className="text-pampa-gray text-lg max-w-2xl mx-auto">
      Valide seu modelo de negócios guiado pelo nosso Consultor IA utilizando o Business Model Canvas.
    </p>
  </div>
);

const Dashboard = () => <h2 className="text-2xl font-bold">Painel do Administrador</h2>;
const MeuProjeto = () => <h2 className="text-2xl font-bold">Meu Projeto (Canvas)</h2>;

function App() {
  // Estado que simula se o usuário está logado
  const [user, setUser] = useState({ authenticated: false, role: null });

  useEffect(() => {
    // Busca o status real no backend enviando os cookies de sessão
    fetch('http://localhost:3001/auth/status', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUser({ authenticated: true, role: data.role });
        }
      })
      .catch(err => console.error("Erro ao checar status:", err));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout user={user} />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="time" element={<MeuProjeto />} />
          {/* Outras rotas entrarão aqui */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

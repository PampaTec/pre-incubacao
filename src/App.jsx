import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NovoTime from './pages/NovoTime';
import GerenciarTime from './pages/GerenciarTime';
import MeuProjeto from './pages/MeuProjeto';
import SkillEditor from './pages/SkillEditor';
import TemplateManager from './pages/TemplateManager';
import Configuracoes from './pages/Configuracoes';
import './index.css';

const Home = () => (
  <div className="text-center py-20">
    <h1 className="text-4xl font-bold font-pampa text-pampa-green mb-4">Bem-vindo à Pré-Incubação PampaTec</h1>
    <p className="text-pampa-gray text-lg max-w-2xl mx-auto">
      Valide seu modelo de negócios guiado pelo nosso Consultor IA utilizando o Business Model Canvas.
    </p>
  </div>
);

function AdminRoute({ children, user }) {
  if (!user.authenticated) return <Navigate to="/" replace />;
  if (user.role !== 'admin') return <Navigate to="/time" replace />;
  return children;
}

function MemberRoute({ children, user }) {
  if (!user.authenticated) return <Navigate to="/" replace />;
  return children;
}

function App() {
  const [user, setUser] = useState({ authenticated: false, role: null });

  useEffect(() => {
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
          <Route path="dashboard" element={
            <AdminRoute user={user}><Dashboard /></AdminRoute>
          } />
          <Route path="novo-time" element={
            <AdminRoute user={user}><NovoTime /></AdminRoute>
          } />
          <Route path="gerenciar-time/:id" element={
            <AdminRoute user={user}><GerenciarTime /></AdminRoute>
          } />
          <Route path="time" element={
            <MemberRoute user={user}><MeuProjeto /></MemberRoute>
          } />
          <Route path="skill-editor" element={
            <AdminRoute user={user}><SkillEditor /></AdminRoute>
          } />
          <Route path="templates" element={
            <AdminRoute user={user}><TemplateManager /></AdminRoute>
          } />
          <Route path="configuracoes" element={
            <AdminRoute user={user}><Configuracoes /></AdminRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { Outlet, Link } from 'react-router-dom';

export default function Layout({ user }) {
  const handleLogin = (role) => {
    // Redireciona para o backend que iniciará o fluxo OAuth
    const authUrl = role === 'admin'
      ? 'http://localhost:3001/auth/google/admin'
      : 'http://localhost:3001/auth/google';

    window.location.href = authUrl;
  };

  const handleLogout = () => {
    window.location.href = 'http://localhost:3001/auth/logout';
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">

            {/* Logo / Título */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-3">
                <img
                  src="/logo-pampatec.png"
                  alt="Logo PampaTec"
                  className="h-10 w-auto object-contain"
                />
                <span className="text-2xl font-pampa text-pampa-green font-bold hidden sm:block">
                  Pré-Incubação
                </span>
              </Link>
            </div>

            {/* Menu Desktop */}
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {user?.role === 'admin' && (
                <>
                  <Link to="/dashboard" className="text-pampa-gray hover:text-pampa-green px-3 py-2 rounded-md font-medium transition-colors">Painel Admin</Link>
                  <Link to="/templates" className="text-pampa-gray hover:text-pampa-green px-3 py-2 rounded-md font-medium transition-colors">Templates</Link>
                  <Link to="/skill-editor" className="text-pampa-gray hover:text-pampa-green px-3 py-2 rounded-md font-medium transition-colors">Skill Editor</Link>
                </>
              )}
              {user?.role === 'user' && (
                <Link to="/time" className="text-pampa-gray hover:text-pampa-green px-3 py-2 rounded-md font-medium transition-colors">Meu Projeto</Link>
              )}
            </nav>

            {/* Ações de Login / Perfil */}
            <div className="flex items-center space-x-4">
              {!user?.authenticated ? (
                <>
                  <button
                    onClick={() => handleLogin('user')}
                    className="btn-pampa"
                  >
                    Sou Empreendedor
                  </button>
                  <button
                    onClick={() => handleLogin('admin')}
                    className="text-pampa-gray hover:text-pampa-green font-medium transition-colors"
                  >
                    Admin PampaTec
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    Olá, {user.role === 'admin' ? 'Administrador' : 'Empreendedor'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-red-500 hover:text-red-700 font-medium transition-colors"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Conteúdo Principal (Rotas filhas) */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Rodapé */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Incubadora PampaTec. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

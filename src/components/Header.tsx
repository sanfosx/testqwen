import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Pizza, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onOpenChat: () => void;
  onNavigate: (section: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenChat, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isAdminRoute = location.pathname.startsWith('/admin');

  const publicLinks = [
    { label: 'Inicio', action: () => onNavigate('hero') },
    { label: 'Menú', action: () => onNavigate('menu') },
    { label: 'Nosotros', action: () => onNavigate('about') },
  ];

  const handleLogoClick = () => {
    if (isAdminRoute || location.pathname !== '/') {
      navigate('/');
      setTimeout(() => onNavigate('hero'), 100);
    } else {
      onNavigate('hero');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogoClick}>
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-yellow-500 rounded-full flex items-center justify-center">
              <Pizza className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight font-poppins">Los Genios</h1>
              <p className="text-yellow-400 text-xs">Pizzería Artesanal</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {isAdminRoute ? (
              <>
                <span className="text-gray-400 text-sm">{user?.email}</span>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white transition-colors font-medium text-sm"
                >
                  Volver al Sitio
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded-full font-semibold text-sm transition-colors border border-gray-700"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                {publicLinks.map(link => (
                  <button
                    key={link.label}
                    onClick={link.action}
                    className="text-gray-300 hover:text-white transition-colors font-medium text-sm"
                  >
                    {link.label}
                  </button>
                ))}
                <Link
                  to={user ? '/admin' : '/login'}
                  className="text-gray-300 hover:text-white transition-colors font-medium text-sm"
                >
                  Admin
                </Link>
                <button
                  onClick={onOpenChat}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2 rounded-full font-semibold text-sm transition-all hover:shadow-lg hover:shadow-red-500/25"
                >
                  Pedir Online
                </button>
              </>
            )}
          </nav>

          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 animate-fade-in">
          <div className="px-4 py-4 space-y-3">
            {isAdminRoute ? (
              <>
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left text-gray-300 hover:text-white py-2 font-medium"
                >
                  Volver al Sitio
                </Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="block w-full text-left text-red-400 hover:text-red-300 py-2 font-medium"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                {publicLinks.map(link => (
                  <button
                    key={link.label}
                    onClick={() => { link.action(); setMobileMenuOpen(false); }}
                    className="block w-full text-left text-gray-300 hover:text-white py-2 font-medium"
                  >
                    {link.label}
                  </button>
                ))}
                <Link
                  to={user ? '/admin' : '/login'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left text-gray-300 hover:text-white py-2 font-medium"
                >
                  Admin
                </Link>
                <button
                  onClick={() => { onOpenChat(); setMobileMenuOpen(false); }}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold mt-2"
                >
                  Pedir Online
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

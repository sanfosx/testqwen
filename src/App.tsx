import React, { Suspense, useState } from 'react';
import { createHashRouter, RouterProvider, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ChatAssistantModal } from './components/ChatAssistantModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';

// Lazy: el AdminPanel (~1000 líneas) y sus dependencias (dnd-kit, etc.)
// solo se descargan cuando el usuario autenticado entra a /admin.
const AdminPanel = React.lazy(() =>
  import('./pages/AdminPanel').then((m) => ({ default: m.AdminPanel })),
);

// Lazy: la home también queda en un chunk separado del shell inicial.
const HomePage = React.lazy(() =>
  import('./pages/HomePage').then((m) => ({ default: m.HomePage })),
);

/** Layout: Header + contenido de la ruta (Outlet) + Footer + chat flotante. */
const RootLayout: React.FC = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const { user } = useAuth();

  /** Scroll suave a una sección; si no está montada, navega a la home primero. */
  const scrollToSection = (section: string) => {
    const el = document.getElementById(section);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    // Estamos en otra ruta (login/admin): vamos a la home con el target.
    window.location.hash = `#/?s=${encodeURIComponent(section)}`;
    setTimeout(() => {
      document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
    }, 250);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-950 font-inter">
        <Header onOpenChat={() => setChatOpen(true)} onNavigate={scrollToSection} />

        <Suspense
          fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            </div>
          }
        >
          <Outlet context={{ openChat: () => setChatOpen(true) }} />
        </Suspense>

        <Footer adminHref={user ? '/admin' : '/login'} />

        <ChatAssistantModal isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      </div>
    </AuthProvider>
  );
};

// Hash router: funciona en cualquier hosting estático sin configuración extra
// de reescritura de URLs (evita 404 al recargar /admin o compartir enlaces).
export const router = createHashRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/login', element: <LoginPage /> },
      {
        element: <ProtectedRoute />,
        children: [{ path: '/admin', element: <AdminPanel /> }],
      },
      { path: '*', element: <HomePage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}




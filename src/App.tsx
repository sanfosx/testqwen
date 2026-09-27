import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { MenuSection } from './components/MenuSection';
import { ChatAssistantModal } from './components/ChatAssistantModal';
import { AdminPanel } from './pages/AdminPanel';

function App() {
  const [currentView, setCurrentView] = useState<'public' | 'admin'>('public');
  const [chatOpen, setChatOpen] = useState(false);

  const scrollToSection = (section: string) => {
    if (currentView !== 'public') {
      setCurrentView('public');
      setTimeout(() => {
        const el = document.getElementById(section);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(section);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 font-inter">
      <Header
        onOpenChat={() => setChatOpen(true)}
        onNavigate={scrollToSection}
        currentView={currentView}
        onGoPublic={() => setCurrentView('public')}
        onGoAdmin={() => setCurrentView('admin')}
      />

      {currentView === 'public' ? (
        <>
          <main>
            <HeroSection onOpenChat={() => setChatOpen(true)} />

            {/* About Section */}
            <section id="about" className="py-20 bg-gray-950 relative overflow-hidden">
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500 rounded-full blur-3xl" />
              </div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white font-poppins mb-6">
                      Nuestra <span className="text-red-400">Historia</span>
                    </h2>
                    <p className="text-gray-300 text-lg leading-relaxed mb-4">
                      Desde 2010, Pizzería Los Genios nació con la pasión de traer los sabores auténticos de Italia
                      a cada rincón de la ciudad. Nuestro fundador, Marco Rossi, trajo consigo las recetas familiares
                      que han pasado por cuatro generaciones de pizzeros napolitanos.
                    </p>
                    <p className="text-gray-400 leading-relaxed mb-6">
                      Cada pizza es elaborada con masa madre fermentada durante 48 horas, salsa de tomates San Marzano
                      importados y mozzarella fresca que llega diariamente. Nuestro horno de leña a 450°C le da ese
                      toque ahumado inconfundible.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                        <p className="text-3xl font-bold text-red-400 font-poppins">48h</p>
                        <p className="text-gray-400 text-sm">Fermentación de masa</p>
                      </div>
                      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                        <p className="text-3xl font-bold text-yellow-400 font-poppins">450°C</p>
                        <p className="text-gray-400 text-sm">Horno de leña</p>
                      </div>
                      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                        <p className="text-3xl font-bold text-green-400 font-poppins">100%</p>
                        <p className="text-gray-400 text-sm">Ingredientes frescos</p>
                      </div>
                      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                        <p className="text-3xl font-bold text-purple-400 font-poppins">4</p>
                        <p className="text-gray-400 text-sm">Generaciones de pizzeros</p>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="aspect-square rounded-3xl bg-gradient-to-br from-red-900/30 to-yellow-900/20 border border-gray-800 flex items-center justify-center overflow-hidden">
                      <div className="text-center p-8">
                        <div className="text-8xl mb-4">🍕</div>
                        <p className="text-2xl font-bold text-white font-poppins mb-2">Arte en cada porción</p>
                        <p className="text-gray-400">Tradición italiana con alma argentina</p>
                      </div>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-red-500 to-yellow-500 rounded-2xl flex items-center justify-center text-4xl shadow-xl">
                      🇮🇹
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <MenuSection />
          </main>

          <Footer onGoAdmin={() => setCurrentView('admin')} />
        </>
      ) : (
        <AdminPanel />
      )}

      <ChatAssistantModal isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

export default App;

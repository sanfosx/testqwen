import React from 'react';
import { Pizza, Phone, MapPin, Mail, Instagram, Facebook } from 'lucide-react';

interface FooterProps {
  onGoAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onGoAdmin }) => {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-yellow-500 rounded-full flex items-center justify-center">
                <Pizza className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold font-poppins">Los Genios</h3>
                <p className="text-yellow-400 text-xs">Pizzería Artesanal</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Desde 2010 elaborando las mejores pizzas artesanales con ingredientes frescos y recetas que pasan de generación en generación.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 font-poppins">Contacto</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-400" />
                <span>(011) 4567-8900</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-400" />
                <span>Av. de los Genios 1234, CABA</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-400" />
                <span>hola@pizzerialosgenios.com</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 font-poppins">Seguinos</h4>
            <div className="flex gap-3 mb-6">
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
            <button
              onClick={onGoAdmin}
              className="text-sm text-gray-500 hover:text-yellow-400 transition-colors underline"
            >
              Panel de Administración
            </button>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Pizzería Los Genios. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

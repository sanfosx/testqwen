import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { productService } from '../services/productService';
import { Flame, Leaf, Crown, GlassWater } from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
  'Pizzas Clásicas': <Flame className="w-5 h-5" />,
  'Pizzas Premium': <Crown className="w-5 h-5" />,
  'Entradas': <Leaf className="w-5 h-5" />,
  'Postres': <span className="text-lg">🍰</span>,
  'Bebidas': <GlassWater className="w-5 h-5" />,
};

const categoryColors: Record<string, string> = {
  'Pizzas Clásicas': 'from-red-900/40 to-red-800/20',
  'Pizzas Premium': 'from-purple-900/40 to-purple-800/20',
  'Entradas': 'from-green-900/40 to-green-800/20',
  'Postres': 'from-pink-900/40 to-pink-800/20',
  'Bebidas': 'from-blue-900/40 to-blue-800/20',
};

const MenuItemCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-5 hover:border-red-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/5 hover:-translate-y-1 group">
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-white font-semibold font-poppins group-hover:text-red-300 transition-colors">
          {product.name}
        </h4>
        <span className="text-yellow-400 font-bold text-lg whitespace-nowrap ml-3">
          ${product.price.toLocaleString('es-AR')}
        </span>
      </div>
      <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>
    </div>
  );
};

export const MenuSection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [grouped, setGrouped] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const allProducts = await productService.getAll();
      setProducts(allProducts);
      const byCategory = await productService.getByCategory();
      setGrouped(byCategory);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Poll for changes
  useEffect(() => {
    const interval = setInterval(loadProducts, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && products.length === 0) {
    return (
      <section id="menu" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-48 mx-auto mb-4" />
            <div className="h-4 bg-gray-800 rounded w-96 mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section id="menu" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white font-poppins mb-4">
            Nuestro <span className="text-red-400">Menú</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Elaborado con ingredientes frescos y recetas que cuentan historias
          </p>
        </div>

        {Object.entries(grouped).map(([category, items], index) => (
          <div key={category} className="mb-16 last:mb-0">
            <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-r ${categoryColors[category] || 'from-gray-800/40 to-gray-700/20'} border border-gray-700/30 p-8`}>
              <div className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `radial-gradient(circle at ${20 + index * 15}% ${30 + index * 10}%, rgba(239,68,68,0.3) 0%, transparent 50%)`,
                }}
              />

              <div className="relative">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-400">
                    {categoryIcons[category] || <Flame className="w-5 h-5" />}
                  </div>
                  <h3 className="text-2xl font-bold text-white font-poppins">{category}</h3>
                  <span className="text-gray-500 text-sm">({items.length} items)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map(product => (
                    <MenuItemCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

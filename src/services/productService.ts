import { Product } from '../types';
import { insforge, isInsforgeConfigured } from '../lib/insforge';
import { v4 as uuidv4 } from 'uuid';

// Fallback a localStorage si InsForge no está configurado
const STORAGE_KEY = 'pizzeria_products';

const defaultProducts: Product[] = [
  { id: uuidv4(), name: 'Margherita Clásica', description: 'Salsa de tomate San Marzano, mozzarella fresca, albahaca y aceite de oliva extra virgen.', price: 4500, category: 'Pizzas Clásicas' },
  { id: uuidv4(), name: 'Pepperoni Suprema', description: 'Salsa de tomate, mozzarella, pepperoni artesanal y orégano.', price: 5200, category: 'Pizzas Clásicas' },
  { id: uuidv4(), name: 'Cuatro Quesos', description: 'Mozzarella, gorgonzola, parmesano y provolone sobre base de crema.', price: 5800, category: 'Pizzas Clásicas' },
  { id: uuidv4(), name: 'Napolitana', description: 'Salsa de tomate, mozzarella, tomates frescos, ajo y anchoas.', price: 5000, category: 'Pizzas Clásicas' },
  { id: uuidv4(), name: 'Los Genios Especial', description: 'Nuestra pizza insignia: jamón serrano, rúcula, queso de cabra, tomates secos y reducción de balsámico.', price: 7200, category: 'Pizzas Premium' },
  { id: uuidv4(), name: 'Trufa Negra', description: 'Crema de trufa negra, mozzarella di bufala, champiñones porcini y aceite trufado.', price: 8500, category: 'Pizzas Premium' },
  { id: uuidv4(), name: 'BBQ Chicken', description: 'Salsa BBQ ahumada, pollo grillado, cebolla caramelizada, cilantro y mozzarella.', price: 6500, category: 'Pizzas Premium' },
  { id: uuidv4(), name: 'Vegetariana Deluxe', description: 'Berenjenas grilladas, zucchini, pimientos asados, aceitunas kalamata y queso feta.', price: 5500, category: 'Pizzas Premium' },
  { id: uuidv4(), name: 'Empanadas de Carne (x6)', description: 'Empanadas de carne cortada a cuchillo, especias secretas y masa casera.', price: 3800, category: 'Entradas' },
  { id: uuidv4(), name: 'Bruschetta Italiana (x4)', description: 'Pan ciabatta tostado con tomates frescos, albahaca, ajo y aceite de oliva.', price: 3200, category: 'Entradas' },
  { id: uuidv4(), name: 'Ensalada Caesar', description: 'Lechuga romana, crutones, parmesano, anchoas y aderezo caesar casero.', price: 3500, category: 'Entradas' },
  { id: uuidv4(), name: 'Tiramisú', description: 'Clásico postre italiano con mascarpone, café espresso y cacao.', price: 3000, category: 'Postres' },
  { id: uuidv4(), name: 'Panna Cotta', description: 'Panna cotta de vainilla con coulis de frutos rojos.', price: 2800, category: 'Postres' },
  { id: uuidv4(), name: 'Coca-Cola 500ml', description: 'Gaseosa Coca-Cola.', price: 1500, category: 'Bebidas' },
  { id: uuidv4(), name: 'Agua Mineral 500ml', description: 'Agua mineral sin gas.', price: 1000, category: 'Bebidas' },
  { id: uuidv4(), name: 'Cerveza Artesanal IPA', description: 'Cerveza artesanal IPA de la casa, 500ml.', price: 2800, category: 'Bebidas' },
];

// Funciones de fallback para localStorage
const localStorageFallback = {
  getAll(): Product[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts));
      return defaultProducts;
    }
    return JSON.parse(data);
  },
  getById(id: string): Product | undefined {
    return this.getAll().find(p => p.id === id);
  },
  create(product: Omit<Product, 'id'>): Product {
    const products = this.getAll();
    const newProduct: Product = { ...product, id: uuidv4() };
    products.push(newProduct);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return newProduct;
  },
  update(id: string, updates: Partial<Product>): Product | undefined {
    const products = this.getAll();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    products[index] = { ...products[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return products[index];
  },
  delete(id: string): boolean {
    const products = this.getAll();
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length === products.length) return false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }
};

export const productService = {
  async getAll(): Promise<Product[]> {
    if (!isInsforgeConfigured()) {
      return localStorageFallback.getAll();
    }
    
    try {
      const { data, error } = await insforge.database
        .from('products')
        .select();
      
      if (error) throw error;
      return (data || []) as Product[];
    } catch (error) {
      console.error('Error fetching products:', error);
      return localStorageFallback.getAll();
    }
  },

  async getById(id: string): Promise<Product | undefined> {
    if (!isInsforgeConfigured()) {
      return localStorageFallback.getById(id);
    }
    
    try {
      const { data, error } = await insforge.database
        .from('products')
        .select()
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Product;
    } catch (error) {
      console.error('Error fetching product:', error);
      return localStorageFallback.getById(id);
    }
  },

  async getByCategory(): Promise<Record<string, Product[]>> {
    const products = await this.getAll();
    return products.reduce((acc, product) => {
      if (!acc[product.category]) acc[product.category] = [];
      acc[product.category].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  },

  async create(product: Omit<Product, 'id'>): Promise<Product> {
    if (!isInsforgeConfigured()) {
      return localStorageFallback.create(product);
    }
    
    try {
      const { data, error } = await insforge.database
        .from('products')
        .insert(product)
        .select()
        .single();
      
      if (error) throw error;
      return data as Product;
    } catch (error) {
      console.error('Error creating product:', error);
      return localStorageFallback.create(product);
    }
  },

  async update(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    if (!isInsforgeConfigured()) {
      return localStorageFallback.update(id, updates);
    }
    
    try {
      const { data, error } = await insforge.database
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Product;
    } catch (error) {
      console.error('Error updating product:', error);
      return localStorageFallback.update(id, updates);
    }
  },

  async delete(id: string): Promise<boolean> {
    if (!isInsforgeConfigured()) {
      return localStorageFallback.delete(id);
    }
    
    try {
      const { error } = await insforge.database
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return localStorageFallback.delete(id);
    }
  }
};

import { Order } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'pizzeria_orders';

const defaultOrders: Order[] = [
  {
    id: uuidv4(),
    customerName: 'Juan Pérez',
    customerPhone: '11-2345-6789',
    customerAddress: 'Av. Corrientes 1234',
    items: [
      { productId: '1', productName: 'Margherita Clásica', quantity: 2, price: 4500 },
      { productId: '14', productName: 'Coca-Cola 500ml', quantity: 2, price: 1500 },
    ],
    total: 12000,
    type: 'delivery',
    status: 'preparing',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: uuidv4(),
    customerName: 'María García',
    customerPhone: '11-9876-5432',
    customerAddress: '',
    items: [
      { productId: '5', productName: 'Los Genios Especial', quantity: 1, price: 7200 },
      { productId: '12', productName: 'Tiramisú', quantity: 1, price: 3000 },
    ],
    total: 10200,
    type: 'pickup',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3000000).toISOString(),
  },
];

export const orderService = {
  getAll(): Order[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultOrders));
      return defaultOrders;
    }
    return JSON.parse(data);
  },

  getById(id: string): Order | undefined {
    return this.getAll().find(o => o.id === id);
  },

  create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
    const orders = this.getAll();
    const now = new Date().toISOString();
    const newOrder: Order = { ...order, id: uuidv4(), createdAt: now, updatedAt: now };
    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    return newOrder;
  },

  update(id: string, updates: Partial<Order>): Order | undefined {
    const orders = this.getAll();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return undefined;
    orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString() };
    if (updates.status === 'completed' || updates.status === 'cancelled') {
      orders[index].completedAt = new Date().toISOString();
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    return orders[index];
  },

  updateStatus(id: string, status: Order['status']): Order | undefined {
    return this.update(id, { status });
  },

  delete(id: string): boolean {
    const orders = this.getAll();
    const filtered = orders.filter(o => o.id !== id);
    if (filtered.length === orders.length) return false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  getValidTransitions(currentStatus: Order['status']): Order['status'][] {
    const transitions: Record<Order['status'], Order['status'][]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready'],
      ready: ['delivered'],
      delivered: ['completed'],
      completed: [],
      cancelled: [],
    };
    return transitions[currentStatus] || [];
  },

  getStatusLabel(status: Order['status']): string {
    const labels: Record<Order['status'], string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      preparing: 'En Preparación',
      ready: 'Listo',
      delivered: 'Entregado',
      completed: 'Completado',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  },

  getStatusColor(status: Order['status']): string {
    const colors: Record<Order['status'], string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
};

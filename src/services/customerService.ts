import { Customer } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'pizzeria_customers';

const defaultCustomers: Customer[] = [
  { id: uuidv4(), name: 'Juan Pérez', phone: '11-2345-6789', address: 'Av. Corrientes 1234', email: 'juan@email.com', createdAt: new Date().toISOString() },
  { id: uuidv4(), name: 'María García', phone: '11-9876-5432', address: 'Calle Florida 567', email: 'maria@email.com', createdAt: new Date().toISOString() },
  { id: uuidv4(), name: 'Carlos López', phone: '11-5555-1234', address: 'Av. Santa Fe 890', email: 'carlos@email.com', createdAt: new Date().toISOString() },
  { id: uuidv4(), name: 'Ana Martínez', phone: '11-7777-8888', address: 'Calle Rivadavia 234', createdAt: new Date().toISOString() },
];

export const customerService = {
  getAll(): Customer[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCustomers));
      return defaultCustomers;
    }
    return JSON.parse(data);
  },

  getById(id: string): Customer | undefined {
    return this.getAll().find(c => c.id === id);
  },

  create(customer: Omit<Customer, 'id' | 'createdAt'>): Customer {
    const customers = this.getAll();
    const newCustomer: Customer = { ...customer, id: uuidv4(), createdAt: new Date().toISOString() };
    customers.push(newCustomer);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    return newCustomer;
  },

  update(id: string, updates: Partial<Customer>): Customer | undefined {
    const customers = this.getAll();
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    customers[index] = { ...customers[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    return customers[index];
  },

  delete(id: string): boolean {
    const customers = this.getAll();
    const filtered = customers.filter(c => c.id !== id);
    if (filtered.length === customers.length) return false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  search(query: string): Customer[] {
    const customers = this.getAll();
    const q = query.toLowerCase();
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  }
};

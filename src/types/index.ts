export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  total: number;
  type: 'delivery' | 'pickup';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  createdAt: string;
}

export interface TimeSlot {
  open: string;
  close: string;
}

export interface DaySchedule {
  day: string;
  slots: TimeSlot[];
  isOpen: boolean;
}

export interface Schedule {
  days: DaySchedule[];
  defaultReservationDuration: number; // in minutes
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
}

export interface Reservation {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  guests: number;
  tableId: string;
  tableName: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type AdminView = 'products' | 'orders' | 'customers' | 'schedule' | 'reservations';

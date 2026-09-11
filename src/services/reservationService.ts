import { Reservation, Table } from '../types';
import { v4 as uuidv4 } from 'uuid';

const RESERVATIONS_KEY = 'pizzeria_reservations';
const TABLES_KEY = 'pizzeria_tables';

const defaultTables: Table[] = [
  { id: uuidv4(), name: 'Mesa 1', capacity: 2 },
  { id: uuidv4(), name: 'Mesa 2', capacity: 4 },
  { id: uuidv4(), name: 'Mesa 3', capacity: 4 },
  { id: uuidv4(), name: 'Mesa 4', capacity: 6 },
  { id: uuidv4(), name: 'Mesa 5', capacity: 8 },
];

const defaultReservations: Reservation[] = [];

export const reservationService = {
  getReservations(): Reservation[] {
    const data = localStorage.getItem(RESERVATIONS_KEY);
    if (!data) {
      localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(defaultReservations));
      return defaultReservations;
    }
    return JSON.parse(data);
  },

  createReservation(reservation: Omit<Reservation, 'id' | 'createdAt'>): Reservation {
    const reservations = this.getReservations();
    const newRes: Reservation = { ...reservation, id: uuidv4(), createdAt: new Date().toISOString() };
    reservations.push(newRes);
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
    return newRes;
  },

  updateReservation(id: string, updates: Partial<Reservation>): Reservation | undefined {
    const reservations = this.getReservations();
    const index = reservations.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    reservations[index] = { ...reservations[index], ...updates };
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
    return reservations[index];
  },

  deleteReservation(id: string): boolean {
    const reservations = this.getReservations();
    const filtered = reservations.filter(r => r.id !== id);
    if (filtered.length === reservations.length) return false;
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(filtered));
    return true;
  },

  getTables(): Table[] {
    const data = localStorage.getItem(TABLES_KEY);
    if (!data) {
      localStorage.setItem(TABLES_KEY, JSON.stringify(defaultTables));
      return defaultTables;
    }
    return JSON.parse(data);
  },

  saveTables(tables: Table[]): void {
    localStorage.setItem(TABLES_KEY, JSON.stringify(tables));
  },

  createTable(table: Omit<Table, 'id'>): Table {
    const tables = this.getTables();
    const newTable: Table = { ...table, id: uuidv4() };
    tables.push(newTable);
    this.saveTables(tables);
    return newTable;
  },

  updateTable(id: string, updates: Partial<Table>): Table | undefined {
    const tables = this.getTables();
    const index = tables.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    tables[index] = { ...tables[index], ...updates };
    this.saveTables(tables);
    return tables[index];
  },

  deleteTable(id: string): boolean {
    const tables = this.getTables();
    const filtered = tables.filter(t => t.id !== id);
    if (filtered.length === tables.length) return false;
    this.saveTables(filtered);
    return true;
  },

  getAvailableSlots(date: string, guests: number, duration: number, openTime: string, closeTime: string): { time: string; availableTables: Table[] }[] {
    const tables = this.getTables().filter(t => t.capacity >= guests);
    const reservations = this.getReservations().filter(r => r.date === date && r.status !== 'cancelled');

    const [openH, openM] = openTime.split(':').map(Number);
    const [closeH, closeM] = closeTime.split(':').map(Number);
    let openMinutes = openH * 60 + openM;
    let closeMinutes = closeH * 60 + closeM;
    if (closeMinutes <= openMinutes) closeMinutes += 24 * 60;

    const slots: { time: string; availableTables: Table[] }[] = [];

    for (let mins = openMinutes; mins + duration <= closeMinutes; mins += 30) {
      const h = Math.floor(mins / 60) % 24;
      const m = mins % 60;
      const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

      const slotEnd = mins + duration;
      const availableTables = tables.filter(table => {
        return !reservations.some(r => {
          if (r.tableId !== table.id) return false;
          const [rH, rM] = r.time.split(':').map(Number);
          const rStart = rH * 60 + rM;
          const rEnd = rStart + duration;
          return mins < rEnd && slotEnd > rStart;
        });
      });

      if (availableTables.length > 0) {
        slots.push({ time: timeStr, availableTables });
      }
    }

    return slots;
  }
};

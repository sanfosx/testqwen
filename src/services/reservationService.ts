import { Reservation, Table } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { insforge, isInsforgeConfigured } from '../lib/insforge';

const RESERVATIONS_KEY = 'pizzeria_reservations';
const TABLES_KEY = 'pizzeria_tables';

const defaultTables: Table[] = [
  { id: uuidv4(), name: 'Mesa 1', capacity: 2 },
  { id: uuidv4(), name: 'Mesa 2', capacity: 4 },
  { id: uuidv4(), name: 'Mesa 3', capacity: 4 },
  { id: uuidv4(), name: 'Mesa 4', capacity: 6 },
  { id: uuidv4(), name: 'Mesa 5', capacity: 8 },
];

const localStorageFallback = {
  getReservations(): Reservation[] {
    const data = localStorage.getItem(RESERVATIONS_KEY);
    if (!data) {
      localStorage.setItem(RESERVATIONS_KEY, JSON.stringify([]));
      return [];
    }
    return JSON.parse(data);
  },
  saveReservations(reservations: Reservation[]): void {
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
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
  }
};

export const reservationService = {
  async getReservations(): Promise<Reservation[]> {
    if (!isInsforgeConfigured()) {
      return localStorageFallback.getReservations();
    }
    try {
      const { data, error } = await insforge.database
        .from('reservations')
        .select()
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Reservation[];
    } catch (error) {
      console.error('Error fetching reservations:', error);
      return localStorageFallback.getReservations();
    }
  },

  async createReservation(reservation: Omit<Reservation, 'id' | 'createdAt'>): Promise<Reservation> {
    if (!isInsforgeConfigured()) {
      const reservations = localStorageFallback.getReservations();
      const newRes: Reservation = { ...reservation, id: uuidv4(), createdAt: new Date().toISOString() };
      reservations.push(newRes);
      localStorageFallback.saveReservations(reservations);
      return newRes;
    }
    try {
      const resData = { ...reservation, id: uuidv4(), created_at: new Date().toISOString() };
      const { data, error } = await insforge.database
        .from('reservations')
        .insert(resData)
        .select()
        .single();
      if (error) throw error;
      return data as Reservation;
    } catch (error) {
      console.error('Error creating reservation:', error);
      const reservations = localStorageFallback.getReservations();
      const newRes: Reservation = { ...reservation, id: uuidv4(), createdAt: new Date().toISOString() };
      reservations.push(newRes);
      localStorageFallback.saveReservations(reservations);
      return newRes;
    }
  },

  async updateReservation(id: string, updates: Partial<Reservation>): Promise<Reservation | undefined> {
    if (!isInsforgeConfigured()) {
      const reservations = localStorageFallback.getReservations();
      const index = reservations.findIndex(r => r.id === id);
      if (index === -1) return undefined;
      reservations[index] = { ...reservations[index], ...updates };
      localStorageFallback.saveReservations(reservations);
      return reservations[index];
    }
    try {
      const { data, error } = await insforge.database
        .from('reservations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Reservation;
    } catch (error) {
      console.error('Error updating reservation:', error);
      const reservations = localStorageFallback.getReservations();
      const index = reservations.findIndex(r => r.id === id);
      if (index === -1) return undefined;
      reservations[index] = { ...reservations[index], ...updates };
      localStorageFallback.saveReservations(reservations);
      return reservations[index];
    }
  },

  async deleteReservation(id: string): Promise<boolean> {
    if (!isInsforgeConfigured()) {
      const reservations = localStorageFallback.getReservations();
      const filtered = reservations.filter(r => r.id !== id);
      if (filtered.length === reservations.length) return false;
      localStorageFallback.saveReservations(filtered);
      return true;
    }
    try {
      const { error } = await insforge.database
        .from('reservations')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting reservation:', error);
      const reservations = localStorageFallback.getReservations();
      const filtered = reservations.filter(r => r.id !== id);
      if (filtered.length === reservations.length) return false;
      localStorageFallback.saveReservations(filtered);
      return true;
    }
  },

  async getTables(): Promise<Table[]> {
    if (!isInsforgeConfigured()) {
      return localStorageFallback.getTables();
    }
    try {
      const { data, error } = await insforge.database
        .from('tables')
        .select();
      if (error) throw error;
      return (data || []) as Table[];
    } catch (error) {
      console.error('Error fetching tables:', error);
      return localStorageFallback.getTables();
    }
  },

  async saveTables(tables: Table[]): Promise<void> {
    localStorageFallback.saveTables(tables);
    
    if (isInsforgeConfigured()) {
      try {
        await insforge.database.from('tables').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        for (const table of tables) {
          await insforge.database.from('tables').insert(table);
        }
      } catch (error) {
        console.error('Error saving tables to InsForge:', error);
      }
    }
  },

  async createTable(table: Omit<Table, 'id'>): Promise<Table> {
    if (!isInsforgeConfigured()) {
      const tables = localStorageFallback.getTables();
      const newTable: Table = { ...table, id: uuidv4() };
      tables.push(newTable);
      localStorageFallback.saveTables(tables);
      return newTable;
    }
    try {
      const tableData = { ...table, id: uuidv4(), created_at: new Date().toISOString() };
      const { data, error } = await insforge.database
        .from('tables')
        .insert(tableData)
        .select()
        .single();
      if (error) throw error;
      return data as Table;
    } catch (error) {
      console.error('Error creating table:', error);
      const tables = localStorageFallback.getTables();
      const newTable: Table = { ...table, id: uuidv4() };
      tables.push(newTable);
      localStorageFallback.saveTables(tables);
      return newTable;
    }
  },

  async updateTable(id: string, updates: Partial<Table>): Promise<Table | undefined> {
    if (!isInsforgeConfigured()) {
      const tables = localStorageFallback.getTables();
      const index = tables.findIndex(t => t.id === id);
      if (index === -1) return undefined;
      tables[index] = { ...tables[index], ...updates };
      localStorageFallback.saveTables(tables);
      return tables[index];
    }
    try {
      const { data, error } = await insforge.database
        .from('tables')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Table;
    } catch (error) {
      console.error('Error updating table:', error);
      return undefined;
    }
  },

  async deleteTable(id: string): Promise<boolean> {
    if (!isInsforgeConfigured()) {
      const tables = localStorageFallback.getTables();
      const filtered = tables.filter(t => t.id !== id);
      if (filtered.length === tables.length) return false;
      localStorageFallback.saveTables(filtered);
      return true;
    }
    try {
      const { error } = await insforge.database
        .from('tables')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting table:', error);
      return false;
    }
  },

  getAvailableSlots(date: string, guests: number, duration: number, openTime: string, closeTime: string): { time: string; availableTables: Table[] }[] {
    const tables = localStorageFallback.getTables().filter(t => t.capacity >= guests);
    const reservations = localStorageFallback.getReservations().filter(r => r.date === date && r.status !== 'cancelled');

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

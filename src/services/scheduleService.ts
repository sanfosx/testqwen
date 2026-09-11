import { Schedule, DaySchedule } from '../types';
import { insforge, isInsforgeConfigured } from '../lib/insforge';

const STORAGE_KEY = 'pizzeria_schedule';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const defaultSchedule: Schedule = {
  days: DAYS.map((day, index) => ({
    day,
    isOpen: true,
    slots: index >= 5
      ? [{ open: '12:00', close: '15:30' }, { open: '19:30', close: '01:00' }]
      : [{ open: '12:00', close: '15:00' }, { open: '19:30', close: '23:30' }],
  })),
  defaultReservationDuration: 90,
};

const localStorageFallback = {
  get(): Schedule {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSchedule));
      return defaultSchedule;
    }
    return JSON.parse(data);
  },
  save(schedule: Schedule): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
  }
};

export const scheduleService = {
  get(): Schedule {
    // Schedule se mantiene síncrono con localStorage por simplicidad
    // En InsForge se puede sincronizar manualmente
    return localStorageFallback.get();
  },

  save(schedule: Schedule): void {
    localStorageFallback.save(schedule);
    
    // Si InsForge está configurado, sincronizar en background
    if (isInsforgeConfigured()) {
      this.syncToInsforge(schedule).catch(err => {
        console.error('Error syncing schedule to InsForge:', err);
      });
    }
  },

  async syncToInsforge(schedule: Schedule): Promise<void> {
    if (!isInsforgeConfigured()) return;
    
    try {
      // Eliminar horarios existentes y crear nuevos
      await insforge.database.from('schedule').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Insertar cada día como una fila
      for (const day of schedule.days) {
        await insforge.database.from('schedule').insert({
          day: day.day,
          is_open: day.isOpen,
          slots: day.slots,
          default_reservation_duration: schedule.defaultReservationDuration,
        });
      }
    } catch (error) {
      console.error('Error syncing schedule:', error);
    }
  },

  async loadFromInsforge(): Promise<Schedule | null> {
    if (!isInsforgeConfigured()) return null;
    
    try {
      const { data, error } = await insforge.database
        .from('schedule')
        .select();
      
      if (error || !data || data.length === 0) return null;
      
      const schedule: Schedule = {
        days: data.map((row: any) => ({
          day: row.day,
          isOpen: row.is_open,
          slots: row.slots || [],
        })),
        defaultReservationDuration: data[0].default_reservation_duration || 90,
      };
      
      return schedule;
    } catch (error) {
      console.error('Error loading schedule from InsForge:', error);
      return null;
    }
  },

  updateDay(dayIndex: number, daySchedule: DaySchedule): void {
    const schedule = this.get();
    schedule.days[dayIndex] = daySchedule;
    this.save(schedule);
  },

  setDefaultReservationDuration(minutes: number): void {
    const schedule = this.get();
    schedule.defaultReservationDuration = minutes;
    this.save(schedule);
  },

  isOpenNow(): boolean {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const ourDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const schedule = this.get();
    const today = schedule.days[ourDayIndex];

    if (!today || !today.isOpen) return false;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return today.slots.some(slot => {
      const [openH, openM] = slot.open.split(':').map(Number);
      const [closeH, closeM] = slot.close.split(':').map(Number);
      let openMinutes = openH * 60 + openM;
      let closeMinutes = closeH * 60 + closeM;

      if (closeMinutes <= openMinutes) {
        closeMinutes += 24 * 60;
        if (currentMinutes < openMinutes) {
          return currentMinutes + 24 * 60 >= openMinutes && currentMinutes + 24 * 60 < closeMinutes;
        }
      }

      return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    });
  },

  getTodaySchedule(): DaySchedule | undefined {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const ourDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const schedule = this.get();
    return schedule.days[ourDayIndex];
  }
};

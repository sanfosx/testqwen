import { Schedule, DaySchedule } from '../types';

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

export const scheduleService = {
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
    // JS: 0=Sunday, 1=Monday... We need: 0=Monday, 1=Tuesday...
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

      // Handle midnight crossing
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

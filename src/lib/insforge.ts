import { createClient } from '@insforge/sdk';

// Configuración de InsForge
// Reemplaza estos valores con las credenciales de tu proyecto
const INSFORGE_BASE_URL = import.meta.env.VITE_INSFORGE_BASE_URL || 'https://your-project.us-east.insforge.app';
const INSFORGE_ANON_KEY = import.meta.env.VITE_INSFORGE_ANON_KEY || 'your-anon-key';

export const insforge = createClient({
  baseUrl: INSFORGE_BASE_URL,
  anonKey: INSFORGE_ANON_KEY,
});

// Verificar si InsForge está configurado
export const isInsforgeConfigured = (): boolean => {
  return INSFORGE_BASE_URL !== 'https://your-project.us-east.insforge.app' && 
         INSFORGE_ANON_KEY !== 'your-anon-key';
};

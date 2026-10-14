/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INSFORGE_BASE_URL: string;
  readonly VITE_INSFORGE_ANON_KEY: string;
  /** Email de la cuenta demo (solo se usa si InsForge no está configurado). */
  readonly VITE_DEMO_ADMIN_EMAIL?: string;
  /** Password de la cuenta demo (solo se usa si InsForge no está configurado). */
  readonly VITE_DEMO_ADMIN_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

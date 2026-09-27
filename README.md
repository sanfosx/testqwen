# Pizzería Los Genios - Aplicación Web Completa

Aplicación web completa para una pizzería con sitio público y panel de administración, integrada con InsForge como backend.

## 🚀 Características

### Sitio Público
- **Hero Section** con diseño moderno y animaciones
- **Menú dinámico** cargado desde la base de datos
- **Asistente IA "Slice"** para tomar pedidos (Gemini API)
- **Entrada de voz** y drag & drop de audio
- **Diseño responsive** con TailwindCSS

### Panel de Administración
- **Productos**: CRUD completo con categorías
- **Pedidos**: Gestión de estados con flujo estricto y temporizador
- **Clientes**: Base de datos de clientes
- **Horarios**: Configuración de horarios de atención
- **Reservas**: Sistema inteligente de reservas con cálculo de disponibilidad

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta en [InsForge](https://insforge.dev)
- (Opcional) API Key de Google Gemini para el asistente IA

## 🔧 Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar InsForge

Primero, instala y configura el CLI de InsForge:

```bash
# Login con tu API key
npx @insforge/cli login --user-api-key uak_ex5u0GrMTqcpCfyAevAjJxtkys2wfkPVT0KkVI2cDbo

# Link tu proyecto
npx @insforge/cli link --project-id e21dae59-c5ad-4a5e-803a-af59b25bfe2b
```

### 3. Crear las tablas en la base de datos

Ejecuta el siguiente SQL en tu base de datos InsForge (puedes usar el dashboard o el CLI):

```sql
-- Tabla de productos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT,
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de pedidos
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  customer_address TEXT,
  items JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('delivery', 'pickup')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de horarios
CREATE TABLE schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day VARCHAR(20) NOT NULL,
  is_open BOOLEAN NOT NULL DEFAULT true,
  slots JSONB NOT NULL DEFAULT '[]'::jsonb,
  default_reservation_duration INTEGER NOT NULL DEFAULT 90
);

-- Tabla de mesas
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  capacity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reservas
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  date DATE NOT NULL,
  time TIME NOT NULL,
  guests INTEGER NOT NULL,
  table_id UUID REFERENCES tables(id),
  table_name VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público
CREATE POLICY "Allow public read access on products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on products" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on products" ON products FOR DELETE USING (true);

CREATE POLICY "Allow public read access on customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on customers" ON customers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on customers" ON customers FOR DELETE USING (true);

CREATE POLICY "Allow public read access on orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on orders" ON orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on orders" ON orders FOR DELETE USING (true);

CREATE POLICY "Allow public read access on schedule" ON schedule FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on schedule" ON schedule FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on schedule" ON schedule FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on schedule" ON schedule FOR DELETE USING (true);

CREATE POLICY "Allow public read access on tables" ON tables FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on tables" ON tables FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on tables" ON tables FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on tables" ON tables FOR DELETE USING (true);

CREATE POLICY "Allow public read access on reservations" ON reservations FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on reservations" ON reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on reservations" ON reservations FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on reservations" ON reservations FOR DELETE USING (true);
```

### 4. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y completa con tus credenciales:

```bash
cp .env.example .env
```

Edita el archivo `.env`:

```env
VITE_INSFORGE_BASE_URL=https://tu-proyecto.us-east.insforge.app
VITE_INSFORGE_ANON_KEY=tu-anon-key
VITE_GEMINI_API_KEY=tu-gemini-api-key  # Opcional
```

Para obtener tus credenciales de InsForge:
```bash
npx @insforge/cli secrets get ANON_KEY
```

### 5. Iniciar la aplicación

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build
```

## 🎯 Modo de Funcionamiento

### Con InsForge (Backend Remoto)
Si configuras las variables de entorno de InsForge, la aplicación usará la base de datos PostgreSQL remota para todas las operaciones CRUD. Los datos se sincronizan en tiempo real.

### Sin InsForge (Fallback a localStorage)
Si no configuras InsForge, la aplicación funcionará automáticamente usando localStorage del navegador. Esto es útil para desarrollo local o demos.

## 📱 Estructura del Proyecto

```
src/
├── components/          # Componentes React reutilizables
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── HeroSection.tsx
│   ├── MenuSection.tsx
│   ├── ChatAssistantModal.tsx
│   ├── Modal.tsx
│   └── Pagination.tsx
├── pages/
│   └── AdminPanel.tsx   # Panel de administración completo
├── services/            # Servicios de datos
│   ├── productService.ts
│   ├── orderService.ts
│   ├── customerService.ts
│   ├── scheduleService.ts
│   ├── reservationService.ts
│   └── aiService.ts
├── lib/
│   ├── insforge.ts      # Cliente de InsForge
│   └── databaseInit.ts  # Script de inicialización
├── types/
│   └── index.ts         # Tipos TypeScript
├── App.tsx
├── main.tsx
└── index.css
```

## 🔑 Características Técnicas

- **TypeScript** para type safety
- **React 18** con hooks modernos
- **TailwindCSS 4** para estilos
- **InsForge SDK** para backend
- **Fallback automático** a localStorage
- **Operaciones async/await** en todos los servicios
- **Diseño responsive** mobile-first
- **Animaciones suaves** con CSS
- **Renderizado de Markdown** en el chat
- **Entrada de voz** con Web Audio API
- **Drag & drop** de archivos de audio

## 🤖 Asistente IA "Slice"

El asistente utiliza Google Gemini API para:
- Tomar pedidos de forma conversacional
- Transcribir audio a texto
- Responder preguntas sobre el menú
- Guiar al usuario en el proceso de pedido

Para habilitarlo, agrega tu API key de Gemini en `.env`:
```env
VITE_GEMINI_API_KEY=tu-api-key
```

Obtén tu API key en: https://makersuite.google.com/app/apikey

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🆘 Soporte

Si tienes problemas o preguntas:
- Documentación de InsForge: https://docs.insforge.dev
- Discord de InsForge: https://discord.gg/DvBtaEc9Jz
- Issues de GitHub: https://github.com/InsForge/InsForge/issues

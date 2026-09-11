import { insforge } from '../lib/insforge';

// SQL para crear todas las tablas necesarias
export const databaseSchema = `
-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
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
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT,
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS orders (
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
CREATE TABLE IF NOT EXISTS schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day VARCHAR(20) NOT NULL,
  is_open BOOLEAN NOT NULL DEFAULT true,
  slots JSONB NOT NULL DEFAULT '[]'::jsonb,
  default_reservation_duration INTEGER NOT NULL DEFAULT 90
);

-- Tabla de mesas
CREATE TABLE IF NOT EXISTS tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  capacity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reservas
CREATE TABLE IF NOT EXISTS reservations (
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

-- Habilitar RLS (Row Level Security) para acceso público
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público (lectura y escritura para todos)
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
`;

// Datos iniciales
export const seedData = {
  products: [
    { name: 'Margherita Clásica', description: 'Salsa de tomate San Marzano, mozzarella fresca, albahaca y aceite de oliva extra virgen.', price: 4500, category: 'Pizzas Clásicas' },
    { name: 'Pepperoni Suprema', description: 'Salsa de tomate, mozzarella, pepperoni artesanal y orégano.', price: 5200, category: 'Pizzas Clásicas' },
    { name: 'Cuatro Quesos', description: 'Mozzarella, gorgonzola, parmesano y provolone sobre base de crema.', price: 5800, category: 'Pizzas Clásicas' },
    { name: 'Napolitana', description: 'Salsa de tomate, mozzarella, tomates frescos, ajo y anchoas.', price: 5000, category: 'Pizzas Clásicas' },
    { name: 'Los Genios Especial', description: 'Nuestra pizza insignia: jamón serrano, rúcula, queso de cabra, tomates secos y reducción de balsámico.', price: 7200, category: 'Pizzas Premium' },
    { name: 'Trufa Negra', description: 'Crema de trufa negra, mozzarella di bufala, champiñones porcini y aceite trufado.', price: 8500, category: 'Pizzas Premium' },
    { name: 'BBQ Chicken', description: 'Salsa BBQ ahumada, pollo grillado, cebolla caramelizada, cilantro y mozzarella.', price: 6500, category: 'Pizzas Premium' },
    { name: 'Vegetariana Deluxe', description: 'Berenjenas grilladas, zucchini, pimientos asados, aceitunas kalamata y queso feta.', price: 5500, category: 'Pizzas Premium' },
    { name: 'Empanadas de Carne (x6)', description: 'Empanadas de carne cortada a cuchillo, especias secretas y masa casera.', price: 3800, category: 'Entradas' },
    { name: 'Bruschetta Italiana (x4)', description: 'Pan ciabatta tostado con tomates frescos, albahaca, ajo y aceite de oliva.', price: 3200, category: 'Entradas' },
    { name: 'Ensalada Caesar', description: 'Lechuga romana, crutones, parmesano, anchoas y aderezo caesar casero.', price: 3500, category: 'Entradas' },
    { name: 'Tiramisú', description: 'Clásico postre italiano con mascarpone, café espresso y cacao.', price: 3000, category: 'Postres' },
    { name: 'Panna Cotta', description: 'Panna cotta de vainilla con coulis de frutos rojos.', price: 2800, category: 'Postres' },
    { name: 'Coca-Cola 500ml', description: 'Gaseosa Coca-Cola.', price: 1500, category: 'Bebidas' },
    { name: 'Agua Mineral 500ml', description: 'Agua mineral sin gas.', price: 1000, category: 'Bebidas' },
    { name: 'Cerveza Artesanal IPA', description: 'Cerveza artesanal IPA de la casa, 500ml.', price: 2800, category: 'Bebidas' },
  ],
  customers: [
    { name: 'Juan Pérez', phone: '11-2345-6789', address: 'Av. Corrientes 1234', email: 'juan@email.com' },
    { name: 'María García', phone: '11-9876-5432', address: 'Calle Florida 567', email: 'maria@email.com' },
    { name: 'Carlos López', phone: '11-5555-1234', address: 'Av. Santa Fe 890', email: 'carlos@email.com' },
    { name: 'Ana Martínez', phone: '11-7777-8888', address: 'Calle Rivadavia 234' },
  ],
  tables: [
    { name: 'Mesa 1', capacity: 2 },
    { name: 'Mesa 2', capacity: 4 },
    { name: 'Mesa 3', capacity: 4 },
    { name: 'Mesa 4', capacity: 6 },
    { name: 'Mesa 5', capacity: 8 },
  ],
  schedule: [
    { day: 'Lunes', is_open: true, slots: [{ open: '12:00', close: '15:00' }, { open: '19:30', close: '23:30' }] },
    { day: 'Martes', is_open: true, slots: [{ open: '12:00', close: '15:00' }, { open: '19:30', close: '23:30' }] },
    { day: 'Miércoles', is_open: true, slots: [{ open: '12:00', close: '15:00' }, { open: '19:30', close: '23:30' }] },
    { day: 'Jueves', is_open: true, slots: [{ open: '12:00', close: '15:00' }, { open: '19:30', close: '23:30' }] },
    { day: 'Viernes', is_open: true, slots: [{ open: '12:00', close: '15:00' }, { open: '19:30', close: '23:30' }] },
    { day: 'Sábado', is_open: true, slots: [{ open: '12:00', close: '15:30' }, { open: '19:30', close: '01:00' }] },
    { day: 'Domingo', is_open: true, slots: [{ open: '12:00', close: '15:30' }, { open: '19:30', close: '01:00' }] },
  ],
};

// Función para inicializar la base de datos
export const initializeDatabase = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Ejecutar el SQL para crear las tablas
    const { error: schemaError } = await insforge.database.rpc('exec_sql', { sql: databaseSchema });
    
    if (schemaError) {
      console.error('Error creating schema:', schemaError);
      return { success: false, message: 'Error al crear el esquema de la base de datos' };
    }

    // Insertar datos iniciales
    const { error: productsError } = await insforge.database.from('products').insert(seedData.products);
    if (productsError) console.warn('Error inserting products:', productsError);

    const { error: customersError } = await insforge.database.from('customers').insert(seedData.customers);
    if (customersError) console.warn('Error inserting customers:', customersError);

    const { error: tablesError } = await insforge.database.from('tables').insert(seedData.tables);
    if (tablesError) console.warn('Error inserting tables:', tablesError);

    const { error: scheduleError } = await insforge.database.from('schedule').insert(seedData.schedule);
    if (scheduleError) console.warn('Error inserting schedule:', scheduleError);

    return { success: true, message: 'Base de datos inicializada correctamente' };
  } catch (error) {
    console.error('Database initialization error:', error);
    return { success: false, message: 'Error al inicializar la base de datos' };
  }
};

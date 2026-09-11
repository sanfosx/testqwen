import React, { useState, useEffect, useCallback } from 'react';
import { Package, ShoppingBag, Users, Clock, Calendar, Plus, Edit, Trash2, ChevronDown, ChevronUp, Menu, X, Settings } from 'lucide-react';
import { Product, Order, Customer, DaySchedule, Table, Reservation, AdminView } from '../types';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { customerService } from '../services/customerService';
import { scheduleService } from '../services/scheduleService';
import { reservationService } from '../services/reservationService';
import { Pagination } from '../components/Pagination';
import { Modal, ConfirmModal } from '../components/Modal';

const ITEMS_PER_PAGE = 8;

export const AdminPanel: React.FC = () => {
  const [activeView, setActiveView] = useState<AdminView>('products');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems: { id: AdminView; label: string; icon: React.ReactNode }[] = [
    { id: 'products', label: 'Productos', icon: <Package className="w-5 h-5" /> },
    { id: 'orders', label: 'Pedidos', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'customers', label: 'Clientes', icon: <Users className="w-5 h-5" /> },
    { id: 'schedule', label: 'Horarios', icon: <Clock className="w-5 h-5" /> },
    { id: 'reservations', label: 'Reservas', icon: <Calendar className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed bottom-4 right-4 z-40 w-14 h-14 bg-red-500 text-white rounded-full shadow-lg flex items-center justify-center"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-gray-900 border-r border-gray-800 z-30 transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">Panel Admin</h2>
            <nav className="space-y-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveView(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeView === item.id
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 min-h-[calc(100vh-4rem)]">
          {activeView === 'products' && <ProductsPanel />}
          {activeView === 'orders' && <OrdersPanel />}
          {activeView === 'customers' && <CustomersPanel />}
          {activeView === 'schedule' && <SchedulePanel />}
          {activeView === 'reservations' && <ReservationsPanel />}
        </main>
      </div>
    </div>
  );
};

// ============ PRODUCTS PANEL ============
const ProductsPanel: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '' });

  const loadProducts = useCallback(() => {
    setProducts(productService.getAll());
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const paginated = products.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  const openCreate = () => {
    setEditingProduct(null);
    setForm({ name: '', description: '', price: '', category: 'Pizzas Clásicas' });
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({ name: product.name, description: product.description, price: product.price.toString(), category: product.category });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.price || !form.category) return;
    if (editingProduct) {
      productService.update(editingProduct.id, { name: form.name, description: form.description, price: parseFloat(form.price), category: form.category });
    } else {
      productService.create({ name: form.name, description: form.description, price: parseFloat(form.price), category: form.category });
    }
    setModalOpen(false);
    loadProducts();
  };

  const handleDelete = (id: string) => {
    productService.delete(id);
    setDeleteConfirm(null);
    loadProducts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white font-poppins">Productos</h2>
          <p className="text-gray-400 text-sm">{products.length} productos en total</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
          <Plus className="w-4 h-4" /> Nuevo
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Nombre</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Categoría</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Precio</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Descripción</th>
              <th className="text-right text-xs font-semibold text-gray-400 uppercase px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {paginated.map(product => (
              <tr key={product.id} className="hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-3 text-white font-medium">{product.name}</td>
                <td className="px-4 py-3"><span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-full">{product.category}</span></td>
                <td className="px-4 py-3 text-yellow-400 font-semibold">${product.price.toLocaleString('es-AR')}</td>
                <td className="px-4 py-3 text-gray-400 text-sm max-w-[200px] truncate">{product.description}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(product)} className="text-blue-400 hover:text-blue-300 p-1.5 mr-1"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteConfirm(product.id)} className="text-red-400 hover:text-red-300 p-1.5"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {paginated.map(product => (
          <div key={product.id} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-white font-semibold">{product.name}</h4>
              <span className="text-yellow-400 font-bold">${product.price.toLocaleString('es-AR')}</span>
            </div>
            <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-full">{product.category}</span>
            <p className="text-gray-400 text-sm mt-2">{product.description}</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => openEdit(product)} className="flex-1 bg-blue-500/10 text-blue-400 py-2 rounded-lg text-sm font-medium">Editar</button>
              <button onClick={() => setDeleteConfirm(product.id)} className="flex-1 bg-red-500/10 text-red-400 py-2 rounded-lg text-sm font-medium">Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Nombre</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none" />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Categoría</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none">
              <option>Pizzas Clásicas</option>
              <option>Pizzas Premium</option>
              <option>Entradas</option>
              <option>Postres</option>
              <option>Bebidas</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Precio ($)</label>
            <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none" />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Descripción</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none resize-none" />
          </div>
          <button onClick={handleSave} className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg font-medium transition-colors">
            {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
          </button>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Eliminar Producto"
        message="¿Estás seguro de que querés eliminar este producto? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        danger
      />
    </div>
  );
};

// ============ ORDERS PANEL ============
const OrdersPanel: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [timers, setTimers] = useState<Record<string, string>>({});

  const loadOrders = useCallback(() => {
    setOrders(orderService.getAll());
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  // Real-time timer
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers: Record<string, string> = {};
      orders.forEach(order => {
        if (!['completed', 'cancelled'].includes(order.status)) {
          const diff = Date.now() - new Date(order.updatedAt).getTime();
          const mins = Math.floor(diff / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          newTimers[order.id] = `${mins}m ${secs}s`;
        }
      });
      setTimers(newTimers);
    }, 1000);
    return () => clearInterval(interval);
  }, [orders]);

  const paginated = orders.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    orderService.updateStatus(orderId, newStatus);
    loadOrders();
  };

  const handleDelete = (id: string) => {
    orderService.delete(id);
    loadOrders();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white font-poppins">Pedidos</h2>
          <p className="text-gray-400 text-sm">{orders.length} pedidos en total</p>
        </div>
      </div>

      <div className="space-y-3">
        {paginated.map(order => {
          const isFinal = ['completed', 'cancelled'].includes(order.status);
          const validTransitions = orderService.getValidTransitions(order.status);

          return (
            <div key={order.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-4 flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-white font-semibold">{order.customerName}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${orderService.getStatusColor(order.status)}`}>
                      {orderService.getStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                    <span>{order.type === 'delivery' ? '🚗 Delivery' : '🏪 Retiro'}</span>
                    <span>•</span>
                    <span>${order.total.toLocaleString('es-AR')}</span>
                    <span>•</span>
                    <span>{new Date(order.createdAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    {!isFinal && timers[order.id] && (
                      <>
                        <span>•</span>
                        <span className="text-yellow-400">⏱ {timers[order.id]}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isFinal && validTransitions.length > 0 && (
                    <select
                      value=""
                      onChange={(e) => e.target.value && handleStatusChange(order.id, e.target.value as Order['status'])}
                      className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:border-red-500 focus:outline-none"
                    >
                      <option value="">Cambiar estado...</option>
                      {validTransitions.map(s => (
                        <option key={s} value={s}>{orderService.getStatusLabel(s)}</option>
                      ))}
                    </select>
                  )}
                  {order.completedAt && (
                    <span className="text-xs text-gray-500">
                      Finalizado: {new Date(order.completedAt).toLocaleString('es-AR', { timeStyle: 'short' })}
                    </span>
                  )}
                  <button
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    className="p-1.5 text-gray-400 hover:text-white"
                  >
                    {expandedOrder === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDelete(order.id)} className="p-1.5 text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {expandedOrder === order.id && (
                <div className="border-t border-gray-800 p-4 bg-gray-800/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-semibold text-gray-300 mb-2">Items del pedido</h5>
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-300">{item.quantity}x {item.productName}</span>
                            <span className="text-gray-400">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-gray-300 mb-2">Datos del cliente</h5>
                      <div className="space-y-1 text-sm text-gray-400">
                        <p>📞 {order.customerPhone || 'No proporcionado'}</p>
                        {order.customerAddress && <p>📍 {order.customerAddress}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

// ============ CUSTOMERS PANEL ============
const CustomersPanel: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '', email: '' });

  const loadCustomers = useCallback(() => {
    setCustomers(customerService.getAll());
  }, []);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  const paginated = customers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(customers.length / ITEMS_PER_PAGE);

  const openCreate = () => {
    setEditingCustomer(null);
    setForm({ name: '', phone: '', address: '', email: '' });
    setModalOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setForm({ name: customer.name, phone: customer.phone, address: customer.address, email: customer.email || '' });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.phone) return;
    if (editingCustomer) {
      customerService.update(editingCustomer.id, form);
    } else {
      customerService.create(form);
    }
    setModalOpen(false);
    loadCustomers();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white font-poppins">Clientes</h2>
          <p className="text-gray-400 text-sm">{customers.length} clientes registrados</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
          <Plus className="w-4 h-4" /> Nuevo
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Nombre</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Teléfono</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Dirección</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Email</th>
              <th className="text-right text-xs font-semibold text-gray-400 uppercase px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {paginated.map(customer => (
              <tr key={customer.id} className="hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-3 text-white font-medium">{customer.name}</td>
                <td className="px-4 py-3 text-gray-300">{customer.phone}</td>
                <td className="px-4 py-3 text-gray-400 text-sm">{customer.address || '-'}</td>
                <td className="px-4 py-3 text-gray-400 text-sm">{customer.email || '-'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(customer)} className="text-blue-400 hover:text-blue-300 p-1.5 mr-1"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteConfirm(customer.id)} className="text-red-400 hover:text-red-300 p-1.5"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {paginated.map(customer => (
          <div key={customer.id} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h4 className="text-white font-semibold mb-1">{customer.name}</h4>
            <p className="text-gray-400 text-sm">📞 {customer.phone}</p>
            {customer.address && <p className="text-gray-400 text-sm">📍 {customer.address}</p>}
            {customer.email && <p className="text-gray-400 text-sm">✉️ {customer.email}</p>}
            <div className="flex gap-2 mt-3">
              <button onClick={() => openEdit(customer)} className="flex-1 bg-blue-500/10 text-blue-400 py-2 rounded-lg text-sm font-medium">Editar</button>
              <button onClick={() => setDeleteConfirm(customer.id)} className="flex-1 bg-red-500/10 text-red-400 py-2 rounded-lg text-sm font-medium">Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Nombre *</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none" />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Teléfono *</label>
            <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none" />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Dirección</label>
            <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none" />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none" />
          </div>
          <button onClick={handleSave} className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg font-medium transition-colors">
            {editingCustomer ? 'Guardar Cambios' : 'Crear Cliente'}
          </button>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && customerService.delete(deleteConfirm) && loadCustomers()}
        title="Eliminar Cliente"
        message="¿Estás seguro de que querés eliminar este cliente?"
        confirmText="Eliminar"
        danger
      />
    </div>
  );
};

// ============ SCHEDULE PANEL ============
const SchedulePanel: React.FC = () => {
  const [schedule, setSchedule] = useState(scheduleService.get());
  const [saving, setSaving] = useState(false);

  const handleDayToggle = (dayIndex: number) => {
    const updated = { ...schedule };
    updated.days[dayIndex] = { ...updated.days[dayIndex], isOpen: !updated.days[dayIndex].isOpen };
    setSchedule(updated);
  };

  const handleSlotChange = (dayIndex: number, slotIndex: number, field: 'open' | 'close', value: string) => {
    const updated = { ...schedule };
    const slots = [...updated.days[dayIndex].slots];
    slots[slotIndex] = { ...slots[slotIndex], [field]: value };
    updated.days[dayIndex] = { ...updated.days[dayIndex], slots };
    setSchedule(updated);
  };

  const addSlot = (dayIndex: number) => {
    const updated = { ...schedule };
    const slots = [...updated.days[dayIndex].slots];
    if (slots.length < 2) {
      slots.push({ open: '19:00', close: '23:00' });
      updated.days[dayIndex] = { ...updated.days[dayIndex], slots };
      setSchedule(updated);
    }
  };

  const removeSlot = (dayIndex: number, slotIndex: number) => {
    const updated = { ...schedule };
    const slots = updated.days[dayIndex].slots.filter((_, i) => i !== slotIndex);
    updated.days[dayIndex] = { ...updated.days[dayIndex], slots };
    setSchedule(updated);
  };

  const handleSave = () => {
    scheduleService.save(schedule);
    setSaving(true);
    setTimeout(() => setSaving(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white font-poppins">Horarios</h2>
          <p className="text-gray-400 text-sm">Configurá los horarios de atención</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
          {saving ? '✓ Guardado' : 'Guardar'}
        </button>
      </div>

      <div className="space-y-4">
        {schedule.days.map((day, dayIndex) => (
          <div key={day.day} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDayToggle(dayIndex)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${day.isOpen ? 'bg-green-500' : 'bg-gray-700'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${day.isOpen ? 'left-[18px]' : 'left-0.5'}`} />
                </button>
                <h4 className="text-white font-semibold">{day.day}</h4>
                {!day.isOpen && <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">Cerrado</span>}
              </div>
            </div>

            {day.isOpen && (
              <div className="space-y-2 ml-13">
                {day.slots.map((slot, slotIndex) => (
                  <div key={slotIndex} className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm w-12">Turno {slotIndex + 1}:</span>
                    <input
                      type="time"
                      value={slot.open}
                      onChange={e => handleSlotChange(dayIndex, slotIndex, 'open', e.target.value)}
                      className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:border-red-500 focus:outline-none"
                    />
                    <span className="text-gray-500">a</span>
                    <input
                      type="time"
                      value={slot.close}
                      onChange={e => handleSlotChange(dayIndex, slotIndex, 'close', e.target.value)}
                      className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:border-red-500 focus:outline-none"
                    />
                    {day.slots.length > 1 && (
                      <button onClick={() => removeSlot(dayIndex, slotIndex)} className="text-red-400 hover:text-red-300 p-1">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {day.slots.length < 2 && (
                  <button onClick={() => addSlot(dayIndex)} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1">
                    <Plus className="w-3 h-3" /> Agregar turno
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 bg-gray-900 rounded-xl border border-gray-800 p-4">
        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-400" /> Duración de Reservas
        </h4>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={schedule.defaultReservationDuration}
            onChange={e => setSchedule({ ...schedule, defaultReservationDuration: parseInt(e.target.value) || 60 })}
            className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none"
          />
          <span className="text-gray-400 text-sm">minutos por defecto</span>
        </div>
      </div>
    </div>
  );
};

// ============ RESERVATIONS PANEL ============
const ReservationsPanel: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    guests: 2,
    tableId: '',
  });
  const [availableSlots, setAvailableSlots] = useState<{ time: string; availableTables: Table[] }[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [newTableForm, setNewTableForm] = useState({ name: '', capacity: 4 });

  const loadData = useCallback(() => {
    setReservations(reservationService.getReservations());
    setTables(reservationService.getTables());
    setCustomers(customerService.getAll());
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const paginated = reservations.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(reservations.length / ITEMS_PER_PAGE);
  const schedule = scheduleService.get();

  const openCreate = () => {
    setForm({
      customerId: '',
      customerName: '',
      customerPhone: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      guests: 2,
      tableId: '',
    });
    setAvailableSlots([]);
    setModalOpen(true);
  };

  const calculateSlots = () => {
    if (!form.date || form.guests < 1) return;
    const todaySchedule = scheduleService.getTodaySchedule();
    if (!todaySchedule || !todaySchedule.isOpen || todaySchedule.slots.length === 0) return;

    const firstSlot = todaySchedule.slots[0];
    const allSlots: { time: string; availableTables: Table[] }[] = [];

    todaySchedule.slots.forEach(slot => {
      const slots = reservationService.getAvailableSlots(form.date, form.guests, schedule.defaultReservationDuration, slot.open, slot.close);
      allSlots.push(...slots);
    });

    setAvailableSlots(allSlots);
  };

  useEffect(() => {
    if (form.date && form.guests > 0 && modalOpen) {
      calculateSlots();
    }
  }, [form.date, form.guests, modalOpen]);

  const selectCustomer = (customer: Customer) => {
    setForm({
      ...form,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
    });
  };

  const handleSave = () => {
    if (!form.customerName || !form.time || !form.tableId || !form.date) return;
    const table = tables.find(t => t.id === form.tableId);
    reservationService.createReservation({
      customerId: form.customerId || '',
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      date: form.date,
      time: form.time,
      guests: form.guests,
      tableId: form.tableId,
      tableName: table?.name || '',
      status: 'confirmed',
    });
    setModalOpen(false);
    loadData();
  };

  const handleAddTable = () => {
    if (!newTableForm.name) return;
    reservationService.createTable(newTableForm);
    setNewTableForm({ name: '', capacity: 4 });
    setTableModalOpen(false);
    loadData();
  };

  const handleDeleteTable = (id: string) => {
    reservationService.deleteTable(id);
    loadData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white font-poppins">Reservas</h2>
          <p className="text-gray-400 text-sm">{reservations.length} reservas • {tables.length} mesas</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTableModalOpen(true)} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2.5 rounded-lg font-medium transition-colors border border-gray-700">
            <Settings className="w-4 h-4" /> Mesas
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" /> Nueva
          </button>
        </div>
      </div>

      {/* Reservations list */}
      <div className="space-y-3">
        {paginated.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay reservas todavía</p>
          </div>
        )}
        {paginated.map(res => (
          <div key={res.id} className="bg-gray-900 rounded-xl border border-gray-800 p-4 flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="text-white font-semibold">{res.customerName}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  res.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  res.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {res.status === 'confirmed' ? 'Confirmada' : res.status === 'cancelled' ? 'Cancelada' : 'Completada'}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                <span>📅 {new Date(res.date + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                <span>🕐 {res.time}</span>
                <span>👥 {res.guests} personas</span>
                <span>🪑 {res.tableName}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {res.status === 'confirmed' && (
                <button
                  onClick={() => { reservationService.updateReservation(res.id, { status: 'cancelled' }); loadData(); }}
                  className="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/20"
                >
                  Cancelar
                </button>
              )}
              <button onClick={() => setDeleteConfirm(res.id)} className="text-red-400 hover:text-red-300 p-1.5">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Create Reservation Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Reserva" size="lg">
        <div className="space-y-4">
          {/* Customer selection */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Cliente existente</label>
            <select
              value={form.customerId}
              onChange={e => {
                const c = customers.find(c => c.id === e.target.value);
                if (c) selectCustomer(c);
                else setForm({ ...form, customerId: '' });
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none"
            >
              <option value="">-- Seleccionar o crear nuevo --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Nombre *</label>
              <input value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Teléfono *</label>
              <input value={form.customerPhone} onChange={e => setForm({...form, customerPhone: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Fecha *</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Comensales *</label>
              <input type="number" min="1" max="20" value={form.guests} onChange={e => setForm({...form, guests: parseInt(e.target.value) || 1})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none" />
            </div>
          </div>

          {/* Available slots matrix */}
          {availableSlots.length > 0 && (
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Turnos disponibles</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-40 overflow-y-auto">
                {availableSlots.map(slot => (
                  <button
                    key={slot.time}
                    onClick={() => {
                      setForm({ ...form, time: slot.time, tableId: slot.availableTables[0]?.id || '' });
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      form.time === slot.time
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                    }`}
                  >
                    {slot.time}
                    <span className="block text-xs opacity-70">{slot.availableTables.length} mesa{slot.availableTables.length > 1 ? 's' : ''}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {availableSlots.length === 0 && form.date && (
            <p className="text-yellow-400 text-sm">No hay turnos disponibles para la fecha y cantidad de comensales seleccionados.</p>
          )}

          {/* Table selection */}
          {form.time && (
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Mesa</label>
              <select
                value={form.tableId}
                onChange={e => setForm({...form, tableId: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none"
              >
                <option value="">Seleccionar mesa</option>
                {availableSlots.find(s => s.time === form.time)?.availableTables.map(t => (
                  <option key={t.id} value={t.id}>{t.name} (cap. {t.capacity})</option>
                ))}
              </select>
            </div>
          )}

          <button onClick={handleSave} className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg font-medium transition-colors">
            Confirmar Reserva
          </button>
        </div>
      </Modal>

      {/* Tables Management Modal */}
      <Modal isOpen={tableModalOpen} onClose={() => setTableModalOpen(false)} title="Gestión de Mesas">
        <div className="space-y-4">
          <div className="space-y-2">
            {tables.map(table => (
              <div key={table.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                <div>
                  <span className="text-white font-medium">{table.name}</span>
                  <span className="text-gray-400 text-sm ml-2">({table.capacity} personas)</span>
                </div>
                <button onClick={() => handleDeleteTable(table.id)} className="text-red-400 hover:text-red-300 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Agregar mesa</h4>
            <div className="flex gap-2">
              <input
                placeholder="Nombre"
                value={newTableForm.name}
                onChange={e => setNewTableForm({...newTableForm, name: e.target.value})}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-red-500 focus:outline-none"
              />
              <input
                type="number"
                placeholder="Cap."
                value={newTableForm.capacity}
                onChange={e => setNewTableForm({...newTableForm, capacity: parseInt(e.target.value) || 2})}
                className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-red-500 focus:outline-none"
              />
              <button onClick={handleAddTable} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => { if (deleteConfirm) { reservationService.deleteReservation(deleteConfirm); loadData(); } }}
        title="Eliminar Reserva"
        message="¿Estás seguro de que querés eliminar esta reserva?"
        confirmText="Eliminar"
        danger
      />
    </div>
  );
};

import { Injectable, signal, computed } from '@angular/core';
import {
  Category,
  Supplier,
  Customer,
  Product,
  Sale,
  Purchase,
  MovementLog
} from '../models/models';

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function nowIso(): string {
  return new Date().toISOString();
}

const STORAGE_KEYS = {
  categories: 'tr_categories',
  suppliers: 'tr_suppliers',
  customers: 'tr_customers',
  products: 'tr_products',
  sales: 'tr_sales',
  purchases: 'tr_purchases',
  movements: 'tr_movements',
  seeded: 'tr_seeded_v1'
};

@Injectable({ providedIn: 'root' })
export class DataService {
  categories = signal<Category[]>(this.load(STORAGE_KEYS.categories, []));
  suppliers = signal<Supplier[]>(this.load(STORAGE_KEYS.suppliers, []));
  customers = signal<Customer[]>(this.load(STORAGE_KEYS.customers, []));
  products = signal<Product[]>(this.load(STORAGE_KEYS.products, []));
  sales = signal<Sale[]>(this.load(STORAGE_KEYS.sales, []));
  purchases = signal<Purchase[]>(this.load(STORAGE_KEYS.purchases, []));
  movements = signal<MovementLog[]>(this.load(STORAGE_KEYS.movements, []));

  lowStockProducts = computed(() =>
    this.products().filter((p) => p.stock <= p.minStock)
  );

  totalInventoryValue = computed(() =>
    this.products().reduce((acc, p) => acc + p.costPrice * p.stock, 0)
  );

  constructor() {
    if (!localStorage.getItem(STORAGE_KEYS.seeded)) {
      this.seed();
      localStorage.setItem(STORAGE_KEYS.seeded, '1');
    }
  }

  private load<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private persist(key: string, value: unknown) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // ---------- CATEGORIES ----------
  addCategory(data: Omit<Category, 'id'>) {
    const cat: Category = { ...data, id: uid() };
    this.categories.update((list) => [...list, cat]);
    this.persist(STORAGE_KEYS.categories, this.categories());
    return cat;
  }
  updateCategory(id: string, data: Partial<Category>) {
    this.categories.update((list) =>
      list.map((c) => (c.id === id ? { ...c, ...data } : c))
    );
    this.persist(STORAGE_KEYS.categories, this.categories());
  }
  deleteCategory(id: string) {
    this.categories.update((list) => list.filter((c) => c.id !== id));
    this.persist(STORAGE_KEYS.categories, this.categories());
  }

  // ---------- SUPPLIERS ----------
  addSupplier(data: Omit<Supplier, 'id'>) {
    const sup: Supplier = { ...data, id: uid() };
    this.suppliers.update((list) => [...list, sup]);
    this.persist(STORAGE_KEYS.suppliers, this.suppliers());
    return sup;
  }
  updateSupplier(id: string, data: Partial<Supplier>) {
    this.suppliers.update((list) =>
      list.map((s) => (s.id === id ? { ...s, ...data } : s))
    );
    this.persist(STORAGE_KEYS.suppliers, this.suppliers());
  }
  deleteSupplier(id: string) {
    this.suppliers.update((list) => list.filter((s) => s.id !== id));
    this.persist(STORAGE_KEYS.suppliers, this.suppliers());
  }

  // ---------- CUSTOMERS ----------
  addCustomer(data: Omit<Customer, 'id' | 'createdAt'>) {
    const cust: Customer = { ...data, id: uid(), createdAt: nowIso() };
    this.customers.update((list) => [...list, cust]);
    this.persist(STORAGE_KEYS.customers, this.customers());
    return cust;
  }
  updateCustomer(id: string, data: Partial<Customer>) {
    this.customers.update((list) =>
      list.map((c) => (c.id === id ? { ...c, ...data } : c))
    );
    this.persist(STORAGE_KEYS.customers, this.customers());
  }
  deleteCustomer(id: string) {
    this.customers.update((list) => list.filter((c) => c.id !== id));
    this.persist(STORAGE_KEYS.customers, this.customers());
  }

  // ---------- PRODUCTS ----------
  addProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
    const prod: Product = {
      ...data,
      id: uid(),
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    this.products.update((list) => [...list, prod]);
    this.persist(STORAGE_KEYS.products, this.products());
    this.logMovement(prod.id, prod.name, 'Entrada', prod.stock, 'Alta inicial de producto');
    return prod;
  }
  updateProduct(id: string, data: Partial<Product>) {
    this.products.update((list) =>
      list.map((p) => (p.id === id ? { ...p, ...data, updatedAt: nowIso() } : p))
    );
    this.persist(STORAGE_KEYS.products, this.products());
  }
  deleteProduct(id: string) {
    this.products.update((list) => list.filter((p) => p.id !== id));
    this.persist(STORAGE_KEYS.products, this.products());
  }
  adjustStock(id: string, delta: number, reason: string) {
    const product = this.products().find((p) => p.id === id);
    if (!product) return;
    const newStock = Math.max(0, product.stock + delta);
    this.updateProduct(id, { stock: newStock });
    this.logMovement(
      id,
      product.name,
      delta >= 0 ? 'Entrada' : 'Salida',
      Math.abs(delta),
      reason
    );
  }

  // ---------- MOVEMENTS ----------
  private logMovement(
    productId: string,
    productName: string,
    type: 'Entrada' | 'Salida' | 'Ajuste',
    quantity: number,
    reason: string
  ) {
    const log: MovementLog = {
      id: uid(),
      productId,
      productName,
      type,
      quantity,
      reason,
      createdAt: nowIso()
    };
    this.movements.update((list) => [log, ...list].slice(0, 500));
    this.persist(STORAGE_KEYS.movements, this.movements());
  }

  // ---------- SALES ----------
  registerSale(data: Omit<Sale, 'id' | 'folio' | 'createdAt'>) {
    const folio = 'V-' + (this.sales().length + 1).toString().padStart(5, '0');
    const sale: Sale = { ...data, id: uid(), folio, createdAt: nowIso() };
    this.sales.update((list) => [sale, ...list]);
    this.persist(STORAGE_KEYS.sales, this.sales());
    if (sale.status === 'Completada') {
      for (const item of sale.items) {
        this.adjustStock(item.productId, -item.quantity, `Venta ${folio}`);
      }
    }
    return sale;
  }
  cancelSale(id: string) {
    const sale = this.sales().find((s) => s.id === id);
    if (!sale || sale.status === 'Cancelada') return;
    for (const item of sale.items) {
      this.adjustStock(item.productId, item.quantity, `Cancelación venta ${sale.folio}`);
    }
    this.sales.update((list) =>
      list.map((s) => (s.id === id ? { ...s, status: 'Cancelada' } : s))
    );
    this.persist(STORAGE_KEYS.sales, this.sales());
  }

  // ---------- PURCHASES ----------
  registerPurchase(data: Omit<Purchase, 'id' | 'folio' | 'createdAt'>) {
    const folio = 'C-' + (this.purchases().length + 1).toString().padStart(5, '0');
    const purchase: Purchase = { ...data, id: uid(), folio, createdAt: nowIso() };
    this.purchases.update((list) => [purchase, ...list]);
    this.persist(STORAGE_KEYS.purchases, this.purchases());
    if (purchase.status === 'Recibida') {
      for (const item of purchase.items) {
        this.adjustStock(item.productId, item.quantity, `Compra ${folio}`);
      }
    }
    return purchase;
  }

  // ---------- HELPERS ----------
  getCategoryName(id: string): string {
    return this.categories().find((c) => c.id === id)?.name ?? 'Sin categoría';
  }
  getSupplierName(id?: string): string {
    if (!id) return '—';
    return this.suppliers().find((s) => s.id === id)?.name ?? '—';
  }

  // ---------- SEED DATA ----------
  private seed() {
    const catElectro = this.addCategory({ name: 'Electrónica', description: 'Dispositivos y accesorios', color: '#289e93' });
    const catHogar = this.addCategory({ name: 'Hogar', description: 'Artículos para el hogar', color: '#43bcae' });
    const catOficina = this.addCategory({ name: 'Oficina', description: 'Papelería y oficina', color: '#1c7f78' });

    const sup1 = this.addSupplier({ name: 'Distribuidora Caribe SRL', contact: 'Juan Pérez', phone: '809-555-0101', email: 'ventas@caribe.com' });
    const sup2 = this.addSupplier({ name: 'Importadora del Este', contact: 'María Gómez', phone: '829-555-0202', email: 'contacto@este.com' });

    this.addCustomer({ name: 'Cliente Mostrador', phone: '000-000-0000', email: '' });
    this.addCustomer({ name: 'Carlos Reyes', phone: '809-555-1212', email: 'carlos@correo.com' });

    this.addProduct({
      name: 'Audífonos Bluetooth', sku: 'ELE-001', description: 'Audífonos inalámbricos con estuche de carga',
      categoryId: catElectro.id, supplierId: sup1.id, costPrice: 450, salePrice: 899, stock: 25, minStock: 5, unit: 'unidad'
    });
    this.addProduct({
      name: 'Cargador USB-C 20W', sku: 'ELE-002', description: 'Cargador rápido de pared',
      categoryId: catElectro.id, supplierId: sup1.id, costPrice: 180, salePrice: 350, stock: 40, minStock: 10, unit: 'unidad'
    });
    this.addProduct({
      name: 'Set de Ollas Antiadherentes', sku: 'HOG-001', description: 'Juego de 5 piezas',
      categoryId: catHogar.id, supplierId: sup2.id, costPrice: 1200, salePrice: 2100, stock: 8, minStock: 3, unit: 'set'
    });
    this.addProduct({
      name: 'Resma de Papel Carta', sku: 'OFI-001', description: '500 hojas, 75g',
      categoryId: catOficina.id, supplierId: sup2.id, costPrice: 180, salePrice: 280, stock: 4, minStock: 10, unit: 'resma'
    });
  }
}

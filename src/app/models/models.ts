export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  categoryId: string;
  supplierId?: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  unit: string;
  photo?: string; // base64
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  folio: string;
  customerId?: string;
  customerName?: string;
  items: SaleItem[];
  total: number;
  paymentMethod: 'Efectivo' | 'Tarjeta' | 'Transferencia';
  status: 'Completada' | 'Cancelada';
  createdAt: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  folio: string;
  supplierId?: string;
  supplierName?: string;
  items: PurchaseItem[];
  total: number;
  status: 'Recibida' | 'Pendiente';
  createdAt: string;
}

export interface AppUser {
  username: string;
  name: string;
  role: 'Administrador' | 'Vendedor';
}

export interface MovementLog {
  id: string;
  productId: string;
  productName: string;
  type: 'Entrada' | 'Salida' | 'Ajuste';
  quantity: number;
  reason: string;
  createdAt: string;
}

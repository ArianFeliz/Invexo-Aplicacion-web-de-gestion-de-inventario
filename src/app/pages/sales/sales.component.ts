import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { Product, Sale, SaleItem } from '../../models/models';
import { LogoComponent } from '../../shared/logo.component';

interface CartLine extends SaleItem {
  maxStock: number;
}

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [FormsModule, DecimalPipe, DatePipe, LogoComponent],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Catálogo -->
      <div class="lg:col-span-2 space-y-4">
        <div class="card p-4 flex flex-col sm:flex-row gap-3">
          <input class="input-base" [(ngModel)]="search" placeholder="Buscar producto por nombre o SKU..." />
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          @for (p of availableProducts(); track p.id) {
            <button
              class="card p-3 text-left hover:border-teal-400 hover:shadow transition disabled:opacity-40"
              [disabled]="p.stock === 0"
              (click)="addToCart(p)"
            >
              <div class="h-20 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden mb-2">
                @if (p.photo) {
                  <img [src]="p.photo" class="w-full h-full object-cover" [alt]="p.name" />
                } @else {
                  <span class="text-2xl">📦</span>
                }
              </div>
              <p class="text-sm font-semibold text-slate-800 leading-tight line-clamp-2">{{ p.name }}</p>
              <div class="flex items-center justify-between mt-1">
                <span class="text-teal-700 font-bold text-sm">RD$ {{ p.salePrice | number: '1.0-2' }}</span>
                <span class="text-xs text-slate-400">Stock: {{ p.stock }}</span>
              </div>
            </button>
          } @empty {
            <p class="text-slate-400 col-span-full text-center py-12">No hay productos disponibles.</p>
          }
        </div>

        <!-- Historial -->
        <div class="card overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100">
            <h2 class="font-bold text-slate-800">Historial de ventas</h2>
          </div>
          <div class="overflow-x-auto max-h-80 overflow-y-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-500 text-left sticky top-0">
                <tr>
                  <th class="px-5 py-2 font-semibold">Folio</th>
                  <th class="px-5 py-2 font-semibold">Fecha</th>
                  <th class="px-5 py-2 font-semibold">Cliente</th>
                  <th class="px-5 py-2 font-semibold">Total</th>
                  <th class="px-5 py-2 font-semibold">Estado</th>
                  <th class="px-5 py-2 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (sale of data.sales(); track sale.id) {
                  <tr class="border-t border-slate-100">
                    <td class="px-5 py-2.5 font-medium text-slate-700">{{ sale.folio }}</td>
                    <td class="px-5 py-2.5 text-slate-500">{{ sale.createdAt | date: 'dd/MM/yy HH:mm' }}</td>
                    <td class="px-5 py-2.5 text-slate-600">{{ sale.customerName || 'Mostrador' }}</td>
                    <td class="px-5 py-2.5 font-semibold text-slate-700">RD$ {{ sale.total | number: '1.0-2' }}</td>
                    <td class="px-5 py-2.5">
                      <span class="badge" [class.bg-teal-50]="sale.status === 'Completada'" [class.text-teal-700]="sale.status === 'Completada'"
                        [class.bg-red-50]="sale.status === 'Cancelada'" [class.text-red-600]="sale.status === 'Cancelada'">
                        {{ sale.status }}
                      </span>
                    </td>
                    <td class="px-5 py-2.5 text-right space-x-1 whitespace-nowrap">
                      <button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="Ver / imprimir factura" (click)="openInvoice(sale)">
                        <svg class="w-4 h-4 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/>
                        </svg>
                      </button>
                      @if (sale.status === 'Completada') {
                        <button class="btn-danger !py-1 !px-2 text-xs" (click)="cancel(sale.id)">Cancelar</button>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="6" class="px-5 py-10 text-center text-slate-400">Aún no hay ventas.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Carrito -->
      <div class="card p-5 h-fit sticky top-20">
        <h2 class="font-bold text-slate-800 mb-3">🧾 Venta actual</h2>

        <div>
          <label class="label-base">Cliente</label>
          <select class="input-base" [(ngModel)]="selectedCustomerId">
            <option value="">Cliente de mostrador</option>
            @for (c of data.customers(); track c.id) {
              <option [value]="c.id">{{ c.name }}</option>
            }
          </select>
        </div>

        <div class="mt-4 divide-y divide-slate-100 max-h-72 overflow-y-auto">
          @for (line of cart(); track line.productId) {
            <div class="py-2.5 flex items-center gap-2">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-slate-700 truncate">{{ line.productName }}</p>
                <p class="text-xs text-slate-400">RD$ {{ line.unitPrice | number: '1.0-2' }} c/u</p>
              </div>
              <input
                type="number"
                class="w-16 rounded-lg border border-slate-300 px-2 py-1 text-sm text-center"
                [min]="1"
                [max]="line.maxStock"
                [(ngModel)]="line.quantity"
                (ngModelChange)="recalc(line)"
              />
              <p class="text-sm font-bold text-slate-700 w-20 text-right">RD$ {{ line.subtotal | number: '1.0-2' }}</p>
              <button class="text-red-400 hover:text-red-600" (click)="removeLine(line)">✕</button>
            </div>
          } @empty {
            <p class="text-sm text-slate-400 text-center py-8">Agrega productos del catálogo</p>
          }
        </div>

        <div class="mt-4">
          <label class="label-base">Método de pago</label>
          <select class="input-base" [(ngModel)]="paymentMethod">
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Transferencia">Transferencia</option>
          </select>
        </div>

        <div class="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
          <span class="font-bold text-slate-700">Total</span>
          <span class="text-2xl font-extrabold text-teal-700">RD$ {{ total() | number: '1.0-2' }}</span>
        </div>

        <button class="btn-primary w-full mt-4" [disabled]="cart().length === 0" (click)="checkout()">
          Registrar venta
        </button>
      </div>
    </div>

    <!-- Modal de factura -->
    @if (invoiceSale(); as sale) {
      <div class="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4 overflow-y-auto" (click)="closeInvoice()">
        <div class="card w-full max-w-lg p-0 my-8 overflow-hidden" (click)="$event.stopPropagation()">
          <!-- Contenido imprimible -->
          <div class="print-invoice p-6 flex flex-col print:min-h-screen">
           <div>
            <div class="flex items-center justify-between border-b border-slate-200 pb-4">
              <div class="flex items-center gap-3">
                <app-logo [size]="40" class="rounded-xl overflow-hidden shrink-0"></app-logo>
                <div>
                  <p class="font-extrabold text-slate-800 leading-tight">Invexo</p>
                  <p class="text-xs text-slate-400">Factura de venta</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-bold text-slate-700">{{ sale.folio }}</p>
                <p class="text-xs text-slate-400">{{ sale.createdAt | date: 'dd/MM/yyyy HH:mm' }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 py-4 text-sm border-b border-slate-200">
              <div>
                <p class="text-xs text-slate-400 font-semibold uppercase tracking-wide">Cliente</p>
                <p class="text-slate-700 font-medium">{{ sale.customerName || 'Cliente de mostrador' }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 font-semibold uppercase tracking-wide">Método de pago</p>
                <p class="text-slate-700 font-medium">{{ sale.paymentMethod }}</p>
              </div>
            </div>

            <table class="w-full text-sm mt-4">
              <thead>
                <tr class="text-left text-xs text-slate-400 uppercase tracking-wide">
                  <th class="pb-2">Producto</th>
                  <th class="pb-2 text-center">Cant.</th>
                  <th class="pb-2 text-right">P. unitario</th>
                  <th class="pb-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                @for (item of sale.items; track item.productId) {
                  <tr class="border-t border-slate-100">
                    <td class="py-2 text-slate-700">{{ item.productName }}</td>
                    <td class="py-2 text-center text-slate-600">{{ item.quantity }}</td>
                    <td class="py-2 text-right text-slate-600">RD$ {{ item.unitPrice | number: '1.0-2' }}</td>
                    <td class="py-2 text-right font-medium text-slate-700">RD$ {{ item.subtotal | number: '1.0-2' }}</td>
                  </tr>
                }
              </tbody>
            </table>

            <div class="flex justify-end mt-4 pt-4 border-t-2 border-slate-800">
              <div class="text-right">
                <p class="text-xs text-slate-400 font-semibold uppercase tracking-wide">Total a pagar</p>
                <p class="text-2xl font-extrabold text-teal-700">RD$ {{ sale.total | number: '1.0-2' }}</p>
              </div>
            </div>

            @if (sale.status === 'Cancelada') {
              <p class="text-center text-red-600 font-bold mt-4 border-2 border-red-400 rounded-lg py-1">VENTA CANCELADA</p>
            }
           </div>

            <!-- Pie de página: firmas + agradecimiento, siempre al final de la hoja -->
            <div class="mt-auto pt-16">
              <div class="grid grid-cols-2 gap-10 px-4">
                <div class="text-center">
                  <div class="border-t border-slate-400 pt-1 text-xs text-slate-500">Firma del cliente</div>
                </div>
                <div class="text-center">
                  <div class="border-t border-slate-400 pt-1 text-xs text-slate-500">Firma del vendedor</div>
                </div>
              </div>
              <p class="text-center text-xs font-bold tracking-wide text-slate-600 mt-8">GRACIAS POR SU COMPRA</p>
            </div>
          </div>

          <!-- Botones (no se imprimen) -->
          <div class="flex justify-end gap-2 px-6 pb-6 no-print">
            <button class="btn-secondary" (click)="closeInvoice()">Cerrar</button>
            <button class="btn-primary" (click)="printInvoice()">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/>
              </svg>
              Imprimir / Guardar como PDF
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class SalesComponent {
  search = '';
  selectedCustomerId = '';
  paymentMethod: 'Efectivo' | 'Tarjeta' | 'Transferencia' = 'Efectivo';
  cart = signal<CartLine[]>([]);
  invoiceSale = signal<Sale | null>(null);

  constructor(public data: DataService, private toast: ToastService) {}

  availableProducts = computed(() => {
    const term = this.search.trim().toLowerCase();
    return this.data.products().filter(
      (p) => !term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)
    );
  });

  total = computed(() => this.cart().reduce((acc, l) => acc + l.subtotal, 0));

  addToCart(p: Product) {
    const existing = this.cart().find((l) => l.productId === p.id);
    if (existing) {
      if (existing.quantity < existing.maxStock) {
        existing.quantity++;
        this.recalc(existing);
        this.cart.set([...this.cart()]);
      } else {
        this.toast.show('No hay más stock disponible de este producto', 'error');
      }
      return;
    }
    if (p.stock <= 0) return;
    const line: CartLine = {
      productId: p.id,
      productName: p.name,
      quantity: 1,
      unitPrice: p.salePrice,
      subtotal: p.salePrice,
      maxStock: p.stock
    };
    this.cart.set([...this.cart(), line]);
  }

  recalc(line: CartLine) {
    if (line.quantity > line.maxStock) line.quantity = line.maxStock;
    if (line.quantity < 1) line.quantity = 1;
    line.subtotal = line.quantity * line.unitPrice;
    this.cart.set([...this.cart()]);
  }

  removeLine(line: CartLine) {
    this.cart.set(this.cart().filter((l) => l.productId !== line.productId));
  }

  checkout() {
    if (this.cart().length === 0) return;
    const customer = this.data.customers().find((c) => c.id === this.selectedCustomerId);
    const sale = this.data.registerSale({
      customerId: customer?.id,
      customerName: customer?.name,
      items: this.cart().map(({ maxStock, ...rest }) => rest),
      total: this.total(),
      paymentMethod: this.paymentMethod,
      status: 'Completada'
    });
    this.toast.show('Venta registrada correctamente');
    this.cart.set([]);
    this.selectedCustomerId = '';
    // Lógica más clara: al completar la venta, mostramos de una vez la factura lista para imprimir.
    this.invoiceSale.set(sale);
  }

  openInvoice(sale: Sale) {
    this.invoiceSale.set(sale);
  }

  closeInvoice() {
    this.invoiceSale.set(null);
  }

  printInvoice() {
    window.print();
  }

  cancel(id: string) {
    if (confirm('¿Cancelar esta venta? El stock será devuelto al inventario.')) {
      this.data.cancelSale(id);
      this.toast.show('Venta cancelada');
    }
  }
}

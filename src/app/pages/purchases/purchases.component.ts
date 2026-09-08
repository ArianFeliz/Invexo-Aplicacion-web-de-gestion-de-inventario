import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { Product, PurchaseItem } from '../../models/models';

interface CartLine extends PurchaseItem {}

@Component({
  selector: 'app-purchases',
  standalone: true,
  imports: [FormsModule, DecimalPipe, DatePipe],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-4">
        <div class="card p-4">
          <label class="label-base">Agregar producto a la orden de compra</label>
          <select class="input-base" (change)="addProduct($event)">
            <option value="">Selecciona un producto...</option>
            @for (p of data.products(); track p.id) {
              <option [value]="p.id">{{ p.name }} — Costo actual: RD$ {{ p.costPrice }}</option>
            }
          </select>
        </div>

        <div class="card overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100">
            <h2 class="font-bold text-slate-800">Historial de compras</h2>
          </div>
          <div class="overflow-x-auto max-h-96 overflow-y-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-500 text-left sticky top-0">
                <tr>
                  <th class="px-5 py-2 font-semibold">Folio</th>
                  <th class="px-5 py-2 font-semibold">Fecha</th>
                  <th class="px-5 py-2 font-semibold">Proveedor</th>
                  <th class="px-5 py-2 font-semibold">Total</th>
                  <th class="px-5 py-2 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                @for (pur of data.purchases(); track pur.id) {
                  <tr class="border-t border-slate-100">
                    <td class="px-5 py-2.5 font-medium text-slate-700">{{ pur.folio }}</td>
                    <td class="px-5 py-2.5 text-slate-500">{{ pur.createdAt | date: 'dd/MM/yy HH:mm' }}</td>
                    <td class="px-5 py-2.5 text-slate-600">{{ pur.supplierName || '—' }}</td>
                    <td class="px-5 py-2.5 font-semibold text-slate-700">RD$ {{ pur.total | number: '1.0-2' }}</td>
                    <td class="px-5 py-2.5">
                      <span class="badge bg-teal-50 text-teal-700">{{ pur.status }}</span>
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="5" class="px-5 py-10 text-center text-slate-400">Aún no hay compras registradas.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card p-5 h-fit sticky top-20">
        <h2 class="font-bold text-slate-800 mb-3">🛒 Nueva orden de compra</h2>

        <div>
          <label class="label-base">Proveedor</label>
          <select class="input-base" [(ngModel)]="selectedSupplierId">
            <option value="">Sin proveedor específico</option>
            @for (s of data.suppliers(); track s.id) {
              <option [value]="s.id">{{ s.name }}</option>
            }
          </select>
        </div>

        <div class="mt-4 divide-y divide-slate-100 max-h-72 overflow-y-auto">
          @for (line of cart(); track line.productId) {
            <div class="py-2.5 flex items-center gap-2">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-slate-700 truncate">{{ line.productName }}</p>
              </div>
              <input
                type="number"
                class="w-16 rounded-lg border border-slate-300 px-2 py-1 text-sm text-center"
                [min]="1"
                [(ngModel)]="line.quantity"
                (ngModelChange)="recalc(line)"
              />
              <input
                type="number"
                class="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm text-center"
                [min]="0"
                step="0.01"
                [(ngModel)]="line.unitCost"
                (ngModelChange)="recalc(line)"
              />
              <p class="text-sm font-bold text-slate-700 w-20 text-right">RD$ {{ line.subtotal | number: '1.0-2' }}</p>
              <button class="text-red-400 hover:text-red-600" (click)="removeLine(line)">✕</button>
            </div>
          } @empty {
            <p class="text-sm text-slate-400 text-center py-8">Agrega productos a la orden</p>
          }
        </div>

        <div class="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
          <span class="font-bold text-slate-700">Total</span>
          <span class="text-2xl font-extrabold text-teal-700">RD$ {{ total() | number: '1.0-2' }}</span>
        </div>

        <button class="btn-primary w-full mt-4" [disabled]="cart().length === 0" (click)="registerPurchase()">
          Registrar compra recibida
        </button>
        <p class="text-xs text-slate-400 mt-2 text-center">El stock se actualizará automáticamente al registrar.</p>
      </div>
    </div>
  `
})
export class PurchasesComponent {
  selectedSupplierId = '';
  cart = signal<CartLine[]>([]);

  constructor(public data: DataService, private toast: ToastService) {}

  total = computed(() => this.cart().reduce((acc, l) => acc + l.subtotal, 0));

  addProduct(event: Event) {
    const select = event.target as HTMLSelectElement;
    const id = select.value;
    select.value = '';
    if (!id) return;
    const product = this.data.products().find((p) => p.id === id);
    if (!product) return;
    if (this.cart().some((l) => l.productId === id)) {
      this.toast.show('Ese producto ya está en la orden', 'info');
      return;
    }
    const line: CartLine = {
      productId: product.id,
      productName: product.name,
      quantity: 1,
      unitCost: product.costPrice,
      subtotal: product.costPrice
    };
    this.cart.set([...this.cart(), line]);
  }

  recalc(line: CartLine) {
    if (line.quantity < 1) line.quantity = 1;
    if (line.unitCost < 0) line.unitCost = 0;
    line.subtotal = line.quantity * line.unitCost;
    this.cart.set([...this.cart()]);
  }

  removeLine(line: CartLine) {
    this.cart.set(this.cart().filter((l) => l.productId !== line.productId));
  }

  registerPurchase() {
    if (this.cart().length === 0) return;
    const supplier = this.data.suppliers().find((s) => s.id === this.selectedSupplierId);
    this.data.registerPurchase({
      supplierId: supplier?.id,
      supplierName: supplier?.name,
      items: [...this.cart()],
      total: this.total(),
      status: 'Recibida'
    });
    this.toast.show('Compra registrada y stock actualizado');
    this.cart.set([]);
    this.selectedSupplierId = '';
  }
}

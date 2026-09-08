import { Component, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-xl font-bold text-slate-800">Reportes</h2>
        <p class="text-sm text-slate-500">Resumen del desempeño de tu negocio</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="card p-5">
          <p class="text-sm text-slate-500 font-medium">Ingresos totales</p>
          <p class="text-2xl font-extrabold text-slate-800 mt-1">RD$ {{ totalRevenue() | number: '1.0-2' }}</p>
        </div>
        <div class="card p-5">
          <p class="text-sm text-slate-500 font-medium">Costo de mercancía vendida</p>
          <p class="text-2xl font-extrabold text-slate-800 mt-1">RD$ {{ totalCost() | number: '1.0-2' }}</p>
        </div>
        <div class="card p-5">
          <p class="text-sm text-slate-500 font-medium">Ganancia bruta</p>
          <p class="text-2xl font-extrabold text-teal-600 mt-1">RD$ {{ grossProfit() | number: '1.0-2' }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top productos vendidos -->
        <div class="card p-5">
          <h3 class="font-bold text-slate-800 mb-4">Productos más vendidos</h3>
          <div class="space-y-3">
            @for (item of topProducts(); track item.name) {
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="font-medium text-slate-700">{{ item.name }}</span>
                  <span class="text-slate-500">{{ item.qty }} uds.</span>
                </div>
                <div class="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div class="h-full bg-teal-500 rounded-full" [style.width.%]="item.pct"></div>
                </div>
              </div>
            } @empty {
              <p class="text-sm text-slate-400 text-center py-8">Aún no hay ventas para mostrar.</p>
            }
          </div>
        </div>

        <!-- Valor por categoría -->
        <div class="card p-5">
          <h3 class="font-bold text-slate-800 mb-4">Valor de inventario por categoría</h3>
          <div class="space-y-3">
            @for (item of categoryValues(); track item.name) {
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="font-medium text-slate-700">{{ item.name }}</span>
                  <span class="text-slate-500">RD$ {{ item.value | number: '1.0-2' }}</span>
                </div>
                <div class="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div class="h-full bg-teal-500 rounded-full" [style.width.%]="item.pct"></div>
                </div>
              </div>
            } @empty {
              <p class="text-sm text-slate-400 text-center py-8">No hay productos en inventario.</p>
            }
          </div>
        </div>
      </div>

      <!-- Movimientos recientes -->
      <div class="card overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100">
          <h3 class="font-bold text-slate-800">Movimientos de inventario recientes</h3>
        </div>
        <div class="overflow-x-auto max-h-80 overflow-y-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 text-left sticky top-0">
              <tr>
                <th class="px-5 py-2 font-semibold">Producto</th>
                <th class="px-5 py-2 font-semibold">Tipo</th>
                <th class="px-5 py-2 font-semibold">Cantidad</th>
                <th class="px-5 py-2 font-semibold">Motivo</th>
              </tr>
            </thead>
            <tbody>
              @for (m of data.movements().slice(0, 30); track m.id) {
                <tr class="border-t border-slate-100">
                  <td class="px-5 py-2.5 font-medium text-slate-700">{{ m.productName }}</td>
                  <td class="px-5 py-2.5">
                    <span class="badge" [class.bg-teal-50]="m.type === 'Entrada'" [class.text-teal-700]="m.type === 'Entrada'"
                      [class.bg-red-50]="m.type === 'Salida'" [class.text-red-600]="m.type === 'Salida'"
                      [class.bg-slate-100]="m.type === 'Ajuste'" [class.text-slate-600]="m.type === 'Ajuste'">
                      {{ m.type }}
                    </span>
                  </td>
                  <td class="px-5 py-2.5 text-slate-600">{{ m.quantity }}</td>
                  <td class="px-5 py-2.5 text-slate-500">{{ m.reason }}</td>
                </tr>
              } @empty {
                <tr><td colspan="4" class="px-5 py-10 text-center text-slate-400">Sin movimientos registrados.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ReportsComponent {
  constructor(public data: DataService) {}

  completedSales = computed(() => this.data.sales().filter((s) => s.status === 'Completada'));

  totalRevenue = computed(() => this.completedSales().reduce((acc, s) => acc + s.total, 0));

  totalCost = computed(() => {
    let cost = 0;
    for (const sale of this.completedSales()) {
      for (const item of sale.items) {
        const product = this.data.products().find((p) => p.id === item.productId);
        cost += (product?.costPrice ?? 0) * item.quantity;
      }
    }
    return cost;
  });

  grossProfit = computed(() => this.totalRevenue() - this.totalCost());

  topProducts = computed(() => {
    const counts = new Map<string, number>();
    for (const sale of this.completedSales()) {
      for (const item of sale.items) {
        counts.set(item.productName, (counts.get(item.productName) ?? 0) + item.quantity);
      }
    }
    const arr = Array.from(counts.entries()).map(([name, qty]) => ({ name, qty }));
    arr.sort((a, b) => b.qty - a.qty);
    const max = arr[0]?.qty ?? 1;
    return arr.slice(0, 6).map((item) => ({ ...item, pct: Math.round((item.qty / max) * 100) }));
  });

  categoryValues = computed(() => {
    const totals = new Map<string, number>();
    for (const product of this.data.products()) {
      const name = this.data.getCategoryName(product.categoryId);
      totals.set(name, (totals.get(name) ?? 0) + product.costPrice * product.stock);
    }
    const arr = Array.from(totals.entries()).map(([name, value]) => ({ name, value }));
    arr.sort((a, b) => b.value - a.value);
    const max = arr[0]?.value || 1;
    return arr.map((item) => ({ ...item, pct: Math.round((item.value / max) * 100) }));
  });
}

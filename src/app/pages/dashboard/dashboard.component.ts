import { Component, computed } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';

interface DayBar {
  label: string;
  total: number;
  pct: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe],
  template: `
    <div class="space-y-6">
      <!-- Saludo + acciones rápidas -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-extrabold text-slate-800">{{ greeting() }}, {{ firstName() }}</h2>
          <p class="text-sm text-slate-500 mt-0.5">{{ today | date: "EEEE d 'de' MMMM, y" }} — esto es lo que pasa hoy en tu negocio</p>
        </div>
        <div class="flex gap-2 shrink-0">
          <a routerLink="/ventas" class="btn-primary">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            Nueva venta
          </a>
          <a routerLink="/productos" class="btn-secondary">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8"/></svg>
            Nuevo producto
          </a>
        </div>
      </div>

      <!-- KPI cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card p-5 flex items-start justify-between">
          <div>
            <p class="text-sm text-slate-500 font-medium">Ventas del día</p>
            <p class="text-2xl font-extrabold text-slate-800 mt-1">RD$ {{ totalVentasHoy() | number: '1.0-2' }}</p>
            <p class="text-xs text-teal-600 mt-2 font-medium">{{ ventasHoy().length }} venta(s) completadas</p>
          </div>
          <div class="w-11 h-11 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 2l1.5 4h9L18 2M4 6h16l-1.5 13.5a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 6z"/></svg>
          </div>
        </div>

        <div class="card p-5 flex items-start justify-between">
          <div>
            <p class="text-sm text-slate-500 font-medium">Valor del inventario</p>
            <p class="text-2xl font-extrabold text-slate-800 mt-1">RD$ {{ data.totalInventoryValue() | number: '1.0-2' }}</p>
            <p class="text-xs text-sky-600 mt-2 font-medium">{{ data.products().length }} productos activos</p>
          </div>
          <div class="w-11 h-11 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8"/></svg>
          </div>
        </div>

        <div class="card p-5 flex items-start justify-between">
          <div>
            <p class="text-sm text-slate-500 font-medium">Ganancia del mes</p>
            <p class="text-2xl font-extrabold text-slate-800 mt-1">RD$ {{ monthlyProfit() | number: '1.0-2' }}</p>
            <p class="text-xs text-amber-600 mt-2 font-medium">Ingresos − costo de venta</p>
          </div>
          <div class="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 3v18h18M7 15l4-4 3 3 5-6"/></svg>
          </div>
        </div>

        <div class="card p-5 flex items-start justify-between" [class.ring-2]="data.lowStockProducts().length > 0" [class.ring-red-200]="data.lowStockProducts().length > 0">
          <div>
            <p class="text-sm text-slate-500 font-medium">Stock bajo</p>
            <p class="text-2xl font-extrabold mt-1" [class.text-red-600]="data.lowStockProducts().length > 0" [class.text-slate-800]="data.lowStockProducts().length === 0">
              {{ data.lowStockProducts().length }}
            </p>
            <p class="text-xs mt-2 font-medium" [class.text-red-500]="data.lowStockProducts().length > 0" [class.text-teal-600]="data.lowStockProducts().length === 0">
              {{ data.lowStockProducts().length > 0 ? 'Productos por reabastecer' : 'Todo en buen nivel ✅' }}
            </p>
          </div>
          <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
               [class.bg-red-100]="data.lowStockProducts().length > 0" [class.text-red-700]="data.lowStockProducts().length > 0"
               [class.bg-teal-100]="data.lowStockProducts().length === 0" [class.text-teal-700]="data.lowStockProducts().length === 0">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/></svg>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Gráfico de ventas -->
        <div class="card lg:col-span-2 p-5">
          <div class="flex items-center justify-between mb-5">
            <div>
              <h2 class="font-bold text-slate-800">Ventas de los últimos 7 días</h2>
              <p class="text-xs text-slate-400">Total del periodo: RD$ {{ weekTotal() | number: '1.0-2' }}</p>
            </div>
          </div>
          <div class="flex items-end justify-between gap-2 h-44">
            @for (bar of weekBars(); track bar.label) {
              <div class="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span class="text-xs font-semibold text-slate-500">{{ bar.total > 0 ? (bar.total | number: '1.0-0') : '' }}</span>
                <div class="w-full rounded-t-lg bg-gradient-to-t from-teal-600 to-teal-400 transition-all" [style.height.%]="bar.pct === 0 ? 3 : bar.pct"></div>
                <span class="text-xs text-slate-400 font-medium">{{ bar.label }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Alertas de stock -->
        <div class="card overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 class="font-bold text-slate-800">Alertas de stock</h2>
            <a routerLink="/productos" class="text-sm text-teal-600 font-semibold hover:underline">Ver todo →</a>
          </div>
          <ul class="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            @for (p of data.lowStockProducts().slice(0, 8); track p.id) {
              <li class="px-5 py-3 flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                  @if (p.photo) {
                    <img [src]="p.photo" class="w-full h-full object-cover" [alt]="p.name" />
                  } @else {
                    <span class="text-base">📦</span>
                  }
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold text-slate-700 truncate">{{ p.name }}</p>
                  <p class="text-xs text-slate-400">SKU: {{ p.sku }}</p>
                </div>
                <span class="badge bg-red-50 text-red-600 shrink-0">{{ p.stock }} / {{ p.minStock }}</span>
              </li>
            } @empty {
              <li class="px-5 py-10 text-center text-slate-400 text-sm">Todo el inventario está en buen nivel ✅</li>
            }
          </ul>
        </div>
      </div>

      <!-- Últimas ventas -->
      <div class="card overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 class="font-bold text-slate-800">Últimas ventas</h2>
          <a routerLink="/ventas" class="text-sm text-teal-600 font-semibold hover:underline">Ver todas →</a>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th class="px-5 py-2 font-semibold">Folio</th>
                <th class="px-5 py-2 font-semibold">Cliente</th>
                <th class="px-5 py-2 font-semibold">Total</th>
                <th class="px-5 py-2 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              @for (sale of data.sales().slice(0, 6); track sale.id) {
                <tr class="border-t border-slate-100">
                  <td class="px-5 py-2.5 font-medium text-slate-700">{{ sale.folio }}</td>
                  <td class="px-5 py-2.5 text-slate-600">{{ sale.customerName || 'Mostrador' }}</td>
                  <td class="px-5 py-2.5 text-slate-700 font-semibold">RD$ {{ sale.total | number: '1.0-2' }}</td>
                  <td class="px-5 py-2.5">
                    <span class="badge" [class.bg-teal-50]="sale.status === 'Completada'" [class.text-teal-700]="sale.status === 'Completada'"
                      [class.bg-red-50]="sale.status === 'Cancelada'" [class.text-red-600]="sale.status === 'Cancelada'">
                      {{ sale.status }}
                    </span>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="4" class="px-5 py-8 text-center text-slate-400">Aún no hay ventas registradas.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  today = new Date();

  constructor(public data: DataService, public auth: AuthService) {}

  firstName(): string {
    const name = this.auth.currentUser()?.name ?? '';
    return name.split(' ')[0] || 'usuario';
  }

  greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }

  ventasHoy = computed(() => {
    const today = new Date().toDateString();
    return this.data.sales().filter((s) => new Date(s.createdAt).toDateString() === today && s.status === 'Completada');
  });

  totalVentasHoy = computed(() => this.ventasHoy().reduce((acc, s) => acc + s.total, 0));

  monthlyProfit = computed(() => {
    const now = new Date();
    const sales = this.data.sales().filter(
      (s) =>
        s.status === 'Completada' &&
        new Date(s.createdAt).getMonth() === now.getMonth() &&
        new Date(s.createdAt).getFullYear() === now.getFullYear()
    );
    let revenue = 0;
    let cost = 0;
    for (const sale of sales) {
      revenue += sale.total;
      for (const item of sale.items) {
        const product = this.data.products().find((p) => p.id === item.productId);
        cost += (product?.costPrice ?? 0) * item.quantity;
      }
    }
    return revenue - cost;
  });

  weekBars = computed<DayBar[]>(() => {
    const days: DayBar[] = [];
    const labels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const totalsByDay: number[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayTotal = this.data
        .sales()
        .filter((s) => s.status === 'Completada' && new Date(s.createdAt).toDateString() === d.toDateString())
        .reduce((acc, s) => acc + s.total, 0);
      totalsByDay.push(dayTotal);
      days.push({ label: labels[d.getDay()], total: dayTotal, pct: 0 });
    }

    const max = Math.max(...totalsByDay, 1);
    return days.map((d) => ({ ...d, pct: Math.round((d.total / max) * 100) }));
  });

  weekTotal = computed(() => this.weekBars().reduce((acc, d) => acc + d.total, 0));
}

import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { Customer } from '../../models/models';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-slate-800">Clientes</h2>
          <p class="text-sm text-slate-500">Base de datos de tus clientes</p>
        </div>
        <button class="btn-primary" (click)="openForm()">+ Nuevo cliente</button>
      </div>

      <div class="card overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th class="px-5 py-3 font-semibold">Nombre</th>
              <th class="px-5 py-3 font-semibold">Teléfono</th>
              <th class="px-5 py-3 font-semibold">Email</th>
              <th class="px-5 py-3 font-semibold">Compras</th>
              <th class="px-5 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (c of data.customers(); track c.id) {
              <tr class="border-t border-slate-100">
                <td class="px-5 py-3 font-semibold text-slate-700">{{ c.name }}</td>
                <td class="px-5 py-3 text-slate-600">{{ c.phone }}</td>
                <td class="px-5 py-3 text-slate-600">{{ c.email || '—' }}</td>
                <td class="px-5 py-3 text-slate-600">RD$ {{ totalSpent(c.id) | number: '1.0-2' }}</td>
                <td class="px-5 py-3 text-right space-x-1">
                  <button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" (click)="openForm(c)">✎</button>
                  <button class="p-1.5 rounded-lg hover:bg-red-50 text-red-500" (click)="remove(c)">🗑</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="px-5 py-10 text-center text-slate-400">No hay clientes registrados.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    @if (showForm()) {
      <div class="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4" (click)="closeForm()">
        <div class="card w-full max-w-md p-6" (click)="$event.stopPropagation()">
          <h3 class="font-bold text-lg text-slate-800 mb-4">{{ editing() ? 'Editar' : 'Nuevo' }} cliente</h3>
          <div class="space-y-3">
            <div>
              <label class="label-base">Nombre completo</label>
              <input class="input-base" [(ngModel)]="form.name" placeholder="Ej: Carlos Reyes" />
            </div>
            <div>
              <label class="label-base">Teléfono</label>
              <input class="input-base" [(ngModel)]="form.phone" placeholder="809-000-0000" />
            </div>
            <div>
              <label class="label-base">Email</label>
              <input class="input-base" [(ngModel)]="form.email" placeholder="Opcional" />
            </div>
            <div>
              <label class="label-base">Dirección</label>
              <input class="input-base" [(ngModel)]="form.address" placeholder="Opcional" />
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-6">
            <button class="btn-secondary" (click)="closeForm()">Cancelar</button>
            <button class="btn-primary" (click)="save()">Guardar</button>
          </div>
        </div>
      </div>
    }
  `
})
export class CustomersComponent {
  showForm = signal(false);
  editing = signal<Customer | null>(null);
  form = { name: '', phone: '', email: '', address: '' };

  constructor(public data: DataService, private toast: ToastService) {}

  totalSpent(customerId: string): number {
    return this.data
      .sales()
      .filter((s) => s.customerId === customerId && s.status === 'Completada')
      .reduce((acc, s) => acc + s.total, 0);
  }

  openForm(c?: Customer) {
    if (c) {
      this.editing.set(c);
      this.form = { name: c.name, phone: c.phone, email: c.email || '', address: c.address || '' };
    } else {
      this.editing.set(null);
      this.form = { name: '', phone: '', email: '', address: '' };
    }
    this.showForm.set(true);
  }
  closeForm() {
    this.showForm.set(false);
  }
  save() {
    if (!this.form.name.trim()) {
      this.toast.show('El nombre es obligatorio', 'error');
      return;
    }
    const editing = this.editing();
    if (editing) {
      this.data.updateCustomer(editing.id, { ...this.form });
      this.toast.show('Cliente actualizado');
    } else {
      this.data.addCustomer({ ...this.form });
      this.toast.show('Cliente creado');
    }
    this.closeForm();
  }
  remove(c: Customer) {
    if (confirm(`¿Eliminar al cliente "${c.name}"?`)) {
      this.data.deleteCustomer(c.id);
      this.toast.show('Cliente eliminado');
    }
  }
}

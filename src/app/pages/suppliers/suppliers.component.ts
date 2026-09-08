import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { Supplier } from '../../models/models';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-slate-800">Proveedores</h2>
          <p class="text-sm text-slate-500">Empresas y contactos que te abastecen</p>
        </div>
        <button class="btn-primary" (click)="openForm()">+ Nuevo proveedor</button>
      </div>

      <div class="card overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th class="px-5 py-3 font-semibold">Nombre</th>
              <th class="px-5 py-3 font-semibold">Contacto</th>
              <th class="px-5 py-3 font-semibold">Teléfono</th>
              <th class="px-5 py-3 font-semibold">Email</th>
              <th class="px-5 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (s of data.suppliers(); track s.id) {
              <tr class="border-t border-slate-100">
                <td class="px-5 py-3 font-semibold text-slate-700">{{ s.name }}</td>
                <td class="px-5 py-3 text-slate-600">{{ s.contact }}</td>
                <td class="px-5 py-3 text-slate-600">{{ s.phone }}</td>
                <td class="px-5 py-3 text-slate-600">{{ s.email || '—' }}</td>
                <td class="px-5 py-3 text-right space-x-1">
                  <button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" (click)="openForm(s)">✎</button>
                  <button class="p-1.5 rounded-lg hover:bg-red-50 text-red-500" (click)="remove(s)">🗑</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="px-5 py-10 text-center text-slate-400">No hay proveedores registrados.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    @if (showForm()) {
      <div class="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4" (click)="closeForm()">
        <div class="card w-full max-w-md p-6" (click)="$event.stopPropagation()">
          <h3 class="font-bold text-lg text-slate-800 mb-4">{{ editing() ? 'Editar' : 'Nuevo' }} proveedor</h3>
          <div class="space-y-3">
            <div>
              <label class="label-base">Nombre de la empresa</label>
              <input class="input-base" [(ngModel)]="form.name" placeholder="Ej: Distribuidora Caribe" />
            </div>
            <div>
              <label class="label-base">Persona de contacto</label>
              <input class="input-base" [(ngModel)]="form.contact" placeholder="Ej: Juan Pérez" />
            </div>
            <div>
              <label class="label-base">Teléfono</label>
              <input class="input-base" [(ngModel)]="form.phone" placeholder="809-000-0000" />
            </div>
            <div>
              <label class="label-base">Email</label>
              <input class="input-base" [(ngModel)]="form.email" placeholder="correo@empresa.com" />
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
export class SuppliersComponent {
  showForm = signal(false);
  editing = signal<Supplier | null>(null);
  form = { name: '', contact: '', phone: '', email: '', address: '' };

  constructor(public data: DataService, private toast: ToastService) {}

  openForm(s?: Supplier) {
    if (s) {
      this.editing.set(s);
      this.form = { name: s.name, contact: s.contact, phone: s.phone, email: s.email || '', address: s.address || '' };
    } else {
      this.editing.set(null);
      this.form = { name: '', contact: '', phone: '', email: '', address: '' };
    }
    this.showForm.set(true);
  }
  closeForm() {
    this.showForm.set(false);
  }
  save() {
    if (!this.form.name.trim() || !this.form.phone.trim()) {
      this.toast.show('Nombre y teléfono son obligatorios', 'error');
      return;
    }
    const editing = this.editing();
    if (editing) {
      this.data.updateSupplier(editing.id, { ...this.form });
      this.toast.show('Proveedor actualizado');
    } else {
      this.data.addSupplier({ ...this.form });
      this.toast.show('Proveedor creado');
    }
    this.closeForm();
  }
  remove(s: Supplier) {
    if (confirm(`¿Eliminar al proveedor "${s.name}"?`)) {
      this.data.deleteSupplier(s.id);
      this.toast.show('Proveedor eliminado');
    }
  }
}

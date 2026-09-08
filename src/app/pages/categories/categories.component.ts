import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { Category } from '../../models/models';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-slate-800">Categorías</h2>
          <p class="text-sm text-slate-500">Organiza tus productos por categoría</p>
        </div>
        <button class="btn-primary" (click)="openForm()">+ Nueva categoría</button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (cat of data.categories(); track cat.id) {
          <div class="card p-5">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" [style.backgroundColor]="cat.color || '#289e93'">
                  {{ cat.name.charAt(0) }}
                </div>
                <div>
                  <p class="font-bold text-slate-800">{{ cat.name }}</p>
                  <p class="text-xs text-slate-400">{{ productCount(cat.id) }} productos</p>
                </div>
              </div>
              <div class="flex gap-1">
                <button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" (click)="openForm(cat)">✎</button>
                <button class="p-1.5 rounded-lg hover:bg-red-50 text-red-500" (click)="remove(cat)">🗑</button>
              </div>
            </div>
            @if (cat.description) {
              <p class="text-sm text-slate-500 mt-3">{{ cat.description }}</p>
            }
          </div>
        } @empty {
          <p class="text-slate-400 col-span-full text-center py-12">No hay categorías todavía.</p>
        }
      </div>
    </div>

    @if (showForm()) {
      <div class="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4" (click)="closeForm()">
        <div class="card w-full max-w-md p-6" (click)="$event.stopPropagation()">
          <h3 class="font-bold text-lg text-slate-800 mb-4">{{ editing() ? 'Editar' : 'Nueva' }} categoría</h3>
          <div class="space-y-3">
            <div>
              <label class="label-base">Nombre</label>
              <input class="input-base" [(ngModel)]="form.name" placeholder="Ej: Electrónica" />
            </div>
            <div>
              <label class="label-base">Descripción</label>
              <input class="input-base" [(ngModel)]="form.description" placeholder="Opcional" />
            </div>
            <div>
              <label class="label-base">Color</label>
              <input class="w-16 h-10 rounded-lg border border-slate-300" type="color" [(ngModel)]="form.color" />
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
export class CategoriesComponent {
  showForm = signal(false);
  editing = signal<Category | null>(null);
  form: { name: string; description: string; color: string } = { name: '', description: '', color: '#289e93' };

  constructor(public data: DataService, private toast: ToastService) {}

  productCount(categoryId: string): number {
    return this.data.products().filter((p) => p.categoryId === categoryId).length;
  }

  openForm(cat?: Category) {
    if (cat) {
      this.editing.set(cat);
      this.form = { name: cat.name, description: cat.description || '', color: cat.color || '#289e93' };
    } else {
      this.editing.set(null);
      this.form = { name: '', description: '', color: '#289e93' };
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
      this.data.updateCategory(editing.id, { ...this.form });
      this.toast.show('Categoría actualizada');
    } else {
      this.data.addCategory({ ...this.form });
      this.toast.show('Categoría creada');
    }
    this.closeForm();
  }

  remove(cat: Category) {
    if (this.productCount(cat.id) > 0) {
      this.toast.show('No puedes eliminar una categoría con productos asignados', 'error');
      return;
    }
    if (confirm(`¿Eliminar la categoría "${cat.name}"?`)) {
      this.data.deleteCategory(cat.id);
      this.toast.show('Categoría eliminada');
    }
  }
}

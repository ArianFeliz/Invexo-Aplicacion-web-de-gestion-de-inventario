import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { Product } from '../../models/models';

type FormState = {
  name: string;
  sku: string;
  description: string;
  categoryId: string;
  supplierId: string;
  costPrice: number | null;
  salePrice: number | null;
  stock: number | null;
  minStock: number | null;
  unit: string;
  photo: string;
};

const EMPTY_FORM: FormState = {
  name: '',
  sku: '',
  description: '',
  categoryId: '',
  supplierId: '',
  costPrice: null,
  salePrice: null,
  stock: null,
  minStock: null,
  unit: 'unidad',
  photo: ''
};

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-xl font-bold text-slate-800">Productos</h2>
          <p class="text-sm text-slate-500">{{ filtered().length }} productos en catálogo</p>
        </div>
        <button class="btn-primary" (click)="openForm()">+ Nuevo producto</button>
      </div>

      <!-- Filtros -->
      <div class="card p-4 flex flex-col sm:flex-row gap-3">
        <input class="input-base sm:max-w-xs" [(ngModel)]="search" placeholder="Buscar por nombre o SKU..." />
        <select class="input-base sm:max-w-xs" [(ngModel)]="categoryFilter">
          <option value="">Todas las categorías</option>
          @for (c of data.categories(); track c.id) {
            <option [value]="c.id">{{ c.name }}</option>
          }
        </select>
        <label class="flex items-center gap-2 text-sm text-slate-600 sm:ml-auto">
          <input type="checkbox" [(ngModel)]="onlyLowStock" class="rounded border-slate-300 text-teal-600 focus:ring-teal-400" />
          Solo stock bajo
        </label>
      </div>

      <!-- Grid de productos -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        @for (p of filtered(); track p.id) {
          <div class="card overflow-hidden flex flex-col">
            <div class="h-36 bg-slate-100 flex items-center justify-center overflow-hidden">
              @if (p.photo) {
                <img [src]="p.photo" [alt]="p.name" class="w-full h-full object-cover" />
              } @else {
                <span class="text-4xl">📦</span>
              }
            </div>
            <div class="p-4 flex-1 flex flex-col">
              <div class="flex items-start justify-between gap-2">
                <p class="font-bold text-slate-800 leading-tight">{{ p.name }}</p>
                <span class="badge shrink-0" [class.bg-red-50]="p.stock <= p.minStock" [class.text-red-600]="p.stock <= p.minStock"
                  [class.bg-teal-50]="p.stock > p.minStock" [class.text-teal-700]="p.stock > p.minStock">
                  {{ p.stock }} {{ p.unit }}
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">SKU: {{ p.sku }}</p>
              <p class="text-xs text-slate-400">{{ data.getCategoryName(p.categoryId) }}</p>

              <div class="mt-3 flex items-baseline gap-2">
                <span class="text-lg font-extrabold text-teal-700">RD$ {{ p.salePrice | number: '1.0-2' }}</span>
                <span class="text-xs text-slate-400 line-through">RD$ {{ p.costPrice | number: '1.0-2' }}</span>
              </div>

              <div class="mt-4 flex gap-2">
                <button class="btn-secondary flex-1 !py-1.5 text-xs" (click)="openForm(p)">Editar</button>
                <button class="btn-secondary flex-1 !py-1.5 text-xs" (click)="openStockAdjust(p)">Ajustar stock</button>
                <button class="p-1.5 rounded-lg hover:bg-red-50 text-red-500" (click)="remove(p)">🗑</button>
              </div>
            </div>
          </div>
        } @empty {
          <p class="text-slate-400 col-span-full text-center py-16">No se encontraron productos con esos filtros.</p>
        }
      </div>
    </div>

    <!-- Modal formulario de producto -->
    @if (showForm()) {
      <div class="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4 overflow-y-auto" (click)="closeForm()">
        <div class="card w-full max-w-2xl p-6 my-8" (click)="$event.stopPropagation()">
          <h3 class="font-bold text-lg text-slate-800 mb-4">{{ editing() ? 'Editar' : 'Nuevo' }} producto</h3>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <!-- Foto -->
            <div>
              <label class="label-base">Foto del producto</label>
              <div class="w-full aspect-square rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden mb-2 border border-dashed border-slate-300">
                @if (form.photo) {
                  <img [src]="form.photo" class="w-full h-full object-cover" alt="preview" />
                } @else {
                  <span class="text-5xl">📷</span>
                }
              </div>
              <input type="file" accept="image/*" (change)="onPhotoSelected($event)" class="text-xs w-full" />
              @if (form.photo) {
                <button class="text-xs text-red-500 mt-1" (click)="form.photo = ''">Quitar foto</button>
              }
            </div>

            <!-- Campos -->
            <div class="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="sm:col-span-2">
                <label class="label-base">Nombre del producto</label>
                <input class="input-base" [(ngModel)]="form.name" placeholder="Ej: Audífonos Bluetooth" />
              </div>
              <div>
                <label class="label-base">SKU / Código</label>
                <input class="input-base" [(ngModel)]="form.sku" placeholder="Ej: ELE-001" />
              </div>
              <div>
                <label class="label-base">Unidad</label>
                <input class="input-base" [(ngModel)]="form.unit" placeholder="unidad, caja, kg..." />
              </div>
              <div>
                <label class="label-base">Categoría</label>
                <select class="input-base" [(ngModel)]="form.categoryId">
                  <option value="">Selecciona...</option>
                  @for (c of data.categories(); track c.id) {
                    <option [value]="c.id">{{ c.name }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="label-base">Proveedor</label>
                <select class="input-base" [(ngModel)]="form.supplierId">
                  <option value="">Sin proveedor</option>
                  @for (s of data.suppliers(); track s.id) {
                    <option [value]="s.id">{{ s.name }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="label-base">Precio de costo (RD$)</label>
                <input class="input-base" type="number" min="0" step="0.01" [(ngModel)]="form.costPrice" />
              </div>
              <div>
                <label class="label-base">Precio de venta (RD$)</label>
                <input class="input-base" type="number" min="0" step="0.01" [(ngModel)]="form.salePrice" />
              </div>
              <div>
                <label class="label-base">Stock actual</label>
                <input class="input-base" type="number" min="0" [(ngModel)]="form.stock" [disabled]="!!editing()" />
              </div>
              <div>
                <label class="label-base">Stock mínimo</label>
                <input class="input-base" type="number" min="0" [(ngModel)]="form.minStock" />
              </div>
              <div class="sm:col-span-2">
                <label class="label-base">Descripción</label>
                <textarea class="input-base" rows="2" [(ngModel)]="form.description" placeholder="Opcional"></textarea>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 mt-6">
            <button class="btn-secondary" (click)="closeForm()">Cancelar</button>
            <button class="btn-primary" (click)="save()">Guardar producto</button>
          </div>
        </div>
      </div>
    }

    <!-- Modal ajuste de stock -->
    @if (adjustingProduct(); as p) {
      <div class="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4" (click)="adjustingProduct.set(null)">
        <div class="card w-full max-w-sm p-6" (click)="$event.stopPropagation()">
          <h3 class="font-bold text-lg text-slate-800 mb-1">Ajustar stock</h3>
          <p class="text-sm text-slate-500 mb-4">{{ p.name }} — stock actual: <b>{{ p.stock }} {{ p.unit }}</b></p>
          <div class="space-y-3">
            <div>
              <label class="label-base">Tipo de ajuste</label>
              <select class="input-base" [(ngModel)]="adjustType">
                <option value="add">Entrada (sumar)</option>
                <option value="remove">Salida (restar)</option>
              </select>
            </div>
            <div>
              <label class="label-base">Cantidad</label>
              <input class="input-base" type="number" min="1" [(ngModel)]="adjustQty" />
            </div>
            <div>
              <label class="label-base">Motivo</label>
              <input class="input-base" [(ngModel)]="adjustReason" placeholder="Ej: Conteo físico, merma, devolución..." />
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-6">
            <button class="btn-secondary" (click)="adjustingProduct.set(null)">Cancelar</button>
            <button class="btn-primary" (click)="confirmAdjust()">Aplicar</button>
          </div>
        </div>
      </div>
    }
  `
})
export class ProductsComponent {
  search = '';
  categoryFilter = '';
  onlyLowStock = false;

  showForm = signal(false);
  editing = signal<Product | null>(null);
  form: FormState = { ...EMPTY_FORM };

  adjustingProduct = signal<Product | null>(null);
  adjustType: 'add' | 'remove' = 'add';
  adjustQty = 1;
  adjustReason = '';

  constructor(public data: DataService, private toast: ToastService) {}

  filtered = computed(() => {
    const term = this.search.trim().toLowerCase();
    return this.data.products().filter((p) => {
      const matchesTerm = !term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term);
      const matchesCategory = !this.categoryFilter || p.categoryId === this.categoryFilter;
      const matchesStock = !this.onlyLowStock || p.stock <= p.minStock;
      return matchesTerm && matchesCategory && matchesStock;
    });
  });

  openForm(p?: Product) {
    if (p) {
      this.editing.set(p);
      this.form = {
        name: p.name,
        sku: p.sku,
        description: p.description || '',
        categoryId: p.categoryId,
        supplierId: p.supplierId || '',
        costPrice: p.costPrice,
        salePrice: p.salePrice,
        stock: p.stock,
        minStock: p.minStock,
        unit: p.unit,
        photo: p.photo || ''
      };
    } else {
      this.editing.set(null);
      this.form = { ...EMPTY_FORM };
    }
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      this.toast.show('La imagen debe pesar menos de 3MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.form.photo = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  save() {
    if (!this.form.name.trim() || !this.form.sku.trim() || !this.form.categoryId) {
      this.toast.show('Nombre, SKU y categoría son obligatorios', 'error');
      return;
    }
    const payload = {
      name: this.form.name.trim(),
      sku: this.form.sku.trim(),
      description: this.form.description,
      categoryId: this.form.categoryId,
      supplierId: this.form.supplierId || undefined,
      costPrice: Number(this.form.costPrice) || 0,
      salePrice: Number(this.form.salePrice) || 0,
      stock: Number(this.form.stock) || 0,
      minStock: Number(this.form.minStock) || 0,
      unit: this.form.unit || 'unidad',
      photo: this.form.photo || undefined
    };

    const editing = this.editing();
    if (editing) {
      const { stock, ...rest } = payload;
      this.data.updateProduct(editing.id, rest);
      this.toast.show('Producto actualizado');
    } else {
      this.data.addProduct(payload);
      this.toast.show('Producto creado');
    }
    this.closeForm();
  }

  remove(p: Product) {
    if (confirm(`¿Eliminar el producto "${p.name}"? Esta acción no se puede deshacer.`)) {
      this.data.deleteProduct(p.id);
      this.toast.show('Producto eliminado');
    }
  }

  openStockAdjust(p: Product) {
    this.adjustingProduct.set(p);
    this.adjustType = 'add';
    this.adjustQty = 1;
    this.adjustReason = '';
  }

  confirmAdjust() {
    const p = this.adjustingProduct();
    if (!p) return;
    if (!this.adjustQty || this.adjustQty <= 0) {
      this.toast.show('Ingresa una cantidad válida', 'error');
      return;
    }
    const delta = this.adjustType === 'add' ? this.adjustQty : -this.adjustQty;
    this.data.adjustStock(p.id, delta, this.adjustReason || 'Ajuste manual');
    this.toast.show('Stock ajustado correctamente');
    this.adjustingProduct.set(null);
  }
}

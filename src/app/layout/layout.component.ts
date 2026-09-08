import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { LogoComponent } from '../shared/logo.component';

interface NavItem {
  label: string;
  path: string;
  icon: string; // svg path data (heroicons-style, 24x24, stroke)
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, LogoComponent],
  template: `
    <div class="min-h-screen flex bg-slate-100">
      <!-- Sidebar -->
      <aside
        class="fixed lg:static z-30 inset-y-0 left-0 w-64 bg-teal-900 text-white flex flex-col transition-transform duration-200 -translate-x-full lg:translate-x-0"
        [class.translate-x-0]="sidebarOpen()"
      >
        <div class="flex items-center gap-3 px-6 py-5">
          <app-logo [size]="40" class="rounded-xl overflow-hidden shrink-0"></app-logo>
          <div>
            <p class="font-extrabold leading-tight tracking-tight">Invexo</p>
            <p class="text-xs text-teal-300">Gestión de negocio</p>
          </div>
        </div>

        <nav class="flex-1 overflow-y-auto py-2 px-3 space-y-0.5">
          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-teal-600/90 text-white shadow-sm"
              #rla="routerLinkActive"
              class="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-teal-200 hover:bg-white/10 hover:text-white transition text-sm font-medium relative"
            >
              @if (rla.isActive) {
                <span class="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-white"></span>
              }
              <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path [attr.d]="item.icon"></path>
              </svg>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>

        <div class="p-3 mx-3 mb-3 rounded-xl bg-white/5">
          <div class="flex items-center gap-3 px-1 py-2">
            <div class="w-9 h-9 rounded-full bg-teal-400 text-teal-950 flex items-center justify-center font-bold text-sm shrink-0">
              {{ initials() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold truncate">{{ auth.currentUser()?.name }}</p>
              <p class="text-xs text-teal-300">{{ auth.currentUser()?.role }}</p>
            </div>
          </div>
          <button (click)="logout()" class="mt-1 w-full text-sm bg-white/10 hover:bg-white/20 transition rounded-lg py-2 font-semibold flex items-center justify-center gap-2">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      @if (sidebarOpen()) {
        <div class="fixed inset-0 bg-black/30 z-20 lg:hidden" (click)="sidebarOpen.set(false)"></div>
      }

      <!-- Main -->
      <div class="flex-1 flex flex-col min-w-0">
        <header class="h-16 bg-white border-b border-slate-200 flex items-center gap-4 px-4 lg:px-8 sticky top-0 z-10">
          <button class="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600" (click)="sidebarOpen.set(!sidebarOpen())">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 class="text-lg font-bold text-slate-800 shrink-0">{{ pageTitle() }}</h1>

          <div class="hidden md:flex flex-1 max-w-md ml-4">
            <div class="relative w-full">
              <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              <input placeholder="Buscar en Invexo..." class="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-100 text-sm text-slate-600 border border-transparent focus:bg-white focus:border-teal-300 focus:ring-2 focus:ring-teal-100 outline-none transition" />
            </div>
          </div>

          <div class="flex items-center gap-3 ml-auto">
            <span class="hidden sm:inline-flex badge bg-teal-50 text-teal-700 border border-teal-200">
              ● Sistema activo
            </span>
            <button class="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 transition" title="Notificaciones">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
            </button>
          </div>
        </header>

        <main class="flex-1 p-4 lg:p-8 overflow-y-auto">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>

    <!-- Toasts -->
    <div class="fixed bottom-4 right-4 z-50 space-y-2 w-80 max-w-[90vw]">
      @for (t of toast.toasts(); track t.id) {
        <div
          class="rounded-xl px-4 py-3 shadow-lg text-sm font-medium text-white flex items-start gap-2"
          [class.bg-teal-600]="t.type === 'success'"
          [class.bg-red-600]="t.type === 'error'"
          [class.bg-slate-700]="t.type === 'info'"
        >
          <span>{{ t.type === 'success' ? '✓' : t.type === 'error' ? '⚠' : 'ℹ' }}</span>
          <span class="flex-1">{{ t.message }}</span>
        </div>
      }
    </div>
  `
})
export class LayoutComponent {
  sidebarOpen = signal(false);

  navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: 'M3 13h4v8H3zM10 3h4v18h-4zM17 8h4v13h-4z' },
    { label: 'Productos', path: '/productos', icon: 'M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8' },
    { label: 'Categorías', path: '/categorias', icon: 'M20.59 13.41L11 3.83A2 2 0 0 0 9.5 3H4a1 1 0 0 0-1 1v5.5a2 2 0 0 0 .83 1.5l9.58 9.59a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.83zM7 7.01l.01-.01' },
    { label: 'Proveedores', path: '/proveedores', icon: 'M3 7h11v8H3zM14 10h4l3 3v2h-7zM7.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z' },
    { label: 'Clientes', path: '/clientes', icon: 'M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
    { label: 'Ventas', path: '/ventas', icon: 'M6 2l1.5 4h9L18 2M4 6h16l-1.5 13.5a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 6zM10 10v6M14 10v6' },
    { label: 'Compras', path: '/compras', icon: 'M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM20 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6' },
    { label: 'Reportes', path: '/reportes', icon: 'M3 3v18h18M7 15l4-4 3 3 5-6' }
  ];

  constructor(public auth: AuthService, public toast: ToastService, private router: Router) {}

  initials(): string {
    const name = this.auth.currentUser()?.name ?? '';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  pageTitle(): string {
    const item = this.navItems.find((n) => this.router.url.startsWith(n.path));
    return item?.label ?? 'Invexo';
  }

  logout() {
    if (confirm('¿Seguro que quieres cerrar sesión?')) {
      this.auth.logout();
      this.router.navigate(['/login']);
    }
  }
}

import { AfterViewInit, Component, ElementRef, ViewChild, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GoogleAuthService } from '../../services/google-auth.service';
import { LogoComponent } from '../../shared/logo.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, LogoComponent],
  template: `
    <div class="h-screen overflow-hidden relative bg-gradient-to-br from-teal-950 via-teal-800 to-teal-600 flex flex-col">
      <!-- Manchas decorativas de fondo -->
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div class="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-teal-400/20 blur-3xl"></div>
        <div class="absolute top-1/3 -right-24 w-[30rem] h-[30rem] rounded-full bg-teal-300/10 blur-3xl"></div>
        <div class="absolute bottom-0 left-1/4 w-[26rem] h-[26rem] rounded-full bg-emerald-400/10 blur-3xl"></div>
      </div>

      <div class="relative max-w-7xl w-full mx-auto px-6 lg:px-10 flex-1 flex flex-col min-h-0 pt-6 pb-3">
        <!-- Barra superior -->
        <header class="flex items-center justify-between gap-4 shrink-0">
          <div class="flex items-center gap-3">
            <app-logo [size]="36" class="rounded-xl overflow-hidden shrink-0 shadow-lg"></app-logo>
            <div class="flex items-center gap-3">
              <span class="text-xl font-extrabold tracking-tight text-white">Invexo</span>
              <span class="hidden sm:inline text-teal-200/60">|</span>
              <span class="hidden sm:inline text-sm text-teal-100/80">Tu negocio, en orden</span>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="hidden md:inline text-sm text-teal-100/80">¿No tienes una cuenta?</span>
            <button routerLink="/registro" class="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 backdrop-blur px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/10 transition">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
              Regístrate
            </button>
          </div>
        </header>

        <!-- Contenido principal -->
        <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-2">
          <!-- Columna izquierda: mensaje -->
          <div class="text-white">
            <span class="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 backdrop-blur px-3 py-1 text-xs font-medium text-teal-50">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Sistema de Inventario
            </span>

            <h1 class="mt-3 text-3xl xl:text-4xl font-extrabold leading-tight">
              Controla tu inventario<br />
              <span class="text-teal-300">sin complicaciones.</span>
            </h1>

            <p class="mt-3 text-teal-50/85 max-w-md text-sm">
              Productos, categorías, proveedores, clientes, ventas, compras y reportes —
              todo en un solo sistema pensado para tu negocio.
            </p>

            <div class="mt-5 grid grid-cols-3 gap-3 max-w-md">
              <div class="flex items-start gap-2">
                <div class="w-8 h-8 rounded-lg bg-teal-400/20 flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4 text-teal-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                </div>
                <div class="text-xs">
                  <p class="font-semibold text-white">Seguro</p>
                  <p class="text-teal-100/70">Tus datos protegidos</p>
                </div>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-8 h-8 rounded-lg bg-teal-400/20 flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4 text-teal-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" /></svg>
                </div>
                <div class="text-xs">
                  <p class="font-semibold text-white">Rápido</p>
                  <p class="text-teal-100/70">Acceso en segundos</p>
                </div>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-8 h-8 rounded-lg bg-teal-400/20 flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4 text-teal-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></svg>
                </div>
                <div class="text-xs">
                  <p class="font-semibold text-white">Desde cualquier lugar</p>
                  <p class="text-teal-100/70">100% responsive</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Columna derecha: tarjeta de login -->
          <div class="flex justify-center lg:justify-end h-full items-center">
            <div class="w-full max-w-sm rounded-3xl bg-white/95 backdrop-blur shadow-2xl p-6">
              <div class="flex items-center gap-3 mb-4">
                <app-logo [size]="32" class="rounded-xl overflow-hidden shrink-0"></app-logo>
                <span class="text-lg font-extrabold text-slate-800">Invexo</span>
              </div>

              <h2 class="text-lg font-bold text-slate-800 mb-0.5">¡Bienvenido de nuevo!</h2>
              <p class="text-xs text-slate-500 mb-4">Inicia sesión para continuar</p>

              <form (ngSubmit)="submit()" class="space-y-3">
                <div>
                  <label class="label-base">Usuario</label>
                  <div class="relative">
                    <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                    <input class="input-base pl-9" type="text" [(ngModel)]="username" name="username" placeholder="admin" required autocomplete="username" />
                  </div>
                </div>
                <div>
                  <label class="label-base">Contraseña</label>
                  <div class="relative">
                    <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      class="input-base pl-9 pr-9"
                      [type]="showPassword() ? 'text' : 'password'"
                      [(ngModel)]="password"
                      name="password"
                      placeholder="••••••••"
                      required
                      autocomplete="current-password"
                    />
                    <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" (click)="showPassword.set(!showPassword())">
                      @if (showPassword()) {
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.6 21.6 0 0 1 5.06-6.06M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a21.7 21.7 0 0 1-3.22 4.44M14.12 14.12a3 3 0 1 1-4.24-4.24" /><path d="M1 1l22 22" />
                        </svg>
                      } @else {
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                        </svg>
                      }
                    </button>
                  </div>
                </div>

                @if (error()) {
                  <p class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ error() }}</p>
                }

                <button type="submit" class="btn-primary w-full">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="M10 17l5-5-5-5" /><path d="M15 12H3" />
                  </svg>
                  Iniciar sesión
                </button>
              </form>

              <div class="relative my-3 text-center">
                <span class="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-slate-200"></span>
                <span class="relative bg-white px-3 text-xs text-slate-400 font-medium">o</span>
              </div>

              <div class="relative">
                <button type="button" class="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                  <svg class="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.49 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.44a5.5 5.5 0 0 1-2.39 3.6v3h3.86c2.26-2.08 3.58-5.15 3.58-8.78z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.86-3c-1.08.72-2.46 1.14-4.07 1.14-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A12 12 0 0 0 12 24z"/>
                    <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.63H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.37z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.28 6.63l3.99 3.09C6.22 6.86 8.87 4.75 12 4.75z"/>
                  </svg>
                  Iniciar con Google
                </button>
                <!-- Botón real de Google, invisible, superpuesto: así el clic lo procesa el SDK de Google
                     pero el usuario ve nuestro botón con el diseño del sistema. -->
                <div #googleBtnContainer class="absolute inset-0 opacity-0 overflow-hidden"></div>
              </div>
              @if (googleError()) {
                <p class="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-2">{{ googleError() }}</p>
              }

              <div class="mt-3 rounded-xl bg-slate-50 border border-slate-100 p-2.5 flex items-start gap-2.5">
                <div class="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div class="text-xs text-slate-600 leading-snug">
                  <p class="font-semibold text-slate-700">Usuarios de prueba</p>
                  <p>Admin — <b>admin</b> / <b>admin123</b> &nbsp;·&nbsp; Vendedor — <b>vendedor</b> / <b>vendedor123</b></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Barra de características -->
        <div class="shrink-0 mt-4 rounded-2xl bg-teal-950/70 border border-white/10 backdrop-blur px-6 py-2.5 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0">
              <svg class="w-3.5 h-3.5 text-teal-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8" /></svg>
            </div>
            <p class="font-semibold text-white text-xs leading-tight">Gestión de productos</p>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0">
              <svg class="w-3.5 h-3.5 text-teal-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <p class="font-semibold text-white text-xs leading-tight">Clientes y proveedores</p>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0">
              <svg class="w-3.5 h-3.5 text-teal-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18M7 15l4-4 3 3 5-6" /></svg>
            </div>
            <p class="font-semibold text-white text-xs leading-tight">Reportes y análisis</p>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0">
              <svg class="w-3.5 h-3.5 text-teal-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM20 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
            </div>
            <p class="font-semibold text-white text-xs leading-tight">Compras y ventas</p>
          </div>
        </div>

        <!-- Footer -->
        <footer class="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-1 pt-2 text-[11px] text-teal-100/60">
          <p>© 2026 Invexo. Todos los derechos reservados.</p>
          <div class="flex items-center gap-4">
            <a href="#" class="hover:text-white transition">Términos de uso</a>
            <a href="#" class="hover:text-white transition">Política de privacidad</a>
            <a href="#" class="hover:text-white transition">Soporte</a>
          </div>
        </footer>
      </div>
    </div>
  `
})
export class LoginComponent implements AfterViewInit {
  @ViewChild('googleBtnContainer') googleBtnContainer!: ElementRef<HTMLDivElement>;

  username = '';
  password = '';
  error = signal('');
  googleError = signal('');
  showPassword = signal(false);

  constructor(private auth: AuthService, private router: Router, private googleAuth: GoogleAuthService) {}

  ngAfterViewInit() {
    this.googleAuth
      .renderButton(this.googleBtnContainer.nativeElement, (profile) => {
        this.auth.loginWithGoogle(profile);
        this.router.navigate(['/dashboard']);
      })
      .catch(() => {
        this.googleError.set(
          'El inicio con Google no está configurado todavía (falta el Client ID en google-config.ts).'
        );
      });
  }

  submit() {
    if (this.auth.login(this.username, this.password)) {
      this.error.set('');
      this.router.navigate(['/dashboard']);
    } else {
      this.error.set('Usuario o contraseña incorrectos.');
    }
  }
}

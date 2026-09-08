import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LogoComponent } from '../../shared/logo.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, LogoComponent],
  template: `
    <div class="min-h-screen relative overflow-hidden bg-gradient-to-br from-teal-950 via-teal-800 to-teal-600 flex items-center justify-center p-6">
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div class="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-teal-400/20 blur-3xl"></div>
        <div class="absolute bottom-0 right-0 w-[26rem] h-[26rem] rounded-full bg-emerald-400/10 blur-3xl"></div>
      </div>

      <div class="relative w-full max-w-sm rounded-3xl bg-white/95 backdrop-blur shadow-2xl p-7">
        <div class="flex items-center gap-3 mb-5">
          <app-logo [size]="36" class="rounded-xl overflow-hidden shrink-0"></app-logo>
          <span class="text-xl font-extrabold text-slate-800">Invexo</span>
        </div>

        <h2 class="text-xl font-bold text-slate-800 mb-1">Crea tu cuenta</h2>
        <p class="text-sm text-slate-500 mb-6">Regístrate para empezar a usar el sistema</p>

        <form (ngSubmit)="submit()" class="space-y-4">
          <div>
            <label class="label-base">Nombre completo</label>
            <input class="input-base" type="text" [(ngModel)]="name" name="name" placeholder="Ej: Juan Pérez" required />
          </div>
          <div>
            <label class="label-base">Nombre de usuario</label>
            <input class="input-base" type="text" [(ngModel)]="username" name="username" placeholder="Ej: juanperez" required />
          </div>
          <div>
            <label class="label-base">Contraseña</label>
            <input class="input-base" type="password" [(ngModel)]="password" name="password" placeholder="Mínimo 6 caracteres" required autocomplete="new-password" />
          </div>
          <div>
            <label class="label-base">Confirmar contraseña</label>
            <input class="input-base" type="password" [(ngModel)]="confirmPassword" name="confirmPassword" placeholder="Repite tu contraseña" required autocomplete="new-password" />
          </div>

          @if (error()) {
            <p class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ error() }}</p>
          }

          <button type="submit" class="btn-primary w-full">Crear cuenta</button>
        </form>

        <p class="text-sm text-slate-500 text-center mt-6">
          ¿Ya tienes cuenta? <a routerLink="/login" class="text-teal-600 font-semibold hover:underline">Inicia sesión</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  name = '';
  username = '';
  password = '';
  confirmPassword = '';
  error = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    if (this.password !== this.confirmPassword) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }
    const result = this.auth.register(this.username, this.password, this.name);
    if (result.ok) {
      this.error.set('');
      this.router.navigate(['/dashboard']);
    } else {
      this.error.set(result.error || 'No se pudo crear la cuenta.');
    }
  }
}

import { Injectable, signal } from '@angular/core';
import { AppUser } from '../models/models';

const STORAGE_KEY = 'tr_current_user';
const USERS_KEY = 'tr_users';

interface StoredUser {
  username: string; // clave única: nombre de usuario o email (en minúsculas)
  password?: string; // no aplica para cuentas iniciadas con Google
  name: string;
  role: 'Administrador' | 'Vendedor';
  provider: 'local' | 'google';
}

function seedUsers(): Record<string, StoredUser> {
  return {
    admin: {
      username: 'admin',
      password: 'admin123',
      name: 'Administrador General',
      role: 'Administrador',
      provider: 'local'
    },
    vendedor: {
      username: 'vendedor',
      password: 'vendedor123',
      name: 'Vendedor de Mostrador',
      role: 'Vendedor',
      provider: 'local'
    }
  };
}

export interface GoogleProfile {
  email: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<AppUser | null>(this.loadCurrent());

  private loadUsers(): Record<string, StoredUser> {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      /* noop */
    }
    const seeded = seedUsers();
    localStorage.setItem(USERS_KEY, JSON.stringify(seeded));
    return seeded;
  }

  private saveUsers(users: Record<string, StoredUser>) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  private loadCurrent(): AppUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AppUser) : null;
    } catch {
      return null;
    }
  }

  private setCurrent(user: AppUser) {
    this.currentUser.set(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  /** Login con usuario/contraseña locales (demo o registrados). */
  login(username: string, password: string): boolean {
    const users = this.loadUsers();
    const record = users[username.trim().toLowerCase()];
    if (record && record.provider === 'local' && record.password === password) {
      this.setCurrent({ username: record.username, name: record.name, role: record.role });
      return true;
    }
    return false;
  }

  /** Crea una cuenta real en el sistema (queda guardada, cualquiera con esas credenciales puede volver a entrar). */
  register(username: string, password: string, name: string): { ok: boolean; error?: string } {
    const key = username.trim().toLowerCase();
    if (!key || !password || !name.trim()) {
      return { ok: false, error: 'Completa todos los campos.' };
    }
    if (password.length < 6) {
      return { ok: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
    }
    const users = this.loadUsers();
    if (users[key]) {
      return { ok: false, error: 'Ese nombre de usuario ya está en uso.' };
    }
    users[key] = { username: key, password, name: name.trim(), role: 'Vendedor', provider: 'local' };
    this.saveUsers(users);
    this.setCurrent({ username: key, name: name.trim(), role: 'Vendedor' });
    return { ok: true };
  }

  /** Login/registro automático a partir de un perfil verificado por Google. */
  loginWithGoogle(profile: GoogleProfile): void {
    const key = profile.email.trim().toLowerCase();
    const users = this.loadUsers();
    if (!users[key]) {
      users[key] = { username: key, name: profile.name, role: 'Vendedor', provider: 'google' };
      this.saveUsers(users);
    }
    const record = users[key];
    this.setCurrent({ username: record.username, name: record.name, role: record.role });
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }
}

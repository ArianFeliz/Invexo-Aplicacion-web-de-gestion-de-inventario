import { Injectable, NgZone } from '@angular/core';
import { GOOGLE_CLIENT_ID } from '../google-config';
import { GoogleProfile } from './auth.service';

declare const google: any;

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private scriptLoaded = false;
  private initialized = false;
  private onCredential: ((profile: GoogleProfile) => void) | null = null;

  constructor(private zone: NgZone) {}

  private loadScript(): Promise<void> {
    if (this.scriptLoaded) return Promise.resolve();
    return new Promise((resolve, reject) => {
      if (document.getElementById('google-identity-script')) {
        this.scriptLoaded = true;
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-identity-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('No se pudo cargar el script de inicio de sesión de Google.'));
      document.head.appendChild(script);
    });
  }

  private decodeJwt(token: string): { email: string; name: string } {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const data = JSON.parse(decoded);
    return { email: data.email, name: data.name };
  }

  private async ensureInitialized(onCredential: (profile: GoogleProfile) => void): Promise<void> {
    this.onCredential = onCredential;
    await this.loadScript();
    if (!this.initialized) {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: { credential: string }) => {
          const profile = this.decodeJwt(response.credential);
          // Volvemos a la zona de Angular para que la UI se actualice correctamente.
          this.zone.run(() => this.onCredential?.(profile));
        }
      });
      this.initialized = true;
    }
  }

  /**
   * Dibuja el botón oficial de Google dentro del elemento dado.
   * Lo usamos superpuesto (invisible) sobre nuestro botón con el diseño del sistema,
   * para que el clic real lo reciba el botón de Google (así lo exige su SDK)
   * pero el usuario vea nuestro estilo.
   */
  async renderButton(container: HTMLElement, onCredential: (profile: GoogleProfile) => void): Promise<void> {
    await this.ensureInitialized(onCredential);
    container.innerHTML = '';
    google.accounts.id.renderButton(container, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      width: container.offsetWidth || 320
    });
  }
}

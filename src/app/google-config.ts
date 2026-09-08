/**
 * Para que "Iniciar con Google" funcione de verdad, necesitas tu propio
 * Client ID de Google (es gratis y toma unos minutos crearlo):
 *
 * 1. Ve a https://console.cloud.google.com/apis/credentials
 * 2. Crea un proyecto (o usa uno existente).
 * 3. Configura la "Pantalla de consentimiento de OAuth" (tipo Externo está bien
 *    para pruebas — no hace falta publicarla para que tú y usuarios de prueba
 *    puedan entrar).
 * 4. En "Credenciales" → "Crear credenciales" → "ID de cliente de OAuth".
 *    - Tipo de aplicación: "Aplicación web"
 *    - En "Orígenes de JavaScript autorizados" agrega la URL donde corres
 *      la app, por ejemplo: http://localhost:4200
 *      (y luego, cuando la subas a producción, agrega también esa URL real)
 * 5. Copia el Client ID que te da Google (termina en .apps.googleusercontent.com)
 *    y pégalo abajo, reemplazando el valor de ejemplo.
 */
export const GOOGLE_CLIENT_ID = 'TU_CLIENT_ID_DE_GOOGLE.apps.googleusercontent.com';

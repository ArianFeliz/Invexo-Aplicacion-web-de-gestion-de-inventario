# Invexo 📦

Sistema de gestión de negocio / inventario construido con **Angular 17** (standalone components) y **Tailwind CSS**. Incluye productos con foto, categorías, proveedores, clientes, ventas (punto de venta), compras, control de stock con alertas y reportes.

## Requisitos

- Node.js 18.13 o superior (recomendado Node 20 LTS)
- npm 9+

## Instalación

```bash
cd invexo
npm install
```

## Ejecutar en desarrollo

```bash
npm start
```

Esto abrirá automáticamente `http://localhost:4200` en tu navegador.

## Usuarios de prueba

| Usuario     | Contraseña   | Rol            |
|-------------|--------------|----------------|
| `admin`     | `admin123`   | Administrador  |
| `vendedor`  | `vendedor123`| Vendedor       |

También puedes crear una cuenta real desde el botón **"Regístrate"** en el login — queda guardada en el sistema (localStorage) y podrás volver a entrar con ese usuario y contraseña.

## Activar "Iniciar con Google"

El botón de Google ya está conectado en el código, pero por seguridad Google exige que cada aplicación tenga su **propio Client ID** — no hay forma de dejarlo funcionando de fábrica sin que tú lo configures. Son 5 minutos:

1. Ve a [Google Cloud Console → Credenciales](https://console.cloud.google.com/apis/credentials).
2. Crea un proyecto (o usa uno existente).
3. Configura la "Pantalla de consentimiento de OAuth" (tipo **Externo** está bien para pruebas).
4. En **Credenciales → Crear credenciales → ID de cliente de OAuth**:
   - Tipo de aplicación: **Aplicación web**
   - En "Orígenes de JavaScript autorizados" agrega `http://localhost:4200`
     y, si vas a publicarlo en GitHub Pages, agrega también `https://TU_USUARIO.github.io`
5. Copia el Client ID que te da Google (termina en `.apps.googleusercontent.com`).
6. Pégalo en `src/app/google-config.ts`, reemplazando el valor de ejemplo.

Mientras no configures tu Client ID real, el botón mostrará un aviso indicando que falta configurarlo — el resto del sistema sigue funcionando normal.

## Módulos incluidos

- **Dashboard**: KPIs del negocio, ventas del día, alertas de stock bajo.
- **Productos**: alta/edición/eliminación con foto (subida desde tu equipo), SKU, categoría, proveedor, precio de costo/venta, stock y stock mínimo. Ajuste manual de stock con motivo (para conteos físicos, mermas, devoluciones, etc.).
- **Categorías**: organización del catálogo con color identificador.
- **Proveedores**: directorio de proveedores y contacto.
- **Clientes**: base de datos de clientes y total histórico comprado.
- **Ventas**: punto de venta simple — agrega productos al carrito, selecciona cliente y método de pago, registra la venta (descuenta stock automáticamente) o cancela ventas (devuelve el stock).
- **Compras**: registro de compras a proveedores que incrementa el stock automáticamente al recibirse.
- **Reportes**: ingresos, costo de mercancía vendida, ganancia bruta, productos más vendidos y valor de inventario por categoría.

## Persistencia de datos

Esta versión guarda toda la información en el **localStorage del navegador** (no requiere backend ni base de datos para funcionar). Esto es ideal para probar y demostrar el sistema de inmediato. Si más adelante quieres conectarlo a una base de datos real (por ejemplo con un backend en Node/Express, NestJS o Firebase), el único archivo que necesitas reemplazar es `src/app/services/data.service.ts` — ahí está encapsulada toda la lógica de guardado/lectura.

## Paleta de colores

El tema usa una paleta verde azulado (teal) personalizada definida en `tailwind.config.js`, combinada con blanco, tal como se solicitó.

## Estructura del proyecto

```
src/app/
  models/       -> Interfaces de datos (Product, Category, Sale, etc.)
  services/     -> DataService (persistencia), AuthService (login), ToastService (notificaciones)
  guards/       -> authGuard (protege las rutas internas)
  layout/       -> Sidebar + topbar de la aplicación
  pages/        -> Un componente standalone por módulo (dashboard, products, sales, etc.)
```

## Subir a GitHub y publicarlo para que cualquiera pueda entrar

Este repositorio ya trae listo un flujo automático (`.github/workflows/deploy.yml`) que compila la app y la publica en **GitHub Pages** cada vez que subas cambios a la rama `main`. Solo tienes que hacer esto una vez:

1. Crea un repositorio nuevo en GitHub (por ejemplo `invexo`), vacío, sin README ni .gitignore (ya los trae el proyecto).
2. Desde la carpeta del proyecto, en tu terminal:
   ```bash
   git init
   git add .
   git commit -m "Primera versión de Invexo"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/invexo.git
   git push -u origin main
   ```
3. En GitHub, ve a **Settings → Pages** de tu repositorio, y en "Build and deployment" selecciona **Source: GitHub Actions** (solo la primera vez).
4. Espera 1-2 minutos — en la pestaña **Actions** de tu repo verás el proceso corriendo. Cuando termine en verde ✅, tu app estará disponible en:
   ```
   https://TU_USUARIO.github.io/invexo/
   ```
5. Comparte ese link — cualquier persona podrá entrar y usar el sistema (con los usuarios de prueba, o creando su cuenta con "Regístrate").

**Importante sobre los datos:** como el sistema guarda todo en el `localStorage` del navegador (ver sección "Persistencia de datos" abajo), cada persona que entre tendrá **su propia copia independiente** de productos, ventas, etc. — no comparten los mismos datos entre sí. Eso es perfecto para un portafolio (cada visitante prueba el sistema "limpio"), pero si más adelante quieres que todos vean los mismos datos reales de un negocio, hace falta conectar una base de datos real (lo menciono en "Próximos pasos" abajo).

Cada vez que quieras subir un cambio nuevo después de esta primera vez, solo necesitas:
```bash
git add .
git commit -m "Descripción del cambio"
git push
```
Y la publicación se actualiza sola.



- Conectar a un backend real (API REST o Firebase) reemplazando `DataService`.
- Agregar exportación de reportes a PDF/Excel.
- Roles y permisos más granulares (ya existe la base con `AuthService`).
- Impresión de tickets/facturas de venta.

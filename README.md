Invexo 📦

Aplicación web de gestión de inventario y punto de venta, hecha con Angular 17 y Tailwind CSS.

🧪 Estado: Beta — funcional, pero puede tener bugs (ej. imágenes de productos pesadas pueden llenar el almacenamiento local).

🔗 Demo: https://ArianFeliz.github.io/Invexo-Aplicacion-web-de-gestion-de-inventario/

---Qué tiene
Dashboard con estadísticas
Productos (con foto, SKU, stock, categoría, proveedor)
Categorías, Proveedores, Clientes
Ventas con carrito y factura imprimible/PDF
Compras (actualiza stock automático)
Reportes (ingresos, ganancia, más vendidos)
Login, registro real, e inicio con Google

---Estructura
src/app/
  models/     -> Interfaces de datos
  services/   -> Lógica (data, auth, google-auth, toast)
  guards/     -> Protección de rutas
  layout/     -> Sidebar + topbar
  shared/     -> Logo reutilizable
  pages/      -> Un componente por módulo (login, dashboard, productos, ventas, etc.)
  
---Uso local
bash
git clone https://github.com/ArianFeliz/Invexo-Aplicacion-web-de-gestion-de-inventario.git
cd Invexo-Aplicacion-web-de-gestion-de-inventario
npm install
npm start

---Usuarios de prueba
Usuario	Contraseña	Rol
admin	   admin123  	Administrador
vendedor	vendedor123	Vendedor

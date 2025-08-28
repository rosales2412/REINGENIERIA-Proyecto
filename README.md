# POS Práctica (MySQL + Express + JS)

Sistema de punto de venta simple para práctica académica. Incluye CRUD de **Usuarios, Clientes y Productos**,
registro de **Ventas** (con descuento de inventario de productos), y **frontend** en HTML/CSS/JS.

## Requisitos
- Node.js 18+
- MySQL 8+

## Instalación backend
```bash
cd backend
cp .env.example .env   # Ajusta credenciales
npm install
# Crear BD + tablas
mysql -u root -p < ../schema.sql
# Datos demo (50+ registros entre tablas)
mysql -u root -p < ../seed.sql
npm run dev
npx http-server -p 5500
```
La API quedará en `http://localhost:3000`.

## Endpoints
- `GET /api/users` `POST /api/users` `GET /api/users/:id` `PUT /api/users/:id` `DELETE /api/users/:id`
- `GET /api/customers` `POST /api/customers` `GET /api/customers/:id` `PUT /api/customers/:id` `DELETE /api/customers/:id`
- `GET /api/products` `POST /api/products` `GET /api/products/:id` `PUT /api/products/:id` `DELETE /api/products/:id`
- `GET /api/sales` `GET /api/sales/:id` `POST /api/sales` (body: `{ customer_id?, items:[{product_id, qty, price?}] }`) `DELETE /api/sales/:id`

> Nota: Eliminar una venta *no* reingresa el stock (simple para práctica).

## Frontend
Abre `frontend/index.html` en tu navegador. Por seguridad CORS, asegúrate que el backend esté corriendo en `http://localhost:3000`.

El frontend incluye:
- Pestañas para **Usuarios, Clientes, Productos y Ventas**
- Formularios simples + tablas
- Ventas con selección de cliente, productos e ítems múltiples, cálculo de total y descuento automático de stock

## Estructura
```
pos-practica/
  backend/
    src/
      routes/
        users.js
        customers.js
        products.js
        sales.js
      db.js
      server.js
    package.json
    .env.example
  frontend/
    index.html
    styles.css
    app.js
  schema.sql
  seed.sql
```

## Sugerencias (opcional)
- Agregar autenticación (JWT) y roles.
- Restock al eliminar venta con transacción inversa.
- Reportes por fecha / producto / cliente.
- Paginación, búsqueda y filtros en tablas.

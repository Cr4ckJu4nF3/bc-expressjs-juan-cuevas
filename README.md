# 🚀 Proyecto Semana 04: Validación, Errores y Logging

## 🎯 Objetivo

Integrar **validación de datos con Zod**, **manejo estructurado de errores con AppError** y
**logging profesional con Winston + Morgan** en la API del dominio que te fue asignado.

## 📋 Tu Dominio Asignado

> **Dominio**: _El instructor te asignará tu dominio (Biblioteca, Farmacia, Gimnasio, etc.)_

Adapta el código genérico del `starter/` a tu dominio. Todos los nombres genéricos
(`Item`, `items`) deben reemplazarse con los términos correspondientes a tu dominio.

**Ejemplos de adaptación:**

| Dominio | Recurso principal | Campos de ejemplo |
|---|---|---|
| Biblioteca | Book | title, author, isbn, stock |
| Farmacia | Medicine | name, dosage, price, stock |
| Gimnasio | Member | name, email, plan, joinedAt |
| Restaurante | Dish | name, category, price, available |

---

## ✅ Requisitos Funcionales

### 1. Validación con Zod
- Schema de creación (`createItemSchema`) con validaciones apropiadas al dominio
- Schema de actualización (`updateItemSchema`) reutilizando `.partial()`
- Tipos TypeScript inferidos con `z.infer<>`
- Validación activa en controladores con `.safeParse()` — respuesta 400 con `issues[]`
- Validación del parámetro `:id` con `z.coerce.number().int().positive()`

### 2. Manejo de errores estructurado
- Clase `AppError` con `statusCode` e `isOperational`
- Servicio lanza `AppError(404, ...)` cuando el recurso no existe
- Middleware `notFound` registrado antes del `errorHandler`
- Middleware `errorHandler` con **exactamente 4 parámetros**
- `errorHandler` distingue `ZodError → 400`, `AppError → statusCode`, genérico → 500
- `next(err)` en todos los bloques `try/catch` de los controladores

### 3. Logging profesional
- Logger Winston configurado en `src/config/logger.ts`
  - Nivel `http` en desarrollo, `warn` en producción
  - Formato colorizado en desarrollo, JSON en producción
  - Transport de archivo `logs/error.log` solo en producción
- Morgan integrado como middleware con la stream de Winston
- Al menos un `logger.info()` al iniciar el servidor
- Al menos un `logger.warn()` en el `errorHandler` para errores AppError
- `console.log` reemplazados por `logger.*`

### 4. Arquitectura en capas
- Rutas → Controladores → Servicios → Repositorios
- Toda la lógica de negocio en el servicio, no en el controlador
- Paginación en el endpoint de listado (`page` y `limit` como query params)

---

## 🛠️ Estructura del starter

```
starter/src/
├── config/
│   └── logger.ts          ← TODO: Winston logger + morganMiddleware
├── errors/
│   └── AppError.ts        ← TODO: clase AppError
├── middlewares/
│   ├── errorHandler.ts    ← TODO: 4-param error handler
│   └── notFound.ts        ← TODO: 404 middleware
├── schemas/
│   └── item.schema.ts     ← TODO: createItemSchema + updateItemSchema
├── repositories/
│   └── items.repository.ts ← TODO: CRUD en memoria
├── services/
│   └── items.service.ts   ← TODO: lógica de negocio con AppError
├── controllers/
│   └── items.controller.ts ← TODO: thin controller con next(err)
├── routes/
│   └── items.routes.ts    ← TODO: registrar endpoints
├── types.ts               ← TODO: Item entity + tipos de respuesta
├── app.ts                 ← TODO: setup Express + orden correcto
└── server.ts              ← TODO: bootstrap + logger.info
```

---

## 💡 Ejemplos de adaptación por dominio

### Biblioteca — campo adicional opcional

```ts
// src/schemas/item.schema.ts (adaptado a Book)
export const createItemSchema = z.object({
  title: z.string().min(1).trim(),
  author: z.string().min(1).trim(),
  isbn: z.string().regex(/^\d{13}$/, 'ISBN debe tener 13 dígitos'),
  stock: z.number().int().nonnegative().default(0),
});
```

### Farmacia — validación de precio y dosificación

```ts
// src/schemas/item.schema.ts (adaptado a Medicine)
export const createItemSchema = z.object({
  name: z.string().min(1).trim(),
  dosage: z.string().min(1, 'Especifica la dosificación (ej: 500mg)'),
  price: z.number().positive('El precio debe ser mayor a 0'),
  stock: z.number().int().nonnegative().default(0),
});
```

---

## 📊 Endpoints requeridos

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/v1/items` | Listar con paginación |
| `GET` | `/api/v1/items/:id` | Obtener por id |
| `POST` | `/api/v1/items` | Crear validando con Zod |
| `PUT` | `/api/v1/items/:id` | Actualizar (campos opcionales) |
| `DELETE` | `/api/v1/items/:id` | Eliminar |

---

## 🛠️ Entregables

1. **API funcional** con todos los endpoints del dominio
2. **Capturas de Postman/Thunder Client** demostrando:
   - `POST` con body inválido → 400 con `issues[]`
   - `GET /:id` con id no numérico → 400
   - `GET /:id` con id inexistente → 404
   - `GET /ruta-inexistente` → 404 JSON (no HTML)
   - Logs en consola visibles
3. **README.md** dentro de tu entrega describiendo:
   - Dominio asignado y recurso principal
   - Campos del schema y sus validaciones
   - Cómo ejecutar el proyecto (`pnpm dev`)

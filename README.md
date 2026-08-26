# 🚀 API REST — Campañas de Marketing Digital (Arquitectura en Capas)

## 🎯 Objetivo

Refactorizar la API de la Semana 02 aplicando una **arquitectura en 4 capas** (`routes → controllers → services → repositories`), con contratos de respuesta consistentes y paginación real, usando **Express 5** y **TypeScript**.

Este proyecto es la continuación directa de la Semana 02: mismo dominio y mismo recurso (`Campaign`), pero ahora la lógica está separada por responsabilidad en vez de vivir toda junta en el archivo de rutas.

---

## 📋 Dominio del proyecto

**Recurso principal**: `Campaign` — una campaña publicitaria de un cliente de la agencia, corriendo en un canal específico.

```typescript
interface Campaign {
  id: number;
  name: string;
  client: string;
  channel: string;
  budget: number;
  active: boolean;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
  };
  createdAt: string;
}
```

Los datos siguen viviendo en memoria, pero ahora el acceso está aislado en una sola capa (`repository`), para que el día que se reemplace por una base de datos real (Semana 05), nada más que ese archivo cambie.

---

## ✅ Qué se implementó

### 1. Repository (`src/repositories/campaigns.repository.ts`)

Único punto de acceso al store en memoria. Devuelve siempre copias defensivas (`{ ...campaign }`) para que nadie fuera de esta capa pueda mutar el array interno por accidente.

### 2. Service (`src/services/campaigns.service.ts`)

Contiene la lógica de negocio: cálculo de paginación (`page`, `limit`), y una regla de dominio (`budget` no puede ser negativo). **Cero imports de Express** — es 100% testeable de forma aislada.

### 3. Controller (`src/controllers/campaigns.controller.ts`)

Hace solo tres cosas por endpoint: extrae datos de `req`, llama al service, responde con `res`. No contiene lógica de negocio ni toca el store.

### 4. Routes (`src/routes/campaigns.routes.ts`)

Mapea las 5 URLs del recurso a sus controllers correspondientes. Sin lógica.

### 5. Contratos de respuesta (`src/types.ts`)

`SingleResponse<T>`, `PaginatedResponse<T>` y `ErrorResponse` genéricos, reutilizados en todos los endpoints para que la forma de la respuesta sea siempre predecible.

| Método | Ruta | Descripción | Status |
|--------|------|-------------|--------|
| `GET` | `/api/v1/campaigns?page=&limit=` | Lista paginada | `200` |
| `GET` | `/api/v1/campaigns/:id` | Obtiene una campaña | `200` / `404` |
| `POST` | `/api/v1/campaigns` | Crea una campaña | `201` |
| `PUT` | `/api/v1/campaigns/:id` | Actualiza una campaña | `200` / `404` |
| `DELETE` | `/api/v1/campaigns/:id` | Elimina una campaña | `204` / `404` |

---

## 🧠 Decisiones de diseño

- **Separación estricta por capa**: `repository` no sabe de HTTP, `service` no sabe de Express, `controller` no sabe de negocio. Cada capa se puede reemplazar o testear sola.
- **Copias defensivas en el repository**: `findAll()`, `create()` y `update()` devuelven `{ ...campaign }` en vez de la referencia interna, para evitar mutaciones accidentales desde capas superiores.
- **Validación de negocio con `Error` genérico (a propósito, por ahora)**: el service lanza `Error('budget must be a non-negative number')` si el presupuesto es negativo. Como no es un `AppError` con `statusCode`, el error handler global lo captura como **500** en vez de un **400** más apropiado. Esto queda intencionalmente así — es exactamente el problema que la Semana 04 resuelve con una clase de error personalizada.
- **Paginación en el service, no en el repository**: el repository siempre devuelve todo el array; el `slice` de paginación ocurre en el service, que es donde vive la lógica de negocio.

---

## 🛠️ Cómo correr el proyecto

```bash
cd 3-proyecto/starter
npm install
npm run dev
```

El servidor arranca en `http://localhost:3000`.

```bash
npm run build   # compila a dist/
npm start       # corre la versión compilada
```

---

## 🧪 Pruebas realizadas

```bash
# Listar con paginación
curl "http://localhost:3000/api/v1/campaigns?page=1&limit=2"
# → { "data": [...2 campañas...], "total": 3, "page": 1, "limit": 2 }

# Obtener por ID
curl http://localhost:3000/api/v1/campaigns/1
# → { "data": { "id": 1, "name": "Verano Rebajas 2026", ... } }

# ID inexistente
curl http://localhost:3000/api/v1/campaigns/999
# → 404 { "error": "Not Found", "message": "Campaign 999 not found" }

# Crear campaña válida
curl -X POST http://localhost:3000/api/v1/campaigns \
  -H "Content-Type: application/json" \
  -d '{"name":"Challenge Viral","client":"Bella Cosmetics","channel":"TikTok","budget":2200,"active":true,"metrics":{"impressions":0,"clicks":0,"conversions":0}}'
# → 201 + la campaña creada con id autogenerado

# Budget negativo — 500 (ver nota de diseño arriba)
curl -X POST http://localhost:3000/api/v1/campaigns \
  -H "Content-Type: application/json" \
  -d '{"name":"Mal presupuesto","client":"X","channel":"Email","budget":-100,"active":true,"metrics":{"impressions":0,"clicks":0,"conversions":0}}'
# → 500 { "error": "Internal Server Error", "message": "budget must be a non-negative number" }

# Actualizar
curl -X PUT http://localhost:3000/api/v1/campaigns/1 -H "Content-Type: application/json" -d '{"budget":3000}'
# → 200 + campaña con budget actualizado

# Eliminar
curl -X DELETE http://localhost:3000/api/v1/campaigns/2
# → 204 sin body
```

Todos los casos fueron verificados manualmente contra el servidor real antes de dar por completado el ejercicio.

---

## 📂 Estructura

```
starter/
├── package.json
├── tsconfig.json
├── .env.example
└── src/
    ├── app.ts                            # Configuración de Express + middlewares
    ├── server.ts                         # Entry point
    ├── types.ts                          # Campaign, DTOs, contratos de respuesta
    ├── repositories/
    │   └── campaigns.repository.ts       # Acceso a datos (en memoria)
    ├── services/
    │   └── campaigns.service.ts          # Lógica de negocio + paginación
    ├── controllers/
    │   └── campaigns.controller.ts       # Interfaz HTTP
    └── routes/
        └── campaigns.routes.ts           # Mapeo de rutas
```

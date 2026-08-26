# 🚀 API REST — Campañas de Marketing Digital (Validación, Errores y Logging)

## 🎯 Objetivo

Extender la API en capas de la Semana 03 agregando **validación de entradas con Zod**, **manejo estructurado de errores con `AppError`** y **logging profesional con Winston + Morgan**, usando **Express 5** y **TypeScript**.

Este proyecto resuelve, de forma explícita, el problema que quedó pendiente en la Semana 03: la validación de negocio ahora responde con el código HTTP correcto (400) en vez de un 500 genérico.

---

## 📋 Dominio del proyecto

**Recurso principal**: `Campaign` — igual que en semanas anteriores, con `client`, `channel`, `budget`, `active` y `metrics`.

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
  createdAt: Date;
}
```

---

## ✅ Qué se implementó

### 1. Validación con Zod (`src/schemas/campaign.schema.ts`)

`createCampaignSchema` valida los 5 campos de negocio (`name`, `client`, `channel` no vacíos; `budget` positivo; `metrics` con enteros no negativos), con `active` y `metrics` por defecto si no se envían. `updateCampaignSchema` reutiliza los mismos campos como opcionales para actualizaciones parciales. Los DTOs (`CreateCampaignDto`, `UpdateCampaignDto`) se infieren con `z.infer<>` — el schema es la única fuente de verdad.

**Detalle de diseño importante**: el schema base (`campaignShape`) está separado del que aplica `.default()`, porque en Zod `.partial()` **no anula** `.default()` — si no fuera por esta separación, un `PUT` parcial que no envía `active` lo pisaría con el valor por defecto en vez de conservar el existente.

### 2. Errores estructurados (`src/errors/AppError.ts`, `src/middlewares/`)

- `AppError`: clase con `statusCode` e `isOperational`, para errores esperados del dominio (`throw new AppError(404, ...)`)
- `notFound`: middleware de 3 parámetros que captura cualquier ruta no definida
- `errorHandler`: middleware de 4 parámetros (obligatorio para que Express lo reconozca como error handler) que distingue `ZodError → 400`, `AppError → su propio statusCode`, y errores genéricos → `500` (sin stack trace en producción)

### 3. Logging con Winston + Morgan (`src/config/logger.ts`)

- Nivel `http` en desarrollo, `warn` en producción (menos ruido)
- Formato coloreado y legible en consola durante desarrollo; JSON estructurado en producción
- Transport de archivo (`logs/error.log`) que **solo se activa en producción**, y solo para nivel `error`
- Morgan conectado al logger vía un `stream` personalizado, así cada request HTTP pasa por Winston en vez de loguearse por separado

| Método | Ruta | Descripción | Status |
|--------|------|-------------|--------|
| `GET` | `/api/v1/campaigns?page=&limit=` | Lista paginada | `200` |
| `GET` | `/api/v1/campaigns/:id` | Obtiene una campaña | `200` / `400` / `404` |
| `POST` | `/api/v1/campaigns` | Crea validando con Zod | `201` / `400` |
| `PUT` | `/api/v1/campaigns/:id` | Actualiza (parcial) | `200` / `400` / `404` |
| `DELETE` | `/api/v1/campaigns/:id` | Elimina | `204` / `400` / `404` |

---

## 🧠 Decisiones de diseño

- **`campaignShape` sin `.default()` como base**: evita que `updateCampaignSchema.partial()` inyecte valores por defecto en campos no enviados (bug real de Zod, verificado con pruebas).
- **`AppError` en vez de `Error` genérico** para los 404 del service: esto es lo que permite que el `errorHandler` global responda con el `statusCode` correcto en vez de un 500 catch-all — la mejora directa sobre la Semana 03.
- **`logger.warn()` para `AppError`, `logger.error()` con stack para errores no controlados**: separa "esto era esperado" de "esto rompió algo", que es justamente para lo que sirven los niveles de un logger.
- **File transport solo en producción**: en desarrollo todo va a consola (más rápido de iterar); en producción los errores además quedan persistidos en `logs/error.log` para poder revisarlos después de que ocurrieron.

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
npm start       # corre la versión compilada (respeta NODE_ENV)
```

---

## 🧪 Pruebas realizadas

```bash
# Body inválido → 400 con issues descriptivos
curl -X POST http://localhost:3000/api/v1/campaigns \
  -H "Content-Type: application/json" -d '{"name":"","budget":-50}'
# → 400 { "error": "Validation Error", "issues": [{ "field": "name", ... }, { "field": "budget", ... }] }

# :id no numérico → 400
curl http://localhost:3000/api/v1/campaigns/abc
# → 400 { "error": "Validation Error", "message": "Parámetro inválido", "issues": [...] }

# Campaña inexistente → 404 vía AppError
curl http://localhost:3000/api/v1/campaigns/999
# → 404 { "error": "Application Error", "message": "Campaign 999 not found" }

# Ruta inexistente → 404 JSON (no HTML)
curl http://localhost:3000/ruta-rara
# → 404 { "error": "Application Error", "message": "Ruta GET /ruta-rara no encontrada" }

# Crear válida, sin active/metrics → defaults aplicados
curl -X POST http://localhost:3000/api/v1/campaigns \
  -H "Content-Type: application/json" \
  -d '{"name":"Challenge Viral","client":"Bella Cosmetics","channel":"TikTok","budget":2200}'
# → 201 { "data": { ..., "active": true, "metrics": { "impressions": 0, "clicks": 0, "conversions": 0 } } }

# PUT parcial → NO pisa active/metrics existentes con los defaults
curl -X PUT http://localhost:3000/api/v1/campaigns/1 -H "Content-Type: application/json" -d '{"budget":3000}'
# → 200 { "data": { ..., "budget": 3000, "active": true, "metrics": { ...valores originales... } } }
```

Verificado también en modo producción (`NODE_ENV=production`): los logs de consola pasan a JSON, y un error 500 real (JSON malformado en el body) queda registrado con su stack completo en `logs/error.log`, mientras que la respuesta al cliente oculta esos detalles.

---

## 📂 Estructura

```
starter/
├── package.json
├── tsconfig.json
├── .env.example
└── src/
    ├── app.ts                            # Configuración de Express + orden de middlewares
    ├── server.ts                         # Entry point + logger.info al arrancar
    ├── types.ts                          # Campaign, contratos de respuesta
    ├── config/
    │   └── logger.ts                     # Winston + integración con Morgan
    ├── errors/
    │   └── AppError.ts                   # Clase de errores operacionales
    ├── middlewares/
    │   ├── notFound.ts                   # 404 para rutas no definidas
    │   └── errorHandler.ts               # Manejador global (4 params)
    ├── schemas/
    │   └── campaign.schema.ts            # Validación Zod + DTOs inferidos
    ├── repositories/
    │   └── campaigns.repository.ts       # Acceso a datos (en memoria)
    ├── services/
    │   └── campaigns.service.ts          # Lógica de negocio
    ├── controllers/
    │   └── campaigns.controller.ts       # Interfaz HTTP
    └── routes/
        └── campaigns.routes.ts           # Mapeo de rutas
```

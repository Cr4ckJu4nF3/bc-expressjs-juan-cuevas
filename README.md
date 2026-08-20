# 🚀 API REST — Gestión de Campañas de Marketing Digital

## 🎯 Objetivo

API REST construida con **Express 5** y **TypeScript** para gestionar las campañas de una agencia de marketing digital: alta, consulta, actualización y baja de campañas, con validación de errores y códigos de estado HTTP correctos.

Este proyecto es la continuación del procesador de campañas de la Semana 01: mismo dominio y mismo recurso (`Campaign`), pero acá pasa de ser un script que corre una vez y termina, a un **servidor que queda corriendo y atiende peticiones HTTP** en tiempo real.

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
}
```

Los datos **no vienen de un archivo** como en la Semana 01 — viven en un array en memoria (`store.ts`) que se llena a medida que se crean campañas vía `POST`. Se reinicia cada vez que se reinicia el servidor (a partir de la Semana 05 del bootcamp se reemplaza por una base de datos real).

---

## ✅ Qué se implementó

### 1. Endpoints CRUD (`src/routes/campaigns.routes.ts`)

| Método | Ruta | Descripción | Status |
|--------|------|-------------|--------|
| `GET` | `/api/v1/campaigns` | Lista todas las campañas | `200` |
| `GET` | `/api/v1/campaigns/:id` | Obtiene una campaña por ID | `200` / `404` |
| `POST` | `/api/v1/campaigns` | Crea una nueva campaña | `201` |
| `PUT` | `/api/v1/campaigns/:id` | Actualiza una campaña existente | `200` / `404` |
| `DELETE` | `/api/v1/campaigns/:id` | Elimina una campaña | `204` / `404` |

Extra: `GET /health` para verificar que el servidor está corriendo.

### 2. Store en memoria (`src/store.ts`)

Cinco funciones puras que encapsulan el acceso a los datos, separadas del código de las rutas:

- `getAll()`, `getById(id)`, `create(dto)`, `update(id, dto)`, `remove(id)`

El `id` se autogenera con un contador (`nextId++`) en cada `create`.

### 3. Cadena de middlewares (`src/app.ts`)

Registrados en este orden exacto — el orden importa porque cada `req` pasa por ellos secuencialmente:

1. `express.json()` — parsea el body de las peticiones
2. **Logger** — imprime `[MÉTODO] /ruta → status (Xms)` de cada petición
3. Rutas (`/health` y `/api/v1/campaigns`)
4. Handler `404` — para cualquier ruta no definida
5. **Error handler global** (4 parámetros) — captura cualquier error no manejado, siempre al final

### 4. Graceful shutdown (`src/server.ts`)

El servidor escucha `SIGTERM` y `SIGINT` (por ejemplo, al hacer `Ctrl+C` o al redeployar) y cierra las conexiones de forma ordenada con `server.close()` en vez de cortar peticiones en curso abruptamente.

---

## 🧠 Decisiones de diseño

- **`id: number` en vez de `string`**: en la Semana 01 los IDs eran strings tipo `"c001"` (venían fijos del JSON). Acá se autogeneran con un contador incremental, así que se usa `number` — es más simple de manejar con `req.params.id` y comparaciones de array.
- **Separación store / routes**: la lógica de acceso a datos vive en `store.ts`, no dentro de los handlers de las rutas. Si mañana se reemplaza el array en memoria por una base de datos, solo cambia `store.ts` — las rutas no se tocan.
- **DTOs separados del modelo** (`CreateCampaignDto`, `UpdateCampaignDto`): `CreateCampaignDto` excluye el `id` (se genera solo), y `UpdateCampaignDto` hace todos los campos opcionales con `Partial<>` para permitir actualizaciones parciales.
- **Un solo error handler global**: en vez de manejar errores en cada ruta individualmente, cualquier error se propaga hasta el middleware de 4 parámetros al final de la cadena.

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
# Health check
curl http://localhost:3000/health
# → { "status": "ok" }

# Listar campañas (vacío al inicio)
curl http://localhost:3000/api/v1/campaigns
# → []

# Crear una campaña
curl -X POST http://localhost:3000/api/v1/campaigns \
  -H "Content-Type: application/json" \
  -d '{"name":"Lanzamiento Otoño","client":"Moda Urbana","channel":"Instagram","budget":1800,"active":true,"metrics":{"impressions":0,"clicks":0,"conversions":0}}'
# → 201 + la campaña creada con id: 1

# Obtener por ID
curl http://localhost:3000/api/v1/campaigns/1
# → 200 + la campaña

# Actualizar (parcial)
curl -X PUT http://localhost:3000/api/v1/campaigns/1 \
  -H "Content-Type: application/json" \
  -d '{"budget":2200}'
# → 200 + campaña con budget actualizado

# ID inexistente
curl http://localhost:3000/api/v1/campaigns/999
# → 404 { "error": "Campaign not found" }

# Eliminar
curl -X DELETE http://localhost:3000/api/v1/campaigns/1
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
    ├── app.ts                       # Configuración de Express + middlewares
    ├── server.ts                    # Entry point + graceful shutdown
    ├── types.ts                     # Campaign, CreateCampaignDto, UpdateCampaignDto
    ├── store.ts                     # CRUD en memoria
    └── routes/
        └── campaigns.routes.ts      # 5 endpoints del recurso
```

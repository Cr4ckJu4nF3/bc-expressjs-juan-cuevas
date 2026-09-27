# 🚀 Proyecto Semana 06 — API con MongoDB y Mongoose

## 🎯 Dominio: Agencia de Marketing Digital

Esta semana se mantiene todo lo de la semana 05 (Postgres + Prisma: `Client`, `Campaign`)
y se agrega una segunda base de datos, MongoDB, para un recurso cuya forma cambia
según el canal: **`Metric`**, el rendimiento diario de una campaña en un canal.

### ¿Por qué Mongo y no una tabla más en Postgres?

Cada canal reporta datos distintos: Instagram/Facebook dan likes y reacciones,
TikTok da video views y watch time, Email da open rate y bounce rate. Modelarlo
en Postgres obligaría a una tabla con muchas columnas nulas o a una tabla EAV.
En Mongo, ese detalle variable vive en un campo `extra` (`Mixed`), sin perder
estructura en los campos comunes (`impressions`, `clicks`, `conversions`, `spend`).

## 🗂️ Entidades

```
Client (Postgres) 1───N Campaign (Postgres)
                          │
                          │ campaignId (string, sin FK real entre motores)
                          ▼
                       Metric (MongoDB)
                       ├─ channel
                       ├─ date
                       ├─ impressions / clicks / conversions / spend
                       └─ extra (forma libre según canal)
```

## ✅ Endpoints nuevos

| Método | Ruta | Descripción | Status |
|--------|------|-------------|--------|
| GET | `/api/v1/metrics` | Listado paginado, filtrable por `?campaignId=` y `?channel=` | 200 |
| GET | `/api/v1/metrics/:id` | Detalle de una métrica | 200 / 400 / 404 |
| POST | `/api/v1/metrics` | Crear (validado con Zod) | 201 / 400 / 409 |
| PUT | `/api/v1/metrics/:id` | Actualizar parcial | 200 / 400 / 404 / 409 |
| DELETE | `/api/v1/metrics/:id` | Eliminar | 204 / 400 / 404 |
| GET | `/api/v1/metrics/summary/:campaignId` | Totales por canal (aggregation pipeline) | 200 |

Los endpoints de `/api/v1/campaigns` (semana 05) no cambian.

### Ejemplo — crear métrica

```bash
curl -X POST http://localhost:3000/api/v1/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "5f1a3c2e-...-uuid-de-una-campaign",
    "channel": "TikTok",
    "date": "2026-09-20",
    "impressions": 41000,
    "clicks": 2100,
    "conversions": 90,
    "spend": 260,
    "extra": { "videoViews": 38000, "watchTimeSeconds": 512000 }
  }'
```

### Ejemplo — resumen por campaña

```bash
curl http://localhost:3000/api/v1/metrics/summary/5f1a3c2e-...-uuid-de-una-campaign
```

```json
{
  "data": [
    { "_id": "TikTok", "totalImpressions": 41000, "totalClicks": 2100, "totalConversions": 90, "totalSpend": 260, "days": 1 },
    { "_id": "Instagram", "totalImpressions": 27500, "totalClicks": 1090, "totalConversions": 52, "totalSpend": 375, "days": 2 }
  ]
}
```

## ⚠️ Manejo de errores Mongoose

| Situación | Respuesta |
|---|---|
| `id` no es un ObjectId válido | `AppError(400, 'ID inválido')` |
| Duplicado de `(campaignId, channel, date)` (código Mongo `11000`) | `AppError(409, ...)` |
| Falla de validación del schema Mongoose | `AppError(400, ...)` |
| Documento no encontrado en update/delete | `AppError(404, ...)` |

Todos pasan por el mismo `errorHandler` global de la semana 04/05 — no hubo que tocarlo,
porque los errores se traducen a `AppError` en el repository, igual que se hacía con
`PrismaClientKnownRequestError` en la semana 05.

## 🛠️ Levantar el proyecto

```bash
# 1. Levantar Postgres + MongoDB
docker compose up -d

# 2. Instalar dependencias (agrega mongoose sobre lo que ya tenías)
pnpm install

# 3. Variables de entorno
cp .env.example .env

# 4. Migraciones y seed de Postgres (igual que semana 05)
pnpm dlx prisma migrate dev
pnpm dlx prisma db seed

# 5. Copia los ids de Campaign que imprime el seed anterior en .env
#    (SEED_CAMPAIGN_VERANO, SEED_CAMPAIGN_BLACKFRIDAY) y corre el seed de Mongo
pnpm seed:mongo

# 6. Levantar el servidor
pnpm dev
```

## 📌 Pendiente para tu entrega

1. Reemplaza los UUIDs de ejemplo en `src/scripts/seed-metrics.ts` por los de tus
   `Campaign` reales, o pásalos por `.env`.
2. Capturas de Postman/Thunder Client de los 6 endpoints nuevos.
3. Log de `pnpm seed:mongo` en el README de tu entrega.
4. Si tu rúbrica de la semana 06 pide algo puntual que no está aquí (p. ej. un
   índice de texto, un `$lookup`, TTL, etc.), dime qué dice exactamente y lo agrego.

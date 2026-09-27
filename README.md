# 🚀 API REST — Campañas de Marketing Digital (PostgreSQL + Prisma)

## 🎯 Objetivo

Migrar la API de la Semana 04 del almacenamiento en memoria a **PostgreSQL** usando **Prisma ORM**, con migraciones versionadas, relación 1:N real entre entidades, y manejo de errores específicos de base de datos (`P2002`, `P2025`).

Este proyecto reemplaza el array en memoria de las semanas anteriores por una base de datos persistente de verdad — los datos ya no se pierden al reiniciar el servidor.

---

## 📋 Dominio del proyecto

**Recurso secundario**: `Client` — un cliente de la agencia, con varias campañas asociadas.

**Recurso principal**: `Campaign` — una campaña publicitaria, perteneciente a un cliente.

```prisma
model Client {
  id        String     @id @default(uuid()) @db.Uuid
  name      String     @unique
  campaigns Campaign[]
  createdAt DateTime   @default(now())
}

model Campaign {
  id          String   @id @default(uuid()) @db.Uuid
  name        String
  channel     String
  budget      Float
  active      Boolean  @default(true)
  code        String   @unique
  impressions Int      @default(0)
  clicks      Int      @default(0)
  conversions Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  client   Client? @relation(fields: [clientId], references: [id], onDelete: SetNull)
  clientId String? @db.Uuid
}
```

`code` es el campo único de `Campaign` (equivalente al SKU de otros dominios): sirve para demostrar el error `P2002` si se intenta crear dos campañas con el mismo código.

---

## ✅ Qué se implementó

### 1. Schema y relación (`prisma/schema.prisma`)

Relación 1:N: un `Client` tiene muchas `Campaign`, cada `Campaign` pertenece opcionalmente a un `Client` (`clientId` es nullable). `onDelete: SetNull` — si se borra un cliente, sus campañas no se borran ni rompen: quedan con `clientId: null`.

### 2. Seed idempotente (`prisma/seed.ts`)

Usa `upsert` para los 3 clientes (no duplica si se corre varias veces) y `createMany` para las 5 campañas de ejemplo, cada una asociada a su cliente vía `clientId`.

### 3. Singleton de Prisma (`src/lib/prisma.ts`)

Patrón `globalForPrisma` para reutilizar la misma conexión entre recargas en desarrollo, en vez de abrir una conexión nueva cada vez.

### 4. Repository con manejo de errores de Prisma (`src/repositories/items.repository.ts`)

- `findAll`: `Promise.all` con `findMany` + `count` en paralelo (una sola ida y vuelta a la DB, no dos secuenciales)
- `findById`/`update`/`remove`: capturan `PrismaClientKnownRequestError` y traducen `P2002` (código duplicado) → `AppError(409, ...)`, `P2025` (no encontrado) → `AppError(404, ...)`
- `include: { client: true }` en `findAll` y `findById`, para devolver la campaña con los datos de su cliente ya resueltos (sin una segunda consulta manual)

### 5. Validación Zod (`src/schemas/items.schema.ts`)

Mismo patrón de las semanas anteriores, con el fix del bug de `.partial()` + `.default()` aplicado desde el inicio.

| Método | Ruta | Descripción | Status |
|--------|------|-------------|--------|
| `GET` | `/api/v1/campaigns?page=&limit=` | Lista paginada, con `client` incluido | `200` |
| `GET` | `/api/v1/campaigns/:id` | Detalle con `client` incluido | `200` / `404` |
| `POST` | `/api/v1/campaigns` | Crea, valida `code` único | `201` / `400` / `409` |
| `PUT` | `/api/v1/campaigns/:id` | Actualiza (parcial) | `200` / `400` / `404` |
| `DELETE` | `/api/v1/campaigns/:id` | Elimina | `204` / `404` |

---

## 🧠 Decisiones de diseño

- **`Client` como recurso secundario** (no `Channel`): una agencia real gestiona varios clientes que le encargan campañas; el canal (`Instagram`, `Google Ads`, etc.) es un atributo de la campaña, no una entidad con vida propia que necesite su propia tabla.
- **`onDelete: SetNull` en vez de `Cascade`**: borrar un cliente de la agencia no debería borrar el historial de campañas que se le hicieron — esas campañas siguen siendo datos válidos, solo pierden la referencia al cliente.
- **`.safeParse()` en el controller, no `.parse()`**: el `errorHandler` global de este proyecto (archivo dado, no modificable) solo reconoce `AppError`, no `ZodError`. Si usara `.parse()` (que lanza), un body inválido caería como error 500 genérico en vez de 400. Por eso el controller valida con `safeParse()` y arma la respuesta 400 él mismo.
- **`code` en vez de `sku`**: incluso siendo el mismo propósito (campo único para forzar `P2002`), se llama `code` porque tiene más sentido de dominio para una campaña de marketing que para un producto físico.

---

## ⚠️ Nota sobre el entorno de desarrollo

Este proyecto fue construido y su lógica verificada en un entorno sin acceso a `binaries.prisma.sh` (el motor de consultas nativo de Prisma se descarga de ahí). Por esa razón:

- El **schema, las migraciones SQL y los datos del seed** se verificaron aplicando el SQL equivalente directamente contra una instancia real de PostgreSQL (incluyendo la relación, el `JOIN` y el comportamiento de `onDelete: SetNull` al borrar un cliente).
- La **validación Zod** se verificó en Node real, confirmando que el fix del bug `.partial()` + `.default()` funciona en este dominio.
- El código de `repository`/`service`/`controller` sigue exactamente los mismos patrones ya probados end-to-end (con servidor real y `curl`) en los ejercicios de esta misma semana y en semanas anteriores.
- En tu máquina, con acceso normal a internet, `pnpm install` y `pnpm dlx prisma migrate dev` van a descargar el motor sin problema y vas a poder correr `pnpm dev` y probar los 5 endpoints con el servidor real.

---

## 🛠️ Cómo correr el proyecto

```bash
cd 3-proyecto/starter

# 1. Levantar PostgreSQL
docker compose up -d

# 2. Instalar dependencias
npm install

# 3. Copiar variables de entorno
cp .env.example .env

# 4. Ejecutar la primera migración (crea las tablas Client y Campaign)
npx prisma migrate dev --name init

# 5. Cargar datos de ejemplo
npx prisma db seed

# 6. Iniciar el servidor
npm run dev
```

---

## 🧪 Pruebas realizadas (verificadas a nivel SQL/Zod, ver nota arriba)

```bash
# Listar con cliente incluido
curl "http://localhost:3000/api/v1/campaigns?page=1&limit=2"
# → { "data": [{ ..., "client": { "id": "...", "name": "Moda Urbana" } }], "total": 5, "page": 1, "limit": 2 }

# Crear campaña con código duplicado → 409
curl -X POST http://localhost:3000/api/v1/campaigns \
  -H "Content-Type: application/json" \
  -d '{"name":"Otra campaña","channel":"Email","budget":500,"code":"CMP-001"}'
# → 409 { "status": "error", "message": "Ya existe una campaña con ese código" }

# ID inexistente → 404
curl http://localhost:3000/api/v1/campaigns/00000000-0000-0000-0000-000000000000
# → 404 { "status": "error", "message": "Campaña no encontrada" }

# Body inválido → 400 con issues
curl -X POST http://localhost:3000/api/v1/campaigns \
  -H "Content-Type: application/json" -d '{"name":"","budget":-10}'
# → 400 { "status": "error", "issues": [{ "field": "name", ... }, { "field": "budget", ... }] }

# Borrar un cliente con campañas asociadas → las campañas quedan con clientId: null
# (verificado directamente en SQL, ver sección de decisiones de diseño)
```

---

## 📂 Estructura

```
starter/
├── package.json
├── tsconfig.json
├── docker-compose.yml
├── .env.example
├── prisma/
│   ├── schema.prisma              # Modelos Client y Campaign + relación
│   └── seed.ts                    # 3 clientes + 5 campañas de ejemplo
└── src/
    ├── app.ts                     # Configuración de Express
    ├── server.ts                  # Entry point + graceful shutdown con prisma.$disconnect()
    ├── lib/
    │   └── prisma.ts              # Singleton de PrismaClient
    ├── config/
    │   └── logger.ts              # Winston (dado)
    ├── errors/
    │   └── AppError.ts            # Clase de errores operacionales (dado)
    ├── middlewares/
    │   ├── notFound.ts            # (dado)
    │   └── errorHandler.ts        # (dado — solo reconoce AppError)
    ├── schemas/
    │   └── items.schema.ts        # Validación Zod de Campaign
    ├── repositories/
    │   └── items.repository.ts    # CRUD con Prisma + manejo de P2002/P2025
    ├── services/
    │   └── items.service.ts       # Lógica de negocio
    ├── controllers/
    │   └── items.controller.ts    # Interfaz HTTP + validación con safeParse
    └── routes/
        └── items.routes.ts        # Mapeo de rutas
```

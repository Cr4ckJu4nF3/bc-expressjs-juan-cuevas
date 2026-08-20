# 🚀 Proyecto Semana 03 — API REST con Arquitectura en Capas

## 🎯 Objetivo

Construir una API REST completa aplicando la arquitectura en 4 capas (`routes → controllers → services → repositories`) con contratos de respuesta tipados en TypeScript.

---

## 📋 Tu Dominio Asignado

**Dominio**: _El instructor te asignará tu dominio único._

Ejemplos de dominios posibles:
- 📖 Biblioteca → recursos: `books`
- 💊 Farmacia → recursos: `medicines`
- 🏋️ Gimnasio → recursos: `members`
- 🍽️ Restaurante → recursos: `dishes`
- 🏥 Hospital → recursos: `patients`
- 🎥 Cine → recursos: `movies`

Adapta **todos los nombres, campos y lógica** al dominio que recibas. El starter usa `items` como nombre genérico.

---

## 📁 Estructura del starter

```
starter/
├── package.json
├── tsconfig.json
├── .env.example
└── src/
    ├── app.ts
    ├── server.ts
    ├── types.ts              # Tipos a completar para tu dominio
    ├── routes/
    │   └── items.routes.ts   # TODO: registrar endpoints
    ├── controllers/
    │   └── items.controller.ts # TODO: thin CRUD controller
    ├── services/
    │   └── items.service.ts    # TODO: lógica con paginación
    └── repositories/
        └── items.repository.ts # TODO: async CRUD + copias defensivas
```

---

## ✅ Requisitos Funcionales

Implementa los siguientes endpoints (adaptados a tu dominio):

| Método | Ruta                 | Status exitoso | Descripción                         |
|--------|----------------------|----------------|-------------------------------------|
| GET    | `/api/v1/items`      | 200            | Listar con paginación `?page&limit` |
| GET    | `/api/v1/items/:id`  | 200            | Obtener por ID                      |
| POST   | `/api/v1/items`      | 201            | Crear nuevo recurso                 |
| PUT    | `/api/v1/items/:id`  | 200            | Actualizar recurso existente        |
| DELETE | `/api/v1/items/:id`  | 204            | Eliminar recurso                    |

### Contratos de respuesta obligatorios

```json
// GET /items?page=1&limit=5 → 200
{ "data": [...], "total": 20, "page": 1, "limit": 5 }

// GET /items/1 → 200
{ "data": { "id": 1, ... } }

// POST /items → 201
{ "data": { "id": 6, ... } }

// GET /items/999 → 404
{ "error": "Not Found", "message": "Item 999 not found" }
```

---

## 💡 Ejemplos de Adaptación por Dominio

**Biblioteca — books:**
```ts
interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  available: boolean;
  createdAt: string;
}
```

**Farmacia — medicines:**
```ts
interface Medicine {
  id: number;
  name: string;
  dosage: string;
  stock: number;
  expiresAt: string;
  createdAt: string;
}
```

**Gimnasio — members:**
```ts
interface Member {
  id: number;
  fullName: string;
  plan: 'basic' | 'premium';
  active: boolean;
  joinedAt: string;
  createdAt: string;
}
```

---

## 🏗️ Reglas de Arquitectura

1. **Repository**: única capa que toca el store. Todos los métodos `async Promise<T>`.
2. **Service**: sin imports de Express. Contiene la paginación y validaciones de dominio.
3. **Controller**: exactamente 3 pasos — extraer → llamar service → responder.
4. **Routes**: solo mapeo URL → controller function.

---

## 🛠️ Instrucciones

1. Clona/copia el `starter/`
2. Instala dependencias: `pnpm install`
3. Copia `.env.example` a `.env`
4. Renombra `items` por el recurso de tu dominio en todos los archivos
5. Define los campos de tu `Item` en `types.ts`
6. Implementa en orden: repository → service → controller → routes
7. Verifica con `pnpm dev` y prueba con Thunder Client o curl

---

## 📌 Entregables

1. Código fuente con tu dominio aplicado (sin `items` genérico)
2. Screenshot de Thunder Client con los 5 endpoints funcionando
3. Screenshot de `pnpm build` sin errores TypeScript
4. README actualizado describiendo tu API (dominio, campos, ejemplos)

# 🚀 Proyecto Semana 07 — Autenticación JWT

## 🎯 Dominio: Agencia de Marketing Digital

Se mantiene todo lo de las semanas 05 (Postgres/Prisma: `Client`, `Campaign`) y
06 (MongoDB/Mongoose: `Metric`), y se agrega autenticación: `User` en Postgres,
contraseñas con `bcrypt`, y sesión con JWT **access token** (corta duración,
cookie `HttpOnly`) + **refresh token** (larga duración, con rotación y
revocación vía un modelo `RefreshToken`).

### Por qué un `RefreshToken` en base de datos y no solo un JWT

Un JWT es autocontenido: si alguien lo roba, es válido hasta que expira, sin
forma de invalidarlo antes. Por eso el refresh token se guarda (como hash
SHA-256, nunca en claro) junto con `revokedAt`: permite cerrar sesión de
verdad, y si se detecta que un refresh token ya usado (rotado) se reutiliza,
se revocan todas las sesiones de ese usuario por seguridad.

## 🗂️ Modelo

```
User (Postgres)
 ├─ id, email (único), passwordHash, name, role
 └─ refreshTokens: RefreshToken[]
      ├─ jti (único), tokenHash (único, sha256 del refresh JWT)
      ├─ expiresAt, revokedAt
```

## ✅ Endpoints nuevos — `/api/v1/auth`

| Método | Ruta | Descripción | Status |
|--------|------|-------------|--------|
| POST | `/register` | Crea usuario, hashea password, inicia sesión (setea cookies) | 201 / 400 / 409 |
| POST | `/login` | Verifica credenciales, setea cookies | 200 / 400 / 401 |
| POST | `/refresh` | Rota el refresh token usando la cookie, setea cookies nuevas | 200 / 401 |
| POST | `/logout` | Revoca el refresh token actual, limpia cookies | 204 |
| GET | `/me` | Usuario autenticado (requiere `authenticate`) | 200 / 401 |

### Endpoints existentes ahora protegidos

`POST`/`PUT`/`DELETE` de `/api/v1/campaigns` y `/api/v1/metrics` ahora exigen
sesión (`authenticate`). Los `GET` siguen públicos. Si tu rúbrica pide otra
cosa (todo protegido, o nada), es un cambio de una línea en cada `routes.ts`.

## 🍪 Cookies

| Cookie | Contenido | Duración | Path | Flags |
|---|---|---|---|---|
| `accessToken` | JWT firmado con `JWT_ACCESS_SECRET` | 15m | `/` | `httpOnly`, `sameSite=lax`, `secure` en producción |
| `refreshToken` | JWT firmado con `JWT_REFRESH_SECRET` | 7d | `/api/v1/auth` | igual que arriba |

## 🛠️ Levantar el proyecto

```bash
# 1. Levantar Postgres + MongoDB
docker compose up -d

# 2. Instalar dependencias (agrega bcrypt, jsonwebtoken, cookie-parser)
pnpm install

# 3. Variables de entorno — genera JWT_ACCESS_SECRET y JWT_REFRESH_SECRET
cp .env.example .env
openssl rand -hex 32   # pega el resultado en JWT_ACCESS_SECRET
openssl rand -hex 32   # y otro distinto en JWT_REFRESH_SECRET

# 4. Migración (crea User y RefreshToken)
pnpm dlx prisma migrate dev --name add_auth

# 5. Seed (ahora también crea un usuario demo: demo@agencia.test / Demo1234!)
pnpm dlx prisma db seed

# 6. Servidor
pnpm dev
```

## 🧪 Probar el flujo con curl (usando cookie jar)

```bash
# Login — guarda las cookies en cookies.txt
curl -c cookies.txt -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@agencia.test","password":"Demo1234!"}'

# Usa la cookie de sesión para crear una campaña
curl -b cookies.txt -X POST http://localhost:3000/api/v1/campaigns \
  -H "Content-Type: application/json" \
  -d '{"name":"Prueba","channel":"Email","budget":100,"code":"CMP-TEST"}'

# Ver el usuario autenticado
curl -b cookies.txt http://localhost:3000/api/v1/auth/me

# Rotar tokens
curl -b cookies.txt -c cookies.txt -X POST http://localhost:3000/api/v1/auth/refresh

# Cerrar sesión
curl -b cookies.txt -X POST http://localhost:3000/api/v1/auth/logout
```

## 📌 Pendiente para tu entrega

1. Capturas de Postman/Thunder Client de los 5 endpoints de `/auth` y de al
   menos un `POST` protegido (con y sin sesión, mostrando el 401).
2. Log de `pnpm dlx prisma db seed` mostrando la creación del usuario demo.
3. Si tu rúbrica de la semana 07 exige algo específico que no está aquí
   (blacklist de access tokens, verificación de email, rate limiting en
   login, etc.), dime exactamente qué pide y lo agrego — el rate limiting y
   RBAC por rol quedan para la semana 08 según el temario del bootcamp.

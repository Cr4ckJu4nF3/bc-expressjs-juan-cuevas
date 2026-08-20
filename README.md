# 🚀 Procesador de Campañas de Marketing Digital

## 🎯 Objetivo

Herramienta de línea de comandos construida con **Node.js + TypeScript** que lee campañas desde un archivo JSON, aplica un filtro opcional por canal, calcula estadísticas de negocio y genera un reporte en disco — todo usando I/O asíncrono no bloqueante (`fs/promises`) y sin depender de ningún framework.

---

## 📋 Dominio del proyecto

**Recurso principal**: `Campaign` — una campaña publicitaria de un cliente de la agencia, corriendo en un canal específico, con sus métricas de rendimiento.

```typescript
interface Campaign {
  id: string;
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

Los datos viven en [`data/campaigns.json`](data/campaigns.json): 12 campañas de 4 clientes (Moda Urbana, FitLife Gym, TechNova, Bella Cosmetics) distribuidas en 6 canales (Instagram, Google Ads, Email, LinkedIn, Facebook, TikTok).

---

## ✅ Qué se implementó

### 1. Lectura asíncrona (`src/reader.ts`)

Lee `campaigns.json` con `fs/promises`, sin bloquear el event loop. Si el archivo no existe o el JSON es inválido, lanza un error descriptivo en vez de romper con un stack trace crudo.

### 2. Filtro por canal (`src/processor.ts` → `filterByChannel`)

Acepta un argumento `--channel` por línea de comandos. Si el canal no existe entre las campañas, el error muestra la lista de canales disponibles en vez de fallar en silencio:

```bash
npm run dev -- --channel Instagram
```

### 3. Cálculo de resumen (`src/processor.ts` → `calculateSummary`)

Sobre el conjunto ya filtrado, calcula:

- Total de campañas, activas e inactivas
- Presupuesto promedio
- Campaña de mayor y menor presupuesto
- Lista de canales presentes

### 4. Escritura del reporte (`src/writer.ts`)

Genera la carpeta `output/` si no existe (`mkdir` con `recursive: true`) y escribe el reporte completo en [`output/report.json`](output/report.json), en formato JSON legible.

### 5. Manejo de errores (`src/index.ts`)

Un único `try/catch` envuelve todo el flujo (lectura → filtro → cálculo → escritura). Cualquier error en cualquier paso se captura, se muestra por consola, y el proceso termina con `process.exit(1)`.

---

## 🧠 Decisiones de diseño

- **Sin frameworks**: solo `fs/promises` y `path` de la librería estándar de Node — el objetivo de la semana era entender el runtime, no abstraerlo.
- **Separación por responsabilidad**: `reader.ts` solo lee, `processor.ts` solo transforma (funciones puras, sin I/O), `writer.ts` solo escribe. Ninguno depende de los otros dos directamente — todo se conecta desde `index.ts`.
- **`id: string`** en vez de número autoincremental: los IDs vienen fijos del archivo JSON (`"c001"`, `"c002"`...), no se generan en runtime como sí pasa en la API de la Semana 02.
- **`filterByChannel` lanza error si no hay resultados** en vez de devolver un array vacío silenciosamente — así el usuario se entera de inmediato si escribió mal el canal.

---

## 🛠️ Cómo correr el proyecto

```bash
cd 3-proyecto/starter
npm install
npm run dev                        # sin filtro, todas las campañas
npm run dev -- --channel Instagram # filtrado por canal
npm run build                      # compila a dist/
npm start -- --channel Instagram   # corre la versión compilada
```

---

## 🧪 Pruebas realizadas

```bash
# Sin filtro
npm run dev
# → Total campañas: 12, resumen completo, reporte guardado en output/report.json

# Con filtro válido
npm run dev -- --channel Instagram
# → Total campañas: 2 (solo las de Instagram)

# Con canal inexistente
npm run dev -- --channel Twitter
# → Error: No hay campañas en el canal "Twitter".
#   Canales disponibles: Instagram, Google Ads, Email, LinkedIn, Facebook, TikTok
```

---

## 📂 Estructura

```
starter/
├── package.json
├── tsconfig.json
├── data/
│   └── campaigns.json          # dataset de entrada
├── output/
│   └── report.json             # reporte generado (se crea al correr el programa)
└── src/
    ├── types.ts                # Campaign, CampaignSummary, Report
    ├── reader.ts                # lectura del JSON
    ├── processor.ts             # filtro + cálculo de resumen
    ├── writer.ts                 # escritura del reporte
    └── index.ts                  # entry point, orquesta todo el flujo
```

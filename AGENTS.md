# AGENTS.md — Reglas para asistentes de IA en este monorepo

> Este archivo define las reglas que todo agente de IA (Copilot, Cursor, Claude, etc.) debe seguir al trabajar en este repositorio.

---

## 1. Archivos del Memory Bank que el agente debe leer al inicio de cada sesión

Al comenzar una nueva sesión o retomar una existente, el agente **debe leer obligatoriamente** los siguientes archivos del banco de memoria en este orden:

| # | Archivo | Propósito |
|---|---------|-----------|
| 1 | `memory-bank/projectbrief.md` | Descripción del negocio, problema que resuelve y objetivos del proyecto |
| 2 | `memory-bank/techContext.md` | Stack tecnológico, decisiones de arquitectura y restricciones técnicas |
| 3 | `memory-bank/progress.md` | Estado actual del desarrollo, completado, en progreso y próximos pasos |

Adicionalmente, el agente **debe leer** `briefing.md` (en la raíz) si necesita contexto detallado sobre la empresa TrackFlow y sus departamentos.

> **Nota:** El agente no debe dar nada por sentado ni inferir información que no esté documentada. Si falta contexto, debe preguntar antes de actuar.

---

## 1b. Mapa de carpetas de producto (dónde va cada cosa)

El código de producto **debe** ubicarse exclusivamente en las siguientes rutas canónicas. No crear un segundo árbol de frontend, API o servicio en otra ubicación.

### 🖥️ Frontend → `uis/`

| Ruta | ¿Qué va aquí? |
|------|---------------|
| `uis/website/` | **Web corporativa pública** — landing, información de TrackFlow, portal de tracking para destinatarios. Ruta `/`. |
| `uis/backoffice/` | **App interna de administración** — dashboards de operaciones, CRM, gestión de devoluciones, transportistas, tickets CX. Layout propio, separado del sitio público. |

> `uis/talent-pipeline-tracker/` es un proyecto preexistente independiente. El código nuevo de producto corporativo debe crearse en `website` o `backoffice`.

### 🛠️ Backend → `services/`

Cada subcarpeta = un servicio concreto (API o worker). Ejemplos planificados:

| Ruta esperada | Propósito |
|---------------|-----------|
| `services/inventory-api/` | API de inventario unificada (stock ambos almacenes) |
| `services/tracking-api/` | Endpoint unificado de tracking multi-transportista |
| `services/orders-ingestion/` | Pipeline de ingesta de pedidos desde email |
| `services/returns-api/` | API de gestión de devoluciones |
| `services/carrier-selector/` | Motor de selección de transportista |
| `services/admin-api/` | API de administración para el backoffice |

> No crear servicios fuera de `services/`. Cada servicio incluye su propia documentación, tests y configuración.

---

## 2. Flujo obligatorio antes de cada commit

Antes de realizar cualquier commit, el agente debe ejecutar los siguientes pasos **en orden**:

### Paso 1 — Revisar el estado del Memory Bank
- Leer `memory-bank/progress.md` para conocer el estado actual del desarrollo.
- Verificar que la tarea a commitar coincida con lo planificado en el banco de memoria.
- Si la tarea no está documentada, actualizar `memory-bank/progress.md` antes de continuar.

### Paso 2 — Validar que no hay errores
- Ejecutar `npm run build`, `npm run type-check` o el comando de compilación correspondiente para garantizar que el proyecto compila sin errores.
- Ejecutar `npm run lint` (o equivalente) para verificar que no hay errores de linting.
- Ejecutar las pruebas unitarias mínimas del módulo afectado: `npm test` o el comando específico del paquete.
- **No commitar si hay errores**, advertencias de compilación o tests fallando.

### Paso 3 — Confirmar modificaciones con el desarrollador
- Mostrar al desarrollador un resumen claro de:
  - Archivos modificados (añadidos, modificados, eliminados).
  - Naturaleza de los cambios (código nuevo, refactor, corrección de bugs, documentación).
  - Impacto en otros módulos del monorepo.
- **No modificar archivos protegidos** (ver sección 3) sin confirmación explícita.
- Esperar la aprobación del desarrollador antes de proceder.

### Paso 4 — Actualizar el Memory Bank
- Actualizar `memory-bank/progress.md` reflejando los cambios realizados:
  - Mover tareas completadas de "En progreso" a "Completado".
  - Añadir nuevas tareas a "Pendiente" si procede.
  - Actualizar la sección de "Próximos pasos" si es necesario.
- Si se tomaron decisiones técnicas importantes durante la sesión, documentarlas en `memory-bank/techContext.md`.

### Paso 5 — Crear el commit
- Redactar un mensaje de commit descriptivo siguiendo [Conventional Commits](https://www.conventionalcommits.org/):
  ```
  tipo(ámbito): descripción breve

  Cuerpo opcional con más detalles.
  ```
  Tipos válidos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`.
- Ejecutar `git commit` con el mensaje redactado.
- **No hacer push sin confirmación explícita del desarrollador.**

---

## 3. Archivos y carpetas que el agente NO debe modificar sin confirmación explícita

El agente tiene prohibido modificar los siguientes archivos y carpetas sin obtener una autorización explícita y verbal del desarrollador:

### 🚫 No modificar sin permiso

| Ruta | Razón |
|------|-------|
| `briefing.md` | Documento maestro de contexto de negocio; cambios pueden desalinear a todo el equipo |
| `memory-bank/` | Banco de memoria del proyecto; cualquier cambio debe ser intencional y revisado |
| `CONTEXT.md` / `CONTEXT.es.md` | Contexto oficial del proyecto; solo se actualiza con decisiones del equipo |
| `package.json` (raíz) | Dependencias y scripts compartidos del monorepo |
| `application.html` | Punto de entrada principal de la aplicación |
| `validation.js` | Lógica de validación global |
| `workflows/` | Flujos de trabajo definidos; modificarlos sin contexto puede romper procesos |
| `infra/` | Configuración de infraestructura; cambios pueden afectar entornos productivos |
| `services/` | Servicios del backend; cambios requieren coordinación con el equipo |

### ⚠️ Modificar con precaución (preguntar siempre)

- `uis/*/` — Interfaces de usuario. **El código nuevo de frontend debe ir en `uis/website/` o `uis/backoffice/`** según corresponda. No crear proyectos frontend fuera de `uis/`.
- `services/*/` — Servicios backend (APIs, workers). **El código nuevo de backend debe ir aquí**, no crear servicios fuera de `services/`.
- `agents/*/` — Agentes de IA; cambios pueden afectar la lógica de automatización.
- `packages/*/` — Paquetes compartidos; cambios impactan a múltiples consumidores.
- `.github/` o configuraciones de CI/CD.
- Archivos de configuración (`tsconfig.json`, `eslint.config.mjs`, `next.config.ts`, etc.).

### ✅ Se puede modificar libremente

- Archivos nuevos dentro de módulos activos.
- Tests y fixtures.
- Documentación de módulos específicos (excepto la raíz y memory-bank).

---

*Última actualización: 2026-10-24*
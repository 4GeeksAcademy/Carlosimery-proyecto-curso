# Memory Bank — Tech Context

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Next.js 14+, React, TypeScript, Tailwind CSS |
| **Backend** | Node.js, TypeScript |
| **Base de datos** | Por definir (según necesidades del proyecto) |
| **API** | REST / GraphQL |
| **Agentes / IA** | Python, frameworks de agentes (CrewAI, LangChain) |
| **Infraestructura** | Cloud (AWS / Azure / GCP por definir) |
| **Testing** | Jest, Vitest, Playwright |
| **Control de versiones** | Git, GitHub |

## Decisiones de arquitectura

1. **Monorepo con estructura modular**: El proyecto está organizado en carpetas temáticas (`agents/`, `services/`, `uis/`, `packages/`, `workflows/`) para separar responsabilidades y facilitar el mantenimiento.

2. **Frontend con Next.js 14+**: Tecnología elegida para los proyectos frontend en `uis/`, aprovechando el enrutamiento basado en archivos, Server Components y la facilidad para construir dashboards interactivos.

3. **Separación entre agentes y servicios**: Los agentes de IA (`agents/`) están desacoplados de los servicios (`services/`), permitiendo que los agentes orquesten flujos sin depender directamente de la lógica de negocio.

4. **API Layer unificada**: Se planea una capa de API que abstraiga los sistemas legacy (WMS, ERP) y exponga endpoints consistentes.

5. **Agentes especializados**: Cada dominio (almacén, transportistas, devoluciones, CX, ventas) tendrá su propio agente o conjunto de agentes, siguiendo el patrón de orquestación.

## Mapa de carpetas de producto

El código de producto **debe** ubicarse exclusivamente en las siguientes rutas canónicas. No se debe crear un segundo árbol de frontend, API o servicio en otra ubicación.

### 🖥️ `uis/` — Proyectos frontend

| Ruta | Propósito | Contenido esperado |
|------|-----------|-------------------|
| `uis/website/` | **Web corporativa de cara al público.** Ruta `/`, marca y copy alineados con `briefing.md` | Páginas públicas, landing, información corporativa, portal de tracking público para destinatarios |
| `uis/backoffice/` | **App interna de la empresa.** Layout propio, separado del sitio público. Vista de entrada en `/` | Dashboard de operaciones, CRM, gestión de devoluciones, panel de transportistas, tickets CX |

> ⚠️ **Nota sobre `uis/talent-pipeline-tracker/`**: Este proyecto preexistente en el monorepo es un frontend independiente (no es `website` ni `backoffice`). El código nuevo de producto corporativo debe ir en `website` o `backoffice`. Si `talent-pipeline-tracker` sigue siendo relevante, puede mantenerse como proyecto separado; de lo contrario, su funcionalidad debería migrarse a `backoffice`.

### 🛠️ `services/` — APIs y servicios backend

Cada subcarpeta dentro de `services/` corresponde a **un servicio concreto** (API o background worker). Ejemplos esperados:

| Ruta | Propósito |
|------|-----------|
| `services/admin-api/` | API de administración para el backoffice |
| `services/tracking-api/` | Endpoint unificado de tracking que agrega estado desde cualquier transportista |
| `services/inventory-api/` | API de inventario unificada (stock en tiempo real para ambos almacenes) |
| `services/orders-ingestion/` | Pipeline de ingesta de pedidos (parseo de emails) |
| `services/returns-api/` | API de gestión de devoluciones |
| `services/carrier-selector/` | Motor de selección de transportista |

> No crear servicios fuera de `services/`. Cada servicio incluye su propia documentación, tests y configuración de despliegue.

## Restricciones técnicas

- **Sistemas legacy**: Los dos almacenes usan sistemas distintos (uno comercial y uno basado en hojas de cálculo) que deben ser integrados sin reemplazarlos por completo.
- **Multi-cloud**: Las bases de datos están repartidas en dos proveedores cloud, lo que añade complejidad a la integración.
- **Sin telemetría actual**: Actualmente no hay monitoreo centralizado, todo se detecta por WhatsApp.
- **Procesos manuales existentes**: Muchos flujos actuales son manuales y dependen de personas, por lo que la automatización debe ser gradual.
- **Equipo reducido**: El equipo de tecnología son 7 personas en Zaragoza, lo que limita la velocidad de desarrollo.

## Reglas de desarrollo para agentes de IA

Se ha establecido una infraestructura de reglas para agentes en:

- **`AGENTS.md`** (raíz): Define los archivos del memory bank a leer, el flujo pre-commit de 5 pasos, y los archivos protegidos.
- **`.agents/rules/`**: Reglas específicas con distintos alcances:
  - `memory-bank-sync.md` — Siempre activa: sincronización obligatoria del memory bank.
  - `never-touch-legacy.md` — Por patrón de archivo: protege código legacy de TrackFlow.
  - `carrier-selection-rules.md` — Solicitada por el agente: reglas de negocio para selección de transportistas.

## Skills implementadas

| Skill | Propósito | Archivos |
|-------|-----------|----------|
| `skills/data-analysis/` | Limpieza básica de datos con pandas | `scripts/pandas_clean.py` |
| `skills/carrier-performance/` | Análisis de rendimiento de transportistas con métricas, informe JSON y CSV | `SKILL.md`, `carrier_performance.py` |

Próximas skills planificadas: return-approval (devoluciones), cx-agent (atención al cliente).
# Memory Bank — Progress

## Estado actual del desarrollo

### ✅ Completado
- [x] Estructura del proyecto definida (monorepo con carpetas temáticas)
- [x] Briefing de empresa creado (`briefing.md`)
- [x] Proyecto frontend iniciado: `talent-pipeline-tracker` con Next.js 14+
- [x] Tipos compartidos definidos en `packages/shared/types/`
- [x] Estructura de agentes definida con template en `agents/_template/`
- [x] Skill de data-analysis con scripts funcionales (`pandas_clean.py`)
- [x] `AGENTS.md` en la raíz con reglas para agentes de IA
- [x] Carpeta `.agents/rules/` con 3 reglas de desarrollo documentadas
- [x] Skill de carrier-performance con script Python y criterios de aceptación
- [x] Mapa de carpetas de producto documentado en `techContext.md` y `AGENTS.md` (frontend → `uis/website/` y `uis/backoffice/`; backend → `services/`)

### 🔄 En progreso
- [ ] Definición de la API de inventario unificada
- [ ] Pipeline de ingesta de pedidos
- [ ] Motor de selección de transportista
- [ ] Frontend del talent-pipeline-tracker (páginas de listado y detalle de candidatos)

### ⬜ Pendiente / Planificado
- [ ] Implementar la API de inventario unificada
- [ ] Desarrollar el pipeline de ingesta automatizada de pedidos
- [ ] Construir el dashboard de operaciones de almacén
- [ ] Implementar el motor de selección de transportista
- [ ] Crear el endpoint unificado de tracking
- [ ] Desarrollar el portal de seguimiento público
- [ ] Implementar el motor de aprobación automática de devoluciones
- [ ] Sistema de inspección asistido por IA
- [ ] Agente de CX para resolución automática de consultas
- [ ] Sistema de tickets unificado con base de conocimiento (RAG)
- [ ] CRM integrado con informes PDF automáticos
- [ ] Telemetría centralizada y monitoreo
- [ ] Despliegue continuo (CI/CD)

## Próximos pasos previstos

1. **Corto plazo**: Definir e implementar la API de inventario unificada que permita consultar stock en tiempo real desde ambos almacenes.
2. **Corto plazo**: Completar las funcionalidades básicas del talent-pipeline-tracker.
3. **Medio plazo**: Desarrollar el pipeline de ingesta de pedidos y el motor de selección de transportista.
4. **Medio plazo**: Implementar el sistema de aprobación automática de devoluciones.
5. **Largo plazo**: Desplegar agentes de IA para CX, ventas y operaciones.
6. **Largo plazo**: Establecer telemetría centralizada y CI/CD para despliegues ágiles.
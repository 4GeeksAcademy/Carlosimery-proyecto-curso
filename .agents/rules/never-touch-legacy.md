# Regla: never-touch-legacy

**Alcance:** Por patrón de archivo — aplica a archivos con los prefijos `legacy_`, `_old`, o archivos dentro de rutas que contengan `/legacy/`

**Descripción:** TrackFlow tiene sistemas legacy (WMS comercial, ERP de los 2010, scripts Python punto a punto sin documentar) que no deben ser modificados por el agente sin aprobación explícita del desarrollador.

## Archivos protegidos por esta regla

| Patrón | Ejemplo | Razón |
|--------|---------|-------|
| `**/legacy_*` | `legacy_wms_adapter.py` | Integraciones existentes que pueden romperse |
| `**/*_old.py` | `data_migration_old.py` | Código no documentado sin pruebas |
| `**/legacy/**` | `services/legacy/erp_bridge.py` | Sistemas que aún no han sido migrados |
| `**/erp_*` | `erp_integration.py` | ERP de principios de 2010; tocar sin contexto puede detener operaciones |
| Scripts `.py` en rutas no documentadas | Cualquier script sin tests asociados | TrackFlow tiene scripts punto a punto nunca documentados |

## Qué hacer en lugar de modificar

1. Si el desarrollador pide cambios en un archivo legacy, preguntar:
   - "¿Tienes documentación o contexto sobre cómo funciona este script?"
   - "¿Quieres que cree una nueva versión moderna en paralelo en lugar de modificar el original?"
2. Si no hay aprobación explícita, **no tocar el archivo**.
3. Preferir siempre crear una nueva implementación que interactúe con el legacy a través de la futura API Layer unificada definida en `techContext.md`.
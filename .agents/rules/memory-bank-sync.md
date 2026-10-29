# Regla: memory-bank-sync

**Alcance:** Siempre activa

**Descripción:** El agente debe sincronizar el memory bank al inicio y al final de cada sesión de trabajo.

## Comportamiento esperado

### Al inicio de la sesión
1. Leer obligatoriamente los archivos del memory bank en este orden:
   - `memory-bank/projectbrief.md`
   - `memory-bank/techContext.md`
   - `memory-bank/progress.md`
2. Leer `briefing.md` si la tarea involucra contexto de dominio de TrackFlow.
3. Leer la sección **"1b. Mapa de carpetas de producto"** de `AGENTS.md` para saber dónde debe ubicarse el código nuevo (frontend en `uis/website/` o `uis/backoffice/`; backend en `services/`).
4. Verificar que la tarea solicitada esté alineada con los objetivos y el progreso documentado.
5. Si la tarea no está reflejada en `progress.md`, detenerse y preguntar al desarrollador antes de proceder.

### Al final de la sesión (pre-commit)
1. Actualizar `memory-bank/progress.md`:
   - Mover tareas completadas de "En progreso" a "Completado".
   - Registrar nuevas tareas si surgieron durante la sesión.
   - Actualizar "Próximos pasos" si el plan cambió.
2. Si se tomaron decisiones técnicas relevantes, documentarlas en `memory-bank/techContext.md`.

## Consecuencias de no cumplir esta regla
- El memory bank queda desactualizado y la siguiente sesión comenzará con información incorrecta.
- El equipo de TrackFlow Tech (7 personas en Zaragoza) perderá trazabilidad de las decisiones.
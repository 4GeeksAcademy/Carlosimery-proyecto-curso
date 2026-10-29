# Regla: carrier-selection-rules

**Alcance:** Solicitada por el agente — el agente debe activar esta regla cuando esté trabajando en tareas relacionadas con **carrier management**, **last-mile**, **shipment optimization**, **tracking** o cualquier código/ticket que involucre a los 8 transportistas de TrackFlow.

**Descripción:** TrackFlow trabaja con 8 transportistas en dos países. Al seleccionar o recomendar un transportista para un envío, el agente debe considerar las siguientes reglas de negocio derivadas del briefing.

## Contexto de negocio (del briefing)

- **Responsable:** Carlos Vega (6 coordinadores logísticos)
- **Transportistas:** UPS, FedEx, DHL (EE.UU.) + MRW, SEUR, DHL (España) + 2 transportistas locales
- **Problema actual:** Asignación manual, sin datos históricos de rendimiento, coste por kg, ni incidencias por ruta.
- **Objetivo:** Motor de selección de transportista que recomiende la opción óptima según destino, peso y urgencia.

## Criterios de selección

Al implementar lógica de selección de transportista, el agente debe considerar:

1. **País de destino**: Determina el conjunto de transportistas disponibles.
   - EE.UU.: UPS, FedEx, DHL
   - España: MRW, SEUR, DHL + 2 locales
2. **Peso del paquete**: Cada transportista tiene límites y tarifas diferentes.
3. **Urgencia**: El tiempo de entrega requerido puede descartar opciones económicas pero lentas.
4. **Coste por kg**: Debe estimarse o calcularse si hay datos históricos disponibles.
5. **Historial de incidencias por ruta**: Si hay datos, preferir transportistas con menor tasa de incidencias en la ruta específica.
6. **Cobertura geográfica**: Algunos transportistas locales solo cubren regiones específicas.

## Formato de salida esperado

Al recomendar un transportista, el agente debe producir una salida estructurada con:

```json
{
  "recommended_carrier": "UPS",
  "alternatives": ["FedEx", "DHL"],
  "estimated_cost": 12.50,
  "estimated_delivery_days": 3,
  "confidence_factors": ["mejor precio para el peso dado", "baja tasa de incidencias en ruta"],
  "data_gaps": ["no hay datos históricos de coste por kg para esta ruta"]
}
```
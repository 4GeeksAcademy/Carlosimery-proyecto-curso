# Skill: carrier-performance-analysis

**Versión:** 1.0  
**Creada para:** TrackFlow Tech — Last Mile and Carrier Management  
**Propietario del dominio:** Carlos Vega (6 coordinadores logísticos)

---

## Objetivo único

Analizar el rendimiento histórico de los 8 transportistas de TrackFlow a partir de datos de envíos, calculando métricas clave (tasa de entrega a tiempo, incidencias por ruta, coste por kg) para alimentar el motor de selección de transportista y el dashboard de rendimiento.

---

## Inputs documentados

El skill recibe un archivo CSV con datos históricos de envíos. El archivo debe contener las siguientes columnas:

| Columna | Tipo | Formato esperado | Obligatorio | Descripción |
|---------|------|------------------|-------------|-------------|
| `shipment_id` | string | `SHP-XXXXXXXX` | Sí | Identificador único del envío |
| `carrier` | string | `UPS`, `FedEx`, `DHL`, `MRW`, `SEUR` o nombre del carrier local | Sí | Nombre del transportista |
| `country` | string | `US` o `ES` | Sí | País de origen del envío |
| `origin_warehouse` | string | `Los Angeles` o `Zaragoza` | Sí | Almacén de origen |
| `destination_city` | string | Nombre de ciudad | Sí | Ciudad de destino |
| `destination_region` | string | Código de región/estado/provincia | Sí | Región de destino |
| `weight_kg` | float | `0.5` - `100.0` | Sí | Peso del paquete en kg |
| `shipping_date` | date | `YYYY-MM-DD` | Sí | Fecha de envío |
| `delivery_date` | date | `YYYY-MM-DD` | No (null si no entregado) | Fecha de entrega |
| `delivery_status` | string | `delivered`, `in_transit`, `failed`, `lost`, `returned` | Sí | Estado actual de la entrega |
| `cost_eur` | float | `0.00` - `500.00` | No | Coste del envío en euros (null si no registrado) |
| `incident_type` | string | `none`, `wrong_address`, `damaged`, `lost`, `delayed`, `failed_attempt` | No | Tipo de incidencia (null si ninguna) |
| `client_id` | string | `CLT-XXXX` | No | Identificador del cliente asociado al envío |

### Formato de archivo
- CSV con cabecera, delimitado por comas.
- Fechas en formato ISO 8601 (`YYYY-MM-DD`).
- Valores decimales con punto como separador decimal.
- Celdas vacías para valores nulos.

---

## Proceso de análisis

El skill ejecuta los siguientes pasos en orden:

### Paso 1 — Carga y validación
- Leer el CSV con pandas.
- Validar que todas las columnas obligatorias existen.
- Rechazar el archivo con un informe de errores si alguna columna obligatoria falta.
- Informar de filas con datos inválidos sin detener el proceso.

### Paso 2 — Limpieza
- Estandarizar nombres de carriers (ej. "fedex", "Fed Ex" → "FedEx").
- Convertir fechas al formato estándar.
- Eliminar duplicados exactos de `shipment_id`.
- Normalizar países a código ISO de 2 letras.

### Paso 3 — Cálculo de métricas por transportista

Para cada transportista, calcular:

| Métrica | Definición | Fórmula |
|---------|-----------|---------|
| `total_shipments` | Número total de envíos gestionados | `COUNT(shipment_id)` |
| `on_time_delivery_rate` | Porcentaje de entregas a tiempo | `(delivered & <= 5 días) / total_delivered * 100` |
| `avg_delivery_days` | Días promedio entre envío y entrega | `AVG(delivery_date - shipping_date)` |
| `incident_rate` | Porcentaje de envíos con incidencias | `(incident_type != 'none') / total_shipments * 100` |
| `avg_cost_per_kg` | Coste promedio por kg transportado | `AVG(cost_eur / weight_kg)` |
| `lost_rate` | Porcentaje de paquetes perdidos | `(delivery_status = 'lost') / total_shipments * 100` |
| `top_incident_type` | Tipo de incidencia más frecuente | `MODE(incident_type WHERE incident_type != 'none')` |

### Paso 4 — Cálculo de métricas por ruta (carrier + región)
- Para cada combinación `(carrier, destination_region)`, calcular las mismas métricas del Paso 3.
- Identificar las 5 rutas con peor rendimiento (mayor incident_rate o menor on_time_delivery_rate).

### Paso 5 — Generación de outputs

---

## Outputs generados

### 1. Informe JSON estructurado (`carrier_performance_report.json`)
```json
{
  "report_metadata": {
    "generated_at": "2026-10-24T10:00:00Z",
    "total_shipments_analyzed": 12500,
    "date_range": {"from": "2026-01-01", "to": "2026-09-30"},
    "carriers_analyzed": 8
  },
  "carrier_summary": [
    {
      "carrier": "UPS",
      "country": "US",
      "total_shipments": 3200,
      "on_time_delivery_rate": 94.5,
      "avg_delivery_days": 2.3,
      "incident_rate": 5.2,
      "avg_cost_per_kg": 4.75,
      "lost_rate": 0.3,
      "top_incident_type": "delayed"
    }
  ],
  "route_performance": [
    {
      "carrier": "SEUR",
      "destination_region": "Madrid",
      "total_shipments": 850,
      "on_time_delivery_rate": 91.2,
      "incident_rate": 8.1,
      "avg_cost_per_kg": 3.20
    }
  ],
  "worst_routes": [
    {"carrier": "DHL", "region": "Cataluña", "incident_rate": 15.3, "recommendation": "evaluar carrier alternativo para esta ruta"}
  ],
  "data_quality_notes": [
    "cost_eur tiene 340 valores nulos (2.7% del total)",
    "delivery_date faltante en 120 envíos no entregados"
  ]
}
```

### 2. Tabla resumen en CSV (`carrier_performance_summary.csv`)
- Una fila por transportista con todas las métricas calculadas.

### 3. Tabla de rutas problemáticas en CSV (`worst_routes.csv`)
- Las 10 rutas con peor rendimiento, ordenadas por incident_rate descendente.

---

## Criterios de aceptación

El skill se considera exitoso si y solo si se cumplen **todos** los siguientes criterios:

| # | Criterio | Verificación |
|---|----------|-------------|
| CA1 | El informe JSON contiene métricas para los 8 carriers de TrackFlow (UPS, FedEx, DHL-US, MRW, SEUR, DHL-ES, +2 locales) o los que existan en los datos | El campo `carriers_analyzed` en metadata coincide con la cantidad de carriers únicos en los datos de entrada |
| CA2 | `on_time_delivery_rate` es un porcentaje entre 0 y 100 para cada transportista | Validación de rango en cada entrada de `carrier_summary` |
| CA3 | Las rutas en `worst_routes` tienen al menos una recomendación textual accionable | El campo `recommendation` no está vacío ni es un placeholder genérico |
| CA4 | `data_quality_notes` documenta todos los campos con valores nulos que superen el 1% del total de filas | Verificar que cada campo con >1% nulos aparezca listado |
| CA5 | El script no lanza excepciones no controladas con datos de entrada válidos | Ejecución completa sin errores sobre un dataset de prueba |
| CA6 | El script rechaza explícitamente un CSV que carezca de columnas obligatorias con un mensaje de error claro | Probar con CSV sin columna `carrier` → error descriptivo |
| CA7 | Los outputs se generan en la carpeta especificada por el usuario o en `./output/` por defecto | Verificar existencia de los 3 archivos de output después de la ejecución |

---

## Referencias

- **Briefing**: Sección "📦 Last mile and carrier management" — Carlos Vega necesita datos históricos de rendimiento.
- **Regla**: `.agents/rules/carrier-selection-rules.md` — las métricas generadas por este skill alimentan las reglas de selección.
- **Stack**: Python con pandas (según `techContext.md`).
- **Skill relacionada**: `skills/data-analysis/` — comparte utilidades de limpieza con pandas.
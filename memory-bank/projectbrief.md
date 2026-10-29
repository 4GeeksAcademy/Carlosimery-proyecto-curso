# Memory Bank — Project Brief

## Descripción del negocio

**TrackFlow** es una empresa de logística de última milla y gestión de almacenes fundada en 2009 en Los Ángeles, Estados Unidos. Opera en dos mercados — Estados Unidos y España — con almacenes en Los Ángeles y Zaragoza. Cuenta con unos 130 empleados y factura aproximadamente 9 millones de euros anuales.

TrackFlow se encarga de almacenar inventario, preparar y empaquetar pedidos, enviarlos a través de una red de transportistas y gestionar las devoluciones. Para las marcas que trabajan con TrackFlow, toda la operación logística es responsabilidad de la empresa.

## Problema que resuelve

Las marcas de e-commerce son buenas fabricando y vendiendo productos, pero no en hacer llegar esos productos a la puerta del cliente. TrackFlow resuelve esa brecha, pero enfrenta graves problemas internos:

- **Falta de visibilidad**: Los dos almacenes no pueden ver el inventario del otro.
- **Procesos manuales**: Los pedidos llegan por email en formatos distintos y se transcriben a mano. El picking se hace con listas en papel.
- **Sin datos estructurados**: No hay datos de rendimiento de transportistas, las devoluciones se aprueban una por una, y el CEO toma decisiones basadas en un informe ensamblado a mano.
- **Tecnología obsoleta**: Dos SGA diferentes, un ERP de principios de los 2010, scripts sin documentar y bases de datos en dos proveedores cloud distintos.

**TrackFlow Tech**, una unidad interna creada por Daniel, tiene el mandato de construir los sistemas, integraciones y automatizaciones inteligentes para modernizar la operación.

## Objetivos del proyecto

| # | Objetivo | Dónde se implementa |
|---|----------|---------------------|
| 1 | **API de inventario unificada** que devuelva stock en tiempo real de cualquier SKU en ambos almacenes | `services/inventory-api/` |
| 2 | **Pipeline de ingesta de pedidos** que parsee los emails automáticamente | `services/orders-ingestion/` |
| 3 | **Dashboard de operaciones de almacén** con alertas de stock bajo | `uis/backoffice/` |
| 4 | **Motor de selección de transportista** que recomiende la opción óptima según destino, peso y urgencia | `services/carrier-selector/` |
| 5 | **Endpoint unificado de tracking** que agregue el estado desde cualquier transportista | `services/tracking-api/` |
| 6 | **Portal de seguimiento público** para destinatarios | `uis/website/` |
| 7 | **Motor de aprobación automática de devoluciones** con reglas configurables por cliente | `services/returns-api/` |
| 8 | **Sistema de inspección asistido por IA** para clasificar el estado de productos devueltos | `services/returns-api/` + `agents/` |
| 9 | **Agente de CX** que resuelva automáticamente consultas de seguimiento y devoluciones | `agents/` + `uis/backoffice/` |
| 10 | **Sistema de tickets unificado** con base de conocimiento semántica (RAG) | `uis/backoffice/` + `services/admin-api/` |
| 11 | **CRM integrado** con informes PDF automáticos y dashboard de salud de cliente | `uis/backoffice/` + `services/admin-api/` |
| 12 | **Telemetría centralizada** para detectar fallos sin depender de WhatsApp | `infra/` + `services/` |
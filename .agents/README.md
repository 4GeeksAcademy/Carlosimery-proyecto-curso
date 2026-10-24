# .agents/

Este directorio contiene las reglas y configuraciones que los agentes de IA deben seguir al trabajar en el monorepo de TrackFlow Tech.

## Estructura

```
.agents/
├── README.md              ← Este archivo
└── rules/
    ├── memory-bank-sync.md          ← Siempre activa
    ├── never-touch-legacy.md        ← Por patrón de archivo
    └── carrier-selection-rules.md   ← Solicitada por el agente
```

## Alcances de reglas

| Regla | Alcance | Descripción |
|-------|---------|-------------|
| `memory-bank-sync` | Siempre activa | Sincronización obligatoria del memory bank al inicio y final de cada sesión |
| `never-touch-legacy` | Por patrón de archivo (`legacy_*`, `*_old`, `/legacy/`) | Prohibición de modificar código legacy sin aprobación explícita |
| `carrier-selection-rules` | Solicitada por el agente | Reglas de negocio para selección de transportistas de TrackFlow |

## Cómo añadir una nueva regla

1. Crear un archivo `.md` en `.agents/rules/` con el formato:
   - **Nombre** de la regla (como encabezado)
   - **Alcance** (siempre activa, por patrón de archivo, o solicitada por el agente)
   - **Descripción** del comportamiento esperado
   - **Consecuencias** de no cumplirla (opcional pero recomendado)
2. Actualizar la tabla de este README.
3. Actualizar `AGENTS.md` en la raíz si la regla afecta el flujo de commit.
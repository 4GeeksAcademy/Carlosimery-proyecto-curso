# .agents/

Este directorio contiene las reglas y configuraciones que los agentes de IA deben seguir al trabajar en el monorepo de TrackFlow Tech.

## Estructura

```
.agents/
├── README.md              ← Este archivo
├── rules/
│   ├── memory-bank-sync.md          ← Siempre activa
│   ├── never-touch-legacy.md        ← Por patrón de archivo
│   └── carrier-selection-rules.md   ← Solicitada por el agente
└── skills/
    └── carrier-performance/
        └── SKILL.md                 ← Definición del skill (configuración)
```

## Skills

Las **definiciones de skills** (documentos `SKILL.md`) viven en `.agents/skills/<nombre>/`
porque son configuración del agente, no código de producto. La **implementación**
(scripts ejecutables) permanece en `skills/<nombre>/` como código de producto.

| Skill | Definición | Implementación |
|-------|-----------|----------------|
| `carrier-performance` | `.agents/skills/carrier-performance/SKILL.md` | `skills/carrier-performance/carrier_performance.py` |

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
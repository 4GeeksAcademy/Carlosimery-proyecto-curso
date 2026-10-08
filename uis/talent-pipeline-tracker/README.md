# TrackFlow Talento

Aplicación interna para gestionar candidaturas en TrackFlow. El equipo de tecnología de Zaragoza desarrolla los sistemas e integraciones que dan soporte a las operaciones logísticas de la empresa en Estados Unidos y España; este panel centraliza el seguimiento de personas candidatas y sus procesos de selección.

## Funcionalidades

- Listado de candidaturas con búsqueda por nombre o email.
- Filtros por estado y etapa sincronizados con los parámetros de la URL.
- Vista de detalle con información de contacto, puesto, experiencia y documentos.
- Actualización de estado y etapa, y gestión de notas.

## Desarrollo local

Requisitos: Node.js y npm.

Configura `NEXT_PUBLIC_API_URL` en `.env.local` con la URL base del servicio que expone la API de candidaturas. Después instala las dependencias e inicia el servidor:

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

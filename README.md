# Portafolio de Juan Montenegro

Aplicacion web full stack para presentar proyectos de desarrollo. Incluye un panel
de administracion con autenticacion para crear y mantener los proyectos, con manejo
de imagenes en Cloudinary.

## Tecnologias

- Frontend: React con Vite (JavaScript), React Router, Axios. Estilos en CSS modular.
- Backend: Node.js con Express, CORS, validacion con Zod, JWT, bcryptjs.
- Base de datos: PostgreSQL (acceso mediante pool de conexiones).
- Imagenes: Cloudinary.
- Contenedores: Docker y Docker Compose.

## Estructura del repositorio

```
juan-montenegro-portafolio/
  backend/    API REST con Express
  frontend/   SPA construida con Vite y React
  docker-compose.yml
```

## Puesta en marcha con Docker

1. Copiar `docker-compose.example.yml` a `docker-compose.yml`:
   - Linux/macOS: `cp docker-compose.example.yml docker-compose.yml`
   - Windows (PowerShell): `Copy-Item docker-compose.example.yml docker-compose.yml`
2. Copiar los archivos de ejemplo de variables de entorno:
   - `.env.example` a `.env` en la raiz.
   - `backend/.env.example` a `backend/.env`.
   - `frontend/.env.example` a `frontend/.env`.
3. Completar los valores reales (base de datos, JWT, Cloudinary).
4. Levantar los servicios: `docker compose up --build`.
5. Aplicar el esquema de base de datos: `docker compose exec backend npm run migrate`.

La SPA queda disponible en `http://localhost:5173` y la API en `http://localhost:4000/api`.

## Flujo de desarrollo

- Una rama por funcionalidad o correccion, en ingles y kebab-case (ej: `feat/auth-middleware`).
- Commits atomicos en espanol siguiendo Conventional Commits (ej: `fix: correccion del seteo de token en login`).
- Las ramas se integran a `main` mediante Pull Requests para no afectar produccion.

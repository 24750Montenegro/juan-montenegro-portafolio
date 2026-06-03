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

## Secciones del portafolio

La sala se recorre con el personaje y, al acercarse a un objeto y pulsar `E`, se
abre una pantalla. Ademas de Proyectos y Arcade existen:

- Conocimientos: habilidades con barra de progreso por categoria.
- Logros: tarjetas con imagen opcional.
- Social: los visitantes dejan calificacion (1 a 5) y comentario, visibles de
  inmediato.

La posicion de cada zona se ajusta con el editor de la sala (boton de
herramientas) y se persiste en el navegador.

## Administracion

Solo el dueno gestiona los CRUD. El resto de visitantes solo ve la informacion
(salvo el envio publico de resenas).

1. Crear el unico usuario administrador una sola vez:
   `POST /api/auth/registro` con `{ nombre, email, password }`. El registro se
   deshabilita automaticamente despues.
2. En la zona de Proyectos, usar el boton `ADMIN` para iniciar sesion. Con la
   sesion activa aparecen los controles de alta, edicion y borrado en Proyectos,
   Conocimientos, Logros y el borrado de resenas en Social.

Cada endpoint expone lectura publica (`GET`) y escritura protegida por token:
`/api/conocimientos`, `/api/logros` (con imagen) y `/api/resenas` (creacion
publica, borrado solo admin).

## Iconos de proyectos

Los proyectos muestran un icono de GitHub y/o de enlace solo si tienen ese dato.
Los archivos `frontend/src/assets/github.png` y `frontend/src/assets/link.png`
son provisionales; reemplazarlos por los iconos pixelart definitivos conservando
el nombre y la ruta.

## Flujo de desarrollo

- Una rama por funcionalidad o correccion, en ingles y kebab-case (ej: `feat/auth-middleware`).
- Commits atomicos en espanol siguiendo Conventional Commits (ej: `fix: correccion del seteo de token en login`).
- Las ramas se integran a `main` mediante Pull Requests para no afectar produccion.

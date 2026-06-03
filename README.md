# Portafolio de Juan Montenegro

Sitio en vivo: https://jfmonte.com

Portafolio interactivo con forma de cuarto pixelart: el visitante recorre la sala
con un personaje y, al acercarse a un objeto y pulsar `E`, abre cada seccion
(proyectos, conocimientos, logros, social y un mini arcade). Incluye un panel de
administracion con autenticacion para que solo el dueno gestione el contenido.

## Tecnologias

- Frontend: React con Vite (JavaScript), React Router, Axios. Estilos en CSS modular.
- Backend: Node.js con Express, CORS, validacion con Zod, JWT, bcryptjs.
- Base de datos: PostgreSQL. En produccion se usa Supabase; en local, un contenedor
  de Postgres incluido en Docker Compose.
- Imagenes: Cloudinary. PDF del portafolio: Supabase Storage.
- Contenedores: Docker y Docker Compose.

## Estructura del repositorio

```
juan-montenegro-portafolio/
  backend/    API REST con Express
  frontend/   SPA construida con Vite y React
  docker-compose.yml
```

## Puesta en marcha en local (Docker)

1. Copiar `docker-compose.example.yml` a `docker-compose.yml`:
   - Linux/macOS: `cp docker-compose.example.yml docker-compose.yml`
   - Windows (PowerShell): `Copy-Item docker-compose.example.yml docker-compose.yml`
2. Copiar los archivos de ejemplo de variables de entorno:
   - `.env.example` a `.env` en la raiz (credenciales del Postgres del contenedor).
   - `backend/.env.example` a `backend/.env`.
   - `frontend/.env.example` a `frontend/.env`.
3. Completar los valores reales. Para la base de datos local, el `DATABASE_URL`
   del backend ya apunta al contenedor `db`. Cloudinary es obligatorio para
   imagenes; Supabase Storage (`SUPABASE_*`) solo se necesita para subir el PDF
   del portafolio.
4. Levantar los servicios: `docker compose up --build`.
5. Aplicar el esquema de base de datos: `docker compose exec backend npm run migrate`.

La SPA queda disponible en `http://localhost:5173` y la API en `http://localhost:4000/api`.

Tambien se puede correr sin Docker: `npm install` y `npm run dev` en `backend/` y
en `frontend/` por separado (requiere un Postgres accesible via el `DATABASE_URL`).

## Secciones del portafolio

La sala se recorre con el personaje y cada objeto abre una pantalla con `E`:

- Proyectos (computadora): lista con imagen, etiquetas e iconos de GitHub/enlace.
- Conocimientos (estanteria): tecnologias con logo, detalle y barra de progreso,
  presentadas como las hojas de un libro.
- Logros (medalla): vitrina de logros (diplomas, noticias, hitos) con imagen.
- Social (tablero): pestana de Contacto con el PDF del portafolio e iconos de
  contacto, y pestana de Resenas donde los visitantes dejan calificacion (1 a 5)
  y comentario, visibles de inmediato.
- Arcade (TV): mini juego Breakout.

Al iniciar una sesion aparece una bienvenida que indica donde esta cada zona. La
posicion de las zonas y objetos se ajusta con el editor de la sala, que se revela
con el codigo Konami.

## Administracion

Solo el dueno gestiona los CRUD; el resto de visitantes solo ve la informacion
(salvo el envio publico de resenas).

1. Crear el unico usuario administrador una sola vez:
   `POST /api/auth/registro` con `{ nombre, email, password }`. El registro se
   deshabilita automaticamente despues.
2. En la zona de Proyectos, usar el boton `ADMIN` para iniciar sesion. Con la
   sesion activa aparecen los controles de alta, edicion y borrado en todas las
   secciones.

Endpoints: lectura publica (`GET`) y escritura protegida por token en
`/api/proyectos`, `/api/conocimientos`, `/api/logros` (con imagen) y `/api/perfil`
(contacto y PDF). En `/api/resenas` la creacion es publica y el borrado solo admin.

## Despliegue

- Frontend en GitHub Pages con dominio propio (`jfmonte.com`):
  - `npm run build` en `frontend/` y publicar `dist/`.
  - Con dominio propio el sitio se sirve en la raiz, asi que la base de Vite es `/`.
  - Para que las rutas del SPA no den 404 al recargar, duplicar `index.html` como
    `404.html` en la publicacion.
  - `frontend/.env`: `VITE_API_URL` debe apuntar a la URL HTTPS del backend.
- Backend en Render (u otro servicio de Node persistente):
  - Render inyecta `PORT`; el server ya escucha en `process.env.PORT`.
  - Configurar las variables de entorno (`DATABASE_URL`, `JWT_SECRET`,
    `CLOUDINARY_*`, `SUPABASE_*`) y `CLIENT_ORIGIN=https://jfmonte.com` para CORS.
  - Con base de datos en Supabase, usar la cadena del pooler (compatible con IPv4).
  - En el plan gratuito el servicio se suspende tras inactividad, por lo que la
    primera peticion despues de un rato tarda mas (arranque en frio).

## Iconos pixelart

Algunos iconos (`github.png`, `link.png`, `gmail.png`, `linkedin.png` en
`frontend/src/assets/`) pueden venir como provisionales; reemplazarlos por el arte
definitivo conservando el nombre y la ruta. Cada icono se muestra solo si el dato
correspondiente existe.

## Flujo de desarrollo

- Una rama por funcionalidad o correccion, en ingles y kebab-case (ej: `feat/auth-middleware`).
- Commits atomicos en espanol siguiendo Conventional Commits (ej: `fix: correccion del seteo de token en login`).
- Las ramas se integran a `main` mediante Pull Requests para no afectar produccion.

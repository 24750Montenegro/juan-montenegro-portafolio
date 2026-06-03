-- Esquema inicial del portafolio: usuarios administradores y proyectos

CREATE TABLE IF NOT EXISTS usuarios (
  id             SERIAL PRIMARY KEY,
  nombre         VARCHAR(80)  NOT NULL,
  email          VARCHAR(160) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  creado_en      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proyectos (
  id              SERIAL PRIMARY KEY,
  titulo          VARCHAR(120) NOT NULL,
  descripcion     TEXT         NOT NULL,
  imagen_url      VARCHAR(500),
  imagen_id       VARCHAR(255),
  repo_url        VARCHAR(500),
  demo_url        VARCHAR(500),
  etiquetas       TEXT[]       NOT NULL DEFAULT '{}',
  destacado       BOOLEAN      NOT NULL DEFAULT FALSE,
  orden           INTEGER      NOT NULL DEFAULT 0,
  creado_en       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  actualizado_en  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proyectos_orden ON proyectos (orden);

-- Conocimientos: habilidades con logo, detalle y nivel de progreso
CREATE TABLE IF NOT EXISTS conocimientos (
  id              SERIAL PRIMARY KEY,
  nombre          VARCHAR(80)  NOT NULL,
  categoria       VARCHAR(60),
  descripcion     TEXT,
  nivel           INTEGER      NOT NULL DEFAULT 0,
  imagen_url      VARCHAR(500),
  imagen_id       VARCHAR(255),
  orden           INTEGER      NOT NULL DEFAULT 0,
  creado_en       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  actualizado_en  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Columnas agregadas despues de la creacion inicial (para bases ya migradas)
ALTER TABLE conocimientos ADD COLUMN IF NOT EXISTS descripcion TEXT;
ALTER TABLE conocimientos ADD COLUMN IF NOT EXISTS imagen_url VARCHAR(500);
ALTER TABLE conocimientos ADD COLUMN IF NOT EXISTS imagen_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_conocimientos_orden ON conocimientos (orden);

-- Logros: reconocimientos con imagen opcional
CREATE TABLE IF NOT EXISTS logros (
  id              SERIAL PRIMARY KEY,
  titulo          VARCHAR(120) NOT NULL,
  descripcion     TEXT,
  fecha           VARCHAR(40),
  imagen_url      VARCHAR(500),
  imagen_id       VARCHAR(255),
  orden           INTEGER      NOT NULL DEFAULT 0,
  creado_en       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  actualizado_en  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logros_orden ON logros (orden);

-- Resenas: calificacion y comentario de los visitantes
CREATE TABLE IF NOT EXISTS resenas (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(80) NOT NULL,
  calificacion  SMALLINT    NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
  comentario    TEXT        NOT NULL,
  creado_en     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resenas_creado ON resenas (creado_en DESC);

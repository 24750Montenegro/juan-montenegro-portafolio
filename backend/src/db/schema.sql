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

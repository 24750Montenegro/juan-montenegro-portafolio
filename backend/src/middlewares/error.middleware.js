// Middlewares para respuestas de error uniformes en toda la API

// Responde 404 cuando ninguna ruta coincide con la peticion
export const noEncontrado = (req, res) => {
  res.status(404).json({ mensaje: 'Recurso no encontrado' });
};

// Captura cualquier error propagado y devuelve un formato consistente
export const manejadorErrores = (error, req, res, next) => {
  const estado = error.status || 500;
  // Solo se registran en consola los errores internos no esperados
  if (estado >= 500) console.error(error);
  res.status(estado).json({ mensaje: error.publico || 'Error interno del servidor' });
};

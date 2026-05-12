// Middleware que valida el cuerpo de la peticion contra un esquema Zod
export const validar = (esquema) => (req, res, next) => {
  const resultado = esquema.safeParse(req.body);
  if (!resultado.success) {
    return res.status(400).json({
      mensaje: 'Datos invalidos',
      errores: resultado.error.flatten().fieldErrors,
    });
  }
  // Se reemplaza el cuerpo por los datos ya validados y normalizados
  req.body = resultado.data;
  next();
};

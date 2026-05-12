// Envuelve un controlador async y reenvia cualquier error al middleware
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Optimizacion de entrega de imagenes de Cloudinary: inserta f_auto (formato
// moderno como WebP/AVIF segun navegador), q_auto (calidad automatica) y un
// ancho maximo. Las URLs que no son de Cloudinary se devuelven sin cambios.
export function optimizarImagen(url, ancho = 800) {
  if (!url || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${ancho},c_limit/`)
}

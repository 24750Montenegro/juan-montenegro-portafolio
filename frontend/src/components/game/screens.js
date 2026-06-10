import monitorImg from '../../assets/monitor.webp'
import tvImg from '../../assets/tv.webp'

// Marcos (imagenes pixelart) que actuan de "pantalla". El area de la pantalla
// es la zona transparente del centro, medida sobre la imagen y expresada como
// inset (% desde cada borde). El contenido del modal se posiciona exactamente
// dentro de ese rectangulo para no tapar el marco.
export const SCREEN_FRAMES = {
  monitor: {
    src: monitorImg,
    width: 2186,
    height: 1952,
    screen: { left: 8.46, top: 11.78, right: 7.18, bottom: 29.82 },
  },
  tv: {
    src: tvImg,
    width: 2432,
    height: 1728,
    screen: { left: 23.48, top: 19.73, right: 23.19, bottom: 19.1 },
  },
}

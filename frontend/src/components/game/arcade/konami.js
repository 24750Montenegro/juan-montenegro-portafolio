// Deteccion del codigo Konami compartida por todos los juegos del arcade.
// Tres formas: todo WASD, todo flechas (ambas terminan en B A) y la version
// de la botonera en pantalla (cruceta = flechas, boton B = 'b' y boton
// A = espacio), para poder hacer el easter egg tambien en movil.
const KONAMI_WASD = ['w', 'w', 's', 's', 'a', 'd', 'a', 'd', 'b', 'a']
const KONAMI_ARROW = [
  'arrowup', 'arrowup', 'arrowdown', 'arrowdown',
  'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a',
]
const KONAMI_PAD = [...KONAMI_ARROW.slice(0, 9), ' ']
const SECUENCIAS = [KONAMI_WASD, KONAMI_ARROW, KONAMI_PAD].map((s) => s.join(','))
const LEN = 10

// Crea un detector con buffer propio. feed(key) devuelve true al completarse.
export function createKonamiDetector() {
  let buffer = []
  return (key) => {
    buffer.push(key)
    if (buffer.length > LEN) buffer = buffer.slice(-LEN)
    if (buffer.length < LEN) return false
    const seq = buffer.join(',')
    if (SECUENCIAS.includes(seq)) {
      buffer = []
      return true
    }
    return false
  }
}

// Deteccion del codigo Konami compartida por todos los juegos del arcade.
// Se aceptan dos formas: todo WASD o todo flechas; ambas terminan en B A.
const KONAMI_WASD = ['w', 'w', 's', 's', 'a', 'd', 'a', 'd', 'b', 'a']
const KONAMI_ARROW = [
  'arrowup', 'arrowup', 'arrowdown', 'arrowdown',
  'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a',
]
const LEN = 10

// Crea un detector con buffer propio. feed(key) devuelve true al completarse.
export function createKonamiDetector() {
  let buffer = []
  return (key) => {
    buffer.push(key)
    if (buffer.length > LEN) buffer = buffer.slice(-LEN)
    if (buffer.length < LEN) return false
    const seq = buffer.join(',')
    if (seq === KONAMI_WASD.join(',') || seq === KONAMI_ARROW.join(',')) {
      buffer = []
      return true
    }
    return false
  }
}

// Constantes compartidas por los juegos del arcade de la TV.
// Resolucion logica del canvas (proporcion ~ a la pantalla de la TV: 1.227)
export const W = 328
export const H = 268

// Zona reservada para el HUD en la parte superior
export const PLAY_TOP = 30

// Paleta retro comun a todos los juegos
export const PALETTE = ['#ff2e88', '#ff7b00', '#fffb96', '#2cf6c2', '#7ad7ff']

// Dibuja texto pixelart con la fuente del arcade
export function pixelText(ctx, str, x, y, size, color, align = 'center') {
  ctx.fillStyle = color
  ctx.font = `${size}px "Press Start 2P", monospace`
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.fillText(str, x, y)
}

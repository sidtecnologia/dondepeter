export function money(v) {
  const value = Math.floor(v)
  return value.toLocaleString('es-CO')
}
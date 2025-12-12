export const money = v => {
  const value = Math.floor(Number(v) || 0)
  return value.toLocaleString('es-CO')
}
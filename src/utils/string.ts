// Función que se encarga de pasar a mayúsculas un string
export function toUpper (thing: string): string {
  return thing !== '' ? thing?.toUpperCase() : thing
}

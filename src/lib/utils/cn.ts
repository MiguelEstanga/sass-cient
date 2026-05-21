/**
 * Helper para combinar clases CSS de forma condicional.
 * Filtra valores falsy (false, null, undefined, "").
 *
 * Ejemplo:
 *   cn("btn", isActive && "btn-active", disabled && "btn-disabled")
 */
export function cn(
  ...classes: Array<any>
): string {
  return classes.filter(Boolean).join(" ");
}
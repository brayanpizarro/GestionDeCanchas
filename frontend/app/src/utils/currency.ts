/**
 * Formatea un número como precio chileno
 * @param amount - Monto a formatear
 * @returns String formateado como precio chileno
 */
export function formatChileanCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
}

/**
 * Formatea un número como precio chileno sin símbolo
 * @param amount - Monto a formatear
 * @returns String formateado como número chileno
 */
export function formatChileanNumber(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat('es-CL').format(numAmount);
}

/**
 * Convierte un string formateado a número
 * @param formattedAmount - String formateado (ej: "$8.500")
 * @returns Número limpio
 */
export function parseChileanCurrency(formattedAmount: string): number {
  return parseInt(formattedAmount.replace(/[^\d]/g, ''));
}

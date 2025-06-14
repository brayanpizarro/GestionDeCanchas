/**
 * Utilidades para validación de RUT chileno en el backend
 */

/**
 * Limpia el RUT removiendo puntos y guiones
 */
export function cleanRut(rut: string): string {
  return rut.replace(/[.-]/g, '').toUpperCase();
}

/**
 * Calcula el dígito verificador del RUT
 */
function calculateVerifier(rut: string): string {
  const rutNumbers = rut.split('').map(Number);
  const multipliers = [2, 3, 4, 5, 6, 7];
  let sum = 0;
  let multiplierIndex = 0;
  
  // Calcular desde el último dígito hacia el primero
  for (let i = rutNumbers.length - 1; i >= 0; i--) {
    sum += rutNumbers[i] * multipliers[multiplierIndex];
    multiplierIndex = (multiplierIndex + 1) % multipliers.length;
  }
  
  const remainder = sum % 11;
  const verifier = 11 - remainder;
  
  if (verifier === 11) return '0';
  if (verifier === 10) return 'K';
  return verifier.toString();
}

/**
 * Valida si un RUT es válido
 */
export function isValidRut(rut: string): boolean {
  if (!rut || typeof rut !== 'string') return false;
  
  const cleanedRut = cleanRut(rut);
  
  // Verificar formato básico (al menos 2 caracteres)
  if (cleanedRut.length < 2) return false;
  
  // Separar cuerpo y dígito verificador
  const body = cleanedRut.slice(0, -1);
  const verifier = cleanedRut.slice(-1);
  
  // Verificar que el cuerpo sean solo números
  if (!/^\d+$/.test(body)) return false;
  
  // Verificar que el dígito verificador sea válido
  if (!/^[0-9K]$/.test(verifier)) return false;
  
  // Verificar longitud (entre 7 y 8 dígitos para el cuerpo)
  if (body.length < 7 || body.length > 8) return false;
  
  // Calcular y verificar el dígito verificador
  const expectedVerifier = calculateVerifier(body);
  return verifier === expectedVerifier;
}

/**
 * Obtiene un mensaje de error específico para el RUT
 */
export function getRutErrorMessage(rut: string): string | null {
  if (!rut || rut.trim() === '') {
    return 'El RUT es obligatorio';
  }
  
  const cleanedRut = cleanRut(rut);
  
  if (cleanedRut.length < 2) {
    return 'El RUT debe tener al menos 8 dígitos';
  }
  
  const body = cleanedRut.slice(0, -1);
  const verifier = cleanedRut.slice(-1);
  
  if (!/^\d+$/.test(body)) {
    return 'El RUT debe contener solo números antes del dígito verificador';
  }
  
  if (!/^[0-9K]$/.test(verifier)) {
    return 'El dígito verificador debe ser un número del 0-9 o K';
  }
  
  if (body.length < 7 || body.length > 8) {
    return 'El RUT debe tener entre 7 y 8 dígitos';
  }
  
  if (!isValidRut(rut)) {
    return 'El RUT ingresado no es válido';
  }
  
  return null;
}

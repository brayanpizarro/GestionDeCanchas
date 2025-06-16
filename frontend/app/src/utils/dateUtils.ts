/**
 * Utility functions for handling dates and times without timezone conversion
 */

/**
 * Formats a date string to display the exact date stored in the database
 * without timezone conversion
 */
export const formatReservationDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  // Usar siempre componentes UTC ya que las fechas vienen con Z
  const day = date.getUTCDate().toString().padStart(2, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = date.getUTCFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Formats a date string to display the exact time stored in the database
 * without timezone conversion
 */
export const formatReservationTime = (dateString: string): string => {
  const date = new Date(dateString);
  
  // Usar siempre componentes UTC ya que las fechas vienen con Z
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

/**
 * Formats a date string to display the full date with weekday
 * without timezone conversion
 */
export const formatReservationFullDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  const weekdays = [
    'domingo', 'lunes', 'martes', 'miércoles', 
    'jueves', 'viernes', 'sábado'
  ];
  
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  
  // Usar siempre componentes UTC ya que las fechas vienen con Z
  const weekday = weekdays[date.getUTCDay()];
  const day = date.getUTCDate();
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  
  return `${weekday}, ${day} de ${month} de ${year}`;
};

/**
 * Formats a time range for reservations
 */
export const formatReservationTimeRange = (startTime: string, endTime: string): string => {
  return `${formatReservationTime(startTime)} - ${formatReservationTime(endTime)}`;
};

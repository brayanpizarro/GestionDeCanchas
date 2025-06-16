export function formatReservationDateBackend(dateString: string): string {
    const date = new Date(dateString);
    
    // Extraer componentes UTC directamente (sin conversión de zona horaria)
    const day = date.getUTCDate();
    const month = date.getUTCMonth();
    const year = date.getUTCFullYear();
    
    const monthNames = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    return `${day} de ${monthNames[month]} de ${year}`;
}

export function formatReservationTimeBackend(dateString: string): string {
    const date = new Date(dateString);
    
    // Extraer componentes UTC directamente (sin conversión de zona horaria)
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    
    // Formatear con ceros a la izquierda
    const hoursStr = hours.toString().padStart(2, '0');
    const minutesStr = minutes.toString().padStart(2, '0');
    
    return `${hoursStr}:${minutesStr}`;
}

export function formatReservationTimeRangeBackend(startTime: string, endTime: string): string {
    const formattedStart = formatReservationTimeBackend(startTime);
    const formattedEnd = formatReservationTimeBackend(endTime);
    return `${formattedStart} - ${formattedEnd}`;
}

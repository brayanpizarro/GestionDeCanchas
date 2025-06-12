export interface Court {
    id: number
    name: string
    description: string
    price: number
    imageUrl: string
    imagePath?: string
    available: boolean
    maxPlayers: number
    capacity?: number
    pricePerHour?: number
    status?: string
}

export interface Player {
    firstName: string
    lastName: string
    rut: string
    age: number
}

export interface Equipment {
    id: string
    name: string
    description: string
    price: number
    available: boolean
    imageUrl: string
}

export interface TimeSlot {
    startTime: Date | string
    endTime: Date | string
    available: boolean
}

export interface CreateReservationDto {
    courtId: number
    userId: number
    startTime: string
    endTime: string
    players: Player[]
}

export interface ReservationSummary {
    court: Court | null
    date: Date
    time: string | null
    duration: number
    equipment: Equipment[]
    players: Player[]
    total: number
}

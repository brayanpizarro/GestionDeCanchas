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
    type?: "covered" | "uncovered"
    isCovered?: boolean
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

export interface SelectedEquipment {
    id: string
    name: string
    price: number
    quantity: number
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
    equipment?: SelectedEquipment[]
}

export interface ReservationSummary {
    court: Court | null
    date: Date
    time: string | null
    duration: number
    equipment: SelectedEquipment[]
    players: Player[]
    total: number
}

export interface Reservation {
    id: number
    courtId: number
    userId: number
    startTime: string
    endTime: string
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
    totalAmount: number
    createdAt: string
    updatedAt: string
    court?: Court
    user?: {
        id: number
        name: string
        email: string
    }
}

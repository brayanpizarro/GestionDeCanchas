
export interface CreateReservationDto {
    courtId: number;
    userId: number;
    startTime: string;
    endTime: string;
}

export interface TimeSlot {
    startTime: Date;
    endTime: Date;
}

export interface Reservation {
    id: number;
    startTime: Date;
    endTime: Date;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    amount: number;
    court: {
        id: number;
        name: string;
        type: string;
    };
    user: {
        id: number;
        name: string;
        email: string;
    };
}

const API_URL = 'http://localhost:3000/api/v1/reservations';

export interface CreateReservationDTO {
    courtId: number;
    userId: number;
    startTime: string;
    endTime: string;
}

class ReservationService {
    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        
        return headers;
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.message || 
                `HTTP Error: ${response.status} ${response.statusText}`
            );
        }
        return response.json();
    }

    async createReservation(data: CreateReservationDTO): Promise<Reservation> {
        const response = await fetch(`${API_URL}/reservations`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        return this.handleResponse<Reservation>(response);
    }

    async getUserReservations(userId: number): Promise<Reservation[]> {
        const response = await fetch(`${API_URL}/reservations/user/${userId}`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });
        
        return this.handleResponse<Reservation[]>(response);
    }

    async getReservation(id: number): Promise<Reservation> {
        const response = await fetch(`${API_URL}/reservations/${id}`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });
        
        return this.handleResponse<Reservation>(response);
    }

    async updateReservationStatus(
        id: number, 
        status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
    ): Promise<Reservation> {
        const response = await fetch(`${API_URL}/reservations/${id}/status`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ status })
        });
        
        return this.handleResponse<Reservation>(response);
    }

    async getAvailableTimeSlots(courtId: number, date: string): Promise<TimeSlot[]> {
        const url = new URL(`${API_URL}/reservations/available/${courtId}`);
        url.searchParams.append('date', date);
        
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: this.getAuthHeaders()
        });
        
        return this.handleResponse<TimeSlot[]>(response);
    }

    async deleteReservation(id: number): Promise<void> {
        const response = await fetch(`${API_URL}/reservations/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.message || 
                `HTTP Error: ${response.status} ${response.statusText}`
            );
        }
    }
}

export const reservationService = new ReservationService();
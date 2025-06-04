const API_URL = 'http://localhost:3001/api/v1';

export interface WeeklyStats {
    name: string;
    reserves: number;
    ingress: number;
}

export interface CourtUsage {
    name: string;
    value: number;
    color: string;
}

export interface RecentReservation {
    id: number;
    court: string;
    player: string;
    time: string;
    date: string;
    status: string;
    amount: string;
}

export interface TopPlayer {
    id: number;
    name: string;
    reserves: number;
    gasto: string;
    nivel: string;
    avatar: string;
}

export interface DashboardStats {
    reservationsToday: number;
    dailyIncome: number;
    activePlayers: number;
    occupancyRate: number;
    weeklyStats: WeeklyStats[];
    courtUsage: CourtUsage[];
    recentReservations: RecentReservation[];
    topPlayers: TopPlayer[];
}

export interface Court {
    id: number;
    name: string;
    type: 'covered' | 'uncovered';
    status: 'available' | 'occupied' | 'maintenance';
    capacity: number;
    pricePerHour: number;
    image?: string;
    rating?: number;
    reservasHoy?: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
}

export interface Reservation {
    id: number;
    courtId: number;
    userId: number;
    startTime: string;
    endTime: string;
    status: string;
    amount: number;
    court?: Court;
    user?: User;
}

// Admin email constant
export const ADMIN_CREDENTIALS = {email : 'administradorucn@gmail.com', password: 'Admin2025:)'};

class DashboardService {    private getAuthHeaders() {
        return {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
        };
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Error en la solicitud');
        }
        return response.json();
    }

    async getDashboardStats(): Promise<DashboardStats> {
        try {
            const response = await fetch(`${API_URL}/dashboard/stats`, {
                headers: this.getAuthHeaders()
            });
            return this.handleResponse<DashboardStats>(response);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    }

    async getCourts(): Promise<Court[]> {
        try {
            const response = await fetch(`${API_URL}/courts`, {
                headers: this.getAuthHeaders()
            });
            const courts = await this.handleResponse<any[]>(response);
            
            return courts.map(court => ({
                id: court.id,
                name: court.name,
                type: court.type || 'uncovered',
                status: court.status,
                capacity: court.capacity,
                pricePerHour: Number(court.pricePerHour),
                image: court.image || '/api/placeholder/400/300',
                lastMaintenance: court.updatedAt,
                reservations: 0 // Este dato se podría actualizar con datos reales más adelante
            }));
        } catch (error) {
            console.error('Error fetching courts:', error);
            throw error;
        }
    }    async createCourt(courtData: FormData): Promise<Court> {
    try {
        const response = await fetch(`${API_URL}/courts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: courtData
        });
        return this.handleResponse<Court>(response);
    } catch (error) {
        console.error('Error creating court:', error);
        throw error;
    }
    }

    async updateCourt(id: number, courtData: Partial<Court>): Promise<Court> {
        try {
            const response = await fetch(`${API_URL}/courts/${id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(courtData)
            });
            return this.handleResponse<Court>(response);
        } catch (error) {
            console.error('Error updating court:', error);
            throw error;
        }
    }

    async deleteCourt(id: number): Promise<void> {
        try {
            const response = await fetch(`${API_URL}/courts/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            await this.handleResponse<void>(response);
        } catch (error) {
            console.error('Error deleting court:', error);
            throw error;
        }
    }

    async getReservations(): Promise<Reservation[]> {
        try {
            const response = await fetch(`${API_URL}/reservations`, {
                headers: this.getAuthHeaders()
            });
            return this.handleResponse<Reservation[]>(response);
        } catch (error) {
            console.error('Error fetching reservations:', error);
            throw error;
        }
    }

    async createReservation(reservationData: Omit<Reservation, 'id'>): Promise<Reservation> {
        try {
            const response = await fetch(`${API_URL}/reservations`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(reservationData)
            });
            return this.handleResponse<Reservation>(response);
        } catch (error) {
            console.error('Error creating reservation:', error);
            throw error;
        }
    }

    async updateReservation(id: number, reservationData: Partial<Reservation>): Promise<Reservation> {
        try {
            const response = await fetch(`${API_URL}/reservations/${id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(reservationData)
            });
            return this.handleResponse<Reservation>(response);
        } catch (error) {
            console.error('Error updating reservation:', error);
            throw error;
        }
    }
}

export const dashboardService = new DashboardService();
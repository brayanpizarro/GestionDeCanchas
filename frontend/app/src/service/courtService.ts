const API_URL = 'http://localhost:3001/api/v1';

export interface Court {
    id: number;
    name: string;
    type: 'covered' | 'uncovered';
    capacity: number;
    pricePerHour: number;
    status: 'available' | 'occupied' | 'maintenance';
    imagePath?: string;
}

export interface CreateCourtData {
    name: string;
    type: 'covered' | 'uncovered';
    capacity: number;
    pricePerHour: number;
    status: 'available' | 'occupied' | 'maintenance';
    image?: File;
}

class CourtService {
    private getAuthHeaders() {
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

    async getAllCourts(): Promise<Court[]> {
        try {
            const response = await fetch(`${API_URL}/courts`, {
                headers: this.getAuthHeaders()
            });
            return this.handleResponse<Court[]>(response);
        } catch (error) {
            console.error('Error fetching courts:', error);
            throw error;
        }
    }

    async createCourt(data: CreateCourtData): Promise<Court> {
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('type', data.type);
            formData.append('capacity', data.capacity.toString());
            formData.append('pricePerHour', data.pricePerHour.toString());
            formData.append('status', data.status);
            
            if (data.image) {
                formData.append('image', data.image);
            }

            const response = await fetch(`${API_URL}/courts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: formData
            });
            return this.handleResponse<Court>(response);
        } catch (error) {
            console.error('Error creating court:', error);
            throw error;
        }
    }

    async updateCourt(id: number, data: Partial<CreateCourtData>): Promise<Court> {
        try {
            const formData = new FormData();
            
            if (data.name) formData.append('name', data.name);
            if (data.type) formData.append('type', data.type);
            if (data.capacity) formData.append('capacity', data.capacity.toString());
            if (data.pricePerHour) formData.append('pricePerHour', data.pricePerHour.toString());
            if (data.status) formData.append('status', data.status);
            if (data.image) formData.append('image', data.image);

            const response = await fetch(`${API_URL}/courts/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: formData
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
            
            if (!response.ok) {
                throw new Error('Error deleting court');
            }
        } catch (error) {
            console.error('Error deleting court:', error);
            throw error;
        }
    }
}

export default new CourtService();

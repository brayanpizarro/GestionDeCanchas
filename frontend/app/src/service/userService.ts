const API_URL = 'http://localhost:3001/api/v1';

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'admin' ;
    status: 'active' | 'suspended' | 'inactive';
    phone: string;
    joinDate: string;
    totalReservations: number;
    totalSpent: number;
}

export interface CreateUserData {
    name: string;
    email: string;
    password: string;
    role?: 'user' | 'admin';
    phone?: string;
}

export interface UpdateUserData {
    name?: string;
    email?: string;
    role?: 'user' | 'admin';
    status?: 'active' | 'suspended' | 'inactive';
    phone?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
}

class UserService {
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

    async getAllUsers(): Promise<User[]> {
        try {
            const response = await fetch(`${API_URL}/users`, {
                headers: this.getAuthHeaders()
            });
            return this.handleResponse<User[]>(response);
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    async getUserById(id: number): Promise<User> {
        try {
            const response = await fetch(`${API_URL}/users/${id}`, {
                headers: this.getAuthHeaders()
            });
            return this.handleResponse<User>(response);
        } catch (error) {
            console.error(`Error fetching user ${id}:`, error);
            throw error;
        }
    }

    async getCurrentUser(): Promise<User | null> {
        try {
            const response = await fetch(`${API_URL}/users/me`, {
                headers: this.getAuthHeaders()
            });
            return this.handleResponse<User>(response);
        } catch (error) {
            console.error('Error fetching current user:', error);
            return null;
        }
    }

    async createUser(userData: CreateUserData): Promise<User> {
        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(userData)
            });
            return this.handleResponse<User>(response);
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async updateUser(id: number, userData: UpdateUserData): Promise<User> {
        try {
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(userData)
            });
            return this.handleResponse<User>(response);
        } catch (error) {
            console.error(`Error updating user ${id}:`, error);
            throw error;
        }
    }

    async updateCurrentUser(userData: UpdateUserData): Promise<User> {
        try {
            const response = await fetch(`${API_URL}/users/me`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(userData)
            });
            return this.handleResponse<User>(response);
        } catch (error) {
            console.error('Error updating current user:', error);
            throw error;
        }
    }

    async deleteUser(id: number): Promise<void> {
        try {
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            await this.handleResponse<void>(response);
        } catch (error) {
            console.error(`Error deleting user ${id}:`, error);
            throw error;
        }
    }

    async register(userData: CreateUserData): Promise<LoginResponse> {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            const data = await this.handleResponse<LoginResponse>(response);
            localStorage.setItem('authToken', data.token);
            return data;
        } catch (error) {
            console.error('Error during registration:', error);
            throw error;
        }
    }

    async login(loginData: LoginData): Promise<LoginResponse> {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });
            const data = await this.handleResponse<LoginResponse>(response);
            localStorage.setItem('authToken', data.token);
            return data;
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    }

    async changePassword(data: ChangePasswordData): Promise<void> {
        try {
            const response = await fetch(`${API_URL}/users/change-password`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(data)
            });
            await this.handleResponse<void>(response);
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    }

    logout(): void {
        localStorage.removeItem('authToken');
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem('authToken');
    }
}

export const userService = new UserService();


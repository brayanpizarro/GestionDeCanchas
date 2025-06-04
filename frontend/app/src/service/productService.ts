const API_URL = 'http://localhost:3001/api/v1';

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    available: boolean;
    imagePath?: string;
}

export interface CreateProductData {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    image?: File;
}

class ProductService {    private getAuthHeaders() {
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

    async getAllProducts(): Promise<Product[]> {
        try {
            const response = await fetch(`${API_URL}/products`, {
                headers: this.getAuthHeaders()
            });
            return this.handleResponse<Product[]>(response);
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    async getProduct(id: number): Promise<Product> {
        try {
            const response = await fetch(`${API_URL}/products/${id}`, {
                headers: this.getAuthHeaders()
            });
            return this.handleResponse<Product>(response);
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    }    async createProduct(data: CreateProductData & { image?: File }): Promise<Product> {
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('description', data.description);
            formData.append('price', data.price.toString());
            formData.append('stock', data.stock.toString());
            formData.append('category', data.category);
            formData.append('available', 'true');
            
            if (data.image) {
                formData.append('image', data.image);
            }

            const response = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    // Note: Don't set Content-Type header when using FormData
                },
                body: formData
            });
            return this.handleResponse<Product>(response);
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    }    async updateProduct(id: number, data: Partial<Product> & { image?: File }): Promise<Product> {
        try {
            const formData = new FormData();
            
            // Append all available fields to FormData
            if (data.name) formData.append('name', data.name);
            if (data.description) formData.append('description', data.description);
            if (data.price) formData.append('price', data.price.toString());
            if (data.stock) formData.append('stock', data.stock.toString());
            if (data.category) formData.append('category', data.category);
            if (typeof data.available === 'boolean') formData.append('available', data.available.toString());
            if (data.image) formData.append('image', data.image);
            
            const response = await fetch(`${API_URL}/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: formData
            });
            return this.handleResponse<Product>(response);
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    async deleteProduct(id: number): Promise<void> {
        try {
            const response = await fetch(`${API_URL}/products/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            await this.handleResponse<void>(response);
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }

    async getLowStockProducts(): Promise<Product[]> {
        try {
            const response = await fetch(`${API_URL}/products/low-stock`, {
                headers: this.getAuthHeaders()
            });
            return this.handleResponse<Product[]>(response);
        } catch (error) {
            console.error('Error fetching low stock products:', error);
            throw error;
        }
    }
}

export const productService = new ProductService();

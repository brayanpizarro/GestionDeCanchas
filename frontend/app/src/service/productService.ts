import { API_BASE_URL } from "./api"
import type { Product, CreateProductFormData, BackendProduct } from "../types"
import type { Equipment } from "../types/reservation"

export class ProductService {
  // CORREGIDO: Usar la misma clave que el AuthContext
  private static getValidToken(): string {
    // Intentar obtener el token con la clave correcta del AuthContext
    const token = localStorage.getItem("authToken") || localStorage.getItem("token")
    
    if (!token || token === "null" || token === "undefined" || token.trim() === "") {
      // Limpiar tokens inválidos (ambas claves por compatibilidad)
      localStorage.removeItem("authToken")
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      throw new Error("No hay token de autenticación disponible")
    }

    // Verificar si el token tiene el formato básico de JWT
    if (!token.includes('.')) {
      localStorage.removeItem("authToken")
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      throw new Error("Token de autenticación inválido")
    }

    return token
  }

  // Método mejorado para manejar errores de autenticación
  private static handleAuthError(response: Response) {
    if (response.status === 401 || response.status === 403) {
      console.warn("Error de autenticación detectado:", response.status)
      
      // Limpiar todas las claves de autenticación
      localStorage.removeItem("authToken")
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      
      // Opcional: disparar evento personalizado para que AuthContext se entere
      window.dispatchEvent(new CustomEvent('auth-error', { 
        detail: { status: response.status, message: 'Sesión expirada' }
      }))
      
      // Solo redirigir si no estamos ya en la página de login
      if (!window.location.pathname.includes('/login')) {
        setTimeout(() => {
          window.location.href = "/login"
        }, 100)
      }
      
      throw new Error("Sesión expirada. Redirigiendo al login...")
    }
  }

  // Método auxiliar para hacer peticiones autenticadas
  private static async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getValidToken()
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    this.handleAuthError(response)
    return response
  }

  static async getProducts(): Promise<Product[]> {
    try {
      console.log('Obteniendo productos...')
      
      const response = await this.authenticatedFetch(`${API_BASE_URL}/products`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }      const products: BackendProduct[] = await response.json()
      console.log('Productos obtenidos:', products.length)
      
      return products.map((product: BackendProduct) => ({
        id: product.id.toString(),
        name: product.name,
        description: product.description || '',
        price: product.price,
        stock: product.stock || 0,
        sold: 0, // Este campo no está en BackendProduct
        category: product.category,
        available: product.available,
        imageUrl: product.imagePath || product.imageUrl,
      }))
    } catch (error) {
      console.error("Error fetching products:", error)
      throw error
    }
  }
  static async getAllProducts(): Promise<Equipment[]> {
    try {
      console.log('Obteniendo todos los productos...')
      
      const response = await this.authenticatedFetch(`${API_BASE_URL}/products`)

      if (!response.ok) {
        throw new Error("Error fetching products")
      }      const products: BackendProduct[] = await response.json()
      console.log('Todos los productos obtenidos:', products.length)
      console.log('Primer producto (para debug):', products[0])
      
      return products.map((product: BackendProduct) => ({
        id: product.id.toString(),
        name: product.name,
        description: product.description || '',
        price: product.price,
        available: product.available,
        imageUrl: product.imageUrl || product.imagePath || '',
      }))
    } catch (error) {
      console.error(" Error fetching all products:", error)
      throw error
    }
  }
  static async createProduct(productData: CreateProductFormData): Promise<Product> {
    try {
      // Validar datos del producto antes de enviar
      if (!productData.name || !productData.price || productData.stock === undefined) {
        throw new Error("Datos del producto incompletos")
      }      console.log('Creando producto:', productData.name)

      const token = this.getValidToken()
        let body: FormData | string
      const baseHeaders = {
        Authorization: `Bearer ${token}`,
      }

      if (productData.imageFile) {
        // Si hay imagen, usar FormData
        const formData = new FormData()
        formData.append("name", productData.name.trim())
        formData.append("description", productData.description?.trim() || "")
        formData.append("price", productData.price.toString())
        formData.append("stock", productData.stock.toString())
        formData.append("available", productData.available.toString())
        
        if (productData.category && productData.category.trim()) {
          formData.append("category", productData.category.trim())
        }
        
        console.log('Archivo a subir:', {
          name: productData.imageFile.name,
          type: productData.imageFile.type,  
          size: productData.imageFile.size
        });
        formData.append("image", productData.imageFile)
        
        body = formData
        // No incluir Content-Type para FormData - se establecerá automáticamente
      } else {
        // Si no hay imagen, enviar JSON
        const jsonData = {
          name: productData.name.trim(),
          description: productData.description?.trim() || "",
          price: Number(productData.price),
          stock: Number(productData.stock),
          available: Boolean(productData.available),
          ...(productData.category && productData.category.trim() && { category: productData.category.trim() })
        }
        
        body = JSON.stringify(jsonData)
      }

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: body instanceof FormData ? baseHeaders : { ...baseHeaders, 'Content-Type': 'application/json' },
        body,
      })

      this.handleAuthError(response)

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = "Error al crear producto"
        
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        
        console.error(" Error creating product:", {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage
        })
        
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log("Producto creado exitosamente:", result)
      return result
        } catch (error) {
      console.error("Error creating product:", error)
      
      // Si es un error de autenticación, no lo relanzamos después del manejo
      if (error instanceof Error && error.message.includes("Sesión expirada")) {
        return Promise.reject(error)
      }
      
      throw error
    }
  }

  static async updateProduct(productId: string, productData: CreateProductFormData): Promise<Product> {
    try {
      // Validar datos del producto antes de enviar
      if (!productData.name || !productData.price || productData.stock === undefined) {
        throw new Error("Datos del producto incompletos")
      }      console.log('Actualizando producto:', productData.name)

      const token = this.getValidToken()
        let body: FormData | string
      const baseHeaders = {
        Authorization: `Bearer ${token}`,
      }
      console.log(`Datos enviados: ${JSON.stringify(productData, null, 2)}`)

      if (productData.imageFile) {
        // Si hay imagen, usar FormData
        const formData = new FormData()
        formData.append("name", productData.name.trim())
        formData.append("description", productData.description?.trim() || "")
        formData.append("price", productData.price.toString())
        formData.append("stock", productData.stock.toString())
        formData.append("available", productData.available.toString())
        
        if (productData.category && productData.category.trim()) {
          formData.append("category", productData.category.trim())
        }
        
        console.log('Archivo a subir:', {
          name: productData.imageFile.name,
          type: productData.imageFile.type,  
          size: productData.imageFile.size
        });
        formData.append("image", productData.imageFile)
        
        body = formData
      } else {
        // Si no hay imagen, enviar JSON
        const jsonData = {
          name: productData.name.trim(),
          description: productData.description?.trim() || "",
          price: Number(productData.price),
          stock: Number(productData.stock),
          available: Boolean(productData.available),
          ...(productData.category && productData.category.trim() && { category: productData.category.trim() })
        }
        
        body = JSON.stringify(jsonData)
      }      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: "PATCH",
        headers: body instanceof FormData ? baseHeaders : { ...baseHeaders, 'Content-Type': 'application/json' },
        body,
      })
      console.log('Respuesta de actualización:', response.status, response.statusText)

      this.handleAuthError(response)

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = "Error al actualizar producto"
        
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        
        console.error("Error updating product:", {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage
        })
        
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log("Producto actualizado exitosamente:", result)
      return result
        } catch (error) {
      console.error("Error updating product:", error)
      
      if (error instanceof Error && error.message.includes("Sesión expirada")) {
        return Promise.reject(error)
      }
      
      throw error
    }
  }

  static async deleteProduct(productId: string): Promise<void> {
    try {
      console.log('Eliminando producto:', productId)

      const token = this.getValidToken()
      
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      this.handleAuthError(response)

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = "Error al eliminar producto"
        
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        
        console.error("Error deleting product:", {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage
        })
        
        throw new Error(errorMessage)
      }

      console.log("Producto eliminado exitosamente")
    } catch (error) {
      console.error("Error deleting product:", error)
      
      // Si es un error de autenticación, no lo relanzamos después del manejo
      if (error instanceof Error && error.message.includes("Sesión expirada")) {
        return Promise.reject(error)
      }
      
      throw error
    }
  }

  static async getProductStats() {
    try {
      console.log('Obteniendo estadísticas de productos...')
      
      const response = await this.authenticatedFetch(`${API_BASE_URL}/products/stats`)
      
      if (!response.ok) throw new Error("Error fetching product stats")
      
      const stats = await response.json()
      console.log('Estadísticas obtenidas:', stats)
      return stats
    } catch (error) {
      console.error("Error fetching product stats:", error)
      throw error
    }
  }

  static async getLowStockProducts() {
    try {
      console.log('Obteniendo productos con bajo stock...')
      
      const response = await this.authenticatedFetch(`${API_BASE_URL}/products/low-stock`)
      
      if (!response.ok) throw new Error("Error fetching low stock products")
      
      const lowStockProducts = await response.json()
      console.log('Productos con bajo stock obtenidos:', lowStockProducts.length)
      return lowStockProducts
    } catch (error) {
      console.error(" Error fetching low stock products:", error)
      throw error
    }
  }

  // Método utilitario para verificar si el usuario está autenticado
  static isAuthenticated(): boolean {
    try {
      this.getValidToken()
      return true
    } catch {
      return false
    }
  }

  // Método para limpiar la sesión manualmente
  static clearSession(): void {
    localStorage.removeItem("authToken")
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  // NUEVO: Método para debug - verificar estado del token
  static debugToken(): void {
    console.log('🔍 Debug del token:')
    console.log('authToken:', localStorage.getItem("authToken") ? 'Presente' : 'Ausente')
    console.log('token:', localStorage.getItem("token") ? 'Presente' : 'Ausente')
    console.log('user:', localStorage.getItem("user") ? 'Presente' : 'Ausente')
    
    try {
      const token = this.getValidToken()
      console.log('Token válido:', token.substring(0, 20) + '...')
      console.log('Es autenticado:', this.isAuthenticated())
    } catch (error) {
      console.log('Token inválido:')
    }
  }

  // Método público para obtener productos en reservaciones (sin autenticación)
  static async getPublicProducts(): Promise<Equipment[]> {
    try {
      console.log('Obteniendo productos públicos para reservaciones...')
      
      // Intenta la petición sin autenticación primero
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        // Si falla, intentar con autenticación si está disponible
        if (this.isAuthenticated()) {
          console.log('Reintentando con autenticación...')
          return await this.getAllProducts()
        } else {
          console.warn('No se pueden cargar productos: requiere autenticación')
          return []
        }
      }      const products: BackendProduct[] = await response.json()
      console.log('Productos públicos obtenidos:', products.length)
        return products.map((product: BackendProduct) => ({
        id: product.id.toString(),
        name: product.name,
        description: product.description || '',
        price: product.price,
        available: product.available,
        imageUrl: product.imageUrl || product.imagePath || '',
      }))
    } catch (error) {
      console.warn('Error cargando productos públicos, intentando con autenticación:', error)
      
      // Como fallback, intentar con autenticación si está disponible
      if (this.isAuthenticated()) {
        try {
          return await this.getAllProducts()
        } catch (authError) {
          console.error('Error incluso con autenticación:', authError)
          return []
        }
      }
      
      // Si no hay autenticación disponible, devolver array vacío
      console.warn('No hay autenticación disponible, devolviendo array vacío de productos')
      return []
    }
  }
}

// Exportar tanto la clase como la instancia para compatibilidad
export const productService = {
  getAllProducts: ProductService.getAllProducts,
  getProducts: ProductService.getProducts,
  createProduct: ProductService.createProduct,
  updateProduct: ProductService.updateProduct,
  deleteProduct: ProductService.deleteProduct,
  getProductStats: ProductService.getProductStats,
  getLowStockProducts: ProductService.getLowStockProducts,
  isAuthenticated: ProductService.isAuthenticated,
  clearSession: ProductService.clearSession,
  debugToken: ProductService.debugToken, // Para debugging
  getPublicProducts: ProductService.getPublicProducts, // Método público para obtener productos en reservaciones
}
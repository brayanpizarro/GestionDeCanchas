"use client"
import { useState, useEffect } from "react"
import { Users, TrendingUp, BarChart3, Package, Plus, ChevronDown, Building2, Loader2 } from "lucide-react"
import StatCard from "../components/admin/StatCard"
import ChangePasswordModal from "../components/admin/ChangePasswordModal"
import UsersTable from "../components/admin/UsersTable"
import CreateCourtModal from "../components/admin/CreateCourtModal"
import CreateProductModal from "../components/admin/CreateProductModal"
import {CourtService} from "../service/courtService"
import { ReservationService} from "../service/reservationService"
import { ProductService } from "../service/productService"
import { UserService } from "../service/userService"
import type { Court, ReservationStats, Product, User, CreateCourtFormData, CreateProductFormData } from "../types"


function AdminDashboard() {
  // State
  const [courts, setCourts] = useState<Court[]>([])
  const [reservationStats, setReservationStats] = useState<ReservationStats[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null)

  // UI States
  const [isCreateCourtModalOpen, setIsCreateCourtModalOpen] = useState(false)
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    const loadCurrentUser = () => {
      const userDataStr = localStorage.getItem("user")
      if (userDataStr) {
        const userData = JSON.parse(userDataStr)
        setCurrentUser(userData)
      }
    }

    loadCurrentUser()
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [courtsData, statsData, productsData, usersData] = await Promise.allSettled([
        CourtService.getCourts(),
        ReservationService.getReservationStats(),
        ProductService.getProducts(),
        UserService.getUsers(),
      ])

      if (courtsData.status === "fulfilled") {
        setCourts(courtsData.value)
      }

      if (statsData.status === "fulfilled") {
        setReservationStats(statsData.value)
      }

      if (productsData.status === "fulfilled") {
        setProducts(productsData.value)
      }

      if (usersData.status === "fulfilled") {
        setUsers(usersData.value)
      }
    } catch (err) {
      console.error("Error loading initial data:", err)
      setError("Error al cargar los datos. Intenta recargar la página.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCourt = async (data: CreateCourtFormData) => {
    try {
      const newCourt = await CourtService.createCourt(data)
      setCourts((prevCourts) => [...prevCourts, newCourt])
      setIsCreateCourtModalOpen(false)
      alert("Cancha creada exitosamente")
    } catch (err) {
      console.error("Error creating court:", err)
      alert(err instanceof Error ? err.message : "Error al crear la cancha")
    }
  }

  const handleCreateProduct = async (data: CreateProductFormData) => {
    try {
      const newProduct = await ProductService.createProduct(data)
      setProducts((prevProducts) => [...prevProducts, newProduct])
      setIsCreateProductModalOpen(false)
      alert("Producto creado exitosamente")
    } catch (error) {
      console.error("Error creating product:", error)
      alert(error instanceof Error ? error.message : "Error desconocido")
    }
  }

  const handleStatusChange = async (courtId: string, newStatus: "available" | "occupied" | "maintenance") => {
    try {
      await CourtService.updateCourtStatus(courtId, newStatus)

      setCourts((prevCourts) =>
        prevCourts.map((court) => (court.id === courtId ? { ...court, status: newStatus } : court)),
      )
    } catch (err) {
      console.error("Error updating court status:", err)
      alert("Error al actualizar el estado de la cancha")
    }
  }

  const handleChangePassword = async (oldPassword: string, newPassword: string) => {
    try {
      await UserService.changePassword(oldPassword, newPassword)
      alert("Contraseña cambiada exitosamente")
      setIsChangePasswordModalOpen(false)
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al cambiar la contraseña")
    }
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      await UserService.deleteUser(userId)
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId))
      alert("Usuario eliminado exitosamente")
    } catch (error) {
      console.error("Error deleting user:", error)
      alert(error instanceof Error ? error.message : "Error al eliminar usuario")
    }
  }

  const stats = [
    {
      title: "Total Canchas",
      value: courts.length,
      subtitle: `${courts.filter((c) => c.status === "available").length} disponibles`,
      icon: Building2,
      color: "bg-blue-600",
    },
    {
      title: "Total Usuarios",
      value: users.length,
      subtitle: `${users.filter((u) => u.role === "admin").length} administradores`,
      icon: Users,
      color: "bg-purple-600",
    },
    {
      title: "Reservas Hoy",
      value: 0,
      subtitle: "reservas programadas",
      icon: TrendingUp,
      color: "bg-green-600",
    },
    {
      title: "Productos",
      value: products.length,
      subtitle: `${products.reduce((sum, p) => sum + p.stock, 0)} en stock`,
      icon: Package,
      color: "bg-orange-600",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-gray-600">Cargando datos...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button onClick={loadInitialData} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0A1838] py-3 px-4 shadow-md text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-lg sm:text-xl font-semibold truncate">Panel Administrativo - Canchas de Padel</h1>
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 sm:space-x-3 focus:outline-none"
              >
                <span className="text-sm font-medium hidden sm:block">{currentUser?.name || "Usuario"}</span>
                <div className="w-8 h-8 bg-white text-blue-500 rounded-full flex items-center justify-center font-semibold">
                  {currentUser?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                      <div className="font-medium">{currentUser?.name}</div>
                      <div className="text-gray-500 text-xs truncate">{currentUser?.email}</div>
                    </div>
                    <button
                      onClick={() => {
                        setIsChangePasswordModalOpen(true)
                        setIsUserMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Cambiar Contraseña
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem("token")
                        localStorage.removeItem("user")
                        window.location.href = "/"
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-4 sm:space-x-8 items-center overflow-x-auto">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "productos", label: "Productos", icon: Package },
              { id: "canchas", label: "Canchas", icon: Building2 },
              { id: "usuarios", label: "Usuarios", icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

        {/* Dashboard Content */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Court Usage Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Uso de Canchas</h2>
                <span className="text-xs sm:text-sm text-gray-500">Reservas por cancha esta semana</span>
              </div>
              <div className="space-y-4">
                {reservationStats.length > 0 ? (
                  reservationStats.map((stat) => (
                    <div key={stat.courtId} className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-3 flex-shrink-0 ${
                          stat.reservations === 0
                            ? "bg-red-500"
                            : stat.reservations < 5
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                      ></div>
                      <span className="text-sm font-medium text-gray-700 w-16 sm:w-20 flex-shrink-0">{stat.court}</span>
                      <div className="flex-1 mx-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              stat.reservations === 0
                                ? "bg-red-500"
                                : stat.reservations < 5
                                  ? "bg-yellow-500"
                                  : "bg-blue-600"
                            }`}
                            style={{ width: `${Math.min((stat.reservations / 20) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-8 text-right flex-shrink-0">
                        {stat.reservations}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">No hay datos de reservas disponibles</div>
                )}
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Productos Más Vendidos</h2>
                <span className="text-xs sm:text-sm text-gray-500">Top productos esta semana</span>
              </div>
              <div className="space-y-4">
                {products.length > 0 ? (
                  products
                    .sort((a, b) => b.sold - a.sold)
                    .slice(0, 5)
                    .map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div className="flex items-center min-w-0 flex-1">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium text-gray-700 truncate">{product.name}</span>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <div className="text-lg font-bold text-gray-900">${product.price.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{product.stock} disponibles</div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-gray-500">No hay productos disponibles</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Courts Management */}
        {activeTab === "canchas" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                <h2 className="text-lg font-semibold text-gray-900">Gestión de Canchas</h2>
                <button
                  onClick={() => setIsCreateCourtModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Cancha
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Imagen
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacidad
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio/Hora
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courts.length > 0 ? (
                    courts.map((court) => (
                      <tr key={court.id}>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          {court.image ? (
                            <img
                              src={court.image || "/placeholder.svg"}
                              alt={court.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {court.name}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {court.type === "covered" ? "Cubierta" : "Descubierta"}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {court.capacity} personas
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${court.pricePerHour.toLocaleString()}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <select
                            value={court.status}
                            onChange={(e) =>
                              handleStatusChange(court.id, e.target.value as "available" | "occupied" | "maintenance")
                            }
                            className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full border-0 ${
                              court.status === "available"
                                ? "bg-green-100 text-green-800"
                                : court.status === "occupied"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            <option value="available">Disponible</option>
                            <option value="occupied">Ocupada</option>
                            <option value="maintenance">Mantenimiento</option>
                          </select>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-3">
                            <button className="text-blue-600 hover:text-blue-900">Editar</button>
                            <button className="text-red-600 hover:text-red-900">Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No hay canchas registradas. Crea la primera cancha.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Management */}
        {activeTab === "productos" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                <h2 className="text-lg font-semibold text-gray-900">Gestión de Productos</h2>
                <button
                  onClick={() => setIsCreateProductModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Producto
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendidos
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.length > 0 ? (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
                              {product.category && (
                                <div className="text-sm text-gray-500 truncate">{product.category}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${product.price.toLocaleString()}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              product.stock > 10
                                ? "bg-green-100 text-green-800"
                                : product.stock > 0
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.stock} unidades
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.sold} vendidos
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-3">
                            <button className="text-blue-600 hover:text-blue-900">Editar</button>
                            <button className="text-red-600 hover:text-red-900">Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No hay productos registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Management */}
        {activeTab === "usuarios" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Gestión de Usuarios</h2>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              {users.length > 0 ? (
                <UsersTable users={users} onDeleteUser={handleDeleteUser} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p>No hay usuarios registrados</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateCourtModal
        isOpen={isCreateCourtModalOpen}
        onClose={() => setIsCreateCourtModalOpen(false)}
        onSubmit={handleCreateCourt}
      />

      <CreateProductModal
        isOpen={isCreateProductModalOpen}
        onClose={() => setIsCreateProductModalOpen(false)}
        onSubmit={handleCreateProduct}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onSubmit={handleChangePassword}
      />
    </div>
  )
}

export default AdminDashboard

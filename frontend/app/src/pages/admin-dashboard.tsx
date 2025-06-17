"use client"
import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Users, BarChart3, Package, Plus, ChevronDown, Building2, Loader2, Calendar, Home, CreditCard } from "lucide-react"
import StatCard from "../components/admin/StatCard"
import ChangePasswordModal from "../components/admin/ChangePasswordModal"
import UsersTable from "../components/admin/UsersTable"
import CreateCourtModal from "../components/admin/CreateCourtModal"
import CreateProductModal from "../components/admin/CreateProductModal"
import VirtualWallet from "../components/admin/VirtualWallet"
import {CourtService} from "../service/courtService"
import { ReservationService} from "../service/reservationService"
import { formatChileanCurrency } from "../utils/currency"
import { formatReservationDate, formatReservationTimeRange, formatReservationFullDate } from "../utils/dateUtils"
import { ProductService } from "../service/productService"
import { UserService } from "../service/userService"
import type { Court, ReservationStats, Product, User, CreateCourtFormData, CreateProductFormData } from "../types"

interface AdminReservation {
  id: string | number
  user?: { name: string }
  userName?: string
  court?: { name: string; id: string | number }
  courtId?: string | number
  courtName?: string
  startTime: string
  endTime: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  amount?: number
  totalPrice?: number
  total?: number
}


function AdminDashboard() {
  const navigate = useNavigate()
  
  // State
  const [courts, setCourts] = useState<Court[]>([])
  const [reservationStats, setReservationStats] = useState<ReservationStats[]>([])
  const [reservations, setReservations] = useState<AdminReservation[]>([]) // Added reservations state
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  // Balance states for admin
  const [adminBalance, setAdminBalance] = useState<number>(0)
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false)
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string; email: string } | null>(null)
  // UI States
  const [isCreateCourtModalOpen, setIsCreateCourtModalOpen] = useState(false)
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false)
  const [isEditCourtModalOpen, setIsEditCourtModalOpen] = useState(false)
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false)
  const [editingCourt, setEditingCourt] = useState<Court | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para cancelación de reservas por admin
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancellingReservation, setCancellingReservation] = useState<AdminReservation | null>(null)
  const [cancellationReason, setCancellationReason] = useState("")
  const [isCancelling, setIsCancelling] = useState(false)
    const loadInitialData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔄 Loading initial data...')
      
      // Get current user for balance request directly from localStorage
      const userDataStr = localStorage.getItem("user")
      const userData = userDataStr ? JSON.parse(userDataStr) : null
      console.log('👤 Current user:', userData)      // Prepare promises - only include balance if we have a valid user ID
      const promises = [
        CourtService.getCourts(),
        // Try to get all reservations for admin, fallback to regular if needed
        ReservationService.getAllReservations().catch(() => ReservationService.getReservations()),
        ProductService.getProducts(),
        UserService.getUsers(),
      ];
      
      // Only add balance promise if we have a valid user ID
      if (userData?.id && userData.id > 0) {
        promises.push(UserService.getUserBalance(userData.id));
      } else {
        promises.push(Promise.resolve(0)); // Default balance of 0
      }
        const [courtsData, reservationsData, productsData, usersData, balanceData] = await Promise.allSettled(promises);

      console.log('📊 Promise results:', {
        courts: courtsData.status,
        reservations: reservationsData.status,
        products: productsData.status,
        users: usersData.status,
        balance: balanceData.status      });

      if (courtsData.status === "fulfilled") {
        console.log('🏟️ Courts loaded:', courtsData.value);
        setCourts(courtsData.value)
        
        // Si también tenemos las reservas, crear estadísticas reales
        if (reservationsData.status === "fulfilled") {
          console.log('� Reservations loaded:', reservationsData.value);
          setReservations(reservationsData.value)
            // Crear estadísticas agrupando las reservas por cancha
          const courtStats = courtsData.value.map((court: Court) => {
            const courtReservations = reservationsData.value.filter((reservation: AdminReservation) => 
              reservation.court?.id === court.id || reservation.courtId === court.id
            );
            
            const confirmedReservations = courtReservations.filter((r: AdminReservation) => 
              r.status === 'confirmed' || r.status === 'completed'
            );
            const cancelledReservations = courtReservations.filter((r: AdminReservation) => 
              r.status === 'cancelled'
            );
            
            console.log(`📊 Court ${court.name}:`, {
              total: courtReservations.length,
              confirmed: confirmedReservations.length,
              cancelled: cancelledReservations.length,
              reservations: courtReservations
            });
            
            return {
              courtId: court.id,
              court: court.name,
              reservations: confirmedReservations.length,
              cancelled: cancelledReservations.length,
              completed: 0,
              revenue: 0
            };
          });
          
          console.log('📊 Court stats created from real data:', courtStats);
          setReservationStats(courtStats);
        } else {
          // Fallback: crear estadísticas vacías
          const emptyStats = courtsData.value.map((court: Court) => ({
            courtId: court.id,
            court: court.name,
            reservations: 0,
            cancelled: 0,
            completed: 0,
            revenue: 0
          }));
          
          console.log('📊 Empty stats created (no reservations data):', emptyStats);
          setReservationStats(emptyStats);
        }
      } else {
        console.log('❌ Failed to load courts data');
      }

      if (productsData.status === "fulfilled") {
        setProducts(productsData.value)
      }

      if (usersData.status === "fulfilled") {
        setUsers(usersData.value)
      }

      if (balanceData.status === "fulfilled") {
        setAdminBalance(balanceData.value)
      }
    } catch (err) {
      console.error("Error loading initial data:", err)
      setError("Error al cargar los datos. Intenta recargar la página.")
    } finally {
      setLoading(false)
    }
  }, [])
  // Load initial data once on mount
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
  }, [loadInitialData]) // Include loadInitialData as dependency

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

  // Edit functions
  const handleEditCourt = (court: Court) => {
    setEditingCourt(court)
    setIsEditCourtModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsEditProductModalOpen(true)
  }

  const handleUpdateCourt = async (data: CreateCourtFormData) => {
    if (!editingCourt) return
    
    try {
      const updatedCourt = await CourtService.updateCourt(editingCourt.id, data)
      setCourts((prevCourts) => 
        prevCourts.map((court) => 
          court.id === editingCourt.id ? updatedCourt : court
        )
      )
      setIsEditCourtModalOpen(false)
      setEditingCourt(null)
      alert("Cancha actualizada exitosamente")
    } catch (err) {
      console.error("Error updating court:", err)
      alert(err instanceof Error ? err.message : "Error al actualizar la cancha")
    }
  }

  const handleUpdateProduct = async (data: CreateProductFormData) => {
    if (!editingProduct) return
    
    try {
      const updatedProduct = await ProductService.updateProduct(editingProduct.id, data)
      setProducts((prevProducts) => 
        prevProducts.map((product) => 
          product.id === editingProduct.id ? updatedProduct : product
        )
      )
      setIsEditProductModalOpen(false)
      setEditingProduct(null)
      alert("Producto actualizado exitosamente")
    } catch (error) {
      console.error("Error updating product:", error)
      alert(error instanceof Error ? error.message : "Error al actualizar el producto")
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

  const handleReservationStatusChange = async (
    reservationId: string | number, 
    newStatus: "pending" | "confirmed" | "completed" | "cancelled"
  ) => {
    try {
      await ReservationService.updateReservationStatus(Number(reservationId), newStatus)
      
      setReservations((prevReservations) =>
        prevReservations.map((reservation) => 
          reservation.id === reservationId 
            ? { ...reservation, status: newStatus } 
            : reservation
        )
      )
      
      alert("Estado de reserva actualizado exitosamente")
    } catch (err) {
      console.error("Error updating reservation status:", err)
      alert("Error al actualizar el estado de la reserva")
    }
  }

  const handleChangePassword = async (oldPassword: string, newPassword: string) => {
    try {
      await UserService.changePassword(oldPassword, newPassword)
      alert("Contraseña cambiada exitosamente")
      setIsChangePasswordModalOpen(false)
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al cambiar la contraseña")
    }  }

  // Función para abrir el modal de cancelación
  const handleOpenCancelModal = (reservation: AdminReservation) => {
    setCancellingReservation(reservation)
    setCancellationReason("")
    setShowCancelModal(true)
  }

  // Función para cancelar reserva con motivo
  const handleAdminCancelReservation = async () => {
    if (!cancellingReservation || !cancellationReason.trim()) {
      alert("Por favor, proporciona un motivo para la cancelación")
      return
    }

    try {
      setIsCancelling(true)
      
      // Usar el nuevo servicio de cancelación
      const result = await ReservationService.cancelReservation(
        Number(cancellingReservation.id), 
        cancellationReason,
        true // isAdminCancellation
      )
      
      if (result.success) {
        // Actualizar el estado local
        setReservations(prev => 
          prev.map(reservation => 
            reservation.id === cancellingReservation.id 
              ? { ...reservation, status: 'cancelled' }
              : reservation
          )
        )
        
        alert("Reserva cancelada exitosamente. Se ha notificado al cliente por correo.")
        setShowCancelModal(false)
        setCancellingReservation(null)
        setCancellationReason("")
      } else {
        alert(result.message || "Error al cancelar la reserva")
      }
    } catch (error) {
      console.error("Error al cancelar reserva:", error)
      alert("Error al cancelar la reserva. Por favor, intenta nuevamente.")
    } finally {
      setIsCancelling(false)
    }
  }

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el producto "${product.name}"?`)) {
      return
    }

    try {
      await ProductService.deleteProduct(product.id)
      setProducts((prevProducts) => 
        prevProducts.filter((p) => p.id !== product.id)
      )
      alert("Producto eliminado exitosamente")
    } catch (error) {
      console.error("Error deleting product:", error)
      alert(error instanceof Error ? error.message : "Error al eliminar el producto")
    }  }

  // Balance management functions
  const handleAddBalance = async (amount: number) => {
    try {
      setIsUpdatingBalance(true)
      const newBalance = await UserService.addBalance(currentUser?.id || 0, amount)
      setAdminBalance(newBalance)
      alert(`Se agregaron ${formatChileanCurrency(amount)} a tu saldo`)
    } catch (error) {
      console.error("Error adding balance:", error)
      alert(error instanceof Error ? error.message : "Error al agregar saldo")
    } finally {
      setIsUpdatingBalance(false)
    }
  }

  const handleDeleteCourt = async (court: Court) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la cancha "${court.name}"?`)) {
      return;
    }

    try {
      await CourtService.deleteCourt(court.id);
      setCourts((prevCourts) => prevCourts.filter((c) => c.id !== court.id));
      alert("Cancha eliminada exitosamente");
    } catch (error) {
      console.error("Error al eliminar la cancha:", error);
      alert(error instanceof Error ? error.message : "Error al eliminar la cancha");
    }
  };

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
      value: reservations.filter(r => {
        const today = new Date().toDateString()
        const reservationDate = new Date(r.startTime).toDateString()
        return reservationDate === today
      }).length,
      subtitle: "reservas programadas",
      icon: Calendar,
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#0A1838] py-3 px-4 shadow-md text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">          <div className="flex items-center justify-between h-16">
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
              </button>              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                      <div className="font-medium">{currentUser?.name}</div>
                      <div className="text-gray-500 text-xs truncate">{currentUser?.email}</div>
                    </div>
                    <button
                      onClick={() => {
                        navigate("/")
                        setIsUserMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Home className="w-4 h-4" />
                      <span>Ir al Inicio</span>
                    </button>
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
          <nav className="flex space-x-4 sm:space-x-8 items-center overflow-x-auto">            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "reservas", label: "Reservas", icon: Calendar },
              { id: "productos", label: "Productos", icon: Package },
              { id: "canchas", label: "Canchas", icon: Building2 },
              { id: "usuarios", label: "Usuarios", icon: Users },
              { id: "tarjeta", label: "Mi Billetera", icon: CreditCard },
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
            ))}          </nav>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex-1">
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
            {/* Court Usage Chart */}            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Uso de Canchas</h2>
                <span className="text-xs sm:text-sm text-gray-500">Total de reservas por cancha (confirmadas y canceladas)</span>
              </div>
              <div className="space-y-4">
                {reservationStats.length > 0 ? (
                  reservationStats.map((stat) => (
                    <div key={stat.courtId} className="space-y-2">                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{stat.court}</span>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="font-medium text-gray-900">
                            {(stat.reservations || 0) + (stat.cancelled || 0)} reservas
                          </span>
                          <span className="text-gray-500">
                            ({stat.reservations || 0} confirmadas, {stat.cancelled || 0} canceladas)
                          </span>
                        </div>
                      </div>                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full mr-3 flex-shrink-0 ${
                            (stat.reservations || 0) + (stat.cancelled || 0) === 0
                              ? "bg-red-500"
                              : (stat.reservations || 0) + (stat.cancelled || 0) < 5
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                        ></div>
                        <div className="flex-1 mr-4">
                          <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                            {/* Total de reservas como base */}
                            {(() => {
                              const totalReservations = (stat.reservations || 0) + (stat.cancelled || 0);
                              const confirmedWidth = totalReservations > 0 ? ((stat.reservations || 0) / totalReservations) * 100 : 0;
                              const cancelledWidth = totalReservations > 0 ? ((stat.cancelled || 0) / totalReservations) * 100 : 0;
                              
                              return (
                                <>
                                  {/* Barra de reservas confirmadas (azul) */}
                                  {stat.reservations && stat.reservations > 0 && (
                                    <div
                                      className="absolute left-0 top-0 h-3 bg-blue-600 rounded-l-full"
                                      style={{ width: `${confirmedWidth}%` }}
                                    ></div>
                                  )}
                                  {/* Barra de reservas canceladas (rojo) */}
                                  {stat.cancelled && stat.cancelled > 0 && (
                                    <div 
                                      className="absolute top-0 h-3 bg-red-500"
                                      style={{ 
                                        left: `${confirmedWidth}%`,
                                        width: `${cancelledWidth}%`,
                                        borderRadius: confirmedWidth === 0 ? '0.75rem 0.75rem 0.75rem 0.75rem' : '0 0.75rem 0.75rem 0'
                                      }}
                                    ></div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                          {/* Leyenda de colores debajo de la barra */}
                          <div className="flex items-center justify-start mt-1 space-x-4 text-xs">
                            {stat.reservations && stat.reservations > 0 && (
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                <span className="text-gray-600">{stat.reservations} confirmadas</span>
                              </div>
                            )}
                            {stat.cancelled && stat.cancelled > 0 && (
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span className="text-gray-600">{stat.cancelled} canceladas</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-8 text-right flex-shrink-0">
                          {(stat.reservations || 0) + (stat.cancelled || 0)}
                        </span>
                      </div>
                    </div>
                  ))                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hay datos de reservas disponibles</p>
                    <p className="text-xs mt-2">
                      Stats length: {reservationStats?.length || 0} | 
                      Courts length: {courts?.length || 0}
                    </p>
                    {courts.length > 0 && (
                      <div className="mt-4 text-left">
                        <p className="text-sm font-medium">Canchas disponibles:</p>
                        {courts.map(court => (
                          <p key={court.id} className="text-xs">
                            - {court.name} (ID: {court.id})
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
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
                          <div className="text-lg font-bold text-gray-900">{formatChileanCurrency(product.price)}</div>
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

        {/* Reservations Management */}
        {activeTab === "reservas" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                <h2 className="text-lg font-semibold text-gray-900">Gestión de Reservas</h2>
                <div className="text-sm text-gray-500">Total: {reservations.length} reservas</div>
              </div>
            </div>            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cancha
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>                  </tr>
                </thead><tbody className="bg-white divide-y divide-gray-200">
                  {reservations.length > 0 ? (
                    reservations.map((reservation) => (
                      <tr key={reservation.id}>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{reservation.id}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {reservation.user?.name || reservation.userName || 'Usuario desconocido'}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {reservation.court?.name || reservation.courtName || 'Cancha no especificada'}
                        </td>                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            <div className="font-medium">
                              {formatReservationDate(reservation.startTime)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatReservationTimeRange(reservation.startTime, reservation.endTime)}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                              reservation.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : reservation.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : reservation.status === "cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {reservation.status === "confirmed" ? "Confirmada" :
                            reservation.status === "pending" ? "Pendiente" :
                            reservation.status === "cancelled" ? "Cancelada" :
                            reservation.status === "completed" ? "Completada" : reservation.status}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatChileanCurrency(
                            Number(reservation.amount) || 
                            Number(reservation.totalPrice) || 
                            Number(reservation.total) || 
                            0
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-3">
                            {/* Solo mostrar selector de estado para reservas no canceladas */}
                            {reservation.status !== 'cancelled' && (
                              <select
                                value={reservation.status}
                                onChange={(e) => {
                                  const newStatus = e.target.value as "pending" | "confirmed" | "completed" | "cancelled"
                                  if (newStatus === 'cancelled') {
                                    handleOpenCancelModal(reservation)
                                  } else {
                                    handleReservationStatusChange(reservation.id, newStatus)
                                  }
                                }}
                                className="text-xs px-2 py-1 border border-gray-300 rounded"
                              >
                                <option value="pending">Pendiente</option>
                                <option value="confirmed">Confirmar</option>
                                <option value="completed">Completada</option>
                                <option value="cancelled">Cancelar</option>
                              </select>
                            )}
                            
                            {/* Botón de cancelación directo para admin */}
                            {reservation.status !== 'cancelled' && reservation.status !== 'completed' && (
                              <button
                                onClick={() => handleOpenCancelModal(reservation)}
                                className="text-xs px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                              >
                                Cancelar
                              </button>
                            )}
                            
                            {/* Mostrar estado para reservas canceladas */}
                            {reservation.status === 'cancelled' && (
                              <span className="text-xs text-gray-500 italic">Cancelada</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No hay reservas registradas.
                      </td>
                    </tr>
                  )}
                </tbody></table>
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
            <div className="overflow-x-auto">              <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>
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
                    </th>                  </tr>
                </thead><tbody className="bg-white divide-y divide-gray-200">
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
                          {formatChileanCurrency(court.pricePerHour)}
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
                            <button 
                              onClick={() => handleEditCourt(court)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Editar
                            </button>
                            <button 
                              onClick={() => handleDeleteCourt(court)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>                      </tr>
                    ))
                  ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">                        No hay canchas registradas. Crea la primera cancha.
                      </td>
                    </tr>
                  )}
                </tbody></table>
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
            <div className="overflow-x-auto">              <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>
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
                </thead><tbody className="bg-white divide-y divide-gray-200">                  {products.length > 0 ? (
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
                          {formatChileanCurrency(product.price)}
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
                            <button 
                              onClick={() => handleEditProduct(product)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Editar
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Eliminar
                            </button>
                          </div>                        </td>
                      </tr>
                    ))
                  ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No hay productos registrados.
                      </td>
                    </tr>
                  )}
                </tbody></table>
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
                <UsersTable users={users} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p>No hay usuarios registrados</p>
                </div>
              )}
            </div>
          </div>
        )}        {/* Virtual Wallet Management */}
        {activeTab === "tarjeta" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Mi Billetera Virtual
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Gestiona tu saldo virtual para realizar reservas
              </p>
            </div>
            <div className="p-4 sm:p-6">
              <VirtualWallet 
                balance={adminBalance}
                onAddBalance={handleAddBalance}
                isLoading={isUpdatingBalance}
              />
            </div>
          </div>
        )}
      </main>
      </div>

      {/* Modals */}
      <CreateCourtModal
        isOpen={isCreateCourtModalOpen}
        onClose={() => setIsCreateCourtModalOpen(false)}
        onSubmit={handleCreateCourt}
      />

      <CreateCourtModal
        isOpen={isEditCourtModalOpen}
        onClose={() => {
          setIsEditCourtModalOpen(false)
          setEditingCourt(null)
        }}
        onSubmit={handleUpdateCourt}        
        editData={editingCourt ? {
          name: editingCourt.name,
          type: editingCourt.type,
          status: editingCourt.status,
          capacity: editingCourt.capacity,
          pricePerHour: editingCourt.pricePerHour,
          imageFile: undefined
        } : undefined}
        isEditing={true}
      />

      <CreateProductModal
        isOpen={isCreateProductModalOpen}
        onClose={() => setIsCreateProductModalOpen(false)}
        onSubmit={handleCreateProduct}
      />

      <CreateProductModal
        isOpen={isEditProductModalOpen}
        onClose={() => {
          setIsEditProductModalOpen(false)
          setEditingProduct(null)
        }}
        onSubmit={handleUpdateProduct}        editData={editingProduct ? {
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          stock: editingProduct.stock,
          category: editingProduct.category,
          available: true, // Default value
          imageFile: undefined
        } : undefined}
        isEditing={true}
      />
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onSubmit={handleChangePassword}      />

      {/* Modal de Cancelación de Reserva */}
      {showCancelModal && cancellingReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Cancelar Reserva</h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Reserva:</strong> #{cancellingReservation.id}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Usuario:</strong> {cancellingReservation.user?.name || cancellingReservation.userName || 'Usuario desconocido'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Cancha:</strong> {cancellingReservation.court?.name || cancellingReservation.courtName || 'Cancha no especificada'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Fecha:</strong> {formatReservationFullDate(cancellingReservation.startTime)}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de la cancelación *
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={4}
                placeholder="Proporciona un motivo detallado para la cancelación. Este mensaje será enviado al cliente."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Este mensaje será incluido en el correo de notificación al cliente.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowCancelModal(false)
                  setCancellingReservation(null)
                  setCancellationReason("")
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                disabled={isCancelling}
              >
                Cancelar
              </button>
              <button
                onClick={handleAdminCancelReservation}
                disabled={isCancelling || !cancellationReason.trim()}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isCancelling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Cancelando...
                  </>
                ) : (
                  'Confirmar Cancelación'
                )}
              </button>
            </div>
          </div>        </div>      )}
      
      {/* Footer */}
      <footer className="bg-[#0A1838] text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Gestión de Canchas UCN</h3>
            <p className="text-gray-300 text-sm">
              Panel Administrativo - Universidad Católica del Norte
            </p>
            <p className="text-gray-400 text-xs mt-2">
              © 2025 Gestión de Canchas UCN. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AdminDashboard

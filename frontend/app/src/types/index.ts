import type React from "react"
export interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  color: string
  change?: string
}

export interface Court {
  id: string
  name: string
  type: "covered" | "uncovered"
  status: "available" | "occupied" | "maintenance"
  capacity: number
  pricePerHour: number
  image: string
  createdAt?: string
  updatedAt?: string
}

export interface ReservationStats {
  court: string
  courtId: string
  reservations: number
  revenue: number
}

export interface Product {
  id: string
  name: string
  price: number
  stock: number
  sold: number
  category?: string
  description?: string
}

export interface User {
  id: number
  name: string
  email: string
  role: "admin" | "user"
  status: "active" | "suspended" | "inactive"
  phone: string
  joinDate: string
  totalReservations: number
  totalSpent: number
}

export interface CreateCourtFormData {
  name: string
  type: "covered" | "uncovered"
  status: "available" | "occupied" | "maintenance"
  capacity: number
  pricePerHour: number
  imageFile?: File
}

export interface CreateProductFormData {
  name: string
  description?: string
  price: number
  stock: number
  available: boolean
  category?: string
  imageFile?: File
}

export interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (oldPassword: string, newPassword: string) => Promise<void>
}

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X } from "lucide-react"
import type { CreateCourtFormData } from "../../types"

interface CreateCourtModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateCourtFormData) => Promise<void>
  editData?: CreateCourtFormData
  isEditing?: boolean
}

const CreateCourtModal: React.FC<CreateCourtModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editData,
  isEditing = false 
}) => {  const [formData, setFormData] = useState<CreateCourtFormData>({
    name: "",
    type: "covered",
    isCovered: true,
    status: "available",
    capacity: 4,
    pricePerHour: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Effect to populate form with edit data
  useEffect(() => {
    if (isEditing && editData) {
      setFormData(editData)    } else if (!isEditing) {
      setFormData({
        name: "",
        type: "covered",
        isCovered: true,
        status: "available",
        capacity: 4,
        pricePerHour: 0,
      })
    }
  }, [isEditing, editData, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      await onSubmit(formData)
      setFormData({
        name: "",
        type: "covered",
        status: "available",
        capacity: 4,
        pricePerHour: 0,
      })
      onClose()    } catch (err) {
      setError(err instanceof Error ? err.message : 
        `Error al ${isEditing ? 'actualizar' : 'crear'} la cancha`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, imageFile: file }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {isEditing ? "Editar Cancha" : "Nueva Cancha"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
              required
            />
          </div>          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <select
              value={formData.type}
              onChange={(e) => {
                const newType = e.target.value as "covered" | "uncovered";
                setFormData((prev) => ({ 
                  ...prev, 
                  type: newType,
                  isCovered: newType === "covered"
                }))
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
            >
              <option value="covered">Cubierta</option>
              <option value="uncovered">Descubierta</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Capacidad</label>            <input
              type="number"
              value={formData.capacity || ""}
              onChange={(e) => setFormData((prev) => ({ 
                ...prev, 
                capacity: e.target.value ? Number.parseInt(e.target.value) : 0 
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Precio por Hora</label>            <input
              type="number"
              value={formData.pricePerHour || ""}
              onChange={(e) => setFormData((prev) => ({ 
                ...prev, 
                pricePerHour: e.target.value ? Number.parseFloat(e.target.value) : 0 
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Imagen</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {isSubmitting 
                ? (isEditing ? "Actualizando..." : "Creando...") 
                : (isEditing ? "Actualizar Cancha" : "Crear Cancha")
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateCourtModal

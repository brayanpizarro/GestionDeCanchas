import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface CreateProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  available: boolean;
  image: string;
  imageFile?: File;
  category?: string;
}

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductFormData) => Promise<void>;
}

const CreateProductModal = ({ isOpen, onClose, onSubmit }: CreateProductModalProps) => {
  const [formData, setFormData] = useState<CreateProductFormData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    available: true,
    image: '',
    category: ''
  });
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 5MB');
      return;
    }

    setIsProcessingImage(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData(prev => ({
          ...prev,
          image: event.target?.result as string,
          imageFile: file
        }));
      }
      setIsProcessingImage(false);
    };
    reader.onerror = () => {
      console.error('Error al leer la imagen');
      setIsProcessingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (field: keyof CreateProductFormData, value: any) => {
  setFormData(prev => {
    const newData = { ...prev };
    
    if (field === 'name') {
      newData[field] = value.slice(0, 100); // Limitar longitud máxima
    } else if (field === 'price') {
      const numValue = Math.max(0, Number(value) || 0);
      newData[field] = numValue;
    } else if (field === 'stock') {
      const numValue = Math.max(0, Math.floor(Number(value)) || 0);
      newData[field] = numValue;
    } else if (field === 'available') {
      newData[field] = value === 'true' || value === true;
    } else if (field === 'category') {
      newData[field] = value.slice(0, 50); // Limitar longitud máxima
    } else {
      newData[field] = value;
    }
    
    return newData;
  });
};

const validateForm = (): string[] => {
  const errors: string[] = [];
  
  if (!formData.name || formData.name.length < 3) {
    errors.push('El nombre debe tener al menos 3 caracteres');
  }
  
  if (isNaN(formData.price) || formData.price <= 0) {
    errors.push('El precio debe ser un número positivo');
  }
  
  if (isNaN(formData.stock) || formData.stock < 0) {
    errors.push('El stock no puede ser negativo');
  }
  
  if (formData.category && formData.category.length < 2) {
    errors.push('La categoría debe tener al menos 2 caracteres');
  }
  
  if (!formData.image) {
    errors.push('Debes seleccionar una imagen para el producto');
  }
  
  return errors;
};

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const errors = validateForm();
  if (errors.length > 0) {
    setFormErrors(errors);
    return;
  }
  
  setFormErrors([]);
  setIsSubmitting(true);
  
  try {
    // Preparar los datos con conversiones explícitas
    const productData = {
      ...formData,
      price: Number(formData.price),
      stock: Math.floor(Number(formData.stock)),
      available: formData.available === true 
    };

    await onSubmit(productData);
    // Resetear formulario solo si fue exitoso
    setFormData({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      available: true,
      category: '',
      image: '',
    });
  } catch (error) {
    console.error('Error completo en handleSubmit:', error);
    // Mostrar errores específicos del backend si existen
    if (error instanceof Error) {
      setFormErrors([error.message]);
    } else {
      setFormErrors(['Error desconocido al crear el producto']);
    }
  } finally {
    setIsSubmitting(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Agregar Nuevo Producto</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {formErrors.length > 0 && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <ul className="list-disc list-inside">
              {formErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Producto
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Pelotas de Padel"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Descripción detallada del producto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría (opcional)
            </label>
            <input
              type="text"
              value={formData.category || ''}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Accesorios, Ropa, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Disponibilidad
            </label>
            <select
              value={formData.available ? 'true' : 'false'}
              onChange={(e) => handleInputChange('available', e.target.value === 'true')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="true">Disponible</option>
              <option value="false">No disponible</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagen del Producto
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isProcessingImage}
            />
            {isProcessingImage && (
              <p className="text-sm text-blue-600 mt-1">Procesando imagen...</p>
            )}
            {formData.image && !isProcessingImage && (
              <div className="mt-2">
                <img 
                  src={formData.image} 
                  alt="Vista previa" 
                  className="w-full h-40 object-contain rounded-lg border bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Vista previa de la imagen
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessingImage || isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isSubmitting ? 'Creando...' : 'Crear Producto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;
export type { CreateProductFormData };
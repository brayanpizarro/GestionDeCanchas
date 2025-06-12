import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface CreateCourtFormData {
  name: string;
  type: 'covered' | 'uncovered';
  status: 'available' | 'occupied' | 'maintenance';
  capacity: number;
  pricePerHour: number;
  image: string;
  imageFile?: File;
}

interface CreateCourtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCourtFormData) => Promise<void>;
}

const CreateCourtModal = ({ isOpen, onClose, onSubmit }: CreateCourtModalProps) => {
  const [formData, setFormData] = useState<CreateCourtFormData>({
    name: '',
    type: 'covered',
    status: 'available',
    capacity: 4,
    pricePerHour: 15000,
    image: ''
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
    
    // Usar FileReader para mostrar vista previa sin comprimir
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

  const handleInputChange = (field: keyof CreateCourtFormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      if (field === 'capacity' || field === 'pricePerHour') {
        const numValue = value === '' ? 0 : Number(value);
        newData[field] = isNaN(numValue) ? 0 : numValue;
      } else {
        newData[field] = value;
      }
      
      return newData;
    });
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) {
      errors.push('El nombre de la cancha es requerido');
    }
    
    if (!formData.capacity || formData.capacity < 2) {
      errors.push('La capacidad debe ser al menos 2 personas');
    }
    
    if (!formData.pricePerHour || formData.pricePerHour <= 0) {
      errors.push('El precio por hora debe ser mayor a 0');
    }
    
    if (!formData.image) {
      errors.push('Debes seleccionar una imagen para la cancha');
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
      await onSubmit(formData);
      setFormData({
        name: '',
        type: 'covered',
        status: 'available',
        capacity: 4,
        pricePerHour: 15000,
        image: ''
      });
    } catch (error) {
      console.error('Error al crear la cancha:', error);
      alert('Error al crear la cancha. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Agregar Nueva Cancha</h3>
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
              Nombre de la Cancha
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Cancha Principal"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Cancha
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="covered">Cubierta</option>
              <option value="uncovered">Descubierta</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacidad (personas)
            </label>
            <input
              type="number"
              min="2"
              max="8"
              value={formData.capacity}
              onChange={(e) => handleInputChange('capacity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio por Hora ($)
            </label>
            <input
              type="number"
              min="1"
              step="1000"
              value={formData.pricePerHour}
              onChange={(e) => handleInputChange('pricePerHour', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagen de la Cancha
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
                  className="w-full h-40 object-cover rounded-lg border"
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
              <span>{isSubmitting ? 'Creando...' : 'Crear Cancha'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourtModal;
export type { CreateCourtFormData };
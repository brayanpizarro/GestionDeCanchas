import React from 'react';
import { MapPin } from 'lucide-react';

const Location: React.FC = () => {
  return (
    <section id="ubicacion" className="py-8 md:py-16 bg-[#0A1838] px-4">
      <div className="container mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white mb-6 md:mb-8">
          Ubicación
        </h2>
        
        <div className="max-w-5xl mx-auto bg-[#0e1f45] p-3 md:p-4 rounded-lg shadow-lg">
          <div className="relative overflow-hidden rounded-lg">
            <img 
              src="assets/imagenes/MapaUcn.png"
              alt="Mapa UCN" 
              className="w-full h-auto rounded-lg"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center mt-4 md:mt-6 text-white space-y-2 sm:space-y-0">
            <MapPin size={20} className="text-red-500 sm:mr-2 flex-shrink-0" />
            <div className="text-center sm:text-left">
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold leading-tight">
                Estamos ubicados en Campus Guayacán, Coquimbo
              </p>
              <p className="text-sm md:text-base text-gray-400 mt-1">
                en zona recreativa (sector canchas)
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;
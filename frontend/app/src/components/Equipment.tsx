import React from 'react';
import {Link} from "react-router-dom";

const Equipment: React.FC = () => {
  return (
    <section id="equipamiento" className="w-full relative py-12 md:py-16">
      <div className="absolute inset-0 bg-cover bg-center" >
          <img
              src="assets/imagenes/equipamiento.webp"
              alt="cancha de padel"
              className="w-full h-full object-cover"
          />
      </div>
      <div className="absolute inset-0 bg-[#0A1838]/50" />
      
      <div className="relative container mx-auto px-4 z-10">
        <div className="text-center max-w-xs sm:max-w-md md:max-w-2xl mx-auto mb-6 md:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 font-sans leading-tight px-2">
            Si no tienes equipamiento, no te preocupes. ¡Nos puedes pedir!
          </h2>
          
          <Link to="/reservation" className="mt-4 md:mt-6 inline-flex items-center bg-white hover:bg-gray-100 text-[#0A1838] px-4 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-lg font-medium transition-all duration-300 hover:shadow-lg">
            <span className="hidden sm:inline">Reserva los equipamientos aquí</span>
            <span className="sm:hidden">Reservar equipos</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Equipment;
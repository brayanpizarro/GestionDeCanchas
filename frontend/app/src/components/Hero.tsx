import React from 'react';
import { Calendar } from 'lucide-react';
import {Link} from "react-router-dom";

const Hero: React.FC = () => {
  return (
    <section id="inicio" className="w-full h-screen pt-16 md:pt-20 relative">
      <div className="absolute inset-0 bg-cover bg-center">
        <img
        src="assets/imagenes/cancha.webp"
        alt="cancha de padel"
        className="w-full h-full object-cover"
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A1838]/40 to-[#0A1838]/90" />
      
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 md:mb-6 font-serif italic transform transition-all duration-700 hover:scale-105 leading-tight">
          canchas UCENIN
        </h1>
        
        <p className="text-white text-sm sm:text-base md:text-lg lg:text-xl max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mb-6 md:mb-10 leading-relaxed px-2">
          Con canchas UCENIN podrás reservar tus canchas de padel 
          que quieras y al mejor precio.
        </p>
        
        <Link to="/reservation" className="flex items-center space-x-2 bg-white hover:bg-gray-100 text-[#0A1838] px-4 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-lg font-medium transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
          <Calendar size={16} className="md:hidden" />
          <Calendar size={20} className="hidden md:block" />
          <span>Reserva tu cancha aquí</span>
        </Link>
      </div>
    </section>
  );
};

export default Hero;
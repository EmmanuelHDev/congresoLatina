import { Calendar, MapPin, Users } from "lucide-react";
import Header from "./component/Header";
import heroImage from "./assets/hero.JPG";
import Logo from "./assets/LOGO_HORIZONTAL.png";
import Cuenta from "./component/CuentaRegresiva";

export default function LandingPage({ onLoginClick, onRegisterClick }) {
  return (
    <div
      className="min-h-screen text-white bg-gradient-to-r from-[#063040]/80 to-[#27866d]/80 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      {/* Capa oscura */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#063040]/70 to-[#27866d]/70"></div>

      <div className="relative z-10">
        <Header onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} />

        {/* Hero Section */}
        <section className="flex flex-col justify-center items-center text-center px-6 md:px-10 min-h-screen relative">
          <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto h-full">
            
            <img 
              src={Logo} 
              alt="Congreso Logo" 
              className="w-80 md:w-[28rem] lg:w-[32rem] mb-10" 
            />

            {/* Info */}
            <div className="flex flex-col md:flex-row gap-4 text-yellow-300 font-medium mb-6 justify-center">
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>02-04 Marzo, 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={18} />
                <span>Hotel Gran David</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={18} />
                <span>+300 Participantes</span>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-center">
              <button
                onClick={onRegisterClick}
                className="px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-md hover:bg-yellow-300 cursor-pointer"
              >
                Registrarse Ahora
              </button>
              <button className="px-6 py-3 border border-white rounded-md hover:bg-white hover:text-teal-800 cursor-pointer">
                Ver Programa
              </button>
            </div>

            {/* Cuenta regresiva */}
            <div className="mt-8">
              <Cuenta />
            </div>
          </div>
        </section>
        {/* <section className="bg-[#f0f7f6] py-16 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
          Objetivo del Congreso
        </h2>
        <p className="text-lg text-[#063040] max-w-3xl mx-auto leading-relaxed">
          Fomentar un espacio de encuentro académico y científico que permita analizar los principales desafíos contemporáneos de la medicina, compartir los descubrimientos más recientes y explorar las nuevas fronteras del conocimiento médico, promoviendo la actualización profesional, el pensamiento crítico y la colaboración interdisciplinaria para enfrentar con eficacia las transformaciones del entorno sanitario global.
        </p>
        </section> */}
      </div>
    </div>
  );
}

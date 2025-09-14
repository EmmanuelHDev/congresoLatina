import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import logoHeader from "../assets/logoHeader.png";

export default function Header({ onLoginClick, onRegisterClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-2xl px-6 py-3 transition-all duration-300 
      ${scrolled ? "backdrop-blur-md bg-[#063040] shadow-md w-[95%]" : "bg-transparent w-[90%]"}`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <img src={logoHeader} alt="logo" className="hidden lg:w-28 lg:h-16" />

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-6 font-medium text-white">
          <a href="#inicio" className="hover:text-yellow-400">Inicio</a>
          <a href="#sobre" className="hover:text-yellow-400">Sobre el Congreso</a>
          <a href="#ponentes" className="hover:text-yellow-400">Ponentes</a>
          <a href="#programa" className="hover:text-yellow-400">Programa</a>
          <a href="#registro" className="hover:text-yellow-400">Registro</a>
          <a href="#venue" className="hover:text-yellow-400">Resort</a>
        </nav>

        {/* Botones Desktop */}
        <div className="hidden md:flex space-x-4">
          <button
            onClick={onLoginClick}
            className="px-4 py-2 bg-[#063040] border border-white text-white rounded-md text-sm hover:bg-[#ffca27]"
          >
            Iniciar Sesión
          </button>
          <button
            onClick={onRegisterClick}
            className="px-4 py-2 bg-teal-800 text-white rounded-md hover:bg-teal-700 text-sm"
          >
            Registrarse
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white ml-auto"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out rounded-b-2xl
        ${menuOpen ? "max-h-96 opacity-100 bg-[#063040] text-white" : "max-h-0 opacity-0"}`}
      >
        <div className="p-4 space-y-3">
          <a href="#inicio" className="block">Inicio</a>
          <a href="#sobre" className="block">Sobre el Congreso</a>
          <a href="#ponentes" className="block">Ponentes</a>
          <a href="#programa" className="block">Programa</a>
          <a href="#registro" className="block">Registro</a>
          <a href="#venue" className="block">Venue</a>
          <div className="flex space-x-2 mt-2">
            <button
              onClick={onLoginClick}
              className="flex-1 px-4 py-2 border border-white rounded-md text-sm text-white hover:bg-teal-700"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={onRegisterClick}
              className="flex-1 px-4 py-2 bg-teal-800 text-white rounded-md text-sm hover:bg-teal-700"
            >
              Registrarse
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

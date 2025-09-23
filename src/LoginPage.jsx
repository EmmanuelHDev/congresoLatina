import { useState } from "react";
import { Lock, ArrowLeft } from "lucide-react";
import { supabase } from "./lib/cliente"; // cliente Supabase
import OjoAbierto from "./assets/icon/tabler--eye.svg";
import OjoCerrado from "./assets/icon/tabler--eye-closed.svg"
import heroImage from "./assets/hero2.webp";
import Logo from "./assets/LOGO_HORIZONTALact.png";

export default function LoginPage({ onBack, onLoginSuccess }) {
  const [cedula, setCedula] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  

  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMensaje("");

  // limpiar y normalizar entrada
  const cedulaLimpia = cedula
    .trim()
    .replace(/[\u2013\u2014]/g, "-"); // convierte en-dash y em-dash a guion normal

  

  const { data, error } = await supabase
    .from("usuarios_congreso")
    .select("*")
    .eq('cedula', cedulaLimpia)
    .maybeSingle(); // devuelve null si no encuentra nada

  if (error) {
    console.error(error);
    setMensaje("❌ Error en la base de datos.");
  } else if (!data) {
    setMensaje("⚠️ Usuario no encontrado.");
  } else {
    setMensaje(`✅ Bienvenido ${data.nombre} ${data.apellido}`);
    if (onLoginSuccess) onLoginSuccess(data);
  }

  setLoading(false);
};



  return (
    <div className="min-h-screen flex">
      {/* Columna izquierda */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-b from-[#063040] to-[#27866d] text-white flex-col justify-center items-center p-10"
       style={{
                backgroundImage: `url(${heroImage})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",
      }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#063040]/70 to-[#27866d]/70"></div>
        <div className="relative z-10 text-center max-w-md">
          <img 
                src={Logo} 
                alt="Congreso Logo" 
                className="w-80 md:w-[28rem] lg:w-[32rem] mb-10" 
          />
          <p className="text-lg opacity-90">
            Accede con tu cédula registrada.
          </p>
        </div>
      </div>

      {/* Columna derecha */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 relative">
        <form
          onSubmit={handleLogin}
          className="bg-white lg:shadow-lg rounded-2xl p-8 w-full max-w-md relative"
        >
          {/* Botón volver */}
          <button
            onClick={onBack}
            type="button"
            className="flex items-center text-sm text-teal-700 hover:underline mb-4"
          >
            <ArrowLeft size={16} className="mr-1" /> Volver al sitio principal
          </button>

          <h2 className="text-2xl font-bold text-center mb-2">Iniciar Sesión</h2>
          <p className="text-gray-500 text-center mb-6">
            Ingresa tu cédula para acceder
          </p>

          {/* Cedula */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cédula
            </label>
            <div className="flex items-center border rounded-lg px-3">
              <Lock className="text-gray-400 mr-2" size={18} />
              <input
                name="cedula"
                type={showPassword ? "text" : "password"}
                placeholder="Tu Cédula"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                className="w-full py-2 outline-none text-gray-700"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500"
              >
                {showPassword ? <img src={OjoAbierto}/>: <img src={OjoCerrado} alt="Ojo cerrado" />}
              </button>
            </div>
          </div>

          {/* Botón login */}
          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer w-full py-3 bg-teal-800 text-white rounded-lg hover:bg-teal-700 mb-4"
          >
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>

          {/* Mensaje */}
          {mensaje && (
            <p className="text-center text-sm text-gray-700">{mensaje}</p>
          )}
        </form>
      </div>
    </div>
  );
}

import { useState } from "react";
import { supabase } from "./lib/cliente"; // importa tu cliente supabase
import Popup from "./component/NotificarDobleUsuario";
export default function RegisterPage({ onBack }) {
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    semestre_actual: "",
    universidad: "",
    seleccion_participacion: "",
    telefono: "",
    correo: ""
  });

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMensaje("");

  // Normalizar la cédula
  const cedulaNormalizada = formData.cedula
    .trim()
    .replace(/[\u2013\u2014]/g, "-"); // en-dash y em-dash -> "-"

  // Crear copia del formData con la cédula corregida
  const datosLimpios = {
    ...formData,
    cedula: cedulaNormalizada,
  };

  const { error } = await supabase
    .from("usuarios_congreso")
    .insert([datosLimpios]);

  if (error) {
    console.error(error);

    if (error.code === "23505") {
      setShowPopup(true);
    } else {
      setMensaje("❌ Error al registrar la inscripción.");
    }
  } else {
    setMensaje("✅ Inscripción enviada correctamente.");
    setFormData({
      nombre: "",
      apellido: "",
      cedula: "",
      semestre_actual: "",
      universidad: "",
      seleccion_participacion: "",
      telefono: "",
      correo: ""
    });
  }

  setLoading(false);
};




  return (
    <div className="min-h-screen flex">
      {/* Columna izquierda */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-b from-[#063040] to-[#27866d] text-white flex-col justify-center items-center p-10">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-6">
            <span className="text-yellow-400 text-6xl">🩺</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Bienvenido al Congreso de Medicina 2025
          </h2>
          <p className="text-lg opacity-90">
            Completa tu inscripción y participa en el congreso.
          </p>
        </div>
      </div>

      {/* Columna derecha */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg"
        >
          {/* Botón volver */}
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-teal-700 hover:underline mb-4 flex items-center"
          >
            ← Volver al sitio principal
          </button>

          <h2 className="text-2xl font-bold text-center mb-2">Formulario de Inscripción</h2>
          <p className="text-gray-500 text-center mb-6">
            Regístrate para participar en el congreso
          </p>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>

          {/* Cédula */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
            <input
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          {/* Semestre y Universidad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semestre actual</label>
              <input
                name="semestre_actual"
                value={formData.semestre_actual}
                onChange={handleChange}
                type="text"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Universidad</label>
              <input
                name="universidad"
                value={formData.universidad}
                onChange={handleChange}
                type="text"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* Selección de participación */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selección de participación
            </label>
            <select
              name="seleccion_participacion"
              value={formData.seleccion_participacion}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Selecciona una opción</option>
              <option value="ponente">Ponente</option>
              <option value="asistente">Asistente</option>
              <option value="voluntario">Voluntario</option>
            </select>
          </div>

          {/* Teléfono */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono / WhatsApp
            </label>
            <input
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              type="text"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Correo */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              type="email"
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          {/* Botón inscribirse */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-800 text-white rounded-lg hover:bg-teal-700"
          >
            {loading ? "Enviando..." : "Enviar inscripción"}
          </button>

          {mensaje && (
            <p className="mt-4 text-center text-sm text-gray-700">{mensaje}</p>
          )}
        </form>
      </div>
          {/* 👇 Aquí renderizamos el popup si showPopup es true */}
    {showPopup && (
      <Popup
        message="Ya existe un usuario con esa cédula registrado."
        onClose={() => setShowPopup(false)}
      />
    )}
    </div>
  );
}

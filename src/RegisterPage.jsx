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
    otra_universidad: "",
    seleccion_participacion: "",
    paquete: "", 
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

    // Normalizar cédula
    const cedulaNormalizada = formData.cedula.trim().replace(/[\u2013\u2014]/g, "-");

    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authUser, error: authError } = await supabase.auth.signUp({
        email: formData.correo,
        password: cedulaNormalizada, // 👈 cédula como password inicial
      });

      if (authError) {
        console.error("Auth error:", authError.message);
        setMensaje("❌ Error al crear la cuenta: " + authError.message);
        setLoading(false);
        return;
      }

      // 2. Insertar datos en tu tabla vinculando auth_id
      const { error: dbError } = await supabase.from("usuarios_congreso").insert([{
        ...formData,
        cedula: cedulaNormalizada,
        auth_id: authUser.user.id, // 👈 guardamos referencia
        seleccion_participacion: "Participante",
      }]);

      if (dbError) {
        console.error("DB error:", dbError.message);
        if (dbError.code === "23505") {
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
          otra_universidad: "",
          seleccion_participacion: "",
          telefono: "",
          paquete: "", 
          correo: ""
        });
      }
    } catch (err) {
      console.error("Error general:", err.message);
      setMensaje("❌ Error inesperado.");
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
              <select
                name="semestre_actual"
                value={formData.semestre_actual}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Seleccione el semestre</option>
                <option value="I">I (Primero)</option>
                <option value="II">II (Segundo)</option>
                <option value="III">III (Tercero)</option>
                <option value="IV">IV (Cuarto)</option>
                <option value="V">V (Quinto)</option>
                <option value="VI">VI (Sexto)</option>
                <option value="VII">VII (Séptimo)</option>
                <option value="VIII">VIII (Octavo)</option>
                <option value="IX">IX (Noveno)</option>
                <option value="X">X (Décimo)</option>
                <option value="XI">XI (Undécimo)</option>
                <option value="XII">XII (Duodécimo)</option>
              </select>
            </div>
            {/* Universidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Universidad</label>
              <select
                name="universidad"
                value={formData.universidad}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Seleccione una universidad</option>
                <option value="universidad-latina-santiago">Universidad Latina - Santiago</option>
                <option value="universidad-latina-chiriqui">Universidad Latina - Chiriquí</option>
                <option value="universidad-latina-panama">Universidad Latina - Panamá</option>
                <option value="columbus-university">Columbus University</option>
                <option value="uip">UIP</option>
                <option value="otra">Otra Universidad</option>
              </select>
            </div>

            {/* Input adicional si selecciona "Otra Universidad" */}
            {formData.universidad === "otra" && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ¿De qué universidad asistirás?
                </label>
                <input
                  type="text"
                  name="otra_universidad"
                  value={formData.otra_universidad || ""}
                  onChange={handleChange}
                  placeholder="Escriba el nombre de su universidad"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            )}

          </div>
          {/* Paquete */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paquete
          </label>
          <select
            name="paquete"
            value={formData.paquete || ""}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          >
            <option value="">Selecciona un paquete</option>
            <option value="solo-congreso">Solo Congreso</option>
            <option value="solo-decameron">Solo Decameron</option>
            <option value="congreso-decameron">Congreso + Decameron</option>
          </select>
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
              <option value="Miembro">Miembro</option>
              <option value="Participante">Participante</option>
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
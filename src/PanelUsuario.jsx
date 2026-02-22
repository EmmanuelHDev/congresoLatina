import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/cliente";
import RecargosAplicados from "./component/RecargosAplicados";
import Cuotas from "./component/Cuotas";
import BotonAdmin from "./component/BotonAdmin";
import PopupMensaje from "./component/PopupMensaje";
import Talleres from "./component/talleres";

export default function PanelUsuario({ usuario, onLogout }) {
  const navigate = useNavigate(); // ✅ Hook para navegación
  const [companeroCuarto, setCompaneroCuarto] = useState(
    usuario?.companero_cuarto || ""
  );
  const [nombreCertificado, setNombreCertificado] = useState(
    usuario?.nombre_certificado || ""
  );
  const [editMode, setEditMode] = useState(false); // 👈 comienza NO editable
  const [popup, setPopup] = useState({
    visible: false,
    tipo: "exito",
    mensaje: "",
  });
  const [resolvedId, setResolvedId] = useState(usuario?.id || null);
  const [cargando, setCargando] = useState(!usuario?.id);

  // ✅ Si el usuario viene del localStorage, resolver su ID de la BD
  useEffect(() => {
    const fetchUserId = async () => {
      if (usuario?.id) {
        setResolvedId(usuario.id);
        setCargando(false);
        return;
      }

      let filtro = {};
      if (usuario?.auth_id) filtro.auth_id = usuario.auth_id;
      else if (usuario?.cedula)
        filtro.cedula = (usuario.cedula || "").trim().toLowerCase();

      if (Object.keys(filtro).length === 0) {
        setCargando(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("usuarios_congreso")
          .select("*")
          .match(filtro)
          .single();

        if (error) {
          console.error("❌ Error resolviendo usuario:", error);
        } else if (data) {
          console.log("✅ Usuario encontrado en BD:", data);

          // ✅ Sincronizar estados con la BD
          setResolvedId(data.id);
          setCompaneroCuarto(data.companero_cuarto ?? "");
          setNombreCertificado(data.nombre_certificado ?? "");

          // ✅ Actualizar localStorage con datos completos
          localStorage.setItem(
            "usuario",
            JSON.stringify({
              ...usuario,
              ...data,
            })
          );
        }
      } catch (err) {
        console.error("❌ Error en fetchUserId:", err);
      } finally {
        setCargando(false);
      }
    };

    fetchUserId();
  }, [usuario]);

  const handleGuardar = async () => {
    if (!resolvedId) {
      setPopup({
        visible: true,
        tipo: "error",
        mensaje: "No se pudo resolver el ID del usuario para actualizar.",
      });
      return;
    }

    console.log("💾 Guardando cambios para ID:", resolvedId);

    try {
      const { data, error } = await supabase
        .from("usuarios_congreso")
        .update({
          companero_cuarto: companeroCuarto,
          nombre_certificado: nombreCertificado,
        })
        .eq("id", resolvedId)
        .select("*");

      console.log("Resultado update:", { data, error });

      if (error) {
        setPopup({ visible: true, tipo: "error", mensaje: error.message });
        return;
      }

      if (!data || data.length === 0) {
        setPopup({
          visible: true,
          tipo: "error",
          mensaje: "No se actualizó ningún registro.",
        });
        return;
      }

      // ✅ Sincronizar UI con la BD
      const updated = data[0];
      setCompaneroCuarto(updated.companero_cuarto ?? "");
      setNombreCertificado(updated.nombre_certificado ?? "");

      // ✅ Actualizar localStorage
      const usuarioActualizado = {
        ...usuario,
        ...updated,
      };
      localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));

      setPopup({
        visible: true,
        tipo: "exito",
        mensaje: "✅ Información guardada correctamente.",
      });
      setEditMode(false);
    } catch (err) {
      console.error("❌ Error al guardar:", err);
      setPopup({
        visible: true,
        tipo: "error",
        mensaje: "Error al guardar los cambios.",
      });
    }
  };

  const handleLogoutClick = () => {
    // ✅ Limpiar todo y redirigir
    onLogout();
    navigate("/"); // Redirige al inicio
  };

  const handleAdminClick = () => {
    navigate("/admin"); // ✅ Navega a admin
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando tu panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-8 px-6 mb-8">
        <div className="max-w-7xl mx-auto">
          {/* Título principal */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="text-white"
              >
                <path
                  fill="currentColor"
                  d="M20 22h-2v-2a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v2H4v-2a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5zm-8-9a6 6 0 1 1 0-12a6 6 0 0 1 0 12m0-2a4 4 0 1 0 0-8a4 4 0 0 0 0 8"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-semibold">Panel de Usuario</h1>
              <p className="text-teal-100">Gestión de pagos y cuotas</p>
            </div>
          </div>

          {/* Información de usuario */}
          <div className="block md:flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  className="text-white"
                >
                  <path
                    fill="currentColor"
                    d="M20 22h-2v-2a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v2H4v-2a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5zm-8-9a6 6 0 1 1 0-12a6 6 0 0 1 0 12m0-2a4 4 0 1 0 0-8a4 4 0 0 0 0 8"
                  />
                </svg>
              </div>
              <div className="mb-4 md:mb-0">
                <p className="font-medium text-lg">
                  {usuario?.nombre} {usuario?.apellido}
                </p>
                <p className="text-sm text-teal-100">
                  Plan: <span className="font-medium">{usuario?.paquete}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 md:mt-0">
              {usuario?.seleccion_participacion === "Admin" && (
                <BotonAdmin onClick={handleAdminClick} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ TALLERES - PASAR PROP usuario */}
      <Talleres usuario={usuario} />

      {/* Fechas de cuotas */}
      <Cuotas usuario={usuario} />

      {/* Nueva sección con Room y Certificado */}
      <div className="max-w-7xl mx-auto px-6 py-8 mt-12 shadow-lg border-0 bg-white rounded-lg">
        <h2 className="flex gap-1 text-lg font-semibold mb-4 text-gray-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="#009588"
              d="M14 14.252v2.09A6 6 0 0 0 6 22H4a8 8 0 0 1 10-7.749M12 13c-3.315 0-6-2.685-6-6s2.685-6 6-6s6 2.685 6 6s-2.685 6-6 6m0-2c2.21 0 4-1.79 4-4s-1.79-4-4-4s-4 1.79-4 4s1.79 4 4 4m6 6v-3h2v3h3v2h-3v3h-2v-3h-3v-2z"
            />
          </svg>
          Información adicional
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Nombre del Compañero de cuarto
            </label>
            <input
              type="text"
              name="companero_cuarto"
              value={companeroCuarto}
              disabled={!editMode}
              onChange={(e) => setCompaneroCuarto(e.target.value)}
              placeholder="Ingrese nombre del Compañero de cuarto"
              className={`w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-[#009588] transition ${
                !editMode ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Nombre para el Certificado
            </label>
            <input
              type="text"
              name="nombre_certificado"
              value={nombreCertificado}
              disabled={!editMode}
              onChange={(e) => setNombreCertificado(e.target.value)}
              placeholder="Ingrese nombre del certificado"
              className={`w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-[#009588] transition ${
                !editMode ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""
              }`}
            />
          </div>
        </div>

        {/* Botones */}
        <div className="mt-6 flex justify-end gap-2">
          {editMode ? (
            <button
              onClick={handleGuardar}
              disabled={!resolvedId}
              className={`px-4 py-2 rounded-md font-medium text-white transition ${
                !resolvedId
                  ? "opacity-50 cursor-not-allowed bg-gray-400"
                  : "bg-[#009588] hover:bg-[#00796b]"
              }`}
            >
              Guardar
            </button>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md font-medium cursor-pointer transition"
            >
              Editar
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 mt-8 max-w-7xl mx-auto flex justify-end">
        <button
          onClick={handleLogoutClick}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md text-sm font-medium transition"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Popup */}
      {popup.visible && (
        <PopupMensaje
          tipo={popup.tipo}
          mensaje={popup.mensaje}
          onClose={() => setPopup({ ...popup, visible: false })}
        />
      )}
    </div>
  );
}
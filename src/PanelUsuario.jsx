import React from "react";
import RecargosAplicados from "./component/RecargosAplicados";
import Cuotas from "./component/Cuotas";
import BotonAdmin from "./component/BotonAdmin";
export default function PanelUsuario({ usuario, onLogout, onAdminClick }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      {/* Panel de Usuario */}
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-8 px-6 mb-8">
        <div className="max-w-7xl mx-auto">
          {/* Título principal */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="text-white">
                <path fill="currentColor" d="M20 22h-2v-2a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v2H4v-2a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5zm-8-9a6 6 0 1 1 0-12a6 6 0 0 1 0 12m0-2a4 4 0 1 0 0-8a4 4 0 0 0 0 8"/>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="text-white">
                  <path fill="currentColor" d="M20 22h-2v-2a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v2H4v-2a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5zm-8-9a6 6 0 1 1 0-12a6 6 0 0 1 0 12m0-2a4 4 0 1 0 0-8a4 4 0 0 0 0 8"/>
                </svg>
              </div>
              <div className="mb-4">
                <p className="font-medium">{usuario.nombre} {usuario.apellido}</p>
                <p className="text-sm text-teal-100">
                  Plan: <span>{usuario.paquete}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {usuario.seleccion_participacion === "Miembro" && (
                <BotonAdmin onClick={onAdminClick} />
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Recargos */}
      {/* <RecargosAplicados
        titulo="Recargos Aplicados"
        tituloCuota="Primera cuota"
        descripcion="Recargo de $10 USD por pago fuera de fecha límite"
      /> */}

      {/* Fechas de cuotas */}
      <Cuotas usuario={usuario} />

      {/* Footer con botón de cerrar sesión */}
      <div className="px-4 mt-6 flex justify-end">
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

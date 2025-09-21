import React from "react";
import RecargosAplicados from "./component/RecargosAplicados";
import Cuotas from "./component/Cuotas";
import BotonAdmin from "./component/BotonAdmin";
export default function PanelUsuario({ usuario, onLogout, onAdminClick }) {
  return (
    <div className="max-w-4xl h-screen min-w-[320px] mx-auto bg-white rounded-xl  space-y-6 pb-8">
      {/* Panel de Usuario */}
      <div className="bg-[#005f5a] p-6 text-white">
        <div className="flex items-center gap-3">
          {/* Icono del usuario en círculo */}
          <div className="bg-[#004643] p-3 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-white"
            >
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12m0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8" />
            </svg>
          </div>

          {/* Título y subtítulo */}
          <div>
            <h2 className="text-2xl font-semibold">Panel de Usuario</h2>
            <p className="text-sm opacity-90">Gestión de pagos y cuotas</p>
          </div>
        </div>
      </div>

      <div className="mt-2 px-4">
        <p>{usuario.nombre} {usuario.apellido}</p>
        <p className="mb-4">
          Plan: <span>{usuario.paquete}</span>
        </p>
       {usuario.rol === "admin" && <BotonAdmin onClick={onAdminClick} />}
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

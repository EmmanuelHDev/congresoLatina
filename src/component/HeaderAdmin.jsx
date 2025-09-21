import React from "react";

export default function HeaderAdmin({ stats }) {
  return (
    <div className="bg-gradient-to-r from-green-600 to-green-500 text-white  shadow p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      {/* Sección izquierda */}
      <div className="flex items-start md:items-center gap-4">
        {/* Icono / Logo */}
        <div className="bg-green-700/40 p-4 rounded-lg flex items-center justify-center">
          
        </div>

        {/* Texto */}
        <div>
          <p className="flex items-center gap-2 text-sm opacity-90">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M24 14.6c0 .6-1.2 1-2.6 1.2c-.9-1.7-2.7-3-4.8-3.9c.2-.3.4-.5.6-.8h.8c3.1-.1 6 1.8 6 3.5M6.8 11H6c-3.1 0-6 1.9-6 3.6c0 .6 1.2 1 2.6 1.2c.9-1.7 2.7-3 4.8-3.9zm5.2 1c2.2 0 4-1.8 4-4s-1.8-4-4-4s-4 1.8-4 4s1.8 4 4 4m0 1c-4.1 0-8 2.6-8 5c0 2 8 2 8 2s8 0 8-2c0-2.4-3.9-5-8-5m5.7-3h.3c1.7 0 3-1.3 3-3s-1.3-3-3-3c-.5 0-.9.1-1.3.3c.8 1 1.3 2.3 1.3 3.7c0 .7-.1 1.4-.3 2M6 10h.3C6.1 9.4 6 8.7 6 8c0-1.4.5-2.7 1.3-3.7C6.9 4.1 6.5 4 6 4C4.3 4 3 5.3 3 7s1.3 3 3 3"/></svg>
            Panel de Administración
          </p>
          <h1 className="text-2xl font-bold">Gestión de Inscripciones</h1>
          <p className="text-sm opacity-90">
            Administra participantes, pagos y cuotas del sistema
          </p>
        </div>
      </div>

      {/* Sección derecha: estadísticas */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="bg-green-700/30 px-6 py-3 rounded-lg text-center">
          <p className="text-xl font-semibold">
            {stats.participantes || 0}
          </p>
          <p className="text-sm opacity-80">Participantes</p>
        </div>
        <div className="bg-green-700/30 px-6 py-3 rounded-lg text-center">
          <p className="text-xl font-semibold">
            {stats.activos ? `${stats.activos}%` : "0%"}
          </p>
          <p className="text-sm opacity-80">Activos</p>
        </div>
      </div>
    </div>
  );
}

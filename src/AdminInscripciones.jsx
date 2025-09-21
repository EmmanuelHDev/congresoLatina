import React, { useState } from "react";
import HeaderAdmin from "./component/HeaderAdmin";
export default function AdminInscripciones({ onBack }) {
  const [filtroPaquete, setFiltroPaquete] = useState("Todos");
  const [filtroCuotas, setFiltroCuotas] = useState("Todas");

  // 🔹 Datos de ejemplo (esto luego lo conectas a tu base con Supabase)
  const participantes = [
    {
      id: 1,
      nombre: "María García López",
      correo: "maria.garcia@email.com",
      paquete: "Premium",
      cuotas: 3,
      estado: "Activo",
      fecha: "14/01/2024",
    },
    {
      id: 2,
      nombre: "Carlos Rodríguez Silva",
      correo: "carlos.rodriguez@email.com",
      paquete: "Básico",
      cuotas: 1,
      estado: "Pendiente",
      fecha: "19/01/2024",
    },
    {
      id: 3,
      nombre: "Ana Martínez Ruiz",
      correo: "ana.martinez@email.com",
      paquete: "Estándar",
      cuotas: 2,
      estado: "Activo",
      fecha: "17/01/2024",
    },
    {
      id: 4,
      nombre: "Luis Fernando Torres",
      correo: "luis.torres@email.com",
      paquete: "Premium",
      cuotas: 6,
      estado: "Activo",
      fecha: "21/01/2024",
    },
    {
      id: 5,
      nombre: "Carmen Delgado Vega",
      correo: "carmen.delgado@email.com",
      paquete: "Básico",
      cuotas: 1,
      estado: "Cancelado",
      fecha: "11/01/2024",
    },
    {
      id: 6,
      nombre: "Roberto Jiménez Mora",
      correo: "roberto.jimenez@email.com",
      paquete: "Estándar",
      cuotas: 4,
      estado: "Pendiente",
      fecha: "24/01/2024",
    },
  ];

  // 🔹 Filtro básico
  const participantesFiltrados = participantes.filter((p) => {
    return (
      (filtroPaquete === "Todos" || p.paquete === filtroPaquete) &&
      (filtroCuotas === "Todas" || p.cuotas.toString() === filtroCuotas)
    );
  });

  const getEstadoClass = (estado) => {
    switch (estado) {
      case "Activo":
        return "bg-green-100 text-green-700 px-2 py-1 rounded text-xs";
      case "Pendiente":
        return "bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs";
      case "Cancelado":
        return "bg-red-100 text-red-700 px-2 py-1 rounded text-xs";
      default:
        return "bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs";
    }
  };

  return (
    <div className="">
      <HeaderAdmin stats={{ participantes: 156, activos: 89 }} />
      {/* Filtros */}
      <div className="px-4 flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          className="border px-3 py-2 rounded w-full sm:w-1/3"
        />
        <select
          value={filtroPaquete}
          onChange={(e) => setFiltroPaquete(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-1/4"
        >
          <option>Todos</option>
          <option>Básico</option>
          <option>Estándar</option>
          <option>Premium</option>
        </select>
        <select
          value={filtroCuotas}
          onChange={(e) => setFiltroCuotas(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-1/4"
        >
          <option>Todas</option>
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
          <option>6</option>
        </select>
        <button className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m2.859 2.877l12.57-1.795a.5.5 0 0 1 .571.494v20.848a.5.5 0 0 1-.57.494L2.858 21.123a1 1 0 0 1-.859-.99V3.867a1 1 0 0 1 .859-.99M4 4.735v14.53l10 1.429V3.306zM17 19h3V5h-3V3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4zm-6.8-7l2.8 4h-2.4L9 13.714L7.4 16H5l2.8-4L5 8h2.4L9 10.286L10.6 8H13z"/></svg>
          Descargar
        </button>
      </div>

      {/* Tabla */}
      <div className="px-4 overflow-x-auto bg-white rounded shadow">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                  <g fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="6" r="4"/>
                    <path strokeLinecap="round" d="M19.998 18q.002-.246.002-.5c0-2.485-3.582-4.5-8-4.5s-8 2.015-8 4.5S4 22 12 22c2.231 0 3.84-.157 5-.437"/>
                  </g>
                </svg>
                Nombre Completo
              </div>
            </th>

            <th className="p-3">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M20 18h-2V9.25L12 13L6 9.25V18H4V6h1.2l6.8 4.25L18.8 6H20m0-2H4c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2"/>
                </svg>
                Correo Electrónico
              </div>
            </th>

            <th className="p-3">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M7 7v10h10V7H7m0-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2"/>
                </svg>
                Paquete
              </div>
            </th>

            <th className="p-3">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M3 4h18v2H3zm0 7h18v2H3zm0 7h18v2H3z"/>
                </svg>
                Cuotas
              </div>
            </th>

            <th className="p-3">Estado</th>

            <th className="p-3">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 16H5V10h14z"/>
                </svg>
                Fecha de Registro
              </div>
            </th>

            <th className="p-3">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2M4 18V8h16v10z"/>
                </svg>
                Comprobante
              </div>
            </th>
          </tr>
        </thead>

          <tbody>
            {participantesFiltrados.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                {/* Nombre con avatar */}
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {/* Círculo con inicial */}
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-600 text-white font-semibold">
                      {p.nombre.charAt(0)}
                    </div>
                    <span>{p.nombre}</span>
                  </div>
                </td>

                <td className="p-3 text-gray-600">{p.correo}</td>
                <td className="p-3">
                  <span className="bg-gray-100 px-2 py-1 rounded text-sm">{p.paquete}</span>
                </td>
                <td className="p-3">{p.cuotas}</td>
                <td className="p-3">
                  <span className={getEstadoClass(p.estado)}>{p.estado}</span>
                </td>
                <td className="p-3">{p.fecha}</td>
                <td className="p-3">
                  <button className="cursor-pointer text-green-600 hover:text-green-800 flex justify-center items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M12 3c5.392 0 9.878 3.88 10.819 9c-.94 5.12-5.427 9-10.819 9s-9.878-3.88-10.818-9C2.122 6.88 6.608 3 12 3m0 16a9.005 9.005 0 0 0 8.778-7a9.005 9.005 0 0 0-17.555 0A9.005 9.005 0 0 0 12 19m0-2.5a4.5 4.5 0 1 1 0-9a4.5 4.5 0 0 1 0 9m0-2a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5"
                      />
                    </svg>{" "}
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}

import React from "react";

export default function RecargosAplicados({
  titulo = "Recargos Aplicados",
  tituloCuota = "Primera cuota",
  descripcion,
}) {
  return (
    <div className="px-4">
      {/* Título general */}
      <h3 className="text-yellow-700 font-semibold flex items-center gap-2 mb-4">
        <span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-orange-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="m12.866 3l9.526 16.5a1 1 0 0 1-.866 1.5H2.474a1 1 0 0 1-.866-1.5L11.134 3a1 1 0 0 1 1.732 0m-8.66 16h15.588L12 5.5zM11 16h2v2h-2zm0-7h2v5h-2z" />
          </svg>
        </span>
        {titulo}
      </h3>

      {/* Bloque de recargo */}
      <div className="bg-yellow-50 border border-yellow-300 rounded-md p-4">
        <p className="mt-2 text-sm flex gap-2 items-center text-yellow-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
          >
            <g
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10" />
              <path d="M15 8h-3m-3 8h3m0 0h1a2 2 0 0 0 2-2v0a2 2 0 0 0-2-2h-2a2 2 0 0 1-2-2v0a2 2 0 0 1 2-2h1m0 8v2m0-10V6" />
            </g>
          </svg>
          <strong className="text-yellow-700">{tituloCuota}:</strong>{" "}
          {descripcion ??
            "Recargo de $10 USD por pago fuera de fecha límite"}
        </p>
      </div>
    </div>
  );
}

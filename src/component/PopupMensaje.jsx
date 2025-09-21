import React from "react";

export default function PopupMensaje({ tipo = "exito", mensaje, onClose }) {
  const colores = tipo === "exito"
    ? "bg-green-100 text-green-800 border-green-300"
    : "bg-red-100 text-red-800 border-red-300";

  const icono = tipo === "exito" ? (
    <svg xmlns="http://www.w3.org/2000/svg" 
      className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" 
      className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
    </svg>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className={`rounded-md p-5 border shadow-md w-[90%] max-w-md ${colores}`}>
        <div className="flex items-center gap-3">
          {icono}
          <p className="font-medium">{mensaje}</p>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

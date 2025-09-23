import React from "react";

export default function Confirmacion({ onLogin }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-2xl p-8 text-center max-w-md">
        <h2 className="text-2xl font-bold text-green-700 mb-4">
          ✅ ¡Correo confirmado!
        </h2>
        <p className="text-gray-600 mb-6">
          Tu cuenta ha sido confirmada exitosamente.  
          Ahora puedes iniciar sesión para continuar.
        </p>
        <button
          onClick={onLogin}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Ir al Login
        </button>
      </div>
    </div>
  );
}

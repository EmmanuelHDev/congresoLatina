// src/component/PopupMensaje.jsx
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

export default function PopupMensaje({
  tipo = "exito",
  mensaje,
  onClose,
  autoCloseDelay = 3000, // en ms
}) {
  useEffect(() => {
    if (autoCloseDelay > 0) {
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoCloseDelay, onClose]);

  const isSuccess = tipo === "exito";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-sm w-full mx-4 relative overflow-hidden"
        >
          {/* Contenido */}
          <div className="p-6 text-center">
            {/* Icono */}
            <div className="mb-4 flex justify-center">
              <div
                className={`rounded-full p-3 ${
                  isSuccess ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {isSuccess ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600" />
                )}
              </div>
            </div>

            {/* Título */}
            <h3
              className={`text-lg font-semibold mb-2 ${
                isSuccess ? "text-green-700" : "text-red-700"
              }`}
            >
              {isSuccess ? "¡Éxito!" : "Error"}
            </h3>

            {/* Mensaje */}
            <p className="text-gray-600 mb-6">{mensaje}</p>

            {/* Botón */}
            <button
              onClick={onClose}
              className={`px-6 py-2 rounded-lg text-white font-medium shadow ${
                isSuccess
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              OK
            </button>

            {/* Barra de cierre automático */}
            {autoCloseDelay > 0 && (
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{
                  duration: autoCloseDelay / 1000,
                  ease: "linear",
                }}
                className={`h-1 mt-4 ${
                  isSuccess ? "bg-green-200" : "bg-red-200"
                } rounded-full mx-auto`}
              />
            )}
            {autoCloseDelay > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                Se cerrará automáticamente
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

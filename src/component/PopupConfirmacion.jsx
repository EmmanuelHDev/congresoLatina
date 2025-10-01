import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function PopupConfirmacion({
  nombre = "",
  onConfirm,
  onCancel,
}) {
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
              <div className="rounded-full p-3 bg-yellow-100">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </div>

            {/* Título */}
            <h3 className="text-lg font-semibold mb-2 text-yellow-700">
              Confirmar Eliminación
            </h3>

            {/* Mensaje */}
            <p className="text-gray-600 mb-6">
              ¿Seguro que deseas eliminar al participante{" "}
              <span className="font-semibold text-gray-800">{nombre}</span>?
            </p>

            {/* Botones */}
            <div className="flex justify-center gap-4">
              <button
                onClick={onCancel}
                className="cursor-pointer px-6 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="cursor-pointer px-6 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

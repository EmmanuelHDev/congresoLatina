import { XCircle } from "lucide-react";

export default function Popup({ message, onClose }) {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[95%] md:w-[70%] lg:w-[40%] z-50">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md relative">
        
        {/* Botón cerrar arriba a la derecha */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-red-600 hover:text-red-800 font-bold"
        >
          ✕
        </button>

        {/* Contenido */}
        <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="font-semibold">ERROR!</span>
          </div>
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
}

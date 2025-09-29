import { useState } from "react";
import { Eye, X } from "lucide-react";
import { supabase } from "../../lib/cliente"; // 👈 importa tu cliente

import { TableCell } from "./table";

export default function ComprobanteCell({ comprobante }) {
  const [open, setOpen] = useState(false);

  if (!comprobante || comprobante.length <= 5) {
    return (
      <TableCell>
        <span className="text-gray-400 font-light text-sm">- No subido</span>
      </TableCell>
    );
  }

  // 👇 Generar URL pública con Supabase
  const { data } = supabase.storage
    .from("comprobantes")
    .getPublicUrl(comprobante);

  const publicUrl = data?.publicUrl;

  return (
    <TableCell>
      <button
        onClick={() => setOpen(true)}
        className="text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer"
        title="Ver Comprobante"
      >
        <Eye className="w-5 h-5" />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-2xl w-full relative">
            {/* Botón de cerrar */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              <X className="w-6 h-6" />
            </button>

            <img
              src={publicUrl}
              alt="Comprobante"
              className="w-full h-auto rounded-md"
            />
          </div>
        </div>
      )}
    </TableCell>
  );
}

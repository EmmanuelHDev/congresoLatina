import { useState } from "react";
import { Eye, X } from "lucide-react";
import { supabase } from "../../lib/cliente";
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

  // URL pública del archivo en Supabase
  const { data } = supabase.storage.from("comprobantes").getPublicUrl(comprobante);
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
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-4 relative">
            {/* Botón cerrar */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-red-400 hover:text-red-600"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Imagen comprobante */}
            <img
              src={publicUrl}
              alt="Comprobante"
              className="w-full h-[680px] object-contain mx-auto rounded-md"
            />
          </div>
        </div>
      )}
    </TableCell>
  );
}

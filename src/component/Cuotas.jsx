import React, { useState, useEffect } from "react";
import UploadComprobante from "./UploadComprobante";
import PopupMensaje from "./PopupMensaje";
import { supabase } from "../lib/cliente";
import { subirComprobante } from "../lib/comprobantes"; // 👈 función de subida

export default function Cuotas({ usuario }) {
  const [file, setFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cuotas, setCuotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState(null); 

  // Traer cuotas desde la base
  useEffect(() => {
    const fetchCuotas = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("cuotas")
        .select("*")
        .order("numero", { ascending: true });

      if (error) {
        console.error("Error cargando cuotas:", error.message);
      } else {
        const cuotasConFechas = data.map((c) => ({
          ...c,
          start: new Date(c.fecha_inicio),
          end: new Date(c.fecha_fin),
        }));
        setCuotas(cuotasConFechas);
      }
      setLoading(false);
    };

    fetchCuotas();
  }, []);

  const today = new Date();

  // Manejar subida de comprobante
  // Manejar subida de comprobante
  const handleFileChange = async (archivo, cuotaId) => {
    if (!archivo) return;

    setFile(archivo);

    // Subir comprobante a Supabase
    const result = await subirComprobante(usuario.id, cuotaId, archivo);

    if (result.success) {
      setPopup({ tipo: "exito", mensaje: "✅ Comprobante subido correctamente" });
    } else {
      setPopup({ tipo: "error", mensaje: "❌ Error al subir: " + result.error });
    }
  };

  return (
    <div className="px-4">
      <h3 className="font-semibold flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M9 1v2h6V1h2v2h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4V1zm11 10H4v8h16zM7 5H4v4h16V5h-3v2h-2V5H9v2H7z"
          />
        </svg>
        Fecha de las cuotas:
      </h3>

      {loading ? (
        <p className="text-gray-500 mt-3">Cargando cuotas...</p>
      ) : cuotas.length === 0 ? (
        <p className="text-gray-500 mt-3">No hay cuotas registradas</p>
      ) : (
        cuotas.map((cuota) => {
          const isActive = today >= cuota.start && today <= cuota.end;

          return (
            <div
              key={cuota.id}
              className={`rounded-md p-4 mt-3 ${
                isActive
                  ? "bg-green-50 border border-green-300"
                  : "bg-gray-100 border border-gray-300"
              }`}
            >
              <div className="flex justify-between items-center">
                <p className="font-semibold">
                  {cuota.descripcion || `Cuota ${cuota.numero}`}
                  <br />
                  <span className="text-sm text-gray-500">
                    {cuota.fecha_inicio} - {cuota.fecha_fin}

                  </span>
                </p>

                {isActive ? (
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                    Disponible
                  </span>
                ) : (
                  <span className="flex items-center text-gray-500 text-xs px-2 py-1 rounded gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M6 22q-.825 0-1.412-.587T4 20V10q0-.825.588-1.412T6 8h1V6q0-2.075 1.463-3.537T12 1t3.538 1.463T17 6v2h1q.825 0 1.413.588T20 10v10q0 .825-.587 1.413T18 22zm0-2h12V10H6zm6-3q.825 0 1.413-.587T14 15t-.587-1.412T12 13t-1.412.588T10 15t.588 1.413T12 17M9 8h6V6q0-1.25-.875-2.125T12 3t-2.125.875T9 6zM6 20V10z"
                      />
                    </svg>
                    Bloqueada
                  </span>
                )}
              </div>

              {isActive && (
                <UploadComprobante
                  file={file}
                  onFileChange={(archivo) => handleFileChange(archivo, cuota.id)} // 👈 ya no va "e.target.files[0]"
                  onVer={() => setShowModal(true)}
                  onCambiar={() => setFile(null)}
                />
              )}
            </div>
          );
        })
      )}

      {/* Modal para vista previa */}
      {showModal && file && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-2">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-[90%] max-w-3xl min-w-[320px] shadow-lg relative">
            <h2 className="text-lg font-semibold mb-4">Vista previa del comprobante</h2>
            <div className="w-full h-[60vh] flex items-center justify-center border rounded bg-gray-50">
              {file.type.includes("image") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="Vista previa"
                  className="max-h-full max-w-full object-contain"
                />
              ) : file.type.includes("pdf") ? (
                <iframe
                  src={`${URL.createObjectURL(file)}#toolbar=0`}
                  title="Vista previa PDF"
                  className="w-full h-full"
                />
              ) : (
                <p className="text-gray-500">Formato no soportado</p>
              )}
            </div>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
      {popup && (
        <PopupMensaje
          tipo={popup.tipo}
          mensaje={popup.mensaje}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}

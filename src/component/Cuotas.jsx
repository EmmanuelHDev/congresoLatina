import React, { useState, useEffect } from "react";
import UploadComprobante from "./UploadComprobante";
import PopupMensaje from "./PopupMensaje";
import RecargosAplicados from "./RecargosAplicados";
import { supabase } from "../lib/cliente";
import { subirComprobante } from "../lib/comprobantes";

export default function Cuotas({ usuario }) {
  const [file, setFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cuotas, setCuotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState(null);

useEffect(() => {
  const fetchCuotasYComprobantes = async () => {
    setLoading(true);

    // 1️⃣ Traer cuotas
    const { data: cuotasData, error: cuotasError } = await supabase
      .from("cuotas")
      .select("*")
      .order("numero", { ascending: true });

    if (cuotasError) {
      console.error("Error cargando cuotas:", cuotasError.message);
      setLoading(false);
      return;
    }

    // 2️⃣ Traer comprobantes del usuario actual
    const { data: comprobantesData, error: compError } = await supabase
      .from("comprobantes_pago")
      .select("cuota_id, archivo_url")
      .eq("usuario_id", usuario.id);

    if (compError) {
      console.error("Error cargando comprobantes:", compError.message);
    }

    // 3️⃣ Crear mapa rápido de comprobantes
    const comprobantesMap = {};
    (comprobantesData || []).forEach((c) => {
      comprobantesMap[c.cuota_id] = c.archivo_url;
    });

    // 4️⃣ Unir cuotas con comprobante
    const cuotasConDatos = cuotasData.map((c) => {
      const start = new Date(`${c.fecha_inicio}T00:00:00`);
      const end = new Date(`${c.fecha_fin}T23:59:59`);
      const tieneComprobante = Boolean(comprobantesMap[c.id]);
      return { ...c, start, end, tieneComprobante };
    });

    setCuotas(cuotasConDatos);
    setLoading(false);

    // 5️⃣ Detectar cuotas vencidas sin comprobante y actualizar usuarios_congreso
    const vencidasNoPagadas = cuotasConDatos
      .filter(
        (c) =>
          new Date() > c.end && // fecha actual mayor al fin
          !c.tieneComprobante // sin comprobante subido
      )
      .map((c) => c.numero);

    if (vencidasNoPagadas.length > 0) {
      const cuotaPendiente = vencidasNoPagadas[0];

      const { error: updateError } = await supabase
        .from("usuarios_congreso")
        .update({ cuota_por_pagar: cuotaPendiente })
        .eq("id", usuario.id);

      if (updateError) {
        console.error("Error actualizando cuota pendiente:", updateError.message);
      } else {
        console.log("✅ Cuota pendiente registrada:", cuotaPendiente);
      }
    }
  };

  fetchCuotasYComprobantes();
}, [usuario.id]);


  const today = new Date();

  // 🔹 Subida de comprobante
  const handleFileChange = async (archivo, cuotaId) => {
    if (!archivo) return;
    setFile(archivo);

    const result = await subirComprobante(usuario.id, cuotaId, archivo);

    if (result.success) {
      setPopup({
        tipo: "exito",
        mensaje: "✅ Comprobante subido correctamente",
      });
      // Refrescar cuotas tras subir
      setCuotas((prev) =>
        prev.map((c) =>
          c.id === cuotaId ? { ...c, tieneComprobante: true } : c
        )
      );
    } else {
      setPopup({ tipo: "error", mensaje: "❌ Error al subir: " + result.error });
    }
  };

 return (
  <>

    {/* 🔹 Bloque principal de cuotas */}
    <div className="max-w-7xl mx-auto px-6 py-8 pb-12 shadow-lg border-0">
      {/* 🔸 Mostrar mensaje de recargo si aplica */}
    {/* {usuario.cuota_por_pagar && (
      <div className="mb-6">
        <RecargosAplicados
          titulo="Recargos Aplicados"
          tituloCuota={`Cuota ${usuario.cuota_por_pagar}`}
          descripcion={`Recargo de $10 USD por no haber pagado la cuota ${usuario.cuota_por_pagar} dentro del plazo establecido.`}
        />
      </div>
    )} */}
      <h3 className="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
          <path
            fill="#009588"
            d="M9 1v2h6V1h2v2h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4V1zm11 10H4v8h16zM7 5H4v4h16V5h-3v2h-2V5H9v2H7z"
          />
        </svg>
        Fecha de las cuotas
      </h3>
      <p className="text-gray-400">Gestiona tus comprobantes de pago</p>

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
              <div className="p-6 transition-colors cursor-pointer">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">
                      {cuota.descripcion || `Cuota ${cuota.numero}`}
                    </h3>

                    {cuota.tieneComprobante ? (
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18 13v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 10l7-7m0 0l7 7m-7-7v12"
                          />
                        </svg>
                        Cuota {cuota.numero} pagada
                      </span>
                    ) : isActive ? (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Disponible
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                        Bloqueada
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {cuota.fecha_inicio} - {cuota.fecha_fin}
                  </div>
                </div>
              </div>

              {/* Mostrar input solo si está activa y no tiene comprobante */}
              {isActive && !cuota.tieneComprobante && (
                <UploadComprobante
                  file={file}
                  onFileChange={(archivo) =>
                    handleFileChange(archivo, cuota.id)
                  }
                  onVer={() => setShowModal(true)}
                  onCambiar={() => setFile(null)}
                />
              )}
            </div>
          );
        })
      )}

      {popup && (
        <PopupMensaje
          tipo={popup.tipo}
          mensaje={popup.mensaje}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  </>
);

}

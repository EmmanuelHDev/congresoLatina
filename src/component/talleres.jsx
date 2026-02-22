import React, { useState, useEffect } from "react";
import { supabase } from "../lib/cliente";
import { Clock, MapPin, Users, CheckCircle, AlertCircle, Loader } from "lucide-react";
import PopupMensaje from "./PopupMensaje";
import QRCode from "qrcode";

export default function Talleres({ usuario }) {
  const [talleres, setTalleres] = useState([]);
  const [inscritos, setInscritos] = useState([]);
  const [inscritosData, setInscritosData] = useState({}); // taller_id → { qr_code, codigo_confirmacion }
  const [qrViewer, setQrViewer] = useState({ visible: false, qr: "", codigo: "", taller: null });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [popup, setPopup] = useState({
    visible: false,
    tipo: "exito",
    mensaje: "",
  });
  const [qrModal, setQrModal] = useState({
    visible: false,
    qr: "",
    codigo: "",
    taller: null,
  });

  // Cargar talleres
  useEffect(() => {
    cargarTalleres();
  }, []);

  const cargarTalleres = async () => {
    try {
      setCargando(true);
      setError(null);

      const { data, error: err } = await supabase
        .from("talleres")
        .select("*")
        .eq("estado", true)
        .order("dia", { ascending: true })
        .order("hora_inicio", { ascending: true });

      if (err) throw err;
      if (!data || data.length === 0) return;

      setTalleres(data);
    } catch (err) {
      console.error("Error:", err.message);
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  // Cargar inscripciones del usuario
  useEffect(() => {
    if (!usuario?.id) return;

    const fetchInscripciones = async () => {
      try {
        const { data, error: err } = await supabase
          .from("inscripciones")
          .select("taller_id, qr_code, codigo_confirmacion")
          .eq("usuario_id", usuario.id);

        if (err) throw err;
        setInscritos(data?.map((item) => item.taller_id) || []);

        // Construir mapa taller_id → datos de inscripción
        const mapa = {};
        data?.forEach((item) => {
          mapa[item.taller_id] = {
            qr_code: item.qr_code,
            codigo_confirmacion: item.codigo_confirmacion,
          };
        });
        setInscritosData(mapa);
      } catch (err) {
        console.error("Error:", err);
      }
    };

    fetchInscripciones();
  }, [usuario?.id]);

  // Manejar inscripción
  const handleInscripcion = async (tallerID, inscrito, diaTaller) => {
    try {
      // NO PERMITIR DESINSCRIBIRSE
      if (inscrito && usuario?.id) {
        setPopup({
          visible: true,
          tipo: "error",
          mensaje: "❌ No puedes desinscribirte una vez confirmada tu inscripción.",
        });
        return;
      }

      // Verificar si ya está inscrito en otro taller del mismo día
      const talleresDia = talleres.filter((t) => t.dia === diaTaller);
      const yaInscritoEnDia = talleresDia.some((t) =>
        inscritos.includes(t.id)
      );

      if (yaInscritoEnDia) {
        setPopup({
          visible: true,
          tipo: "error",
          mensaje: "❌ Ya estás inscrito en otro taller de este día.\nPuedes inscribirte solo en uno por día.",
        });
        return;
      }

      // Inscribirse
      const taller = talleres.find((t) => t.id === tallerID);
      if (!taller) throw new Error("Taller no encontrado");

      const cuposDisponibles =
        (taller.cupos_preclinico || 0) +
        (taller.cupos_clinico || 0) -
        (taller.inscritos_preclinico || 0) -
        (taller.inscritos_clinico || 0);

      if (cuposDisponibles <= 0) {
        setPopup({
          visible: true,
          tipo: "error",
          mensaje: "❌ No hay cupos disponibles",
        });
        return;
      }

      const codigoConfirmacion = Math.random().toString(36).substring(2, 15);

      // Insertar - SOLO ESTOS CAMPOS
      const { error: err } = await supabase
        .from("inscripciones")
        .insert([
          {
            usuario_id: usuario?.id || null,
            taller_id: tallerID,
            dia: taller.dia,
            codigo_confirmacion: codigoConfirmacion,
            qr_code: null,
            confirmado: false,
            asistencia: false,
          },
        ]);

      if (err) throw err;

      // Actualizar contador
      await supabase
        .from("talleres")
        .update({
          inscritos_preclinico: (taller.inscritos_preclinico || 0) + 1,
        })
        .eq("id", tallerID);

      if (usuario?.id) {
        setInscritos([...inscritos, tallerID]);
        // Actualizar mapa con QR provisional (se reemplazará con el generado)
        setInscritosData((prev) => ({
          ...prev,
          [tallerID]: { qr_code: null, codigo_confirmacion: codigoConfirmacion },
        }));
      }

      // Generar QR y enviar email
      let qrDataUrl = null;
      try {
        const urlAsistencia = `${window.location.origin}/asistencia?codigo=${codigoConfirmacion}`;
        qrDataUrl = await QRCode.toDataURL(urlAsistencia, { width: 300, margin: 2 });

        // Guardar QR en la BD
        await supabase
          .from("inscripciones")
          .update({ qr_code: qrDataUrl })
          .eq("codigo_confirmacion", codigoConfirmacion);

        // Actualizar mapa local con QR generado
        setInscritosData((prev) => ({
          ...prev,
          [tallerID]: { qr_code: qrDataUrl, codigo_confirmacion: codigoConfirmacion },
        }));


      } catch (_) {
        // No bloquear la inscripción si el QR falla
      }

      // Mostrar modal con QR (siempre, haya o no email)
      if (qrDataUrl) {
        setQrModal({
          visible: true,
          qr: qrDataUrl,
          codigo: codigoConfirmacion,
          taller,
        });
      } else {
        setPopup({
          visible: true,
          tipo: "exito",
          mensaje: `✅ ¡Inscrito!\n\nCódigo: ${codigoConfirmacion}`,
        });
      }

      cargarTalleres();
    } catch (err) {
      console.error("Error:", err);
      setPopup({
        visible: true,
        tipo: "error",
        mensaje: `❌ Error: ${err.message}`,
      });
    }
  };

  const DIAS_NOMBRE = {
    1: "Lunes 2 de Marzo",
    2: "Martes 3 de Marzo",
    3: "Miércoles 4 de Marzo",
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader size={32} className="mx-auto mb-2 text-teal-600 animate-spin" />
          <p className="text-gray-600 text-sm">Cargando talleres...</p>
        </div>
      </div>
    );
  }

  const obtenerNombreDia = (numDia) => {
    const diasMap = {
      1: "Lunes 2 de Marzo",
      2: "Martes 3 de Marzo",
      3: "Miércoles 4 de Marzo",
    };
    return diasMap[numDia] || "Día desconocido";
  };

  const tallerePorDia = talleres.reduce((acc, taller) => {
    const nombreDia = obtenerNombreDia(taller.dia);
    if (!acc[nombreDia]) acc[nombreDia] = [];
    acc[nombreDia].push(taller);
    return acc;
  }, {});

  const dias = [
    "Lunes 2 de Marzo",
    "Martes 3 de Marzo",
    "Miércoles 4 de Marzo",
  ];

  if (talleres.length === 0 && !error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center p-8 bg-yellow-50 rounded-lg border border-yellow-200">
          <AlertCircle size={48} className="mx-auto mb-4 text-yellow-600" />
          <p className="text-yellow-800 text-lg font-semibold">
            No hay talleres disponibles
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h2 className="flex gap-2 text-2xl font-bold text-gray-900 mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            className="text-teal-600"
          >
            <path
              fill="currentColor"
              d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54l-2.16-2.66c-.44-.53-1.25-.58-1.78-.15c-.53.43-.58 1.24-.15 1.77l3 3.69c.42.52 1.24.58 1.77.13l4-5.34c.45-.53.38-1.33-.15-1.77c-.53-.44-1.34-.39-1.78.15z"
            />
          </svg>
          Talleres Disponibles
        </h2>
        <p className="text-gray-600">
          📌 Puedes inscribirte en <strong>solo 1 taller por día</strong>
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-600 rounded">
          <p className="text-red-800 flex items-center gap-2">
            <AlertCircle size={20} />
            Error: {error}
          </p>
        </div>
      )}

      <div className="space-y-8">
        {dias.map((dia) =>
          tallerePorDia[dia] && tallerePorDia[dia].length > 0 ? (
            <div
              key={dia}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-4">
                <h3 className="text-lg font-semibold">{dia}</h3>
                <p className="text-sm text-teal-100">
                  {tallerePorDia[dia].length} taller(es) • 1 inscripción permitida
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                {tallerePorDia[dia].map((taller) => {
                  const inscrito = inscritos.includes(taller.id);
                  const cuposDisponibles =
                    (taller.cupos_preclinico || 0) +
                    (taller.cupos_clinico || 0) -
                    (taller.inscritos_preclinico || 0) -
                    (taller.inscritos_clinico || 0);
                  const totalCupos =
                    (taller.cupos_preclinico || 0) +
                    (taller.cupos_clinico || 0);
                  const inscritos_total =
                    (taller.inscritos_preclinico || 0) +
                    (taller.inscritos_clinico || 0);
                  const porcentajeOcupacion =
                    totalCupos > 0
                      ? (inscritos_total / totalCupos) * 100
                      : 0;

                  // Verificar si hay otro taller del mismo día inscrito
                  const otroTallerDelDiaInscrito = talleres
                    .filter((t) => t.dia === taller.dia && t.id !== taller.id)
                    .some((t) => inscritos.includes(t.id));

                  // El botón está deshabilitado si:
                  // 1. No hay cupos Y no está inscrito
                  // 2. Hay otro taller del mismo día inscrito Y no está inscrito en este
                  const btnDeshabilitado =
                    (cuposDisponibles <= 0 && !inscrito) ||
                    (otroTallerDelDiaInscrito && !inscrito);

                  return (
                    <div
                      key={taller.id}
                      className={`border-2 rounded-lg p-5 transition-all ${
                        inscrito
                          ? "border-teal-600 bg-teal-50"
                          : "border-gray-200 bg-white hover:border-teal-300"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-base mb-1">
                            {taller.nombre}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {taller.expositor}
                          </p>
                        </div>
                        {inscrito && (
                          <CheckCircle
                            size={24}
                            className="text-teal-600 flex-shrink-0 ml-2"
                          />
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-4">{taller.tema}</p>

                      <div className="space-y-2 mb-4 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-teal-600" />
                          <span>
                            {taller.hora_inicio} – {taller.hora_fin}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-teal-600" />
                          <span>{taller.salon}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-blue-600" />
                          <span>
                            Preclínico: {taller.inscritos_preclinico || 0}/{taller.cupos_preclinico || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-purple-600" />
                          <span>
                            Clínico: {taller.inscritos_clinico || 0}/{taller.cupos_clinico || 0}
                          </span>
                        </div>
                      </div>

                      {totalCupos > 0 && (
                        <div className="mb-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-teal-600 h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.min(porcentajeOcupacion, 100)}%`,
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {Math.round(porcentajeOcupacion)}% ocupado
                          </p>
                        </div>
                      )}

                      <button
                        onClick={() =>
                          handleInscripcion(taller.id, inscrito, taller.dia)
                        }
                        disabled={btnDeshabilitado || inscrito}
                        className={`w-full py-2 px-4 rounded-md font-medium text-sm transition ${
                          inscrito
                            ? "bg-green-600 text-white cursor-not-allowed"
                            : btnDeshabilitado
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-teal-100 hover:bg-teal-200 text-teal-800"
                        }`}
                      >
                        {inscrito
                          ? "✓ Inscripción confirmada"
                          : cuposDisponibles <= 0
                          ? "Sin cupos"
                          : otroTallerDelDiaInscrito
                          ? "Ya inscrito en otro"
                          : "Inscribirse"}
                      </button>

                      {/* Botón Ver QR */}
                      {inscrito && inscritosData[taller.id] && (
                        <button
                          onClick={async () => {
                            const data = inscritosData[taller.id];
                            // Siempre regenerar con el dominio actual (el guardado en BD puede tener localhost)
                            const urlQr = `${window.location.origin}/asistencia?codigo=${data.codigo_confirmacion}`;
                            const qr = await QRCode.toDataURL(urlQr, { width: 300, margin: 2 });
                            setQrViewer({ visible: true, qr, codigo: data.codigo_confirmacion, taller });
                          }}
                          className="w-full mt-2 py-2 px-4 rounded-md font-medium text-sm border-2 border-teal-600 text-teal-700 hover:bg-teal-50 transition cursor-pointer flex items-center justify-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>
                          Ver mi QR
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null
        )}
      </div>

      {popup.visible && (
        <PopupMensaje
          tipo={popup.tipo}
          mensaje={popup.mensaje}
          onClose={() => setPopup({ ...popup, visible: false })}
        />
      )}

      {/* Modal Ver QR - pantalla completa para mostrar el día del evento */}
      {qrViewer.visible && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-5 py-3 text-center">
              <h3 className="font-bold text-base">Mi QR de Asistencia</h3>
            </div>
            <div className="p-5 text-center">
              <div className="bg-teal-50 rounded-lg px-3 py-2 mb-4 text-left">
                <p className="font-semibold text-teal-800 text-sm truncate">{qrViewer.taller?.nombre}</p>
                <p className="text-teal-600 text-xs">
                  {DIAS_NOMBRE[qrViewer.taller?.dia]} · {qrViewer.taller?.hora_inicio} – {qrViewer.taller?.hora_fin}
                </p>
              </div>

              {qrViewer.qr ? (
                <img
                  src={qrViewer.qr}
                  alt="Código QR"
                  className="w-64 h-64 mx-auto border-4 border-teal-500 rounded-xl p-1 mb-3"
                />
              ) : (
                <div className="w-64 h-64 mx-auto flex items-center justify-center bg-gray-100 rounded-xl mb-3">
                  <p className="text-gray-400 text-sm">Generando QR...</p>
                </div>
              )}

              <p className="font-mono text-xs text-gray-500 mb-4 tracking-widest">{qrViewer.codigo}</p>

              <button
                onClick={() => setQrViewer({ visible: false, qr: "", codigo: "", taller: null })}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg font-medium transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal QR de confirmación */}
      {qrModal.visible && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-4 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-1" />
              <h3 className="text-lg font-bold">¡Inscripción Confirmada!</h3>
              <p className="text-teal-100 text-xs mt-1">Guarda una captura de tu QR</p>
            </div>

            {/* Contenido */}
            <div className="p-6 text-center">
              {/* Info del taller */}
              <div className="bg-teal-50 rounded-lg p-3 mb-4 text-left">
                <p className="font-semibold text-teal-800 text-sm">{qrModal.taller?.nombre}</p>
                <p className="text-teal-600 text-xs mt-1">
                  {DIAS_NOMBRE[qrModal.taller?.dia]} · {qrModal.taller?.hora_inicio} – {qrModal.taller?.hora_fin}
                </p>
                <p className="text-teal-600 text-xs">{qrModal.taller?.salon}</p>
              </div>

              {/* QR Code */}
              <p className="text-sm text-gray-600 mb-3">
                Presenta este QR el día del taller para registrar tu asistencia:
              </p>
              <div className="flex justify-center mb-4">
                <img
                  src={qrModal.qr}
                  alt="Código QR"
                  className="w-48 h-48 border-4 border-teal-500 rounded-lg p-1"
                />
              </div>

              {/* Código */}
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg py-2 px-4 mb-5">
                <p className="text-xs text-gray-500 mb-1">Código de confirmación</p>
                <p className="font-mono font-bold text-gray-800 tracking-widest text-sm">
                  {qrModal.codigo}
                </p>
              </div>

              <p className="text-xs text-gray-400 mb-4">
                Guarda una captura de pantalla de este QR.
              </p>

              <button
                onClick={() => setQrModal({ visible: false, qr: "", codigo: "", taller: null })}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg font-medium transition cursor-pointer"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
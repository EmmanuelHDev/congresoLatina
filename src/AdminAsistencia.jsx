import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/cliente";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, QrCode } from "lucide-react";
import { Card, CardContent } from "./component/ui/card";

export default function AdminAsistencia() {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const [escaneando, setEscaneando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [ultimoResultado, setUltimoResultado] = useState(null); // { tipo: "exito"|"repetido"|"error", mensaje, estudiante }
  const [historial, setHistorial] = useState([]);
  const ultimoCodigoRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup al desmontar
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  const iniciarEscaner = () => {
    setEscaneando(true);
    setUltimoResultado(null);

    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
        },
        false
      );

      scanner.render(
        async (codigoDecodificado) => {
          // Evitar procesar el mismo código dos veces seguidas
          if (codigoDecodificado === ultimoCodigoRef.current || procesando) return;
          ultimoCodigoRef.current = codigoDecodificado;

          setProcesando(true);
          await marcarAsistencia(codigoDecodificado);
          setProcesando(false);

          // Resetear para permitir siguiente escaneo después de 3 segundos
          setTimeout(() => {
            ultimoCodigoRef.current = null;
          }, 3000);
        },
        (error) => {
          // Ignorar errores de lectura (son frecuentes mientras busca el QR)
        }
      );

      scannerRef.current = scanner;
    }, 100);
  };

  const detenerEscaner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
    setEscaneando(false);
    setUltimoResultado(null);
  };

  const marcarAsistencia = async (codigo) => {
    // Buscar inscripción con datos del usuario y taller
    const { data, error } = await supabase
      .from("inscripciones")
      .select(`
        id,
        asistencia,
        confirmado,
        codigo_confirmacion,
        usuarios_congreso ( nombre, apellido, cedula ),
        talleres ( nombre, dia )
      `)
      .eq("codigo_confirmacion", codigo)
      .single();

    if (error || !data) {
      const resultado = {
        tipo: "error",
        mensaje: "Código QR no encontrado o inválido.",
        codigo,
      };
      setUltimoResultado(resultado);
      setHistorial((prev) => [{ ...resultado, hora: horaActual() }, ...prev].slice(0, 20));
      return;
    }

    if (data.asistencia) {
      const resultado = {
        tipo: "repetido",
        mensaje: "Asistencia ya registrada anteriormente.",
        estudiante: `${data.usuarios_congreso?.nombre} ${data.usuarios_congreso?.apellido}`,
        taller: data.talleres?.nombre,
        cedula: data.usuarios_congreso?.cedula,
      };
      setUltimoResultado(resultado);
      setHistorial((prev) => [{ ...resultado, hora: horaActual() }, ...prev].slice(0, 20));
      return;
    }

    // Marcar asistencia
    const { error: updateError } = await supabase
      .from("inscripciones")
      .update({ asistencia: true, confirmado: true })
      .eq("id", data.id);

    if (updateError) {
      const resultado = {
        tipo: "error",
        mensaje: "Error al registrar asistencia: " + updateError.message,
        codigo,
      };
      setUltimoResultado(resultado);
      setHistorial((prev) => [{ ...resultado, hora: horaActual() }, ...prev].slice(0, 20));
      return;
    }

    const resultado = {
      tipo: "exito",
      mensaje: "¡Asistencia registrada!",
      estudiante: `${data.usuarios_congreso?.nombre} ${data.usuarios_congreso?.apellido}`,
      taller: data.talleres?.nombre,
      cedula: data.usuarios_congreso?.cedula,
    };
    setUltimoResultado(resultado);
    setHistorial((prev) => [{ ...resultado, hora: horaActual() }, ...prev].slice(0, 20));
  };

  const horaActual = () => {
    return new Date().toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const totalRegistrados = historial.filter((h) => h.tipo === "exito").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-8 px-6 mb-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => { detenerEscaner(); navigate("/admin"); }}
              className="cursor-pointer p-2 rounded-lg hover:bg-white/30 transition-colors"
              title="Volver al panel de admin"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="p-2 bg-white/20 rounded-lg">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold">Registro de Asistencia</h1>
              <p className="text-emerald-100">Escanea el QR del estudiante para marcar asistencia</p>
            </div>
          </div>

          {/* Stat */}
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-lg px-4 py-2">
            <CheckCircle className="w-5 h-5 text-emerald-200" />
            <span className="text-sm font-medium">{totalRegistrados} asistencia(s) registrada(s) en esta sesión</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Panel del escáner */}
          <div>
            <Card className="shadow-lg border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-emerald-800 flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Escáner QR
                </h2>
              </div>
              <CardContent className="p-6">
                {!escaneando ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <QrCode className="w-10 h-10 text-emerald-600" />
                    </div>
                    <p className="text-gray-600 mb-6 text-sm">
                      Activa la cámara para escanear los códigos QR de los estudiantes.
                    </p>
                    <button
                      onClick={iniciarEscaner}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition cursor-pointer"
                    >
                      Activar Cámara
                    </button>
                  </div>
                ) : (
                  <div>
                    <div id="qr-reader" className="w-full" />
                    {procesando && (
                      <p className="text-center text-emerald-700 font-medium mt-3 text-sm animate-pulse">
                        Procesando...
                      </p>
                    )}
                    <button
                      onClick={detenerEscaner}
                      className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition cursor-pointer"
                    >
                      Detener Cámara
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Último resultado */}
            {ultimoResultado && (
              <div
                className={`mt-4 rounded-xl p-5 border-2 transition-all ${
                  ultimoResultado.tipo === "exito"
                    ? "bg-green-50 border-green-400"
                    : ultimoResultado.tipo === "repetido"
                    ? "bg-yellow-50 border-yellow-400"
                    : "bg-red-50 border-red-400"
                }`}
              >
                <div className="flex items-start gap-3">
                  {ultimoResultado.tipo === "exito" ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : ultimoResultado.tipo === "repetido" ? (
                    <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-semibold text-base ${
                      ultimoResultado.tipo === "exito" ? "text-green-800"
                      : ultimoResultado.tipo === "repetido" ? "text-yellow-800"
                      : "text-red-800"
                    }`}>
                      {ultimoResultado.mensaje}
                    </p>
                    {ultimoResultado.estudiante && (
                      <p className="text-sm text-gray-700 mt-1">
                        <strong>Estudiante:</strong> {ultimoResultado.estudiante}
                      </p>
                    )}
                    {ultimoResultado.cedula && (
                      <p className="text-sm text-gray-700">
                        <strong>Cédula:</strong> {ultimoResultado.cedula}
                      </p>
                    )}
                    {ultimoResultado.taller && (
                      <p className="text-sm text-gray-700">
                        <strong>Taller:</strong> {ultimoResultado.taller}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Historial de la sesión */}
          <div>
            <Card className="shadow-lg border-0">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-emerald-800">
                  Historial de sesión ({historial.length})
                </h2>
              </div>
              <CardContent className="p-0">
                {historial.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-10">
                    Aún no se han escaneado códigos.
                  </p>
                ) : (
                  <div className="divide-y max-h-[480px] overflow-y-auto">
                    {historial.map((item, idx) => (
                      <div key={idx} className="px-5 py-3 flex items-center gap-3">
                        {item.tipo === "exito" ? (
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : item.tipo === "repetido" ? (
                          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {item.estudiante || item.codigo || "Desconocido"}
                          </p>
                          {item.taller && (
                            <p className="text-xs text-gray-500 truncate">{item.taller}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">{item.hora}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}

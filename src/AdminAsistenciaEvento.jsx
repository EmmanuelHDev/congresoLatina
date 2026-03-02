import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/cliente";
import { Html5Qrcode } from "html5-qrcode";
import { ArrowLeft, QrCode, Camera, CameraOff, LogIn, LogOut, Users, AlertCircle, XCircle, Download, Lock, X, ScanLine } from "lucide-react";
import { Card, CardContent } from "./component/ui/card";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const DIAS = {
  1: "Lunes 2 de Marzo",
  2: "Martes 3 de Marzo",
  3: "Miércoles 4 de Marzo",
};

const POPUP_DURACION = 3500; // ms

export default function AdminAsistenciaEvento() {
  const navigate = useNavigate();
  const scannerRef    = useRef(null);
  const ultimoCodigoRef = useRef(null);
  const procesandoRef = useRef(false);
  const popupTimerRef = useRef(null);
  const isMounted     = useRef(true);

  const [diaSeleccionado, setDiaSeleccionado] = useState(1);
  const [escaneando, setEscaneando]   = useState(false);
  const [procesando, setProcesando]   = useState(false);
  const [errorCamara, setErrorCamara] = useState(null);
  const [historial, setHistorial]     = useState([]);
  const [asistentes, setAsistentes]   = useState([]);
  const [cargandoLista, setCargandoLista] = useState(false);
  const [diasCerrados, setDiasCerrados]   = useState([]);
  const [cerrando, setCerrando]           = useState(false);
  const [popup, setPopup] = useState(null); // { tipo, mensaje, nombre, cedula }

  // Marcar desmontado
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      pararCamara();
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    };
  }, []);

  useEffect(() => {
    cargarConfig();
    cargarAsistentes();
  }, [diaSeleccionado]); // eslint-disable-line react-hooks/exhaustive-deps

  const safe = (fn) => (...args) => { if (isMounted.current) fn(...args); };

  const mostrarPopup = (data) => {
    if (!isMounted.current) return;
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    setPopup(data);
    popupTimerRef.current = setTimeout(() => {
      if (isMounted.current) setPopup(null);
    }, POPUP_DURACION);
  };

  const cargarConfig = async () => {
    const { data } = await supabase
      .from("evento_config")
      .select("dias_asistencia_cerrados")
      .eq("id", 1)
      .single();
    if (data && isMounted.current) setDiasCerrados(data.dias_asistencia_cerrados || []);
  };

  const cerrarDia = async () => {
    if (!window.confirm(`¿Confirmas cerrar la asistencia del ${DIAS[diaSeleccionado]}?\nEsta acción bloqueará nuevos registros para ese día.`)) return;
    safe(setCerrando)(true);
    await detenerEscaner();
    const nuevos = [...diasCerrados, diaSeleccionado];
    const { error } = await supabase
      .from("evento_config")
      .update({ dias_asistencia_cerrados: nuevos })
      .eq("id", 1);
    if (!error) safe(setDiasCerrados)(nuevos);
    safe(setCerrando)(false);
  };

  const cargarAsistentes = async () => {
    safe(setCargandoLista)(true);
    const { data } = await supabase
      .from("asistencia_evento")
      .select(`*, usuarios_congreso(nombre, apellido, cedula, semestre_actual)`)
      .eq("dia", diaSeleccionado)
      .order("hora_entrada", { ascending: false });
    if (isMounted.current) {
      setAsistentes(data || []);
      setCargandoLista(false);
    }
  };

  const pararCamara = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); scannerRef.current.clear(); } catch (_) {}
      scannerRef.current = null;
    }
  };

  const iniciarEscaner = () => {
    setErrorCamara(null);
    setEscaneando(true);
  };

  const exportarExcel = async () => {
    const { data } = await supabase
      .from("asistencia_evento")
      .select(`dia, hora_entrada, hora_salida, usuarios_congreso(nombre, apellido, cedula, semestre_actual, universidad)`)
      .order("dia", { ascending: true })
      .order("hora_entrada", { ascending: true });

    if (!data || data.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Asistencia Evento");

    sheet.columns = [
      { header: "Día",          key: "dia",          width: 20 },
      { header: "Nombre",       key: "nombre",       width: 25 },
      { header: "Apellido",     key: "apellido",     width: 25 },
      { header: "Cédula",       key: "cedula",       width: 15 },
      { header: "Semestre",     key: "semestre",     width: 12 },
      { header: "Universidad",  key: "universidad",  width: 30 },
      { header: "Hora Entrada", key: "hora_entrada", width: 18 },
      { header: "Hora Salida",  key: "hora_salida",  width: 18 },
    ];

    sheet.getRow(1).eachCell((cell) => {
      cell.font  = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1D4ED8" } };
      cell.alignment = { horizontal: "center" };
    });

    const formatTs = (ts) =>
      ts ? new Date(ts).toLocaleString("es-PA", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }) : "—";

    data.forEach((r) => {
      sheet.addRow({
        dia:          DIAS[r.dia] || `Día ${r.dia}`,
        nombre:       r.usuarios_congreso?.nombre       || "",
        apellido:     r.usuarios_congreso?.apellido     || "",
        cedula:       r.usuarios_congreso?.cedula       || "",
        semestre:     r.usuarios_congreso?.semestre_actual || "",
        universidad:  r.usuarios_congreso?.universidad  || "",
        hora_entrada: formatTs(r.hora_entrada),
        hora_salida:  formatTs(r.hora_salida),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "asistencia_evento.xlsx");
  };

  useEffect(() => {
    if (!escaneando) return;
    let cancelado = false;

    const arrancar = async () => {
      try {
        const html5Qrcode = new Html5Qrcode("qr-evento-video");
        await html5Qrcode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 260, height: 260 }, aspectRatio: 1.0 },
          async (decodedText) => {
            let uid = decodedText.trim();
            try {
              const url = new URL(decodedText);
              const param = url.searchParams.get("uid");
              if (param) uid = param;
            } catch (_) {}

            if (uid === ultimoCodigoRef.current || procesandoRef.current) return;
            ultimoCodigoRef.current = uid;
            procesandoRef.current = true;
            if (isMounted.current) setProcesando(true);

            try {
              await registrarAsistencia(uid);
            } catch (e) {
              if (isMounted.current) mostrarPopup({ tipo: "error", mensaje: e?.message || "Error inesperado." });
            }

            if (isMounted.current) setProcesando(false);
            procesandoRef.current = false;
            setTimeout(() => { ultimoCodigoRef.current = null; }, 3000);
          },
          () => {}
        );
        if (cancelado) { html5Qrcode.stop().catch(() => {}); return; }
        scannerRef.current = html5Qrcode;
      } catch (_) {
        if (!cancelado && isMounted.current) {
          setErrorCamara("No se pudo acceder a la cámara. Verifica los permisos.");
          setEscaneando(false);
        }
      }
    };

    arrancar();
    return () => { cancelado = true; };
  }, [escaneando]); // eslint-disable-line react-hooks/exhaustive-deps

  const detenerEscaner = async () => {
    await pararCamara();
    if (isMounted.current) {
      setEscaneando(false);
      setPopup(null);
    }
  };

  const registrarAsistencia = async (uid) => {
    const { data: usuario, error: userErr } = await supabase
      .from("usuarios_congreso")
      .select("id, nombre, apellido, cedula")
      .eq("id", uid)
      .single();

    if (userErr || !usuario) {
      mostrarPopup({ tipo: "error", mensaje: "Participante no encontrado.", codigo: uid });
      setHistorial(prev => [{ tipo: "error", mensaje: "Participante no encontrado.", hora: horaActual() }, ...prev].slice(0, 30));
      return;
    }

    const nombre = `${usuario.nombre} ${usuario.apellido}`;

    const { data: registro } = await supabase
      .from("asistencia_evento")
      .select("*")
      .eq("usuario_id", uid)
      .eq("dia", diaSeleccionado)
      .maybeSingle();

    if (!registro) {
      const { error: insertErr } = await supabase
        .from("asistencia_evento")
        .insert({ usuario_id: uid, dia: diaSeleccionado, hora_entrada: new Date().toISOString() });

      if (insertErr) {
        mostrarPopup({ tipo: "error", mensaje: insertErr.message || "Error al registrar entrada.", nombre });
        setHistorial(prev => [{ tipo: "error", nombre, hora: horaActual() }, ...prev].slice(0, 30));
        return;
      }

      mostrarPopup({ tipo: "entrada", mensaje: "Entrada registrada", nombre, cedula: usuario.cedula });
      setHistorial(prev => [{ tipo: "entrada", nombre, hora: horaActual() }, ...prev].slice(0, 30));

    } else if (!registro.hora_salida) {
      const { error: updateErr } = await supabase
        .from("asistencia_evento")
        .update({ hora_salida: new Date().toISOString() })
        .eq("id", registro.id);

      if (updateErr) {
        mostrarPopup({ tipo: "error", mensaje: updateErr.message || "Error al registrar salida.", nombre });
        setHistorial(prev => [{ tipo: "error", nombre, hora: horaActual() }, ...prev].slice(0, 30));
        return;
      }

      mostrarPopup({ tipo: "salida", mensaje: "Salida registrada", nombre, cedula: usuario.cedula });
      setHistorial(prev => [{ tipo: "salida", nombre, hora: horaActual() }, ...prev].slice(0, 30));

    } else {
      mostrarPopup({ tipo: "repetido", mensaje: "Entrada y salida ya registradas hoy.", nombre, cedula: usuario.cedula });
      setHistorial(prev => [{ tipo: "repetido", nombre, hora: horaActual() }, ...prev].slice(0, 30));
    }

    cargarAsistentes();
  };

  const horaActual = () =>
    new Date().toLocaleTimeString("es-PA", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const formatHora = (ts) =>
    ts ? new Date(ts).toLocaleTimeString("es-PA", { hour: "2-digit", minute: "2-digit" }) : "—";

  const totalEntradas = asistentes.filter(a => a.hora_entrada).length;
  const totalSalidas  = asistentes.filter(a => a.hora_salida).length;
  const enRecinto     = totalEntradas - totalSalidas;

  // Config del popup por tipo
  const POPUP_CONFIG = {
    entrada:  { bg: "bg-green-500",  border: "border-green-600",  icono: <LogIn   className="w-16 h-16 text-white" />, texto: "text-green-700" },
    salida:   { bg: "bg-blue-500",   border: "border-blue-600",   icono: <LogOut  className="w-16 h-16 text-white" />, texto: "text-blue-700"  },
    repetido: { bg: "bg-yellow-400", border: "border-yellow-500", icono: <AlertCircle className="w-16 h-16 text-white" />, texto: "text-yellow-700" },
    error:    { bg: "bg-red-500",    border: "border-red-600",    icono: <XCircle className="w-16 h-16 text-white" />, texto: "text-red-700"   },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">

      {/* ── POPUP OVERLAY ── */}
      {popup && (() => {
        const cfg = POPUP_CONFIG[popup.tipo] || POPUP_CONFIG.error;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className={`relative w-full max-w-sm rounded-3xl shadow-2xl border-4 ${cfg.border} bg-white overflow-hidden`}>
              {/* Barra de progreso animada */}
              <div
                className={`absolute top-0 left-0 h-1.5 ${cfg.bg}`}
                style={{ animation: `shrink ${POPUP_DURACION}ms linear forwards` }}
              />
              <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>

              {/* Ícono */}
              <div className={`${cfg.bg} flex items-center justify-center py-8`}>
                {cfg.icono}
              </div>

              {/* Contenido */}
              <div className="px-6 py-5 text-center">
                <p className={`text-2xl font-bold mb-1 ${cfg.texto}`}>{popup.mensaje}</p>
                {popup.nombre && (
                  <p className="text-lg font-semibold text-gray-800 mt-2">{popup.nombre}</p>
                )}
                {popup.cedula && (
                  <p className="text-sm text-gray-500 mt-0.5">C.I. {popup.cedula}</p>
                )}
              </div>

              {/* Botón cerrar */}
              <button
                onClick={() => { if (popupTimerRef.current) clearTimeout(popupTimerRef.current); setPopup(null); }}
                className="absolute top-3 right-3 p-1 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-gray-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-6 px-6 mb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { detenerEscaner(); navigate("/admin"); }}
                className="cursor-pointer p-2 rounded-lg hover:bg-white/20 transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="p-2 bg-white/20 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Asistencia al Evento</h1>
                <p className="text-blue-200 text-sm">Control de entrada y salida por día</p>
              </div>
            </div>
            <button
              onClick={() => { detenerEscaner(); navigate("/admin/asistencia"); }}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
            >
              <ScanLine className="w-4 h-4" />
              Escanear Talleres
            </button>
          </div>

          {/* Tabs de día */}
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3].map(d => (
              <button
                key={d}
                onClick={() => setDiaSeleccionado(d)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition cursor-pointer ${
                  diaSeleccionado === d
                    ? "bg-white text-blue-700"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                Día {d} · {DIAS[d].split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-12">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
            <p className="text-2xl font-bold text-green-600">{totalEntradas}</p>
            <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
              <LogIn className="w-3 h-3" /> Entradas
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
            <p className="text-2xl font-bold text-gray-500">{totalSalidas}</p>
            <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
              <LogOut className="w-3 h-3" /> Salidas
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
            <p className="text-2xl font-bold text-blue-600">{enRecinto}</p>
            <p className="text-xs text-gray-500 mt-1">En recinto</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Panel escáner */}
          <div>
            <Card className="shadow-md border-0">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 border-b flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-blue-800 flex items-center gap-2">
                    <QrCode className="w-5 h-5" /> Escáner QR
                  </h2>
                  <p className="text-xs text-blue-600 mt-0.5">1er escaneo = entrada · 2do escaneo = salida</p>
                </div>
                {!diasCerrados.includes(diaSeleccionado) && (
                  <button
                    onClick={cerrarDia}
                    disabled={cerrando}
                    className="flex items-center gap-1.5 text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg font-medium transition cursor-pointer disabled:opacity-60 flex-shrink-0"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Cerrar día
                  </button>
                )}
              </div>
              <CardContent className="p-5">

                {diasCerrados.includes(diaSeleccionado) ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-10 h-10 text-orange-500" />
                    </div>
                    <p className="text-orange-700 font-semibold text-base mb-1">Asistencia cerrada</p>
                    <p className="text-gray-500 text-sm">
                      El registro de {DIAS[diaSeleccionado]} fue cerrado.<br />
                      No se pueden registrar nuevas entradas o salidas.
                    </p>
                  </div>
                ) : (
                  <>
                    <div
                      id="qr-evento-video"
                      className="w-full rounded-lg overflow-hidden bg-black"
                      style={{ display: escaneando ? "block" : "none", minHeight: escaneando ? 280 : 0 }}
                    />

                    {!escaneando && (
                      <div className="text-center py-8">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Camera className="w-10 h-10 text-blue-600" />
                        </div>
                        <p className="text-gray-500 text-sm mb-1">Activa la cámara para escanear.</p>
                        <p className="text-gray-400 text-xs mb-5">El browser pedirá permiso la primera vez.</p>
                        {errorCamara && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
                            {errorCamara}
                          </div>
                        )}
                        <button
                          onClick={iniciarEscaner}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition cursor-pointer flex items-center gap-2 mx-auto"
                        >
                          <Camera className="w-5 h-5" /> Activar Cámara
                        </button>
                      </div>
                    )}

                    {escaneando && (
                      <div className="mt-3">
                        {procesando && (
                          <p className="text-center text-blue-700 text-sm animate-pulse mb-2">Procesando...</p>
                        )}
                        <button
                          onClick={detenerEscaner}
                          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition cursor-pointer flex items-center justify-center gap-2"
                        >
                          <CameraOff className="w-4 h-4" /> Detener Cámara
                        </button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Historial de sesión */}
            {historial.length > 0 && (
              <Card className="shadow-md border-0 mt-4">
                <div className="px-5 py-3 border-b bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700">Historial de sesión ({historial.length})</h3>
                </div>
                <CardContent className="p-0">
                  <div className="divide-y max-h-56 overflow-y-auto">
                    {historial.map((item, idx) => (
                      <div key={idx} className="px-4 py-2.5 flex items-center gap-3">
                        {item.tipo === "entrada"  ? <LogIn       className="w-4 h-4 text-green-500 flex-shrink-0" /> :
                         item.tipo === "salida"   ? <LogOut      className="w-4 h-4 text-blue-500 flex-shrink-0" /> :
                         item.tipo === "repetido" ? <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" /> :
                                                    <XCircle     className="w-4 h-4 text-red-500 flex-shrink-0" />}
                        <p className="text-sm text-gray-800 flex-1 truncate">{item.nombre || "Desconocido"}</p>
                        <span className="text-xs text-gray-400 flex-shrink-0">{item.hora}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Lista de asistentes */}
          <div>
            <Card className="shadow-md border-0">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 border-b flex items-center justify-between gap-2">
                <h2 className="font-semibold text-blue-800 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {DIAS[diaSeleccionado]} ({totalEntradas})
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={cargarAsistentes}
                    className="text-xs text-blue-600 hover:underline cursor-pointer"
                  >
                    Actualizar
                  </button>
                  <button
                    onClick={exportarExcel}
                    className="flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Excel
                  </button>
                </div>
              </div>
              <CardContent className="p-0">
                {cargandoLista ? (
                  <p className="text-center text-gray-400 text-sm py-10">Cargando...</p>
                ) : asistentes.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-10">Sin asistentes registrados aún.</p>
                ) : (
                  <div className="divide-y max-h-[580px] overflow-y-auto">
                    {asistentes.map((a) => (
                      <div key={a.id} className="px-4 py-3 flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${a.hora_salida ? "bg-gray-300" : "bg-green-500"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {a.usuarios_congreso?.nombre} {a.usuarios_congreso?.apellido}
                          </p>
                          <p className="text-xs text-gray-400">C.I. {a.usuarios_congreso?.cedula}</p>
                        </div>
                        <div className="text-right text-xs flex-shrink-0 space-y-0.5">
                          <div className="flex items-center justify-end gap-1 text-green-600">
                            <LogIn className="w-3 h-3" />
                            <span>{formatHora(a.hora_entrada)}</span>
                          </div>
                          {a.hora_salida ? (
                            <div className="flex items-center justify-end gap-1 text-gray-400">
                              <LogOut className="w-3 h-3" />
                              <span>{formatHora(a.hora_salida)}</span>
                            </div>
                          ) : (
                            <div className="text-green-500 font-medium">En recinto</div>
                          )}
                        </div>
                        <button
                          onClick={() => { detenerEscaner(); navigate("/admin/asistencia"); }}
                          title="Ir a escáner de talleres"
                          className="ml-1 p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition cursor-pointer flex-shrink-0"
                        >
                          <ScanLine className="w-4 h-4" />
                        </button>
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

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/cliente";
import QRCode from "qrcode";
import { ArrowLeft, Printer, QrCode, Users, BookOpen } from "lucide-react";

const DIAS = {
  1: "Lunes 2 de Marzo",
  2: "Martes 3 de Marzo",
  3: "Miércoles 4 de Marzo",
};

export default function AdminQRList() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("asistencia");
  const [usuariosQR, setUsuariosQR] = useState([]);
  const [talleresQR, setTalleresQR] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (tab === "asistencia") cargarQRAsistencia();
    else cargarQRTalleres();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const cargarQRAsistencia = async () => {
    setCargando(true);
    const { data } = await supabase
      .from("usuarios_congreso")
      .select("id, nombre, apellido, cedula, semestre_actual, universidad")
      .order("apellido");

    if (!data) { setCargando(false); return; }

    const conQR = await Promise.all(
      data.map(async (u) => {
        const qr = await QRCode.toDataURL(u.id, { width: 180, margin: 1 });
        return { ...u, qr };
      })
    );
    setUsuariosQR(conQR);
    setCargando(false);
  };

  const cargarQRTalleres = async () => {
    setCargando(true);
    const { data } = await supabase
      .from("inscripciones")
      .select(`
        id,
        codigo_confirmacion,
        asistencia,
        usuarios_congreso(nombre, apellido, cedula),
        talleres(id, nombre, dia, hora_inicio, hora_fin, salon)
      `)
      .order("taller_id");

    if (!data) { setCargando(false); return; }

    const conQR = await Promise.all(
      data.map(async (i) => {
        const qr = await QRCode.toDataURL(i.codigo_confirmacion, { width: 180, margin: 1 });
        return { ...i, qr };
      })
    );

    // Agrupar por taller
    const grupos = {};
    conQR.forEach((i) => {
      const key = i.talleres?.id || "sin";
      if (!grupos[key]) grupos[key] = { taller: i.talleres, items: [] };
      grupos[key].items.push(i);
    });

    // Ordenar inscritos por apellido dentro de cada taller
    Object.values(grupos).forEach((g) => {
      g.items.sort((a, b) =>
        (a.usuarios_congreso?.apellido || "").localeCompare(b.usuarios_congreso?.apellido || "")
      );
    });

    setTalleresQR(
      Object.values(grupos).sort((a, b) =>
        (a.taller?.nombre || "").localeCompare(b.taller?.nombre || "")
      )
    );
    setCargando(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-header { display: block !important; }
          .qr-card { page-break-inside: avoid; border: 1px solid #d1d5db !important; box-shadow: none !important; }
          .taller-section { page-break-before: always; }
          .taller-section:first-child { page-break-before: avoid; }
          body { background: white; }
        }
        .print-header { display: none; }
      `}</style>

      {/* Header */}
      <div className="no-print bg-gradient-to-r from-indigo-700 to-purple-700 text-white py-6 px-6 mb-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin")}
              className="cursor-pointer p-2 rounded-lg hover:bg-white/20 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="p-2 bg-white/20 rounded-lg">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Lista de Códigos QR</h1>
              <p className="text-indigo-200 text-sm">Imprime los QR de participantes y talleres</p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-lg font-medium transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="no-print max-w-7xl mx-auto px-4 mb-6">
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border w-fit">
          <button
            onClick={() => setTab("asistencia")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
              tab === "asistencia" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Users className="w-4 h-4" />
            QR Asistencia al Evento
          </button>
          <button
            onClick={() => setTab("talleres")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
              tab === "talleres" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            QR por Taller
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {cargando ? (
          <div className="no-print text-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4" />
            <p className="text-gray-500">Generando QR codes...</p>
          </div>
        ) : tab === "asistencia" ? (
          <>
            <p className="no-print text-sm text-gray-500 mb-4">
              {usuariosQR.length} participantes — el QR codifica el ID único del participante para el sistema de entrada/salida del evento.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {usuariosQR.map((u) => (
                <div key={u.id} className="qr-card bg-white rounded-xl shadow-sm p-3 text-center border">
                  <img src={u.qr} alt="QR" className="w-full mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-800 leading-tight">
                    {u.nombre} {u.apellido}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">C.I. {u.cedula}</p>
                  {u.semestre_actual && (
                    <p className="text-xs text-indigo-500 mt-0.5">{u.semestre_actual}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {talleresQR.map((grupo, idx) => (
              <div key={idx} className={`taller-section ${idx > 0 ? "mt-10" : ""}`}>
                {/* Header visible en pantalla */}
                <div className="no-print bg-indigo-600 text-white px-5 py-3 rounded-xl mb-4">
                  <h2 className="font-bold text-lg">{grupo.taller?.nombre}</h2>
                  <p className="text-indigo-200 text-sm">
                    {DIAS[grupo.taller?.dia]}
                    {grupo.taller?.hora_inicio ? ` · ${grupo.taller.hora_inicio}–${grupo.taller.hora_fin}` : ""}
                    {grupo.taller?.salon ? ` · ${grupo.taller.salon}` : ""}
                    {" · "}{grupo.items.length} inscrito(s)
                  </p>
                </div>

                {/* Header visible al imprimir */}
                <div className="print-header mb-4 pb-2 border-b-2 border-gray-800">
                  <h2 className="font-bold text-xl text-gray-900">{grupo.taller?.nombre}</h2>
                  <p className="text-gray-500 text-sm">
                    {DIAS[grupo.taller?.dia]}
                    {grupo.taller?.hora_inicio ? ` · ${grupo.taller.hora_inicio}–${grupo.taller.hora_fin}` : ""}
                    {grupo.taller?.salon ? ` · Salón: ${grupo.taller.salon}` : ""}
                    {" · "}{grupo.items.length} inscrito(s)
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {grupo.items.map((i, j) => (
                    <div key={j} className="qr-card bg-white rounded-xl shadow-sm p-3 text-center border">
                      <img src={i.qr} alt="QR" className="w-full mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-800 leading-tight">
                        {i.usuarios_congreso?.nombre} {i.usuarios_congreso?.apellido}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">C.I. {i.usuarios_congreso?.cedula}</p>
                      {i.asistencia && (
                        <span className="text-xs text-green-600 font-medium">✓ Asistió</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

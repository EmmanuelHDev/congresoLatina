import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "./lib/cliente";
import { CheckCircle, XCircle, AlertCircle, Loader } from "lucide-react";

const DIAS_NOMBRE = {
  1: "Lunes 2 de Marzo",
  2: "Martes 3 de Marzo",
  3: "Miércoles 4 de Marzo",
};

export default function Asistencia() {
  const [searchParams] = useSearchParams();
  const codigo = searchParams.get("codigo");

  const [estado, setEstado] = useState("cargando"); // "cargando" | "exito" | "repetido" | "error"
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (!codigo) {
      setEstado("error");
      setInfo({ mensaje: "Código QR inválido o no proporcionado." });
      return;
    }

    const registrarAsistencia = async () => {
      const { data, error } = await supabase
        .from("inscripciones")
        .select(`
          id,
          asistencia,
          confirmado,
          codigo_confirmacion,
          usuarios_congreso ( nombre, apellido, cedula ),
          talleres ( nombre, dia, hora_inicio, hora_fin, salon )
        `)
        .eq("codigo_confirmacion", codigo)
        .single();

      if (error || !data) {
        setEstado("error");
        setInfo({ mensaje: "Código QR no encontrado. Verifica que sea el código correcto." });
        return;
      }

      const estudiante = `${data.usuarios_congreso?.nombre} ${data.usuarios_congreso?.apellido}`;
      const taller = data.talleres;

      if (data.asistencia) {
        setEstado("repetido");
        setInfo({ estudiante, cedula: data.usuarios_congreso?.cedula, taller });
        return;
      }

      const { error: updateError } = await supabase
        .from("inscripciones")
        .update({ asistencia: true, confirmado: true })
        .eq("id", data.id);

      if (updateError) {
        setEstado("error");
        setInfo({ mensaje: "Error al registrar asistencia: " + updateError.message });
        return;
      }

      setEstado("exito");
      setInfo({ estudiante, cedula: data.usuarios_congreso?.cedula, taller });
    };

    registrarAsistencia();
  }, [codigo]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo / Marca */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">COEMLATS 2026</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* Cargando */}
          {estado === "cargando" && (
            <div className="p-10 text-center">
              <Loader className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Verificando asistencia...</p>
            </div>
          )}

          {/* Éxito */}
          {estado === "exito" && (
            <>
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-8 text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">¡Asistencia Registrada!</h1>
                <p className="text-emerald-100 text-sm mt-1">Bienvenido/a al taller</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide mb-1">Participante</p>
                  <p className="text-gray-800 font-bold text-lg">{info?.estudiante}</p>
                  {info?.cedula && (
                    <p className="text-gray-500 text-sm">CI: {info.cedula}</p>
                  )}
                </div>

                {info?.taller && (
                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                    <p className="text-xs text-teal-600 font-semibold uppercase tracking-wide mb-1">Taller</p>
                    <p className="text-gray-800 font-semibold">{info.taller.nombre}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {DIAS_NOMBRE[info.taller.dia]} · {info.taller.hora_inicio} – {info.taller.hora_fin}
                    </p>
                    {info.taller.salon && (
                      <p className="text-gray-500 text-sm">{info.taller.salon}</p>
                    )}
                  </div>
                )}

                <div className="text-center pt-2">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Asistencia confirmada
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Ya registrado */}
          {estado === "repetido" && (
            <>
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-8 text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">Ya Registrado</h1>
                <p className="text-amber-100 text-sm mt-1">Esta asistencia ya fue marcada</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide mb-1">Participante</p>
                  <p className="text-gray-800 font-bold text-lg">{info?.estudiante}</p>
                  {info?.cedula && (
                    <p className="text-gray-500 text-sm">CI: {info.cedula}</p>
                  )}
                </div>

                {info?.taller && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide mb-1">Taller</p>
                    <p className="text-gray-800 font-semibold">{info.taller.nombre}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {DIAS_NOMBRE[info.taller.dia]} · {info.taller.hora_inicio} – {info.taller.hora_fin}
                    </p>
                  </div>
                )}

                <p className="text-center text-sm text-gray-500">
                  La asistencia a este taller ya fue registrada anteriormente.
                </p>
              </div>
            </>
          )}

          {/* Error */}
          {estado === "error" && (
            <>
              <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-8 text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <XCircle className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">Código Inválido</h1>
                <p className="text-red-100 text-sm mt-1">No se pudo registrar la asistencia</p>
              </div>

              <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="text-gray-700 text-sm">{info?.mensaje || "Error desconocido."}</p>
                </div>

                <p className="text-center text-xs text-gray-400 mt-4">
                  Si el problema persiste, contacta al personal del congreso.
                </p>
              </div>
            </>
          )}

        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Congreso de Estudiantes de Medicina Latinoamérica y el Caribe
        </p>
      </div>
    </div>
  );
}

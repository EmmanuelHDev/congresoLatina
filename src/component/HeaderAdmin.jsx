import React, { useEffect, useState } from "react";
import { supabase } from "../lib/cliente";
import { Card, CardContent } from "./ui/card";
import { Users, TrendingUp, FileText, Settings,ArrowLeft} from "lucide-react";

export default function HeaderAdmin({ onBack }) {
  const [totalParticipantes, setTotalParticipantes] = useState(0);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [totalTalleres, setTotalTalleres] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      // 🔹 Total Participantes
      const { count: participantesCount, error: errorParticipantes } =
        await supabase
          .from("usuarios_congreso")
          .select("*", { count: "exact", head: true });

      if (!errorParticipantes) {
        setTotalParticipantes(participantesCount || 0);
      }

      // 🔹 Total Administradores (donde seleccion_participacion = 'Miembro')
      const { count: adminsCount, error: errorAdmins } = await supabase
      .from("usuarios_congreso")
      .select("*", { count: "exact", head: true })
      .in("seleccion_participacion", ["Miembro", "Admin"]);


      if (!errorAdmins) {
        setTotalAdmins(adminsCount || 0);
      }

      // 🔹 Total Talleres
      const { count: talleresCount, error: errorTalleres } = await supabase
        .from("talleres")
        .select("*", { count: "exact", head: true });

      if (!errorTalleres) {
        setTotalTalleres(talleresCount || 0);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-6 px-4 md:py-8 md:px-6 mb-6 md:mb-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <button
            onClick={onBack}
            className="cursor-pointer p-2 rounded-lg hover:bg-white/30 transition-colors flex-shrink-0"
            title="Volver al panel de usuario"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <div className="p-2 bg-white/20 rounded-lg flex-shrink-0">
            <Settings className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-3xl font-semibold truncate">Panel de Administración</h1>
            <p className="text-emerald-100 text-xs md:text-sm">Gestión de Inscripciones</p>
            <p className="text-xs text-emerald-200 hidden sm:block">
              Administra participantes, pagos y cuotas del sistema
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-xs md:text-sm">Participantes</p>
                  <p className="text-2xl md:text-3xl font-semibold">{totalParticipantes}</p>
                </div>
                <Users className="w-5 h-5 md:w-8 md:h-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-xs md:text-sm">Admins</p>
                  <p className="text-2xl md:text-3xl font-semibold">{totalAdmins}</p>
                </div>
                <TrendingUp className="w-5 h-5 md:w-8 md:h-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-xs md:text-sm">Talleres</p>
                  <p className="text-2xl md:text-3xl font-semibold">{totalTalleres}</p>
                </div>
                <FileText className="w-5 h-5 md:w-8 md:h-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

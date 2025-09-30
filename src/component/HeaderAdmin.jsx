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

      // 🔹 Talleres (por ahora lo dejamos en 0 hasta conectar otra tabla)
      setTotalTalleres(0);
    };

    fetchStats();
  }, []);

  return (
    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-8 px-6 mb-8">
      <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button
            onClick={onBack}  // 👈 cambia la ruta a la del panel del usuario
            className="cursor-pointer p-2 rounded-lg hover:bg-white/30 transition-colors"
            title="Volver al panel de usuario"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
            <div className="p-2 bg-white/20 rounded-lg">
              <Settings className="w-6 h-6" />
            </div>
            <div>
            <h1 className="text-3xl font-semibold">Panel de Administración</h1>
            <p className="text-emerald-100">Gestión de Inscripciones</p>
            <p className="text-sm text-emerald-200">
              Administra participantes, pagos y cuotas del sistema
            </p>
          </div>
        </div>

        {/* 🔹 Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Total Participantes</p>
                  <p className="text-3xl font-semibold">{totalParticipantes}</p>
                </div>
                <Users className="w-8 h-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">
                    Total de Administradores
                  </p>
                  <p className="text-3xl font-semibold">{totalAdmins}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Total de Talleres</p>
                  <p className="text-3xl font-semibold">{totalTalleres}</p>
                </div>
                <FileText className="w-8 h-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

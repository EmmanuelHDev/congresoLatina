import React, { useState, useEffect } from "react";
import { supabase } from "./lib/cliente";
import ComprobanteCell from "./component/ui/ComprobanteCell";
import HeaderAdmin from "./component/HeaderAdmin";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import PopupMensaje from "./component/PopupConfirmacion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./component/ui/card";
import { Button } from "./component/ui/button";
import { Badge } from "./component/ui/badge";
import { Input } from "./component/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./component/ui/table";

import {
  Search,
  Filter,
  Download,
  Trash
} from "lucide-react";

export default function AdminInscripciones({ onBack }) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroPaquete, setFiltroPaquete] = useState("Todos");
  const [filtroCuota, setFiltroCuota] = useState("Todos");
  const [filtroPendiente, setFiltroPendiente] = useState("Todos"); // 🆕
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmacion, setConfirmacion] = useState({
    visible: false,
    id: null,
    nombre: "",
  });
  const [popupDetalle, setPopupDetalle] = useState({
  visible: false,
  participante: null,
  });

useEffect(() => {
  const fetchParticipantes = async () => {
    setLoading(true);

    // 1️⃣ RPC actual
    const { data, error } = await supabase.rpc("obtener_participantes_con_cuota");
    if (error) {
      console.error("Error cargando usuarios:", error.message);
      setLoading(false);
      return;
    }

    // 2️⃣ Traer cuotas pendientes desde la tabla usuarios_congreso
    const { data: cuotasPendientes } = await supabase
      .from("usuarios_congreso")
      .select("id, cuota_por_pagar");

    // 3️⃣ Crear mapa rápido
    const cuotaMap = {};
    cuotasPendientes?.forEach((u) => {
      cuotaMap[u.id] = u.cuota_por_pagar;
    });

    // 4️⃣ Unir ambas fuentes
    const mapeados = data.map((u) => ({
      id: u.id,
      nombre: u.nombre_completo,
      correo: u.correo,
      paquete: u.paquete || "Sin paquete",
      estado: u.estado,
      cuotaActual: u.cuota_actual ? parseInt(u.cuota_actual) : 0,
      fechaRegistro: u.fecha_registro,
      comprobante: u.comprobante || null,
      cedula: u.cedula || "",
      cuotaPendiente: cuotaMap[u.id] || null, // 🆕 se toma del mapa
      telefono: u.telefono, 
      companeroCuarto: u.companero_cuarto
    }));

    setParticipantes(mapeados);
    setLoading(false);
  };

  fetchParticipantes();
}, []);


  // 🔹 Filtros
  const participantesFiltrados = participantes.filter((p) => {
    const coincideBusqueda =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.correo.toLowerCase().includes(busqueda.toLowerCase());

    const coincidePaquete =
      filtroPaquete === "Todos" || p.paquete === filtroPaquete;

    let coincideCuota = true;
    if (filtroCuota !== "Todos") {
      if (filtroCuota === "Completo") {
        coincideCuota = p.cuotaActual >= 6;
      } else {
        coincideCuota = p.cuotaActual === parseInt(filtroCuota, 10);
      }
    }

    // 🆕 Nuevo filtro: ver quién tiene cuota pendiente
    let coincidePendiente = true;
    if (filtroPendiente !== "Todos") {
      if (filtroPendiente === "Con deuda") {
        coincidePendiente = p.cuotaPendiente !== null;
      } else if (filtroPendiente === "Sin deuda") {
        coincidePendiente = p.cuotaPendiente === null;
      }
    }

    return (
      coincideBusqueda &&
      coincidePaquete &&
      coincideCuota &&
      coincidePendiente
    );
  });

  const totalParticipantes = participantes.length;

  const getPaqueteBadge = (paquete) => {
    switch (paquete) {
      case "congreso-decameron":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            Congreso + Decameron
          </Badge>
        );
      case "solo-decameron":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Solo Decameron
          </Badge>
        );
      case "solo-congreso":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Solo Congreso
          </Badge>
        );
      default:
        return <Badge>{paquete}</Badge>;
    }
  };

  // 📤 Exportar Excel (incluye columna de deuda)
  const exportarExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Participantes");

      worksheet.columns = [
        { header: "Nombre Completo", key: "nombre", width: 30 },
        { header: "Correo", key: "correo", width: 30 },
        { header: "Cédula", key: "cedula", width: 20 },
        { header: "Paquete", key: "paquete", width: 20 },
        { header: "Cuota Actual", key: "cuotaActual", width: 15 },
        // { header: "Cuota Pendiente", key: "cuotaPendiente", width: 15 }, // 🆕
        { header: "Registro", key: "fechaRegistro", width: 15 },
        { header: "Comprobante", key: "comprobante", width: 40 },
      ];

      participantesFiltrados.forEach((p) => {
        worksheet.addRow({
          nombre: p.nombre,
          correo: p.correo,
          cedula: p.cedula,
          paquete: p.paquete,
          cuotaActual: p.cuotaActual,
          // cuotaPendiente: p.cuotaPendiente || "N/A",
          fechaRegistro: p.fechaRegistro,
          comprobante: p.comprobante || "No subido",
          telefono: p.telefono,
          companeroCuarto: p.companeroCuarto
        });
      });

      worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "228B22" },
      };

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "participantes.xlsx");
    } catch (err) {
      console.error("❌ Error al exportar Excel:", err);
    }
  };

  // 🗑️ Eliminar participante
  const handleEliminar = async (id) => {
    const { error } = await supabase.rpc("eliminar_participante", { p_id: id });

    if (error) {
      console.error("❌ Error al eliminar:", error.message);
      setConfirmacion({
        visible: true,
        tipo: "error",
        mensaje: "No se pudo eliminar el participante.",
      });
    } else {
      setParticipantes((prev) => prev.filter((p) => p.id !== id));
      setConfirmacion({
        visible: true,
        tipo: "exito",
        mensaje: "Participante eliminado correctamente.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <HeaderAdmin onBack={onBack} />

      <div className="max-w-8xl mx-auto px-6 pb-12">
        {/* 🔹 Filtros */}
        <Card className="shadow-lg border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Filtros de Búsqueda</span>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 cursor-pointer"
                onClick={exportarExcel}
              >
                <Download className="w-4 h-4" />
                Descargar
              </Button>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 🔍 Buscar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre o correo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* 🧾 Paquete */}
              <select
                value={filtroPaquete}
                onChange={(e) => setFiltroPaquete(e.target.value)}
                className="border px-3 py-2 rounded"
              >
                <option value="Todos">Todos los paquetes</option>
                <option value="congreso-decameron">Congreso + Decameron</option>
                <option value="solo-decameron">Solo Decameron</option>
                <option value="solo-congreso">Solo Congreso</option>
              </select>

              {/* 💵 Cuota actual */}
              <select
                value={filtroCuota}
                onChange={(e) => setFiltroCuota(e.target.value)}
                className="border px-3 py-2 rounded"
              >
                <option value="Todos">Todas las cuotas</option>
                <option value="1">Primera Cuota</option>
                <option value="2">Segunda Cuota</option>
                <option value="3">Tercera Cuota</option>
                <option value="4">Cuarta Cuota</option>
                <option value="5">Quinta Cuota</option>
                <option value="6">Sexta Cuota</option>
                <option value="Completo">Pago Completo</option>
              </select>

              {/* ⚠️ Filtro cuota pendiente
              <select
                value={filtroPendiente}
                onChange={(e) => setFiltroPendiente(e.target.value)}
                className="border px-3 py-2 rounded"
              >
                <option value="Todos">Usuarios con cuota pendientes</option>
                <option value="Con deuda">Con cuota pendiente</option>
                <option value="Sin deuda">Sin deuda</option>
              </select> */}

              {/* 🔄 Limpiar */}
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  setBusqueda("");
                  setFiltroPaquete("Todos");
                  setFiltroCuota("Todos");
                  setFiltroPendiente("Todos");
                }}
              >
                <Filter className="w-4 h-4" />
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 🔹 Tabla */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100">
            <CardTitle className="text-emerald-800">
              Lista de Participantes ({participantesFiltrados.length} de{" "}
              {totalParticipantes})
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <p className="p-4 text-gray-500">Cargando datos...</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                  <TableHead className="text-center"></TableHead>
                    <TableHead>Nombre Completo</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Cédula</TableHead>
                    <TableHead>Paquete</TableHead>
                    <TableHead>Cuota Actual</TableHead>
                    <TableHead>Registro</TableHead>
                    <TableHead>Comprobante</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {participantesFiltrados.map((p) => (
                    <TableRow key={p.id} className="hover:bg-gray-50/50">
                      <TableCell className="flex justify-center gap-3">
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Ver detalles"
                          className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
                          onClick={() => setPopupDetalle({ visible: true, participante: p })}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m14 21l-2 2l-2-2H4.995A1.995 1.995 0 0 1 3 19.005V4.995C3 3.893 3.893 3 4.995 3h14.01C20.107 3 21 3.893 21 4.995v14.01A1.995 1.995 0 0 1 19.005 21zm-7.643-3h11.49a6.99 6.99 0 0 0-5.745-3a6.99 6.99 0 0 0-5.745 3M12 13a3.5 3.5 0 1 0 0-7a3.5 3.5 0 0 0 0 7"/></svg>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-semibold">
                            {p.nombre
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <span className="font-medium">{p.nombre}</span>
                        </div>
                      </TableCell>
                      <TableCell>{p.correo}</TableCell>
                      <TableCell>{p.paquete}</TableCell>
                      <TableCell>{getPaqueteBadge(p.cedula)}</TableCell>
                      <TableCell className="text-center">{p.cuotaActual}</TableCell>
                      <TableCell>{p.fechaRegistro}</TableCell>
                      <ComprobanteCell comprobante={p.comprobante} />
                    </TableRow>
                  ))}
                </TableBody>
              </Table>


              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 🧾 Modal de confirmación */}
      {confirmacion.visible && (
        <PopupMensaje
          nombre={confirmacion.nombre}
          onCancel={() =>
            setConfirmacion({ visible: false, id: null, nombre: "" })
          }
          onConfirm={async () => {
            await handleEliminar(confirmacion.id);
            setConfirmacion({ visible: false, id: null, nombre: "" });
          }}
        />
      )}
      {popupDetalle.visible && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative">
            {/* Botón de cerrar */}
            <button
              onClick={() => setPopupDetalle({ visible: false, participante: null })}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold text-emerald-700 mb-4 text-center">
              Detalles del Solicitante
            </h2>

            {popupDetalle.participante && (
              <div className="space-y-2 text-gray-700">
                <p><strong>Nombre:</strong> {popupDetalle.participante.nombre}</p>
                <p><strong>Correo:</strong> {popupDetalle.participante.correo}</p>
                <p><strong>Cédula:</strong> {popupDetalle.participante.cedula}</p>
                <p><strong>Paquete:</strong> {popupDetalle.participante.paquete}</p>
                <p><strong>Cuotas pagadas:</strong> {popupDetalle.participante.cuotaActual}</p>
                <p><strong>Fecha de registro:</strong> {popupDetalle.participante.fechaRegistro}</p>
                <p><strong>Compañero:</strong> {popupDetalle.participante.companeroCuarto || "No asignado"}</p>
                <p><strong>Teléfono:</strong> {popupDetalle.participante.telefono || "No registrado"}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setPopupDetalle({ visible: false, participante: null })}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 cursor-pointer"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

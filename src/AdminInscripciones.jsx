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
  const [comprobantesPorCuota, setComprobantesPorCuota] = useState({});
  const [tabCuota, setTabCuota] = useState(1);
  const [imagenesPrecargadas, setImagenesPrecargadas] = useState({});

  const [confirmacion, setConfirmacion] = useState({
    visible: false,
    id: null,
    nombre: "",
  });
  const [popupDetalle, setPopupDetalle] = useState({
    visible: false,
    participante: null,
  });

  const cargarComprobantes = async (participante) => {
    const { data: carpetas, error: errCarpetas } = await supabase.storage
      .from("comprobantes")
      .list("", { limit: 2000 });

    if (errCarpetas) console.error("❌ Error al listar carpetas:", errCarpetas);


    if (!carpetas) return;

    const normalize = (str) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/ñ/g, "n").replace(/Ñ/g, "N").toLowerCase();
    const normalizarCarpeta = (str) =>
      normalize(str)
        .replace(/[\s]+/g, "_")       // todos los espacios → "_"
        .replace(/_+/g, "_")          // si hay __ o ___ → "_"
        .replace(/[^a-z0-9_]/gi, "")  // limpia caracteres raros
        .replace(/^_+|_+$/g, "")      // quita _ al inicio y final
        .toLowerCase();

    const nombre = normalize(participante.nombre);
    

    // 2️⃣ Encontrando carpeta real
    const nombreNormalizado = normalizarCarpeta(participante.nombre);

    const carpetaReal = carpetas.find(c =>
      normalizarCarpeta(c.name) === nombreNormalizado
    );



   

    if (!carpetaReal) {
      console.log("❌ No se encontró carpeta para:", participante.nombre);
      return;
    }

    // 3️⃣ Listando archivos dentro de esa carpeta

    const { data: archivos, error: errArchivos } = await supabase.storage
      .from("comprobantes")
      .list(carpetaReal.name);

    if (errArchivos) console.error("❌ Error al listar archivos:", errArchivos);


    const grupos = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

    archivos.forEach((f) => {
      const lower = f.name.toLowerCase();
      const fullPath = `${carpetaReal.name}/${f.name}`;


      if (lower.startsWith("primera")) grupos[1].push(fullPath);
      if (lower.startsWith("segunda")) grupos[2].push(fullPath);
      if (lower.startsWith("tercera")) grupos[3].push(fullPath);
      if (lower.startsWith("cuarta")) grupos[4].push(fullPath);
      if (lower.startsWith("quinta")) grupos[5].push(fullPath);
      if (lower.startsWith("sexta")) grupos[6].push(fullPath);
    });



    // 4️⃣ PRE-CARGA
    const preloaded = {};

    for (const cuota in grupos) {
      preloaded[cuota] = [];

      for (const path of grupos[cuota]) {

        const { data } = supabase.storage.from("comprobantes").getPublicUrl(path);



        preloaded[cuota].push({
          path,
          url: data.publicUrl
        });
      }
    }



    setImagenesPrecargadas(preloaded);
    setComprobantesPorCuota(grupos);


    setPopupDetalle({ visible: true, participante });
  };





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
      //console.log(data);
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

  // 🧮 Calcular tamaño total del bucket "comprobantes"
  useEffect(() => {
    const calcularTamanoBucket = async () => {
      let totalBytes = 0;

      try {
        // 1️⃣ Listar carpetas principales
        const { data: carpetas, error } = await supabase.storage
          .from("comprobantes")
          .list("", { limit: 2000 });

        if (error) {
          console.error("Error listando carpetas:", error);
          return;
        }

        // 2️⃣ Recorrer cada carpeta y sumar archivos internos
        for (const carpeta of carpetas) {
          const { data: archivos } = await supabase.storage
            .from("comprobantes")
            .list(carpeta.name, { limit: 2000 });

          archivos?.forEach((f) => {
            totalBytes += f.metadata?.size || 0;
          });
        }

        const totalMB = (totalBytes / 1024 / 1024).toFixed(2);

        
      } catch (error) {
        console.error("Error midiendo bucket:", error);
      }
    };

    calcularTamanoBucket();
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
                      <TableHead className="text-center">Detalles</TableHead>
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
                            onClick={() => cargarComprobantes(p)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m14 21l-2 2l-2-2H4.995A1.995 1.995 0 0 1 3 19.005V4.995C3 3.893 3.893 3 4.995 3h14.01C20.107 3 21 3.893 21 4.995v14.01A1.995 1.995 0 0 1 19.005 21zm-7.643-3h11.49a6.99 6.99 0 0 0-5.745-3a6.99 6.99 0 0 0-5.745 3M12 13a3.5 3.5 0 1 0 0-7a3.5 3.5 0 0 0 0 7" /></svg>
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
                        <TableCell>{p.cedula}</TableCell>
                        <TableCell>{getPaqueteBadge(p.paquete)}</TableCell>
                        <TableCell className="text-center">{p.cuotaActual}</TableCell>
                        <TableCell>{p.fechaRegistro}</TableCell>
                        <ComprobanteCell comprobante={p.comprobante} />
                        <TableCell className="text-center">
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Eliminar participante"
                            className="text-red-500 hover:text-red-700 cursor-pointer"
                            onClick={() =>
                              setConfirmacion({
                                visible: true,
                                id: p.id,
                                nombre: p.nombre,
                              })
                            }
                          >
                            <Trash className="w-5 h-5" />
                          </Button>
                        </TableCell>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden relative">

            {/* Botón cerrar */}
            <button
              onClick={() => setPopupDetalle({ visible: false, participante: null })}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>

            {/* Contenido scrolleable */}
            <div className="overflow-y-auto max-h-[90vh] p-6">

              <h2 className="text-2xl font-bold text-emerald-700 mb-4 text-center">
                Detalles del Solicitante
              </h2>

              {/* Datos del participante */}
              {popupDetalle.participante && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-6 text-gray-700 text-sm mb-6">
                  <p><strong>Nombre:</strong> {popupDetalle.participante.nombre}</p>
                  <p><strong>Correo:</strong> {popupDetalle.participante.correo}</p>
                  <p><strong>Cédula:</strong> {popupDetalle.participante.cedula}</p>
                  <p><strong>Paquete:</strong> {popupDetalle.participante.paquete}</p>
                  <p><strong>Cuotas pagadas:</strong> {popupDetalle.participante.cuotaActual}</p>
                  <p><strong>Fecha registro:</strong> {popupDetalle.participante.fechaRegistro}</p>
                  <p><strong>Compañero:</strong> {popupDetalle.participante.companeroCuarto || "No asignado"}</p>
                  <p><strong>Teléfono:</strong> {popupDetalle.participante.telefono || "No registrado"}</p>
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-2 border-b pb-2 mb-4 overflow-x-auto">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    onClick={() => setTabCuota(n)}
                    className={`px-3 py-1 rounded-md text-sm font-semibold whitespace-nowrap
                ${tabCuota === n
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"}
              `}
                  >
                    Cuota {n}
                  </button>
                ))}
              </div>

              {/* Contenido del tab */}
              {!Array.isArray(comprobantesPorCuota[tabCuota]) ? (
                <p className="text-gray-500 text-sm">Cargando comprobantes...</p>
              ) : comprobantesPorCuota[tabCuota].length === 0 ? (
                <p className="text-gray-500 text-sm">No hay comprobantes para esta cuota.</p>
              ) : (
                <div className="space-y-6">
                  {imagenesPrecargadas[tabCuota]?.map((imgObj) => (
                    <div className="flex justify-center">
                      <img
                        key={imgObj.path}
                        src={imgObj.url}
                        className="max-w-full max-h-[70vh] object-contain rounded-lg border shadow-lg bg-white"
                      />
                    </div>

                  ))}

                </div>
              )}

              {/* Botón cerrar */}
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
        </div>
      )}


    </div>
  );
}

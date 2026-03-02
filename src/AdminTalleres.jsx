import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/cliente";
import { Card, CardContent, CardHeader, CardTitle } from "./component/ui/card";
import { Button } from "./component/ui/button";
import { Badge } from "./component/ui/badge";
import { Input } from "./component/ui/input";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "./component/ui/table";
import {
  ArrowLeft, Settings, Users, Clock, MapPin,
  Pencil, Trash2, Eye, X, Save, ToggleRight,
} from "lucide-react";

const DIAS = { 1: "Lunes 2 de Marzo", 2: "Martes 3 de Marzo", 3: "Miércoles 4 de Marzo" };
const SEMESTRES_ROMANO = { 1:'I', 2:'II', 3:'III', 4:'IV', 5:'V', 6:'VI', 7:'VII', 8:'VIII', 9:'IX', 10:'X', 11:'XI', 12:'XII' };

const TALLER_VACIO = {
  nombre: "", expositor: "", tema: "", hora_inicio: "",
  hora_fin: "", salon: "", dia: 1, estado: true,
  cupos_preclinico: 0, cupos_clinico: 0,
  inscritos_preclinico: 0, inscritos_clinico: 0,
  semestres_permitidos: [],
};

export default function AdminTalleres() {
  const navigate = useNavigate();
  const [talleres, setTalleres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalForm, setModalForm] = useState({ visible: false, modo: "crear", taller: TALLER_VACIO });
  const [modalInscritos, setModalInscritos] = useState({ visible: false, taller: null, lista: [], cargando: false });
  const [modalEliminar, setModalEliminar] = useState({ visible: false, taller: null });
  const [guardando, setGuardando] = useState(false);
  const [filtroDia, setFiltroDia] = useState("todos");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [sinTaller, setSinTaller] = useState([]);
  const [cargandoSinTaller, setCargandoSinTaller] = useState(false);
  const [busquedaSinTaller, setBusquedaSinTaller] = useState("");
  const [modalInscribir, setModalInscribir] = useState({
    visible: false, usuario: null, diaSeleccionado: "", tallerSeleccionado: "", inscribiendo: false,
  });

  useEffect(() => {
    cargarTalleres();
    cargarSinTaller();
  }, []);

  const cargarSinTaller = async () => {
    setCargandoSinTaller(true);
    // Traer todos los usuario_id que ya tienen al menos una inscripción
    const { data: inscripciones } = await supabase
      .from("inscripciones")
      .select("usuario_id");
    const inscritos = new Set((inscripciones || []).map(i => i.usuario_id));

    // Traer todos los usuarios y filtrar los que no tienen ninguna inscripción
    const { data: todos } = await supabase
      .from("usuarios_congreso")
      .select("id, nombre, apellido, cedula, semestre_actual, universidad")
      .order("apellido");

    setSinTaller((todos || []).filter(u => !inscritos.has(u.id)));
    setCargandoSinTaller(false);
  };

  const handleInscribirAdmin = async () => {
    if (!modalInscribir.tallerSeleccionado) return;
    setModalInscribir(prev => ({ ...prev, inscribiendo: true }));

    const codigo = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map(b => b.toString(36).toUpperCase()).join("");

    const { error } = await supabase.from("inscripciones").insert({
      usuario_id:           modalInscribir.usuario.id,
      taller_id:            modalInscribir.tallerSeleccionado,
      codigo_confirmacion:  codigo,
      confirmado:           true,
      asistencia:           false,
    });

    if (error) {
      alert("Error al inscribir: " + error.message);
      setModalInscribir(prev => ({ ...prev, inscribiendo: false }));
      return;
    }

    setModalInscribir({ visible: false, usuario: null, diaSeleccionado: "", tallerSeleccionado: "", inscribiendo: false });
    cargarSinTaller();
    cargarTalleres();
  };

  const cargarTalleres = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("talleres")
      .select("*, inscripciones(count)")
      .order("dia", { ascending: true })
      .order("hora_inicio", { ascending: true });

    if (!error) setTalleres(data || []);
    setLoading(false);
  };

  const abrirCrear = () => {
    setModalForm({ visible: true, modo: "crear", taller: { ...TALLER_VACIO } });
  };

  const abrirEditar = (taller) => {
    setModalForm({ visible: true, modo: "editar", taller: { ...taller } });
  };

  const handleGuardar = async () => {
    const t = modalForm.taller;
    if (!t.nombre.trim() || !t.expositor.trim()) {
      alert("Nombre y expositor son obligatorios.");
      return;
    }

    setGuardando(true);
    const payload = {
      nombre: t.nombre.trim(),
      expositor: t.expositor.trim(),
      tema: t.tema.trim(),
      hora_inicio: t.hora_inicio,
      hora_fin: t.hora_fin,
      salon: t.salon.trim(),
      dia: Number(t.dia),
      estado: t.estado,
      cupos_preclinico: Number(t.cupos_preclinico) || 0,
      cupos_clinico: Number(t.cupos_clinico) || 0,
      inscritos_preclinico: Number(t.inscritos_preclinico) || 0,
      inscritos_clinico: Number(t.inscritos_clinico) || 0,
      semestres_permitidos: t.semestres_permitidos || [],
    };

    let error;
    if (modalForm.modo === "crear") {
      ({ error } = await supabase.from("talleres").insert([payload]));
    } else {
      ({ error } = await supabase.from("talleres").update(payload).eq("id", t.id));
    }

    setGuardando(false);
    if (error) {
      alert("Error al guardar: " + error.message);
      return;
    }

    setModalForm({ ...modalForm, visible: false });
    cargarTalleres();
  };

  const toggleEstado = async (taller) => {
    const { error } = await supabase
      .from("talleres")
      .update({ estado: !taller.estado })
      .eq("id", taller.id);

    if (!error) {
      setTalleres((prev) =>
        prev.map((t) => t.id === taller.id ? { ...t, estado: !t.estado } : t)
      );
    }
  };

  const handleEliminar = async () => {
    const { error } = await supabase
      .from("talleres")
      .delete()
      .eq("id", modalEliminar.taller.id);

    if (error) {
      alert("Error al eliminar: " + error.message);
      return;
    }
    setModalEliminar({ visible: false, taller: null });
    cargarTalleres();
  };

  const verInscritos = async (taller) => {
    setModalInscritos({ visible: true, taller, lista: [], cargando: true });

    const { data, error } = await supabase
      .from("inscripciones")
      .select(`
        id,
        codigo_confirmacion,
        confirmado,
        asistencia,
        usuarios_congreso (
          nombre,
          apellido,
          cedula,
          correo
        )
      `)
      .eq("taller_id", taller.id);

    if (error) {
      console.error(error);
      setModalInscritos((prev) => ({ ...prev, cargando: false }));
      return;
    }

    setModalInscritos((prev) => ({ ...prev, lista: data || [], cargando: false }));
  };

  const totalInscritos = talleres.reduce(
    (acc, t) => acc + (t.inscripciones?.[0]?.count ?? 0), 0
  );
  const talleresActivos = talleres.filter((t) => t.estado).length;

  const talleresFiltrados = talleres.filter((t) => {
    const pasaDia = filtroDia === "todos" || String(t.dia) === filtroDia;
    const pasaNombre = filtroNombre.trim() === "" ||
      t.nombre.toLowerCase().includes(filtroNombre.toLowerCase()) ||
      t.expositor.toLowerCase().includes(filtroNombre.toLowerCase());
    return pasaDia && pasaNombre;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-6 px-4 md:py-8 md:px-6 mb-6 md:mb-8">
        <div className="">
          {/* Fila superior: back + título + botón */}
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <button
              onClick={() => navigate("/admin")}
              className="cursor-pointer p-2 rounded-lg hover:bg-white/30 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <div className="p-2 bg-white/20 rounded-lg flex-shrink-0">
              <Settings className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-3xl font-semibold truncate">Gestión de Talleres</h1>
              <p className="text-emerald-100 text-xs md:text-sm hidden sm:block">Administra talleres e inscripciones</p>
            </div>
            <button
              onClick={() => navigate("/admin/asistencia")}
              className="cursor-pointer flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition px-3 py-2 rounded-lg text-xs md:text-sm font-medium flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>
              <span className="hidden sm:inline">Registrar Asistencia</span>
              <span className="sm:hidden">Asistencia</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-6">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-3 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-xs md:text-sm">Total Talleres</p>
                    <p className="text-2xl md:text-3xl font-semibold">{talleres.length}</p>
                  </div>
                  <Settings className="w-5 h-5 md:w-8 md:h-8 text-emerald-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-3 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-xs md:text-sm">Activos</p>
                    <p className="text-2xl md:text-3xl font-semibold">{talleresActivos}</p>
                  </div>
                  <ToggleRight className="w-5 h-5 md:w-8 md:h-8 text-emerald-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-3 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-xs md:text-sm">Inscritos</p>
                    <p className="text-2xl md:text-3xl font-semibold">{totalInscritos}</p>
                  </div>
                  <Users className="w-5 h-5 md:w-8 md:h-8 text-emerald-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="px-6 pb-12">
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <CardTitle className="text-emerald-800 flex-1">
                Lista de Talleres ({talleresFiltrados.length}{talleresFiltrados.length !== talleres.length ? ` de ${talleres.length}` : ""})
              </CardTitle>
              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={filtroDia}
                  onChange={(e) => setFiltroDia(e.target.value)}
                  className="text-sm border border-emerald-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="todos">Todos los días</option>
                  <option value="1">Lunes 2 de Marzo</option>
                  <option value="2">Martes 3 de Marzo</option>
                  <option value="3">Miércoles 4 de Marzo</option>
                </select>
                <input
                  type="text"
                  placeholder="Buscar taller o expositor..."
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                  className="text-sm border border-emerald-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 w-56"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <p className="p-6 text-gray-500">Cargando talleres...</p>
            ) : talleres.length === 0 ? (
              <p className="p-6 text-gray-500">No hay talleres registrados.</p>
            ) : talleresFiltrados.length === 0 ? (
              <p className="p-6 text-gray-400 text-center">Sin resultados para los filtros aplicados.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="min-w-[200px]">Nombre</TableHead>
                      <TableHead className="min-w-[150px]">Expositor</TableHead>
                      <TableHead className="min-w-[160px]">Día</TableHead>
                      <TableHead className="min-w-[130px]">Horario</TableHead>
                      <TableHead className="min-w-[120px]">Salón</TableHead>
                      <TableHead className="text-center min-w-[110px]">Cupos Preclín.</TableHead>
                      <TableHead className="text-center min-w-[100px]">Cupos Clín.</TableHead>
                      <TableHead className="text-center min-w-[100px]">Inscritos</TableHead>
                      <TableHead className="text-center min-w-[90px]">Estado</TableHead>
                      <TableHead className="text-center min-w-[110px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {talleresFiltrados.map((taller) => {
                      const inscritos = taller.inscripciones?.[0]?.count ?? 0;
                      const cupos = (taller.cupos_preclinico || 0) + (taller.cupos_clinico || 0);
                      return (
                        <TableRow key={taller.id} className="hover:bg-gray-50/50">
                          <TableCell className="font-medium">
                            <p title={taller.nombre}>{taller.nombre}</p>
                            {taller.tema && (
                              <p className="text-xs text-gray-500 truncate max-w-[220px]" title={taller.tema}>{taller.tema}</p>
                            )}
                            {(taller.semestres_permitidos || []).length > 0 && (
                              <p className="text-xs text-amber-700 font-medium mt-0.5">
                                Solo sem. {taller.semestres_permitidos.map((s) => SEMESTRES_ROMANO[s] || s).join(", ")}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>{taller.expositor}</TableCell>
                          <TableCell>
                            <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100 whitespace-nowrap">
                              {DIAS[taller.dia] || `Día ${taller.dia}`}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-gray-600 whitespace-nowrap">
                              <Clock className="w-3 h-3" />
                              {taller.hora_inicio} – {taller.hora_fin}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPin className="w-3 h-3" />
                              {taller.salon}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm">{taller.cupos_preclinico || 0}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm">{taller.cupos_clinico || 0}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`font-semibold text-sm ${inscritos >= cupos ? "text-red-600" : "text-emerald-600"}`}>
                              {inscritos}/{cupos}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <button
                              onClick={() => toggleEstado(taller)}
                              title={taller.estado ? "Desactivar" : "Activar"}
                              className="cursor-pointer"
                            >
                              {taller.estado ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer">Activo</Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-200 cursor-pointer">Inactivo</Badge>
                              )}
                            </button>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                title="Ver inscritos"
                                className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                onClick={() => verInscritos(taller)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                title="Editar"
                                className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
                                onClick={() => abrirEditar(taller)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                title="Eliminar"
                                className="text-red-500 hover:text-red-700 cursor-pointer"
                                onClick={() => setModalEliminar({ visible: true, taller })}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Sección: participantes sin taller ── */}
      <div className="px-6 pb-6 mt-6">
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <CardTitle className="text-amber-800 flex items-center gap-2 flex-1">
                <Users className="w-5 h-5" />
                Sin inscripción en talleres
                {!cargandoSinTaller && (
                  <span className="text-sm font-normal text-amber-600 ml-1">
                    ({sinTaller.filter(u => {
                      const q = busquedaSinTaller.trim().toLowerCase();
                      return !q || `${u.nombre} ${u.apellido}`.toLowerCase().includes(q) || (u.cedula || "").includes(q);
                    }).length})
                  </span>
                )}
              </CardTitle>
              <input
                type="text"
                placeholder="Buscar participante..."
                value={busquedaSinTaller}
                onChange={e => setBusquedaSinTaller(e.target.value)}
                className="text-sm border border-amber-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 w-56"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {cargandoSinTaller ? (
              <p className="p-6 text-gray-400 text-sm">Cargando...</p>
            ) : sinTaller.length === 0 ? (
              <p className="p-6 text-gray-400 text-sm text-center">¡Todos los participantes tienen al menos un taller inscrito!</p>
            ) : (() => {
              const filtrados = sinTaller.filter(u => {
                const q = busquedaSinTaller.trim().toLowerCase();
                return !q || `${u.nombre} ${u.apellido}`.toLowerCase().includes(q) || (u.cedula || "").includes(q);
              });
              return filtrados.length === 0 ? (
                <p className="p-6 text-gray-400 text-sm text-center">Sin resultados.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50">
                        <TableHead>Nombre</TableHead>
                        <TableHead>Cédula</TableHead>
                        <TableHead>Semestre</TableHead>
                        <TableHead>Universidad</TableHead>
                        <TableHead className="text-center">Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtrados.map(u => (
                        <TableRow key={u.id} className="hover:bg-amber-50/40">
                          <TableCell className="font-medium">{u.nombre} {u.apellido}</TableCell>
                          <TableCell>{u.cedula || "—"}</TableCell>
                          <TableCell>{u.semestre_actual || "—"}</TableCell>
                          <TableCell className="text-sm text-gray-600 max-w-[200px] truncate">{u.universidad || "—"}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              className="bg-amber-500 hover:bg-amber-600 text-white cursor-pointer text-xs"
                              onClick={() => setModalInscribir({ visible: true, usuario: u, diaSeleccionado: "", tallerSeleccionado: "", inscribiendo: false })}
                            >
                              Inscribir en taller
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Modal Crear/Editar */}
      {modalForm.visible && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-emerald-700">
                {modalForm.modo === "crear" ? "Nuevo Taller" : "Editar Taller"}
              </h2>
              <button onClick={() => setModalForm({ ...modalForm, visible: false })} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Taller *</label>
                <Input
                  value={modalForm.taller.nombre}
                  onChange={(e) => setModalForm({ ...modalForm, taller: { ...modalForm.taller, nombre: e.target.value } })}
                  placeholder="Ej: Taller de Suturas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expositor *</label>
                <Input
                  value={modalForm.taller.expositor}
                  onChange={(e) => setModalForm({ ...modalForm, taller: { ...modalForm.taller, expositor: e.target.value } })}
                  placeholder="Nombre del expositor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salón</label>
                <Input
                  value={modalForm.taller.salon}
                  onChange={(e) => setModalForm({ ...modalForm, taller: { ...modalForm.taller, salon: e.target.value } })}
                  placeholder="Ej: Sala A"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tema / Descripción</label>
                <Input
                  value={modalForm.taller.tema}
                  onChange={(e) => setModalForm({ ...modalForm, taller: { ...modalForm.taller, tema: e.target.value } })}
                  placeholder="Descripción breve del taller"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Día</label>
                <select
                  value={modalForm.taller.dia}
                  onChange={(e) => setModalForm({ ...modalForm, taller: { ...modalForm.taller, dia: Number(e.target.value) } })}
                  className="w-full border px-3 py-2 rounded-md text-sm"
                >
                  <option value={1}>Lunes 2 de Marzo</option>
                  <option value={2}>Martes 3 de Marzo</option>
                  <option value={3}>Miércoles 4 de Marzo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={modalForm.taller.estado ? "true" : "false"}
                  onChange={(e) => setModalForm({ ...modalForm, taller: { ...modalForm.taller, estado: e.target.value === "true" } })}
                  className="w-full border px-3 py-2 rounded-md text-sm"
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora de inicio</label>
                <Input
                  type="time"
                  value={modalForm.taller.hora_inicio}
                  onChange={(e) => setModalForm({ ...modalForm, taller: { ...modalForm.taller, hora_inicio: e.target.value } })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora de fin</label>
                <Input
                  type="time"
                  value={modalForm.taller.hora_fin}
                  onChange={(e) => setModalForm({ ...modalForm, taller: { ...modalForm.taller, hora_fin: e.target.value } })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cupos Preclínico</label>
                <Input
                  type="number"
                  min="0"
                  value={modalForm.taller.cupos_preclinico}
                  onChange={(e) => setModalForm({ ...modalForm, taller: { ...modalForm.taller, cupos_preclinico: e.target.value } })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cupos Clínico</label>
                <Input
                  type="number"
                  min="0"
                  value={modalForm.taller.cupos_clinico}
                  onChange={(e) => setModalForm({ ...modalForm, taller: { ...modalForm.taller, cupos_clinico: e.target.value } })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inscritos Preclínico</label>
                <Input
                  type="number"
                  min="0"
                  value={modalForm.taller.inscritos_preclinico}
                  onChange={(e) => setModalForm({ ...modalForm, taller: { ...modalForm.taller, inscritos_preclinico: e.target.value } })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inscritos Clínico</label>
                <Input
                  type="number"
                  min="0"
                  value={modalForm.taller.inscritos_clinico}
                  onChange={(e) => setModalForm({ ...modalForm, taller: { ...modalForm.taller, inscritos_clinico: e.target.value } })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restricción por semestre
                  <span className="ml-2 text-xs text-gray-400 font-normal">(dejar sin marcar = todos los semestres pueden inscribirse)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map((sem) => {
                    const checked = (modalForm.taller.semestres_permitidos || []).includes(sem);
                    return (
                      <label key={sem} className={`flex items-center gap-1 px-2.5 py-1 rounded-md border cursor-pointer text-sm select-none transition ${
                        checked ? "bg-emerald-100 border-emerald-400 text-emerald-800 font-medium" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={checked}
                          onChange={(e) => {
                            const current = modalForm.taller.semestres_permitidos || [];
                            const updated = e.target.checked
                              ? [...current, sem].sort((a, b) => a - b)
                              : current.filter((s) => s !== sem);
                            setModalForm({ ...modalForm, taller: { ...modalForm.taller, semestres_permitidos: updated } });
                          }}
                        />
                        {SEMESTRES_ROMANO[sem]}
                      </label>
                    );
                  })}
                </div>
                {(modalForm.taller.semestres_permitidos || []).length > 0 && (
                  <p className="mt-1.5 text-xs text-emerald-700">
                    Solo podrán inscribirse: semestre {(modalForm.taller.semestres_permitidos).map((s) => SEMESTRES_ROMANO[s]).join(", ")}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 pb-6">
              <Button variant="outline" onClick={() => setModalForm({ ...modalForm, visible: false })} className="cursor-pointer">
                Cancelar
              </Button>
              <Button
                onClick={handleGuardar}
                disabled={guardando}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {guardando ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Inscritos */}
      {modalInscritos.visible && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-emerald-700">
                  Inscritos: {modalInscritos.taller?.nombre}
                </h2>
                <p className="text-sm text-gray-500">
                  {DIAS[modalInscritos.taller?.dia]} · {modalInscritos.taller?.hora_inicio} – {modalInscritos.taller?.hora_fin}
                </p>
              </div>
              <button
                onClick={() => setModalInscritos({ visible: false, taller: null, lista: [], cargando: false })}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {modalInscritos.cargando ? (
                <p className="text-gray-500 text-center py-8">Cargando inscritos...</p>
              ) : modalInscritos.lista.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay inscritos en este taller.</p>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-4 font-medium">
                    {modalInscritos.lista.length} estudiante(s) inscrito(s)
                  </p>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Nombre</TableHead>
                          <TableHead>Cédula</TableHead>
                          <TableHead>Correo</TableHead>
                          <TableHead className="text-center">Confirmado</TableHead>
                          <TableHead className="text-center">Asistencia</TableHead>
                          <TableHead>Código</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {modalInscritos.lista.map((ins) => {
                          const u = ins.usuarios_congreso;
                          return (
                            <TableRow key={ins.id}>
                              <TableCell className="font-medium">
                                {u ? `${u.nombre} ${u.apellido}` : "—"}
                              </TableCell>
                              <TableCell>{u?.cedula || "—"}</TableCell>
                              <TableCell className="text-sm text-gray-600">{u?.correo || "—"}</TableCell>
                              <TableCell className="text-center">
                                {ins.confirmado ? (
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Sí</Badge>
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">No</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {ins.asistencia ? (
                                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Asistió</Badge>
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">Pendiente</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-xs font-mono text-gray-500">
                                {ins.codigo_confirmacion}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t flex justify-end">
              <Button
                onClick={() => setModalInscritos({ visible: false, taller: null, lista: [], cargando: false })}
                className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Inscribir (admin) */}
      {modalInscribir.visible && (() => {
        const talleresDia = talleres.filter(t => String(t.dia) === String(modalInscribir.diaSeleccionado));
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-xl font-bold text-amber-700">Inscribir en taller</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {modalInscribir.usuario?.nombre} {modalInscribir.usuario?.apellido}
                  </p>
                </div>
                <button
                  onClick={() => setModalInscribir({ visible: false, usuario: null, diaSeleccionado: "", tallerSeleccionado: "", inscribiendo: false })}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Día del taller</label>
                  <select
                    value={modalInscribir.diaSeleccionado}
                    onChange={e => setModalInscribir(prev => ({ ...prev, diaSeleccionado: e.target.value, tallerSeleccionado: "" }))}
                    className="w-full border px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="">Selecciona un día...</option>
                    <option value="1">Lunes 2 de Marzo</option>
                    <option value="2">Martes 3 de Marzo</option>
                    <option value="3">Miércoles 4 de Marzo</option>
                  </select>
                </div>

                {modalInscribir.diaSeleccionado && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Taller</label>
                    {talleresDia.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">No hay talleres en ese día.</p>
                    ) : (
                      <select
                        value={modalInscribir.tallerSeleccionado}
                        onChange={e => setModalInscribir(prev => ({ ...prev, tallerSeleccionado: e.target.value }))}
                        className="w-full border px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                      >
                        <option value="">Selecciona un taller...</option>
                        {talleresDia.map(t => {
                          const inscritos = t.inscripciones?.[0]?.count ?? 0;
                          const cupos = (t.cupos_preclinico || 0) + (t.cupos_clinico || 0);
                          const lleno = inscritos >= cupos;
                          return (
                            <option key={t.id} value={t.id}>
                              {t.nombre} — {t.hora_inicio} ({inscritos}/{cupos} cupos){lleno ? " ⚠️ lleno" : ""}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>
                )}

                {modalInscribir.tallerSeleccionado && (() => {
                  const t = talleres.find(x => x.id === modalInscribir.tallerSeleccionado);
                  const inscritos = t?.inscripciones?.[0]?.count ?? 0;
                  const cupos = (t?.cupos_preclinico || 0) + (t?.cupos_clinico || 0);
                  return inscritos >= cupos ? (
                    <p className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                      ⚠️ Este taller está lleno. Como admin puedes inscribir igual.
                    </p>
                  ) : null;
                })()}
              </div>

              <div className="flex justify-end gap-2 px-6 pb-6">
                <Button
                  variant="outline"
                  onClick={() => setModalInscribir({ visible: false, usuario: null, diaSeleccionado: "", tallerSeleccionado: "", inscribiendo: false })}
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleInscribirAdmin}
                  disabled={!modalInscribir.tallerSeleccionado || modalInscribir.inscribiendo}
                  className="bg-amber-500 hover:bg-amber-600 text-white cursor-pointer disabled:opacity-60"
                >
                  {modalInscribir.inscribiendo ? "Inscribiendo..." : "Confirmar inscripción"}
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal Eliminar */}
      {modalEliminar.visible && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">¿Eliminar taller?</h3>
            <p className="text-gray-600 text-sm mb-6">
              Vas a eliminar <strong>"{modalEliminar.taller?.nombre}"</strong>. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => setModalEliminar({ visible: false, taller: null })}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEliminar}
                className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

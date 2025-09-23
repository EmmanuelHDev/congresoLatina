import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Input } from "./components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import {
  Search,
  Filter,
  Download,
  Eye,
  Users,
  TrendingUp,
  FileText,
  Settings,
} from "lucide-react";

export default function AdminInscripciones({ onBack }) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroPaquete, setFiltroPaquete] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  // 🔹 Datos de ejemplo (esto luego lo conectas con Supabase)
  const participantes = [
    {
      id: 1,
      nombre: "María García López",
      correo: "maria.garcia@email.com",
      paquete: "Premium",
      cuotas: 3,
      estado: "Activo",
      fecha: "14/01/2024",
    },
    {
      id: 2,
      nombre: "Carlos Rodríguez Silva",
      correo: "carlos.rodriguez@email.com",
      paquete: "Básico",
      cuotas: 1,
      estado: "Pendiente",
      fecha: "19/01/2024",
    },
    {
      id: 3,
      nombre: "Ana Martínez Ruiz",
      correo: "ana.martinez@email.com",
      paquete: "Estándar",
      cuotas: 2,
      estado: "Activo",
      fecha: "17/01/2024",
    },
    {
      id: 4,
      nombre: "Luis Fernando Torres",
      correo: "luis.torres@email.com",
      paquete: "Premium",
      cuotas: 6,
      estado: "Activo",
      fecha: "21/01/2024",
    },
    {
      id: 5,
      nombre: "Carmen Delgado Vega",
      correo: "carmen.delgado@email.com",
      paquete: "Básico",
      cuotas: 1,
      estado: "Cancelado",
      fecha: "11/01/2024",
    },
    {
      id: 6,
      nombre: "Roberto Jiménez Mora",
      correo: "roberto.jimenez@email.com",
      paquete: "Estándar",
      cuotas: 4,
      estado: "Pendiente",
      fecha: "24/01/2024",
    },
  ];

  // 🔹 Lógica de filtros
  const participantesFiltrados = participantes.filter((p) => {
    const coincideBusqueda =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.correo.toLowerCase().includes(busqueda.toLowerCase());
    const coincidePaquete =
      filtroPaquete === "Todos" || p.paquete === filtroPaquete;
    const coincideEstado =
      filtroEstado === "Todos" || p.estado === filtroEstado;
    return coincideBusqueda && coincidePaquete && coincideEstado;
  });

  const totalParticipantes = participantes.length;
  const participantesActivos = participantes.filter(
    (p) => p.estado === "Activo"
  ).length;
  const porcentajeActivos = Math.round(
    (participantesActivos / totalParticipantes) * 100
  );

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case "Activo":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Activo
          </Badge>
        );
      case "Pendiente":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pendiente
          </Badge>
        );
      case "Cancelado":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Cancelado
          </Badge>
        );
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  const getPaqueteBadge = (paquete) => {
    switch (paquete) {
      case "Premium":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            Premium
          </Badge>
        );
      case "Estándar":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Estándar
          </Badge>
        );
      case "Básico":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Básico
          </Badge>
        );
      default:
        return <Badge>{paquete}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* 🔹 Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-8 px-6 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
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
                      Participantes Activos
                    </p>
                    <p className="text-3xl font-semibold">{participantesActivos}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-emerald-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm">Porcentaje Activos</p>
                    <p className="text-3xl font-semibold">{porcentajeActivos}%</p>
                  </div>
                  <FileText className="w-8 h-8 text-emerald-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* 🔹 Filtros */}
        <Card className="shadow-lg border-0 mb-8">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
            <CardTitle className="flex items-center justify-between">
              <span>Filtros de Búsqueda</span>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Descargar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre o correo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={filtroPaquete}
                onChange={(e) => setFiltroPaquete(e.target.value)}
                className="border px-3 py-2 rounded"
              >
                <option value="Todos">Todos los paquetes</option>
                <option value="Premium">Premium</option>
                <option value="Estándar">Estándar</option>
                <option value="Básico">Básico</option>
              </select>

              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="border px-3 py-2 rounded"
              >
                <option value="Todos">Todos los estados</option>
                <option value="Activo">Activo</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Cancelado">Cancelado</option>
              </select>

              <Button variant="outline" className="gap-2">
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead>Nombre Completo</TableHead>
                    <TableHead>Correo Electrónico</TableHead>
                    <TableHead>Paquete</TableHead>
                    <TableHead>Cuotas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha de Registro</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participantesFiltrados.map((p) => (
                    <TableRow key={p.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                            <span className="text-emerald-700 font-medium text-sm">
                              {p.nombre
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </span>
                          </div>
                          <span className="font-medium">{p.nombre}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{p.correo}</TableCell>
                      <TableCell>{getPaqueteBadge(p.paquete)}</TableCell>
                      <TableCell className="text-center">{p.cuotas}</TableCell>
                      <TableCell>{getEstadoBadge(p.estado)}</TableCell>
                      <TableCell className="text-gray-600">{p.fecha}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="w-4 h-4 text-emerald-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./LandingPage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import PanelUsuario from "./PanelUsuario";
import AdminInscripciones from "./AdminInscripciones";
import AdminTalleres from "./AdminTalleres";
import AdminAsistencia from "./AdminAsistencia";
import AdminAsistenciaEvento from "./AdminAsistenciaEvento";
import AdminQRList from "./AdminQRList";
import ConfirmacionCuenta from "./Confirmacion";
import Asistencia from "./Asistencia";

// ✅ Componente para rutas protegidas
function RutaPrivada({ children, usuario }) {
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// ✅ Componente para rutas de admin
function RutaAdmin({ children, usuario }) {
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }
  if (usuario.seleccion_participacion !== "Admin") {
    return <Navigate to="/panel" replace />;
  }
  return children;
}

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [adminAcceso, setAdminAcceso] = useState(false);

  // ✅ PASO 1: Al cargar la app, restaurar sesión desde localStorage
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      try {
        const usuarioParsed = JSON.parse(usuarioGuardado);
        console.log("✅ Sesión restaurada desde localStorage:", usuarioParsed);
        setUsuario(usuarioParsed);
      } catch (error) {
        console.error("❌ Error al restaurar sesión:", error);
        localStorage.removeItem("usuario");
      }
    }
    setCargando(false);
  }, []);

  // ✅ PASO 2: Cuando el usuario inicia sesión exitosamente
  const handleLoginSuccess = (data) => {
    console.log("✅ Login exitoso, guardando usuario en localStorage:", data);
    setUsuario(data);
    // Guardar datos del usuario en localStorage
    localStorage.setItem("usuario", JSON.stringify(data));
  };

  // ✅ PASO 3: Cuando el usuario cierra sesión
  const handleLogout = () => {
    console.log("❌ Usuario cerró sesión");
    setUsuario(null);
    // Limpiar localStorage
    localStorage.removeItem("usuario");
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* ✅ LANDING PAGE - Ruta principal (sin redirección automática) */}
        <Route path="/" element={<LandingPage />} />
        
        {/* ✅ Rutas públicas - El usuario elige ir aquí desde Landing */}
        <Route 
          path="/login" 
          element={<LoginPage onLoginSuccess={handleLoginSuccess} />} 
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/confirmacion" element={<ConfirmacionCuenta />} />
        <Route path="/asistencia" element={<Asistencia />} />

        {/* ✅ Rutas privadas - Requieren estar logueado */}
        <Route
          path="/panel"
          element={
            <RutaPrivada usuario={usuario}>
              <PanelUsuario 
                usuario={usuario} 
                onLogout={handleLogout}
              />
            </RutaPrivada>
          }
        />

        {/* ✅ Ruta de admin - Solo para administradores */}
        <Route
          path="/admin"
          element={
            <RutaAdmin usuario={usuario}>
              <AdminInscripciones
                usuario={usuario}
                onLogout={handleLogout}
                adminAcceso={adminAcceso}
                setAdminAcceso={setAdminAcceso}
              />
            </RutaAdmin>
          }
        />

        {/* ✅ Ruta de admin talleres */}
        <Route
          path="/admin/talleres"
          element={
            <RutaAdmin usuario={usuario}>
              <AdminTalleres />
            </RutaAdmin>
          }
        />

        {/* ✅ Ruta de asistencia */}
        <Route
          path="/admin/asistencia"
          element={
            <RutaAdmin usuario={usuario}>
              <AdminAsistencia />
            </RutaAdmin>
          }
        />

        {/* ✅ Ruta asistencia evento */}
        <Route
          path="/admin/asistencia-evento"
          element={
            <RutaAdmin usuario={usuario}>
              <AdminAsistenciaEvento />
            </RutaAdmin>
          }
        />

        {/* ✅ Ruta lista de QR */}
        <Route
          path="/admin/qr"
          element={
            <RutaAdmin usuario={usuario}>
              <AdminQRList />
            </RutaAdmin>
          }
        />

        {/* ✅ Ruta 404 - Redirige a landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
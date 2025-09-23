import { useState } from "react";
import LandingPage from "./LandingPage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import PanelUsuario from "./PanelUsuario";
import AdminInscripciones from "./AdminInscripciones";
import ConfirmacionCuenta from "./Confirmacion";
export default function App() {
  const [view, setView] = useState("landing");
  const [usuario, setUsuario] = useState(null);

  const handleLogout = () => {
    setUsuario(null); // limpiar datos del usuario
    setView("landing");
    window.scrollTo(0, 0); // regresar al inicio
  };

  return (
    <>
      {view === "landing" && (
        <LandingPage
          onLoginClick={() => setView("login")}
          onRegisterClick={() => setView("register")}
        />
      )}

      {view === "login" && (
        <LoginPage
          onBack={() => setView("landing")}
          onLoginSuccess={(data) => {
            setUsuario(data);
            setView("panel");
          }}
        />
      )}

      {view === "register" && <RegisterPage onBack={() => setView("landing")} />}

      {view === "panel" && (
        <PanelUsuario
          usuario={usuario}
          onLogout={handleLogout}
          onAdminClick={() => setView("admin")} // 👈 ir a admin
        />
      )}

      {view === "admin" && (
        <AdminInscripciones onBack={() => setView("panel")} /> // 👈 volver al panel
      )}
      
      {view === "confirmacion" && (
        <ConfirmacionCuenta onLogin={() => setView("login")} />
      )}
    </>
  );
}

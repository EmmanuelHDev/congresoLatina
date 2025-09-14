import { useState } from "react";
import LandingPage from "./LandingPage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

export default function App() {
  const [view, setView] = useState("landing"); 
  // valores posibles: "landing", "login", "register"

  return (
    <>
      {view === "landing" && (
        <LandingPage
          onLoginClick={() => setView("login")}
          onRegisterClick={() => setView("register")}
        />
      )}
      {view === "login" && <LoginPage onBack={() => setView("landing")} />}
      {view === "register" && <RegisterPage onBack={() => setView("landing")} />}
    </>
  );
}

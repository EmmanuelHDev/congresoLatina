import { Mail, Phone, User, Banknote, Hash } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import ImageContacto from "../assets/Contacto.webp"

export default function InformacionContacto() {
  return (
    <div className="relative z-1 min-h-screen flex flex-col items-center justify-center p-6">
      {/* Imagen de fondo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${ImageContacto})` }}
      ></div>
       {/* Capa oscura */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#063040]/80 to-[#27866d]/80"></div>
      <div className="relative z-10 w-full flex flex-col items-center">
        <h1 className="text-3xl font-bold text-yellow-400 mb-2">
          Información de Contacto y Pagos
        </h1>
        <p className="text-white mb-8">
          ¿Tienes preguntas? Contáctanos o realiza tu depósito
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
          {/* Información de Contacto */}
        <Card className="bg-gray-700/50 backdrop-blur-md rounded-2xl shadow-lg">
          <CardContent className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-400" /> Información de Contacto
            </h2>

            <div>
              <p className="text-gray-400 font-semibold">Teléfono</p>
              <p className="text-white">6788-0554</p>
              <p className="text-gray-400 text-sm">Nathalie Lazo - Presidenta</p>
            </div>

            <div>
              <p className="text-gray-400 font-semibold">Correo Electrónico</p>
              <p className="text-white">coemlats@gmail.com</p>
            </div>

            <Button className="cursor-pointer w-full bg-white text-gray-800 hover:bg-gray-200 flex items-center gap-2">
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=coemlats@gmail.com&su=Consulta%20sobre%20Congreso&body=Hola,%20quisiera%20más%20información%20sobre%20el%20evento."
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer w-full bg-white text-gray-800 hover:bg-gray-200 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition"
              >
                <Mail className="w-4 h-4" /> Enviar Correo
              </a>

            </Button>
          </CardContent>
        </Card>

        {/* Información Bancaria */}
        <Card className="bg-gray-700/50 backdrop-blur-md rounded-2xl shadow-lg">
          <CardContent className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Banknote className="w-5 h-5 text-green-400" /> Información Bancaria
            </h2>

            <div>
              <p className="text-gray-400 font-semibold">Beneficiario</p>
              <p className="text-white">AIDA MICHELLE CABRE QUINTANA</p>
            </div>

            <div>
              <p className="text-gray-400 font-semibold">Banco</p>
              <p className="text-white">Banco General</p>
              <p className="text-gray-400 text-sm">Cuenta de Ahorros</p>
            </div>

            <div>
              <p className="text-gray-400 font-semibold">Número de Cuenta</p>
              <p className="text-white">0498000022122</p>
            </div>

            <div className="bg-yellow-500/20 border border-yellow-500/60 text-yellow-100 p-3 rounded-md shadow-md">
              <p className="text-sm">
                <span className="font-bold">Importante:</span>{" "}
                Sube el comprobante de pago en la plataforma del congreso después de realizar tu depósito.
              </p>
            </div>

          </CardContent>
        </Card>

        </div>
      </div>
    </div>
  );
}

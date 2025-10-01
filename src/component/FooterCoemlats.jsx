import { Mail, Phone } from "lucide-react";

export default function FooterCoemlats() {
  return (
    <footer className="bg-black text-gray-300 py-10 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Columna 1 */}
        <div>
          <h2 className="text-white text-lg font-bold mb-2">COEMLATS 2026</h2>
          <p>
            Un congreso médico de primer nivel que reúne a los mejores
            profesionales de la salud para compartir conocimientos y
            experiencias.
          </p>
        </div>

        {/* Columna 2 */}
        <div>
          <h2 className="text-white text-lg font-bold mb-2">Contacto Rápido</h2>
          <p className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-green-400" /> 6788-0554
          </p>
          <p className="flex items-center gap-2 mt-2">
            <Mail className="w-4 h-4 text-green-400" /> coemlats@gmail.com
          </p>
        </div>

        {/* Columna 3 */}
        <div>
          <h2 className="text-white text-lg font-bold mb-2">
            Información Importante
          </h2>
          <ul className="space-y-2 text-sm">
            <li className="text-green-400 list-disc ml-5">
              <span className="text-gray-300">Pagos por cuotas disponibles</span>
            </li>
            <li className="text-green-400 list-disc ml-5">
              <span className="text-gray-300">Múltiples paquetes para elegir</span>
            </li>
            <li className="text-green-400 list-disc ml-5">
              <span className="text-gray-300">Certificados de participación</span>
            </li>
            <li className="text-green-400 list-disc ml-5">
              <span className="text-gray-300">Experiencia integral disponible</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Línea divisoria */}
      <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
        <p>© 2025 COEMLATS. Todos los derechos reservados.</p>
        <p className="mt-1">
          Congreso organizado con los más altos estándares de calidad académica.
        </p>
      </div>
    </footer>
  );
}

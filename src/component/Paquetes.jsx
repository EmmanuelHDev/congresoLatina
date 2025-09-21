import { Check } from "lucide-react";

export default function Paquetes() {
  const paquetes = [
    {
      nombre: "Paquete A",
      titulo: "Solo Congreso",
      descripcion: "Acceso completo al congreso científico",
      precio: "$120.00",
      boton: "Seleccionar Paquete A",
      popular: false,
    },
    {
      nombre: "Paquete B",
      titulo: "Solo Decamerón",
      descripcion: "Experiencia completa en resort",
      precio: "$165.00",
      boton: "Seleccionar Paquete B",
      popular: false,
    },
    {
      nombre: "Paquete C",
      titulo: "Congreso + Decamerón",
      descripcion: "La experiencia completa - Congreso y resort",
      precio: "$285.00",
      boton: "Seleccionar Paquete C",
      popular: true,
    },
  ];

  return (
    <section className="bg-[#f0f7f6] py-16 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-[#063040] text-3xl font-bold mb-4">Paquetes Disponibles</h2>
        <p className="text-gray-600 mb-12">
          Elige el paquete que mejor se adapte a tus necesidades y disfruta de una experiencia única
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          {paquetes.map((p, i) => (
            <div
              key={i}
              className={`rounded-2xl border p-8 shadow-sm bg-white relative ${
                p.popular ? "border-blue-500 shadow-lg scale-105" : ""
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ffca27] text-white text-sm px-4 py-1 rounded-full shadow">
                  Más Popular
                </span>
              )}
              <h3 className="text-[#063040] text-lg font-semibold mb-1">{p.nombre}</h3>
              <h4 className="text-2xl font-bold">{p.titulo}</h4>
              <p className="text-gray-500 mb-4">{p.descripcion}</p>
              <p className="text-4xl font-extrabold text-blue-600 mb-6">
                {p.precio}
              </p>
              <button
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  p.popular
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {p.boton}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

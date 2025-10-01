import { Check } from "lucide-react";

export default function Paquetes({ onRegisterClick }) {
  const paquetes = [
    {
      nombre: "Paquete A",
      titulo: "Solo Congreso",
      descripcion: "Cuota: 20.00",
      precio: "$120.00",
      boton: "Seleccionar Paquete A",
      popular: false,
    },
    {
      nombre: "Paquete B",
      titulo: "Solo Decameron",
      descripcion: "Cuota:27.50",
      precio: "$165.00",
      boton: "Seleccionar Paquete B",
      popular: false,
    },
    {
      nombre: "Paquete C",
      titulo: "Congreso + Decameron",
      descripcion: "Cuota:47.50",
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
                p.popular ? "border-[#006D6B] shadow-lg scale-105" : ""
              }`}
            >
              {p.popular && (
                <span className="flex justify-center items-center gap-1 absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-sm px-6 py-1 rounded-full shadow">
                 <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 4c-3.2 0-5 2.667-5 4c0-1.333-1.8-4-5-4S3 6.667 3 8c0 7 9 12 9 12s9-5 9-12c0-1.333-.8-4-4-4"
                  />
                </svg>Más popular
                </span>
              )}
              <h3 className="text-[#063040] text-lg font-semibold mb-1">{p.nombre}</h3>
              <h4 className="text-2xl font-semibold">{p.titulo}</h4>
              <p className="text-gray-500 mb-4">{p.descripcion}</p>
              <p className="text-4xl font-extrabold text-[#006D6B] mb-6">
                {p.precio}
              </p>
              <button
                onClick={onRegisterClick}   
                className={`cursor-pointer w-full py-3 rounded-lg font-semibold transition ${
                  p.popular
                    ? "bg-[#006D6B] text-white hover:bg-transparent hover:text-[#006D6B] border-2 hover:border-[#006D6B]"
                    : "bg-transparent border-2 border-[#006D6B] text-[#006D6B] hover:bg-[#006D6B] hover:text-white"
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

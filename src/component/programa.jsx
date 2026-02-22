import React, { useState } from "react";
import { Calendar, Clock, User, MapPin, Download } from "lucide-react";

export default function Programa() {
  const [diaActivo, setDiaActivo] = useState(0);

  const programa = [
    {
      dia: "Lunes 2 de Marzo",
      fecha: "2 de marzo de 2026",
      bloques: [
        {
          nombre: "BLOQUE 1",
          color: "bg-green-600",
          actividades: [
            {
              hora: "7:00 a.m. – 7:55 a.m.",
              titulo: "REGISTRO",
              tema: null,
              expositor: null,
              salon: null,
            },
            {
              hora: "8:00 a.m. – 8:55 a.m.",
              titulo: "INAUGURACIÓN",
              tema: null,
              expositor: null,
              salon: null,
            },
            {
              hora: "9:00 a.m. – 9:55 a.m.",
              titulo: "EXPOSICIÓN MAGISTRAL #1",
              tema: "Medicina basada en evidencia: Pilar en la práctica clínica",
              expositor: "Dra. Erika Ferguson",
              salon: null,
            },
            {
              hora: "10:00 a.m. – 10:55 a.m.",
              titulo: "COFFEE BREAK #1",
              tema: "Actividad Lúdica",
              expositor: null,
              salon: null,
            },
            {
              hora: "11:00 a.m. – 11:55 a.m.",
              titulo: "EXPOSICIÓN MAGISTRAL #2",
              tema: "¿Qué tipo de médico necesita Panamá en el 2030?",
              expositor: "Dra. Gladys Hidalgo",
              salon: null,
            },
            {
              hora: "12:00 p.m. – 12:50 p.m.",
              titulo: "ALMUERZO",
              tema: "Actividad Lúdica",
              expositor: null,
              salon: null,
            },
          ],
        },
        {
          nombre: "BLOQUE 2",
          color: "bg-blue-600",
          actividades: [
            {
              hora: "12:55 p.m. – 2:10 p.m.",
              titulo: "TALLER 1",
              tema: "Control de parto",
              expositor: "Dr. Rogelio García",
              salon: "Salón Granito",
            },
            {
              hora: "12:55 p.m. – 2:10 p.m.",
              titulo: "TALLER 2",
              tema: "Reducción, inmovilización y férulas: Clínica y transformación",
              expositor: "Dr. Luis Delgado y Soluciones Ortopédicas",
              salon: "Salón Laurel",
            },
            {
              hora: "12:55 p.m. – 2:10 p.m.",
              titulo: "TALLER 3",
              tema: "Primeros auxilios básicos",
              expositor: "RG Training",
              salon: "Salón Villa Magna",
            },
            {
              hora: "12:55 p.m. – 2:10 p.m.",
              titulo: "TALLER 4",
              tema: "Reanimación básica en pacientes adultos",
              expositor: "Start Training",
              salon: "Salón Bahía",
            },
            {
              hora: "12:55 p.m. – 2:10 p.m.",
              titulo: "TALLER 5",
              tema: "Monitoreo fetal",
              expositor: "Dr. Riggie Castillo",
              salon: "Salón Ensenada",
            },
          ],
        },
        {
          nombre: "BLOQUE 3",
          color: "bg-teal-600",
          actividades: [
            {
              hora: "2:15 p.m. – 3:10 p.m.",
              titulo: "EXPOSICIÓN MAGISTRAL #3",
              tema: "Trasformando la diabetes: Innovaciones clínicas para el nuevo siglo",
              expositor: "Dr. Rubén Carrasco",
              salon: null,
            },
            {
              hora: "3:15 p.m. – 3:35 p.m.",
              titulo: "COFFEE BREAK",
              tema: "Actividad Lúdica",
              expositor: null,
              salon: null,
            },
            {
              hora: "3:40 p.m. – 4:35 p.m.",
              titulo: "EXPOSICIÓN MAGISTRAL #4",
              tema: "Anticuerpos monoclonales: Nuevas tecnologías en Panamá",
              expositor: "Dra. Yageis Bolaños",
              salon: null,
            },
            {
              hora: "3:40 p.m. – 4:35 p.m.",
              titulo: "TALLER 6",
              tema: "Reanimación básica en pacientes pediátricos",
              expositor: "Start Training",
              salon: "Salón Laurel",
            },
          ],
        },
      ],
    },
    {
      dia: "Martes 3 de Marzo",
      fecha: "3 de marzo de 2026",
      bloques: [
        {
          nombre: "BLOQUE 1",
          color: "bg-green-600",
          actividades: [
            {
              hora: "7:00 a.m. – 7:55 a.m.",
              titulo: "REGISTRO",
              tema: null,
              expositor: null,
              salon: null,
            },
            {
              hora: "8:00 a.m. – 9:30 a.m.",
              titulo: "CONCURSO",
              tema: null,
              expositor: null,
              salon: null,
            },
            {
              hora: "9:35 a.m. – 10:30 a.m.",
              titulo: "EXPOSICIÓN MAGISTRAL #1",
              tema: "Estudio de biomarcadores para la detección de enfermedades neurodegenerativas",
              expositor: "Dr. Alcibiades Villarreal (INDICASAT)",
              salon: null,
            },
            {
              hora: "10:35 a.m. – 11:05 a.m.",
              titulo: "COFFEE BREAK",
              tema: "Actividad Lúdica",
              expositor: null,
              salon: null,
            },
            {
              hora: "11:10 a.m. – 12:05 p.m.",
              titulo: "EXPOSICIÓN MAGISTRAL #2",
              tema: "Prevención del deterioro cognitivo en Panamá",
              expositor: "Dra. Diana Oviedo (INDICASAT)",
              salon: null,
            },
            {
              hora: "12:10 p.m. – 12:50 p.m.",
              titulo: "ALMUERZO",
              tema: "Actividad Lúdica",
              expositor: null,
              salon: null,
            },
          ],
        },
        {
          nombre: "BLOQUE 2",
          color: "bg-blue-600",
          actividades: [
            {
              hora: "1:05 p.m. – 2:00 p.m.",
              titulo: "TALLER 1",
              tema: "El arte y la ciencia de la sutura",
              expositor: "Dr. Carlos Guerra y Dr. Arturo Ríos",
              salon: "Salón Granito",
            },
            {
              hora: "1:05 p.m. – 2:00 p.m.",
              titulo: "TALLER 2",
              tema: "Fondo de ojo: Diagnóstico clínico temprano",
              expositor: "Dra. Mileydis Moreno",
              salon: "Salón Ensenada",
            },
            {
              hora: "1:05 p.m. – 2:00 p.m.",
              titulo: "TALLER 3",
              tema: "USG: Apoyo al diagnóstico clínico",
              expositor: "Dra. Edda Leonor Cháves",
              salon: "Salón Villa Magna",
            },
            {
              hora: "1:05 p.m. – 2:00 p.m.",
              titulo: "TALLER 4",
              tema: "RCP",
              expositor: "RG Training",
              salon: "Salón Laurel",
            },
            {
              hora: "1:05 p.m. – 2:00 p.m.",
              titulo: "TALLER 5",
              tema: "Identificación de lesiones dermatológicas",
              expositor: "Dra. Catia Gutiérrez",
              salon: "Salón Bahía",
            },
          ],
        },
        {
          nombre: "BLOQUE 3",
          color: "bg-teal-600",
          actividades: [
            {
              hora: "2:15 p.m. – 3:10 p.m.",
              titulo: "EXPOSICIÓN MAGISTRAL #3",
              tema: "Transformación médica en Oncología Pediátrica",
              expositor: "Dr. Antonio Alvarado",
              salon: null,
            },
            {
              hora: "3:15 p.m. – 3:35 p.m.",
              titulo: "COFFEE BREAK",
              tema: "Actividad Lúdica",
              expositor: null,
              salon: null,
            },
            {
              hora: "3:40 p.m. – 4:35 p.m.",
              titulo: "ESPACIO PATROCINADOR",
              tema: null,
              expositor: null,
              salon: null,
            },
          ],
        },
      ],
    },
    {
      dia: "Miércoles 4 de Marzo",
      fecha: "4 de marzo de 2026",
      bloques: [
        {
          nombre: "BLOQUE 1",
          color: "bg-green-600",
          actividades: [
            {
              hora: "7:00 a.m. – 7:55 a.m.",
              titulo: "REGISTRO",
              tema: null,
              expositor: null,
              salon: null,
            },
            {
              hora: "8:00 a.m. – 8:55 a.m.",
              titulo: "EXPOSICIÓN MAGISTRAL #1",
              tema: "Inteligencia artificial en el diagnóstico médico: ¿Un aliado o una amenaza?",
              expositor: "Grupo Health Training",
              salon: null,
            },
            {
              hora: "9:00 a.m. – 9:30 a.m.",
              titulo: "COFFEE BREAK",
              tema: "Actividad Lúdica",
              expositor: null,
              salon: null,
            },
            {
              hora: "9:35 a.m. – 10:30 a.m.",
              titulo: "EXPOSICIÓN MAGISTRAL #2",
              tema: "El futuro ya llegó: Medicina personalizada y genética aplicada en la práctica clínica",
              expositor: "Dr. Iván Landires",
              salon: null,
            },
          ],
        },
        {
          nombre: "BLOQUE 2",
          color: "bg-blue-600",
          actividades: [
            {
              hora: "10:45 a.m. – 11:40 a.m.",
              titulo: "TALLER 1",
              tema: "Atención de emergencias pediátricas",
              expositor: "Start Training",
              salon: "Salón Ensenada",
            },
            {
              hora: "10:45 a.m. – 11:40 a.m.",
              titulo: "TALLER 2",
              tema: "Irrigación ótica",
              expositor: "Dr. Pedro Vega y Dr. Héctor Santacoloma",
              salon: "Salón Granito",
            },
            {
              hora: "10:45 a.m. – 11:40 a.m.",
              titulo: "TALLER 3",
              tema: "Manejo de vía aérea",
              expositor: "RG Training",
              salon: "Salón Villa Magna",
            },
            {
              hora: "10:45 a.m. – 11:40 a.m.",
              titulo: "TALLER 4",
              tema: "Laparoscopía clínica",
              expositor: "Dr. Carlos Guerra",
              salon: "Salón Bahía",
            },
            {
              hora: "10:45 a.m. – 11:40 a.m.",
              titulo: "TALLER 5",
              tema: "Interpretación de EKG",
              expositor: "Dr. Manuel Rodríguez",
              salon: "Salón Laurel",
            },
          ],
        },
        {
          nombre: "BLOQUE 3",
          color: "bg-teal-600",
          actividades: [
            {
              hora: "11:55 a.m. – 12:50 p.m.",
              titulo: "CLAUSURA Y PREMIACIONES",
              tema: null,
              expositor: null,
              salon: null,
            },
          ],
        },
      ],
    },
  ];

  return (
    <section className="py-16 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Título */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Programa del Evento
            </h2>
            <p className="text-lg text-gray-600 flex items-center gap-2">
              <Calendar size={20} className="text-teal-600" />
              2 - 4 de Marzo 2026 | Hotel Gran David
            </p>
          </div>

          {/* Botón descargar PDF */}
          <a
            href="https://drive.google.com/uc?export=download&id=YOUR_FILE_ID"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold shadow-md hover:shadow-lg whitespace-nowrap"
          >
            <Download size={20} />
            Descargar PDF
          </a>
        </div>

        {/* Tabs - Seleccionar día */}
        <div className="flex gap-2 md:gap-4 mb-8 overflow-x-auto pb-2">
          {programa.map((item, index) => (
            <button
              key={index}
              onClick={() => setDiaActivo(index)}
              className={`px-4 md:px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                diaActivo === index
                  ? "bg-teal-600 text-white shadow-lg"
                  : "bg-white text-gray-800 border-2 border-gray-200 hover:border-teal-600"
              }`}
            >
              {item.dia}
            </button>
          ))}
        </div>

        {/* Contenido del día seleccionado */}
        <div className="space-y-8">
          {programa[diaActivo].bloques.map((bloque, bloqueIdx) => (
            <div key={bloqueIdx} className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Header del bloque */}
              <div className={`${bloque.color} text-white p-4 md:p-6`}>
                <h3 className="text-xl md:text-2xl font-bold">{bloque.nombre}</h3>
              </div>

              {/* Actividades */}
              <div className="divide-y divide-gray-200">
                {bloque.actividades.map((actividad, actIdx) => (
                  <div key={actIdx} className="p-4 md:p-6 hover:bg-gray-50 transition">
                    {/* Hora */}
                    <div className="flex items-start gap-3 mb-3">
                      <Clock size={18} className="text-teal-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-gray-900">{actividad.hora}</p>
                        <p className="text-sm font-semibold text-teal-600 uppercase">
                          {actividad.titulo}
                        </p>
                      </div>
                    </div>

                    {/* Tema */}
                    {actividad.tema && (
                      <div className="ml-8 mb-3">
                        <p className="text-gray-700 font-medium">{actividad.tema}</p>
                      </div>
                    )}

                    {/* Expositor */}
                    {actividad.expositor && (
                      <div className="ml-8 flex items-center gap-2 mb-2 text-sm text-gray-600">
                        <User size={16} className="text-teal-600 flex-shrink-0" />
                        <span className="font-medium">{actividad.expositor}</span>
                      </div>
                    )}

                    {/* Salón */}
                    {actividad.salon && (
                      <div className="ml-8 flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={16} className="text-teal-600 flex-shrink-0" />
                        <span className="font-medium">{actividad.salon}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
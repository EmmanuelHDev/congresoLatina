import React, { useState, useRef } from "react";
import { Phone, Mail, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";

export default function Expositores() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const carouselRef = useRef(null);

  const expositores = [
    {
      id: 1,
      nombre: "Arturo I. Ríos Q.",
      especialidad: "Cirujano General",
      descripcion: "Especialista en cirugía general con más de 15 años de experiencia en investigación clínica. Jefe del departamento de especialidades quirúrgicas.",
      imagen: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=1160",
      contacto: "6430-6474",
      tipo: "telefono",
    },
    {
      id: 2,
      nombre: "Mileidys Moreno",
      especialidad: "Oftalmóloga",
      descripcion: "Experta en oftalmología general con especialización en procedimientos de última generación. Múltiples años de experiencia clínica.",
      imagen: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=1160",
      contacto: "6290-1065",
      tipo: "telefono",
    },
    {
      id: 3,
      nombre: "Iván Landires",
      especialidad: "MD, MSC, PHD",
      descripcion: "Investigador distinguido del Sistema Nacional de Investigación. Experto en genética humana con publicaciones internacionales.",
      imagen: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1160",
      contacto: "ivanlandires@yahoo.es",
      tipo: "email",
    },
    {
      id: 4,
      nombre: "Luis Miguel Delgado",
      especialidad: "Ortopeda",
      descripcion: "Especialista en ortopedia y traumatología con experiencia en procedimientos avanzados. Formación en universidades de prestigio.",
      imagen: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1160",
      contacto: "6887-8313",
      tipo: "telefono",
    },
    {
      id: 5,
      nombre: "Eduardo Ruiloba",
      especialidad: "Paramédico, Educador",
      descripcion: "Coordinador académico especializado en emergencias médicas. Instructor de primeros auxilios y soporte vital básico.",
      imagen: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=1160",
      contacto: "eruiloba09@gmail.com",
      tipo: "email",
    },
    {
      id: 6,
      nombre: "Erika Ferguson",
      especialidad: "Epidemióloga",
      descripcion: "Especialista en epidemiología y vigilancia sanitaria. Encargada de epidemiología y comité de infecciones desde 2011.",
      imagen: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=1160",
      contacto: "6675-6804",
      tipo: "telefono",
    },
    {
      id: 7,
      nombre: "Antonio Alvarado",
      especialidad: "Pediatra Hematólogo",
      descripcion: "Especialista en hematología pediátrica. Jefe de la sala de hematología pediátrica con formación en hospitales de renombre.",
      imagen: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1160",
      contacto: "6495-6375",
      tipo: "telefono",
    },
    {
      id: 8,
      nombre: "Gladys Cecilia Hidalgo",
      especialidad: "Neumóloga",
      descripcion: "Directora regional de salud y especialista en neumología. Coordinadora del programa de tuberculosis desde 2000.",
      imagen: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=1160",
      contacto: "tbcgh@hotmail.com",
      tipo: "email",
    },
    {
      id: 9,
      nombre: "Carlos Guerra Sousa",
      especialidad: "Cirujano",
      descripcion: "Cirujano general con especialización en trauma severo. Experiencia en procedimientos quirúrgicos avanzados y educación médica.",
      imagen: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1160",
      contacto: "6151-8755",
      tipo: "telefono",
    },
    {
      id: 10,
      nombre: "Edda Leonor Chaves",
      especialidad: "Doctora",
      descripcion: "Presidenta de la Federación Latinoamericana de Ultrasonido. Miembro del board administrativo de WFUMB 2021-actualidad.",
      imagen: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=1160",
      contacto: "6275-0862",
      tipo: "telefono",
    },
    {
      id: 11,
      nombre: "Rubén Carrasco",
      especialidad: "Endocrinólogo",
      descripcion: "Médico especialista en endocrinología, metabolismo y nutrición. Miembro activo de sociedades médicas internacionales.",
      imagen: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1160",
      contacto: "rcarrascob16@gmail.com",
      tipo: "email",
    },
    {
      id: 12,
      nombre: "Alcibiades Elias Villarreal",
      especialidad: "PhD en Biotecnología",
      descripcion: "Director de investigación y desarrollo. Profesor de postgrado en biotecnología y ciencias médicas desde 2020.",
      imagen: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1160",
      contacto: "6070-6966",
      tipo: "telefono",
    },
    {
      id: 13,
      nombre: "Diana Carolina Oviedo",
      especialidad: "Psicóloga",
      descripcion: "Coordinadora del área de neuropsicología. Doctora en neurociencias con investigación en cognición y demencia.",
      imagen: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=1160",
      contacto: "6879-5469",
      tipo: "telefono",
    },
    {
      id: 14,
      nombre: "Pedro Vega Rodríguez",
      especialidad: "Doctor",
      descripcion: "Subdirector y planificador de salud. Profesor de la facultad de ciencias de la salud con experiencia en atención primaria.",
      imagen: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1160",
      contacto: "6277-7010",
      tipo: "telefono",
    },
    {
      id: 15,
      nombre: "Yageis Yamileth Bolaños",
      especialidad: "Neumóloga Pediátrica",
      descripcion: "Especialista en neumología pediátrica. Subinvestigadora en múltiples estudios clínicos de importancia internacional.",
      imagen: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=1160",
      contacto: "6615-0407",
      tipo: "telefono",
    },
    {
      id: 16,
      nombre: "RG Training",
      especialidad: "Empresa de Capacitación",
      descripcion: "Centro autorizado de capacitación en emergencias y primeros auxilios. Acreditado por instituciones internacionales de salud.",
      imagen: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1160",
      contacto: "rgtraining.panama@gmail.com",
      tipo: "email",
    },
  ];

  // Función para renderizar el icono correcto
  const renderIcon = (tipo) => {
    if (tipo === "telefono") {
      return <Phone size={16} className="text-teal-600" />;
    } else if (tipo === "email") {
      return <Mail size={16} className="text-teal-600" />;
    }
    return <Briefcase size={16} className="text-teal-600" />;
  };

  // Funciones para el carrusel mobile
  const scroll = (direction) => {
    const container = carouselRef.current;
    if (!container) return;

    const scrollAmount = 340; // ancho de card + gap
    const newPosition =
      direction === "left"
        ? scrollPosition - scrollAmount
        : scrollPosition + scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });
    setScrollPosition(newPosition);
  };

  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Título */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Expositores del Evento
          </h2>
          <p className="text-lg text-gray-600">
            Conoce a los expertos y especialistas que compartirán sus conocimientos en el Congreso de Medicina 2025
          </p>
        </div>

        {/* DESKTOP: Grid de 3 columnas */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {expositores.map((expositor) => (
            <div
              key={expositor.id}
              className="flex gap-4 p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:shadow-lg hover:border-teal-200 transition-all duration-300"
            >
              {/* Imagen */}
              <img
                alt={expositor.nombre}
                src={expositor.imagen}
                className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
              />

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-base md:text-lg line-clamp-2">
                  {expositor.nombre}
                </h3>

                <div className="flex items-center gap-2 mt-1">
                  <Briefcase size={14} className="text-teal-600 flex-shrink-0" />
                  <p className="text-sm font-semibold text-teal-600 line-clamp-1">
                    {expositor.especialidad}
                  </p>
                </div>

                <p className="mt-2 text-gray-700 text-sm leading-relaxed line-clamp-2">
                  {expositor.descripcion}
                </p>

                {/* Contacto con icono */}
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                  {renderIcon(expositor.tipo)}
                  <span className="truncate">{expositor.contacto}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MOBILE: Carrusel horizontal */}
        <div className="md:hidden relative">
          {/* Carrusel */}
          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto scroll-smooth pb-4"
            style={{ scrollBehavior: "smooth" }}
          >
            {expositores.map((expositor) => (
              <div
                key={expositor.id}
                className="flex-shrink-0 w-80 flex gap-4 p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:shadow-lg hover:border-teal-200 transition-all duration-300"
              >
                {/* Imagen */}
                <img
                  alt={expositor.nombre}
                  src={expositor.imagen}
                  className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                />

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base line-clamp-2">
                    {expositor.nombre}
                  </h3>

                  <div className="flex items-center gap-2 mt-1">
                    <Briefcase size={14} className="text-teal-600 flex-shrink-0" />
                    <p className="text-sm font-semibold text-teal-600 line-clamp-1">
                      {expositor.especialidad}
                    </p>
                  </div>

                  <p className="mt-2 text-gray-700 text-sm leading-relaxed line-clamp-2">
                    {expositor.descripcion}
                  </p>

                  {/* Contacto con icono */}
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                    {renderIcon(expositor.tipo)}
                    <span className="truncate">{expositor.contacto}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botones de navegación */}
          {/* <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-teal-600 hover:bg-teal-700 text-white rounded-full p-2 transition-colors z-10"
            aria-label="Anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-teal-600 hover:bg-teal-700 text-white rounded-full p-2 transition-colors z-10"
            aria-label="Siguiente"
          >
            <ChevronRight size={24} />
          </button> */}
        </div>

        {/* Indicador de scroll en mobile */}
        <div className="md:hidden mt-6 flex justify-center gap-2 text-xs text-gray-600">
          <span>← Desliza para ver más →</span>
        </div>
      </div>
    </section>
  );
}
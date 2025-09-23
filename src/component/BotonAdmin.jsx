import { useNavigate } from "react-router-dom";
import React from "react";
export default function BotonAdmin({ onClick }) {
  //const navigate = useNavigate();
  
  return (
     <button
     onClick={onClick}
     className="cursor-pointer bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-md flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="text-white" viewBox="0 0 24 24">
          <path fill="currentColor" d="M19 2H8c-1.1 0-2 .9-2 2v2H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2v-2h1c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m-3 16H6V8h10zm3-4h-1V6c0-1.1-.9-2-2-2h-7V4h10z"/>
        </svg>
        Ver Inscripciones
      </button>
  );
}

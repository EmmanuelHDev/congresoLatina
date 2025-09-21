import { useNavigate } from "react-router-dom";
import React from "react";
export default function BotonAdmin({ onClick }) {
  //const navigate = useNavigate();
  
  return (
    <button
      onClick={onClick}
      className="cursor-pointer max-w-3xs md:w-auto bg-[#005f5a] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M19 22H5a3 3 0 0 1-3-3V3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v12h4v4a3 3 0 0 1-3 3m-1-5v2a1 1 0 1 0 2 0v-2zm-2 3V4H4v15a1 1 0 0 0 1 1zM6 7h8v2H6zm0 4h8v2H6zm0 4h5v2H6z"/></svg>
       Ver Inscripciones
    </button>
  );
}

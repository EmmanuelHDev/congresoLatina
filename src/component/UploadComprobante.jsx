import React, { useRef } from "react";

export default function UploadComprobante({
  file,
  onFileChange,
  onVer,
  onCambiar,
}) {
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // cuando selecciona archivo
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      onFileChange(selectedFile); // solo notificamos al padre
    }
  };

  return (
    <div className="mt-3 border border-dashed border-green-400 rounded-md bg-green-50 p-4">
      {/* Label */}
      <label className="font-semibold text-green-700 flex items-center gap-2 mb-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Subir comprobante de pago
      </label>

      <input
        id="comprobante"
        type="file"
        ref={fileInputRef}
        accept=".jpg,.png,.pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {!file ? (
        <div className="flex items-center gap-3">
          {/* Input personalizado SOLO en pantallas medianas en adelante */}
          <label
            htmlFor="comprobante"
            className="hidden md:flex flex-1 border rounded px-4 py-2 text-sm text-gray-500 bg-white cursor-pointer hover:bg-gray-50 items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-gray-400"
            >
              <path d="M18 15.75q0 2.6-1.825 4.425T11.75 22t-4.425-1.825T5.5 15.75V6.5q0-1.875 1.313-3.187T10 2t3.188 1.313T14.5 6.5v8.75q0 1.15-.8 1.95t-1.95.8t-1.95-.8t-.8-1.95V6h2v9.25q0 .325.213.538t.537.212t.538-.213t.212-.537V6.5q-.025-1.05-.737-1.775T10 4t-1.775.725T7.5 6.5v9.25q-.025 1.775 1.225 3.013T11.75 20q1.75 0 2.975-1.237T16 15.75V6h2z" />
            </svg>
            Subir el comprobante aquí
          </label>

          {/* Botón verde */}
          <button
            type="button"
            onClick={handleButtonClick}
            className="cursor-pointer w-full md:w-auto bg-gradient-to-r from-green-500 to-green-400 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-upload"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Elegir archivo
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-white border border-green-300 rounded p-2">
          <p className="text-sm text-gray-700 truncate">{file.name}</p>
          <div className="flex gap-2">
            {/* Botón Ver */}
            <button
              type="button"
              className="cursor-pointer px-3 py-1 bg-green-100 text-green-700 rounded text-sm flex items-center gap-1"
              onClick={onVer}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5"/>
              </svg>
              Ver
            </button>

            {/* Botón Cambiar */}
            <button
              type="button"
              className="cursor-pointer px-3 py-1 bg-red-100 text-red-600 rounded text-sm flex items-center gap-1"
              onClick={() => {
                onCambiar();
                if (fileInputRef.current) {
                  fileInputRef.current.value = null;
                  fileInputRef.current.click();
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1a6.887 6.887 0 0 0 0 9.8c2.73 2.7 7.15 2.7 9.88 0c1.36-1.35 2.04-2.92 2.04-4.9h2c0 1.98-.88 4.55-2.64 6.29c-3.51 3.48-9.21 3.48-12.72 0c-3.5-3.47-3.53-9.11-.02-12.58a8.987 8.987 0 0 1 12.65 0L21 3zM12.5 8v4.25l3.5 2.08l-.72 1.21L11 13V8z"/>
              </svg>
              Cambiar
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2">
        Formatos aceptados: JPG, PNG (máx. 5MB)
      </p>
    </div>
  );
}

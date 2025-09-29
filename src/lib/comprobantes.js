import { supabase } from "./cliente";

export async function subirComprobante(usuarioId, cuotaId, file) {
  try {
    // Buscar datos del usuario
    const { data: usuarioData, error: usuarioError } = await supabase
      .from("usuarios_congreso")
      .select("nombre, apellido")
      .eq("id", usuarioId)
      .single();

    if (usuarioError) throw usuarioError;

    const nombreParticipante = usuarioData
      ? `${usuarioData.nombre}_${usuarioData.apellido}`
      : `usuario_${usuarioId}`;

    // Buscar datos de la cuota
    const { data: cuotaData, error: cuotaError } = await supabase
      .from("cuotas")
      .select("descripcion")
      .eq("id", cuotaId)
      .single();

    if (cuotaError) throw cuotaError;

    const descripcionCuota = cuotaData ? cuotaData.descripcion : `cuota_${cuotaId}`;

    // 🔹 Normalizar strings
    const cleanNombre = nombreParticipante
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_");

    const cleanDescripcion = descripcionCuota
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_");

    const safeFileName = file.name
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_");

    // 🔹 Nombre único para el archivo
    const filePath = `${cleanNombre}/${cleanDescripcion}-${Date.now()}-${safeFileName}`;

    // 🔹 Subir al bucket "comprobantes"
    const { error: uploadError } = await supabase.storage
      .from("comprobantes")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 🔹 Guardar SOLO la ruta en la tabla comprobantes_pago
    const { error: dbError } = await supabase.from("comprobantes_pago").insert([
      {
        usuario_id: usuarioId,
        cuota_id: cuotaId,
        archivo_url: filePath,   // 👈 Guardamos la ruta, NO la signed URL
        tipo_mime: file.type,
      },
    ]);

    if (dbError) throw dbError;

    return { success: true, path: filePath };
  } catch (err) {
    console.error("Error al subir comprobante:", err.message);
    return { success: false, error: err.message };
  }
}

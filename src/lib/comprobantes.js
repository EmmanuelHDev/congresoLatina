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

    // Normalizar strings para que no tengan espacios raros
    const cleanNombre = nombreParticipante.replace(/\s+/g, "_");
    const cleanDescripcion = descripcionCuota.replace(/\s+/g, "_");

    // Nombre único para el archivo
    const filePath = `comprobantes/${cleanNombre}/${cleanDescripcion}-${Date.now()}-${file.name}`;

    // Subir al bucket "comprobantes"
    const { error: uploadError } = await supabase.storage
      .from("comprobantes")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Obtener URL pública
    const { data } = supabase.storage.from("comprobantes").getPublicUrl(filePath);
    const archivoUrl = data.publicUrl;

    // Guardar registro en la tabla comprobantes_pago
    const { error: dbError } = await supabase.from("comprobantes_pago").insert([
      {
        usuario_id: usuarioId,
        cuota_id: cuotaId,
        archivo_url: archivoUrl,
        tipo_mime: file.type,
        nombre_archivo: filePath, // 👈 opcional: guardas la ruta del storage
      },
    ]);

    if (dbError) throw dbError;

    return { success: true, url: archivoUrl };
  } catch (err) {
    console.error("Error al subir comprobante:", err.message);
    return { success: false, error: err.message };
  }
}

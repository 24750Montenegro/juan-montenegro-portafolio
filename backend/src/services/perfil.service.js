// Logica de negocio para el perfil: contacto y PDF del portafolio.
// El PDF se guarda en Supabase Storage; en la base solo queda la URL y su ruta.
import { obtenerPerfil, crearPerfil, actualizarPerfil } from '../models/perfil.model.js';
import { subirArchivo, eliminarArchivo } from './storage.service.js';

// Devuelve el perfil, creandolo vacio la primera vez
export const obtener = async () => (await obtenerPerfil()) || crearPerfil();

// Actualiza el contacto y reemplaza el PDF si llega uno nuevo
export const actualizar = async (datos, archivo) => {
  const perfil = await obtener();
  const cambios = { ...datos };
  if (archivo) {
    const ruta = `perfil/portafolio-${Date.now()}.pdf`;
    const subido = await subirArchivo(archivo.buffer, ruta, 'application/pdf');
    cambios.pdfUrl = subido.url;
    cambios.pdfId = subido.path;
    if (perfil.pdf_id) await eliminarArchivo(perfil.pdf_id);
  }
  return actualizarPerfil(perfil.id, cambios);
};

// Elimina el PDF del perfil y su archivo en Supabase Storage
export const eliminarPdf = async () => {
  const perfil = await obtener();
  if (perfil.pdf_id) await eliminarArchivo(perfil.pdf_id);
  return actualizarPerfil(perfil.id, { pdfUrl: null, pdfId: null });
};

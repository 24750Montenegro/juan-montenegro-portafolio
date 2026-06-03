// Logica de negocio para el perfil: contacto y PDF del portafolio
import { obtenerPerfil, crearPerfil, actualizarPerfil } from '../models/perfil.model.js';
import { subirArchivo, eliminarArchivo } from './upload.service.js';

const CARPETA = 'portafolio/perfil';

// Devuelve el perfil, creandolo vacio la primera vez
export const obtener = async () => (await obtenerPerfil()) || crearPerfil();

// Actualiza el contacto y reemplaza el PDF si llega uno nuevo
export const actualizar = async (datos, archivo) => {
  const perfil = await obtener();
  const cambios = { ...datos };
  if (archivo) {
    const subido = await subirArchivo(archivo.buffer, CARPETA, 'raw');
    cambios.pdfUrl = subido.url;
    cambios.pdfId = subido.id;
    await eliminarArchivo(perfil.pdf_id, 'raw');
  }
  return actualizarPerfil(perfil.id, cambios);
};

// Elimina el PDF del perfil y su archivo en Cloudinary
export const eliminarPdf = async () => {
  const perfil = await obtener();
  if (perfil.pdf_id) await eliminarArchivo(perfil.pdf_id, 'raw');
  return actualizarPerfil(perfil.id, { pdfUrl: null, pdfId: null });
};

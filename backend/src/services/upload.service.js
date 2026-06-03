// Servicio para subir y eliminar imagenes de proyectos en Cloudinary
import { cloudinary } from '../config/cloudinary.js';

const CARPETA = 'portafolio/proyectos';

// Sube un buffer de imagen a la carpeta dada y devuelve url segura e id publico
export const subirImagen = (buffer, carpeta = CARPETA) =>
  new Promise((resolve, reject) => {
    const flujo = cloudinary.uploader.upload_stream(
      { folder: carpeta, resource_type: 'image' },
      (error, resultado) => {
        if (error) return reject(error);
        resolve({ url: resultado.secure_url, id: resultado.public_id });
      },
    );
    flujo.end(buffer);
  });

// Elimina una imagen previa de Cloudinary si tiene id publico
export const eliminarImagen = async (idPublico) => {
  if (!idPublico) return;
  await cloudinary.uploader.destroy(idPublico);
};

// Sube un archivo generico (p.ej. PDF) como recurso raw
export const subirArchivo = (buffer, carpeta, tipo = 'raw') =>
  new Promise((resolve, reject) => {
    const flujo = cloudinary.uploader.upload_stream(
      { folder: carpeta, resource_type: tipo },
      (error, resultado) => {
        if (error) return reject(error);
        resolve({ url: resultado.secure_url, id: resultado.public_id });
      },
    );
    flujo.end(buffer);
  });

// Elimina un recurso de Cloudinary indicando su tipo (image, raw, ...)
export const eliminarArchivo = async (idPublico, tipo = 'image') => {
  if (!idPublico) return;
  await cloudinary.uploader.destroy(idPublico, { resource_type: tipo });
};

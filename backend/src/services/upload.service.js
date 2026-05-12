// Servicio para subir y eliminar imagenes de proyectos en Cloudinary
import { cloudinary } from '../config/cloudinary.js';

const CARPETA = 'portafolio/proyectos';

// Sube un buffer de imagen y devuelve su url segura e id publico
export const subirImagen = (buffer) =>
  new Promise((resolve, reject) => {
    const flujo = cloudinary.uploader.upload_stream(
      { folder: CARPETA, resource_type: 'image' },
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

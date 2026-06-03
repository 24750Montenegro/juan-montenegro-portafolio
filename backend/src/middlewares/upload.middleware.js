// Configuracion de Multer para recibir una imagen en memoria
import multer from 'multer';

const LIMITE_TAMANO = 5 * 1024 * 1024;

// Solo se aceptan archivos de tipo imagen
const filtroArchivo = (req, archivo, cb) => {
  if (archivo.mimetype.startsWith('image/')) return cb(null, true);
  cb(Object.assign(new Error('Solo se permiten imagenes'), {
    status: 400,
    publico: 'Solo se permiten imagenes',
  }));
};

export const subida = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMITE_TAMANO },
  fileFilter: filtroArchivo,
});

const LIMITE_PDF = 10 * 1024 * 1024;

// Solo se aceptan archivos PDF
const filtroPdf = (req, archivo, cb) => {
  if (archivo.mimetype === 'application/pdf') return cb(null, true);
  cb(Object.assign(new Error('Solo se permiten archivos PDF'), {
    status: 400,
    publico: 'Solo se permiten archivos PDF',
  }));
};

export const subidaPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMITE_PDF },
  fileFilter: filtroPdf,
});

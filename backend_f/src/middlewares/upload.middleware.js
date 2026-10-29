const multer = require('multer');

// Almacenamiento en memoria para permitir transmisión segura hacia Supabase Storage
const storage = multer.memoryStorage();

// Tipos MIME permitidos para evidencias universitarias (imágenes y PDFs)
const MIME_TYPES_PERMITIDOS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const fileFilter = (req, file, cb) => {
  if (MIME_TYPES_PERMITIDOS.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan JPEG, PNG, WEBP y PDF.'), false);
  }
};

const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Máximo 5 MB por archivo
    files: 5, // Máximo 5 archivos por petición
  },
  fileFilter,
});

module.exports = uploadMiddleware;

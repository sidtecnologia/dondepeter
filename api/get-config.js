import { fileURLToPath } from 'url';
import path from 'path';


export default (req, res) => {
  
  const SB_URL = process.env.SB_URL;
  const SB_ANON_KEY = process.env.SB_ANON_KEY;

  if (!SB_URL || !SB_ANON_KEY) {
    
    return res.status(500).json({ 
      error: 'Variables de entorno de SB faltantes en la configuración del servidor.',
      url: null,
      anonKey: null
    });
  }

  // Devuelve las claves públicas como JSON
  res.status(200).json({
    url: SB_URL,
    anonKey: SB_ANON_KEY
  });
};
export default (req, res) => {
  
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

 
  console.log('--- Diagnóstico API Config ---');
  console.log('URL Cargada:', !!SUPABASE_URL); 
  console.log('ANON_KEY Cargada:', !!SUPABASE_ANON_KEY);
  console.log('------------------------------');

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    
    return res.status(500).json({ 
      error: 'Variables de entorno de Supabase faltantes en la configuración de Vercel.',
      url: null,
      anonKey: null
    });
  }


  res.status(200).json({
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY
  });
};

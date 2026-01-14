// Configuración Maestra
const config = {
  // 1. Pega aquí tu URL de Supabase (Project Settings > API)
  supabaseUrl: 'https://lsifmouszhweotcbljck.supabase.co',
  
  // 2. Pega aquí tu Clave ANON/PUBLIC (Project Settings > API)
  supabaseAnonKey: 'sb_publishable_QWATkTcswugRlkPrxWTcTw_WpGsQM4f',
  
  // 3. ESTA ES LA CLAVE: Le decimos al sistema "Sí, estamos conectados"
  hasSupabaseConfig: true,
  
  // Esto evita errores de IA (déjalo así)
  geminiApiKey: '',
  hasGeminiConfig: true
};

export default config;
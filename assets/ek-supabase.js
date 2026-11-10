/* ============================================================================
   TALLER CREATIVO EK · Conexión pública a Supabase  (assets/ek-supabase.js)
   ----------------------------------------------------------------------------
   Datos PÚBLICOS y seguros (la anon key está protegida por Row Level Security).
   NUNCA pongas aquí la service role key. La usa assets/ek-live.js para leer en
   tiempo real: stock, reseñas, calificación y ventas.
   ========================================================================== */
window.EK_SUPABASE = {
  url: "https://vqefszeokokdbykzwloq.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxZWZzemVva29rZGJ5a3p3bG9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyODQzODMsImV4cCI6MjEwMzg2MDM4M30.HkT_ZDR3EV_euC3WkgA-Yzfbe508jPyeCKmrgum2_8s",
  activo: true // pon false para desactivar la lectura en vivo (sitio 100% estático)
};

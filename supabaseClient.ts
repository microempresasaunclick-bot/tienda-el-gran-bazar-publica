import { createClient } from '@supabase/supabase-js'

// Estas líneas buscan tus llaves secretas de forma segura
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

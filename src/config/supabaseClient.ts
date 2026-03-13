import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey: string = import.meta.env.VITE_SUPABASE_KEY as string

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey)
console.log(import.meta.env.VITE_SUPABASE_URL)

export default supabase;
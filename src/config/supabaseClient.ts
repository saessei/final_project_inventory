import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl: string = process.env.SUPABASE_URL as string
const supabaseKey: string = process.env.SUPABASE_KEY as string

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey)

export default supabase;
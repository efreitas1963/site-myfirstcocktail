import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vztlsfppfesdqhjzdfpj.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_EzW-ynXhs_1XWBTiL0osCw_n2Zs4nm_'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

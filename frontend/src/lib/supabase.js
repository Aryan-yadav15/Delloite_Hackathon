'use client'

import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Export the client for client components
export const supabase = supabaseClient

// Hook for client components
export const useSupabase = () => {
  return supabaseClient
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://xzlqidvpcbefamrxiffw.supabase.co";   // from Supabase dashboard
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6bHFpZHZwY2JlZmFtcnhpZmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTgxMzQsImV4cCI6MjA3MTg3NDEzNH0.lC170sAgHBPF4UiSuCDClCv1u5taNA041xLK5jIsAsA";  // from Supabase dashboard

// ✅ Properly pass the auth options here
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,   // prevents storing session in localStorage
    autoRefreshToken: false, // prevents auto-refresh
  },
});

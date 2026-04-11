import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase Project URL and Anon Key
export const supabaseUrl = 'https://vnxxqjdfcvwiuwlstebu.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZueHhxamRmY3Z3aXV3bHN0ZWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NTMwNzgsImV4cCI6MjA4OTIyOTA3OH0.rtQy7iBZMxgv5ZDiok1h6mp3Ngexa1WYlEnhQy6PiAo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

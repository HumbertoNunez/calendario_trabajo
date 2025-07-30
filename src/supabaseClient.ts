import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://kouzrwfdwqofjydtdrmq.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvdXpyd2Zkd3FvZmp5ZHRkcm1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NDc5NzIsImV4cCI6MjA2OTQyMzk3Mn0.ijjPqGYA10T9i_HZWM2w6JFAk2qz_EBeX_LcAvBcNTo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

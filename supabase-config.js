// supabase-config.js
// Replace with your Supabase project details
export const supabaseUrl = 'https://bfwnkrhgsdxghsydiisu.supabase.co';
export const supabaseAnonKey = 'sb_publishable_u-t29UICVHzbNWXkUdv7vQ_MrQ5Wr-e';

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.44.0/dist/esm/index.js';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

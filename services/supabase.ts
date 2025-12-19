
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://efiaorgzfbwcjlyqtxkf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmaWFvcmd6ZmJ3Y2pseXF0eGtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMTk3NjksImV4cCI6MjA4MTY5NTc2OX0.8GpSi8oQtWGvFhgzgbsHKAgr2Wx__GwuNSOuoVpJBXk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Book {
  id: string;
  title: string;
  page_count: number;
  created_at: string;
  updated_at?: string;
}

export interface BookPage {
  id: string;
  book_id: string;
  page_number: number;
  file_path: string;
  created_at: string;
}

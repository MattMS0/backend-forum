import { createClient } from '@supabase/supabase-js';

// URL do Supabase e chave de API (encontre essas informações no dashboard do Supabase)
const supabaseUrl = 'https://fyfrlfhqjhrkjhkgtdqh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5ZnJsZmhxamhya2poa2d0ZHFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY1ODE3MjcsImV4cCI6MjA0MjE1NzcyN30.bzJyOWpYVslGLrA-Ac3hCcBZxgPv7_3_pzYDBoqqZpg';

// Inicializa o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

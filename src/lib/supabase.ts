import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (import.meta.env.PROD && (!supabaseUrl || !supabaseAnonKey)) {
  console.error('Missing Supabase environment variables');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  userId: string;
  order_number: string;
  package_tier: 'basic' | 'standard' | 'custom';
  design_data: Record<string, any>;
  status: 'pending' | 'confirmed' | 'in_production' | 'completed' | 'delivered';
  total_price: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: Record<string, any> | null;
  created_at: string;
  updated_at: string;
};

export type DraftDesign = {
  id: string;
  userId: string;
  name: string;
  package_tier: 'basic' | 'standard' | 'custom';
  design_data: Record<string, any>;
  preview_image: string | null;
  created_at: string;
  updated_at: string;
};

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 数据库类型定义
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          username: string;
          avatar_url?: string;
          subscription_status: 'free' | 'premium';
          subscription_expiry?: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          username: string;
          avatar_url?: string;
          subscription_status?: 'free' | 'premium';
          subscription_expiry?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          username?: string;
          avatar_url?: string;
          subscription_status?: 'free' | 'premium';
          subscription_expiry?: string;
        };
      };
      brushes: {
        Row: {
          id: string;
          title: string;
          description: string;
          preview_image_url: string;
          category_id: string;
          creator_id: string;
          created_at: string;
          download_count: number;
          is_featured: boolean;
          is_free: boolean;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          preview_image_url: string;
          category_id: string;
          creator_id: string;
          created_at?: string;
          download_count?: number;
          is_featured?: boolean;
          is_free?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          preview_image_url?: string;
          category_id?: string;
          creator_id?: string;
          created_at?: string;
          download_count?: number;
          is_featured?: boolean;
          is_free?: boolean;
        };
      };
      brush_downloads: {
        Row: {
          id: string;
          brush_id: string;
          storage_link: string;
          file_size: string;
          version: string;
        };
        Insert: {
          id?: string;
          brush_id: string;
          storage_link: string;
          file_size: string;
          version: string;
        };
        Update: {
          id?: string;
          brush_id?: string;
          storage_link?: string;
          file_size?: string;
          version?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          display_order: number;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description: string;
          display_order?: number;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          display_order?: number;
        };
      };
      comments: {
        Row: {
          id: string;
          brush_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          brush_id: string;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          brush_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
        };
      };
      ratings: {
        Row: {
          id: string;
          brush_id: string;
          user_id: string;
          score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          brush_id: string;
          user_id: string;
          score: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          brush_id?: string;
          user_id?: string;
          score?: number;
          created_at?: string;
        };
      };
    };
  };
}; 
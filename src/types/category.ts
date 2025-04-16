// Define the Category type
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
  brush_count?: number;
  created_at?: string;
  updated_at?: string;
} 
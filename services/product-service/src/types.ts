export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  brand: string;
  inventory_quantity: number;
  category: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

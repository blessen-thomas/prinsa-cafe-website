// ============================================================
// Prinsa Café — TypeScript Type Definitions
// ============================================================

// --- Menu ---
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Dish {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id: string;
  image_url?: string;
  is_veg: boolean;
  is_featured: boolean;
  is_available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  category?: Category;
  average_rating?: number;
  review_count?: number;
}

// --- Reviews ---
export interface Review {
  id: string;
  customer_name: string;
  email?: string;
  rating: number;
  review_text: string;
  dish_id?: string;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  dish?: Pick<Dish, 'id' | 'name' | 'image_url'>;
}

// --- Gallery ---
export interface GalleryImage {
  id: string;
  image_url: string;
  alt_text?: string;
  caption?: string;
  category: 'interior' | 'exterior' | 'food' | 'events' | 'general';
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

// --- Settings ---
export interface BusinessHours {
  day: string;
  open: string;
  close: string;
  is_closed: boolean;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  type: 'text' | 'json' | 'boolean' | 'number';
  label: string;
  group: string;
  created_at: string;
  updated_at: string;
}

// --- Contact ---
export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// --- Admin ---
export interface Admin {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'super_admin';
  created_at: string;
}

// --- API Response Types ---
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// --- Form Types ---
export interface ReviewFormData {
  customer_name: string;
  email?: string;
  rating: number;
  review_text: string;
  dish_id?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface DishFormData {
  name: string;
  description?: string;
  price: number;
  category_id: string;
  image_url?: string;
  is_veg: boolean;
  is_featured: boolean;
  is_available: boolean;
  sort_order: number;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  is_visible: boolean;
}

// --- CSV Import ---
export interface DishCsvRow {
  name: string;
  description?: string;
  price: string;
  category: string;
  is_veg: string;       // 'true' | 'false' | 'yes' | 'no' | '1' | '0'
  is_featured?: string;
  is_available?: string;
  sort_order?: string;
}

// --- Navigation ---
export interface NavLink {
  label: string;
  href: string;
}

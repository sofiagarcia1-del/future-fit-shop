/**
 * Tipos alineados con el modelo draw.io / supabase/migrations
 */

export type DbStatus = {
  id: number;
  name: string;
};

export type DbGender = {
  id: number;
  name: string;
};

export type DbRol = {
  id: number;
  name: string;
};

export type DbUser = {
  id: number;
  auth_user_id: string | null;
  id_status: number;
  id_gender: number | null;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  email: string;
  phone: string | null;
  created_at: string;
  height: number | null;
  weight: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
};

export type DbUserPhoto = {
  id: number;
  id_user: number;
  photofront_url: string | null;
  photoback_url: string | null;
  is_primary: boolean;
  created_at: string;
};

export type DbBrand = {
  id: number;
  name: string;
  created_at: string;
};

export type DbProduct = {
  id: number;
  id_brand: number;
  id_status: number;
  id_color: number | null;
  id_size: number | null;
  id_suppliers: number | null;
  name: string;
  description: string | null;
  created_at: string;
  unit_price: number;
};

export type DbProductCatalogRow = {
  id: number;
  name: string;
  description: string | null;
  unit_price: number;
  created_at: string;
  brand: string;
  category: string;
  image_url: string;
  color_name: string | null;
  color_hex: string | null;
  size_name: string | null;
};

export type DbOrder = {
  id: number;
  id_user: number;
  id_status: number;
  id_payment_method: number | null;
  total_amount: number;
  address: string;
  created_at: string;
};

export type DbProductXOrder = {
  id: number;
  id_order: number;
  id_product: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

export type DbNotification = {
  id: number;
  id_user: number;
  id_status: number;
  id_notification_type: number;
  message: string;
  sent_at: string;
};

export type UserProfileUpdate = Partial<
  Pick<DbUser, "first_name" | "last_name" | "phone" | "birth_date" | "id_gender" | "height" | "weight" | "chest" | "waist" | "hips">
>;

export type DbTryOnResult = {
  id: number;
  id_user: number;
  id_product: number;
  original_user_image: string | null;
  garment_image: string;
  generated_image: string | null;
  fashn_prediction_id: string | null;
  id_status: number;
  error_message: string | null;
  saved: boolean;
  created_at: string;
};

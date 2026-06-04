-- ============================================================
-- Prinsa Café — Supabase Database Schema
-- ============================================================
-- Run this SQL in your Supabase SQL Editor to set up the database.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_visible ON categories(is_visible);

-- ============================================================
-- DISHES TABLE
-- ============================================================
CREATE TABLE dishes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  image_url TEXT,
  is_veg BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_dishes_category ON dishes(category_id);
CREATE INDEX idx_dishes_featured ON dishes(is_featured);
CREATE INDEX idx_dishes_available ON dishes(is_available);
CREATE INDEX idx_dishes_veg ON dishes(is_veg);

-- ============================================================
-- REVIEWS TABLE (linked to dishes)
-- ============================================================
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  dish_id UUID REFERENCES dishes(id) ON DELETE SET NULL,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reviews_approved ON reviews(is_approved);
CREATE INDEX idx_reviews_featured ON reviews(is_featured);
CREATE INDEX idx_reviews_dish ON reviews(dish_id);

-- ============================================================
-- GALLERY TABLE
-- ============================================================
CREATE TABLE gallery (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  caption VARCHAR(500),
  category VARCHAR(50) DEFAULT 'general'
    CHECK (category IN ('interior', 'exterior', 'food', 'events', 'general')),
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_gallery_visible ON gallery(is_visible);
CREATE INDEX idx_gallery_category ON gallery(category);

-- ============================================================
-- ADMINS TABLE
-- ============================================================
CREATE TABLE admins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- CONTACT SUBMISSIONS TABLE
-- ============================================================
CREATE TABLE contact_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(200),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_contact_read ON contact_submissions(is_read);

-- ============================================================
-- SITE SETTINGS TABLE (for business hours, etc.)
-- ============================================================
CREATE TABLE site_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'json', 'boolean', 'number')),
  label VARCHAR(200) NOT NULL,
  "group" VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_settings_key ON site_settings(key);
CREATE INDEX idx_settings_group ON site_settings("group");

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dishes_updated_at
  BEFORE UPDATE ON dishes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_updated_at
  BEFORE UPDATE ON gallery
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- CATEGORIES: Public read (visible only)
CREATE POLICY "Public can view visible categories"
  ON categories FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Admins can do everything with categories"
  ON categories FOR ALL
  USING (auth.role() = 'service_role');

-- DISHES: Public read (available only)
CREATE POLICY "Public can view available dishes"
  ON dishes FOR SELECT
  USING (is_available = true);

CREATE POLICY "Admins can do everything with dishes"
  ON dishes FOR ALL
  USING (auth.role() = 'service_role');

-- REVIEWS: Public read (approved), public insert
CREATE POLICY "Public can view approved reviews"
  ON reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Public can submit reviews"
  ON reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can do everything with reviews"
  ON reviews FOR ALL
  USING (auth.role() = 'service_role');

-- GALLERY: Public read (visible only)
CREATE POLICY "Public can view visible gallery"
  ON gallery FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Admins can do everything with gallery"
  ON gallery FOR ALL
  USING (auth.role() = 'service_role');

-- ADMINS: Service role only
CREATE POLICY "Only service role can access admins"
  ON admins FOR ALL
  USING (auth.role() = 'service_role');

-- CONTACT: Public insert, service role read
CREATE POLICY "Public can submit contact forms"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage contact submissions"
  ON contact_submissions FOR ALL
  USING (auth.role() = 'service_role');

-- SETTINGS: Public read, service role write
CREATE POLICY "Public can view settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON site_settings FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Run these in Supabase Dashboard > Storage, or via SQL:

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('gallery-images', 'gallery-images', true),
  ('dish-images', 'dish-images', true),
  ('logo-assets', 'logo-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, authenticated upload
CREATE POLICY "Public read gallery images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery-images');

CREATE POLICY "Admin upload gallery images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gallery-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admin delete gallery images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'gallery-images' AND auth.role() = 'authenticated');

CREATE POLICY "Public read dish images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'dish-images');

CREATE POLICY "Admin upload dish images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'dish-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admin delete dish images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'dish-images' AND auth.role() = 'authenticated');

CREATE POLICY "Public read logo assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'logo-assets');

-- ============================================================
-- SEED DATA: Default Site Settings
-- ============================================================
INSERT INTO site_settings (key, value, type, label, "group") VALUES
  ('business_hours', '[{"day":"Monday","open":"08:00","close":"22:00","is_closed":false},{"day":"Tuesday","open":"08:00","close":"22:00","is_closed":false},{"day":"Wednesday","open":"08:00","close":"22:00","is_closed":false},{"day":"Thursday","open":"08:00","close":"22:00","is_closed":false},{"day":"Friday","open":"08:00","close":"22:00","is_closed":false},{"day":"Saturday","open":"08:00","close":"22:00","is_closed":false},{"day":"Sunday","open":"09:00","close":"22:00","is_closed":false}]', 'json', 'Business Hours', 'hours'),
  ('whatsapp_number', '917583368648', 'text', 'WhatsApp Number', 'contact'),
  ('phone_number', '+917583368648', 'text', 'Phone Number', 'contact'),
  ('email', 'hello@prinsacafe.com', 'text', 'Email Address', 'contact'),
  ('address', 'Sacred Hearts Road, TC Palya, Krishnarajapuram, Bengaluru, Karnataka 560036', 'text', 'Address', 'contact'),
  ('instagram_url', 'https://instagram.com/prinsacafe', 'text', 'Instagram URL', 'social'),
  ('facebook_url', 'https://facebook.com/prinsacafe', 'text', 'Facebook URL', 'social'),
  ('google_maps_url', 'https://maps.google.com/?q=Prinsa+Cafe+TC+Palya+Krishnarajapuram+Bengaluru', 'text', 'Google Maps URL', 'social')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- VIEW: Dish with average rating
-- ============================================================
CREATE OR REPLACE VIEW dishes_with_ratings AS
SELECT
  d.*,
  c.name AS category_name,
  c.slug AS category_slug,
  COALESCE(AVG(r.rating), 0) AS average_rating,
  COUNT(r.id) AS review_count
FROM dishes d
LEFT JOIN categories c ON d.category_id = c.id
LEFT JOIN reviews r ON r.dish_id = d.id AND r.is_approved = true
GROUP BY d.id, c.name, c.slug;

-- ============================================================
-- NOTES FOR CSV IMPORT
-- ============================================================
-- To import dishes from CSV:
-- 1. Ensure categories exist first (create them or use the admin panel)
-- 2. CSV columns: name, description, price, category (slug), is_veg, is_featured, is_available, sort_order
-- 3. Use the admin panel's CSV import feature, or run:
--
-- COPY dishes (name, description, price, category_id, is_veg, is_featured, is_available, sort_order)
-- FROM '/path/to/dishes.csv'
-- WITH (FORMAT csv, HEADER true);
--
-- Or use the Supabase Dashboard > Table Editor > Import CSV

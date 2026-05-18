-- =====================================================
-- TRODEC Database Schema
-- Optimized for Supabase (PostgreSQL)
-- =====================================================

-- =====================================================
-- 1. ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('consumer', 'expert', 'brand_admin', 'admin');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE pitch_status AS ENUM ('pending', 'accepted', 'declined', 'shipped', 'delivered', 'posted');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE product_status AS ENUM ('draft', 'active', 'inactive');


-- =====================================================
-- 2. PROFILES (Base user table - matches backend)
-- =====================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'consumer',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);


-- =====================================================
-- 3. EXPERT DETAILS (matches backend)
-- =====================================================

CREATE TABLE expert_details (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  expertise TEXT[] DEFAULT '{}',
  linkedin_url TEXT,
  bio TEXT,
  years_of_experience INT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_date TIMESTAMPTZ,
  rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_reviews INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expert_details_verified ON expert_details(is_verified);
CREATE INDEX idx_expert_details_expertise ON expert_details USING GIN(expertise);


-- =====================================================
-- 4. BRAND DETAILS (matches backend)
-- =====================================================

CREATE TABLE brand_details (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  business_type TEXT,
  website_url TEXT,
  description TEXT,
  logo_url TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_brand_details_verified ON brand_details(is_verified);


-- =====================================================
-- 5. CATEGORIES
-- =====================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);


-- =====================================================
-- 6. COMMUNITIES
-- =====================================================

CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  cover_image_url TEXT,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  member_count INT NOT NULL DEFAULT 0,
  expert_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_communities_slug ON communities(slug);
CREATE INDEX idx_communities_category ON communities(category_id);


-- =====================================================
-- 7. COMMUNITY MEMBERS
-- =====================================================

CREATE TABLE community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  is_expert BOOLEAN NOT NULL DEFAULT FALSE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, community_id)
);

CREATE INDEX idx_community_members_user ON community_members(user_id);
CREATE INDEX idx_community_members_community ON community_members(community_id);


-- =====================================================
-- 8. PRODUCTS
-- =====================================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brand_details(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  compare_at_price DECIMAL(10,2) CHECK (compare_at_price >= 0),
  sku TEXT,
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  status product_status NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  average_rating DECIMAL(2,1) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
  review_count INT NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_slug ON products(slug);


-- =====================================================
-- 9. PRODUCT IMAGES
-- =====================================================

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE UNIQUE INDEX idx_product_images_primary ON product_images(product_id) WHERE is_primary = TRUE;


-- =====================================================
-- 10. CART ITEMS
-- =====================================================

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_cart_items_user ON cart_items(user_id);


-- =====================================================
-- 11. ADDRESSES
-- =====================================================

CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON addresses(user_id);


-- =====================================================
-- 12. ORDERS
-- =====================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status order_status NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  shipping_name TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  shipping_address_line1 TEXT NOT NULL,
  shipping_address_line2 TEXT,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  shipping_country TEXT NOT NULL DEFAULT 'India',
  tracking_number TEXT,
  tracking_url TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);


-- =====================================================
-- 13. ORDER ITEMS
-- =====================================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  brand_id UUID NOT NULL REFERENCES brand_details(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  product_image_url TEXT,
  product_price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  status order_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_order_items_brand ON order_items(brand_id);


-- =====================================================
-- 14. PITCHES (Brand → Expert)
-- =====================================================

CREATE TABLE pitches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brand_details(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  expert_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status pitch_status NOT NULL DEFAULT 'pending',
  message TEXT,
  offer_details TEXT,
  requirements TEXT,
  expert_response TEXT,
  responded_at TIMESTAMPTZ,
  shipping_address TEXT,
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  post_id UUID,
  posting_deadline DATE,
  posted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pitches_brand ON pitches(brand_id);
CREATE INDEX idx_pitches_expert ON pitches(expert_id);
CREATE INDEX idx_pitches_community ON pitches(community_id);
CREATE INDEX idx_pitches_status ON pitches(status);


-- =====================================================
-- 15. POSTS (Expert Reviews)
-- =====================================================

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  pitch_id UUID REFERENCES pitches(id) ON DELETE SET NULL,
  title TEXT,
  content TEXT NOT NULL,
  rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  likes_count INT NOT NULL DEFAULT 0,
  comments_count INT NOT NULL DEFAULT 0,
  pros TEXT[],
  cons TEXT[],
  verdict TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_expert ON posts(expert_id);
CREATE INDEX idx_posts_product ON posts(product_id);
CREATE INDEX idx_posts_community ON posts(community_id);


-- =====================================================
-- 16. POST MEDIA
-- =====================================================

CREATE TABLE post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image',
  alt_text TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_post_media_post ON post_media(post_id);


-- =====================================================
-- 17. POST LIKES
-- =====================================================

CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_likes_post ON post_likes(post_id);


-- =====================================================
-- 18. NOTIFICATIONS
-- =====================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = FALSE;


-- =====================================================
-- 19. TRIGGERS & FUNCTIONS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_expert_details_updated_at BEFORE UPDATE ON expert_details FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_brand_details_updated_at BEFORE UPDATE ON brand_details FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON communities FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_pitches_updated_at BEFORE UPDATE ON pitches FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'TG' || TO_CHAR(NOW(), 'YYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Update community member counts
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities SET
      member_count = member_count + 1,
      expert_count = expert_count + (CASE WHEN NEW.is_expert THEN 1 ELSE 0 END)
    WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities SET
      member_count = GREATEST(member_count - 1, 0),
      expert_count = GREATEST(expert_count - (CASE WHEN OLD.is_expert THEN 1 ELSE 0 END), 0)
    WHERE id = OLD.community_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_community_member_change AFTER INSERT OR DELETE ON community_members FOR EACH ROW EXECUTE FUNCTION update_community_member_count();

-- Update product rating from posts
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products SET
    average_rating = COALESCE((SELECT AVG(rating) FROM posts WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) AND is_published = TRUE), 0),
    review_count = (SELECT COUNT(*) FROM posts WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) AND is_published = TRUE)
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_post_change AFTER INSERT OR UPDATE OR DELETE ON posts FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Update post likes count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_post_like_change AFTER INSERT OR DELETE ON post_likes FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();


-- =====================================================
-- 20. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Profiles viewable by everyone" ON profiles FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role full access to profiles" ON profiles FOR ALL USING (auth.role() = 'service_role');

-- EXPERT DETAILS
CREATE POLICY "Verified experts viewable" ON expert_details FOR SELECT USING (is_verified = TRUE OR auth.uid() = id);
CREATE POLICY "Experts can update own details" ON expert_details FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role full access to expert_details" ON expert_details FOR ALL USING (auth.role() = 'service_role');

-- BRAND DETAILS
CREATE POLICY "Verified brands viewable" ON brand_details FOR SELECT USING (is_verified = TRUE OR auth.uid() = id);
CREATE POLICY "Brands can update own details" ON brand_details FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role full access to brand_details" ON brand_details FOR ALL USING (auth.role() = 'service_role');

-- COMMUNITIES
CREATE POLICY "Active communities viewable" ON communities FOR SELECT USING (is_active = TRUE);

-- COMMUNITY MEMBERS
CREATE POLICY "Community members viewable" ON community_members FOR SELECT USING (TRUE);
CREATE POLICY "Users can join communities" ON community_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave communities" ON community_members FOR DELETE USING (auth.uid() = user_id);

-- PRODUCTS
CREATE POLICY "Active products viewable" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Brand owners can manage products" ON products FOR ALL USING (brand_id = auth.uid());

-- PRODUCT IMAGES
CREATE POLICY "Product images viewable" ON product_images FOR SELECT USING (TRUE);

-- CART ITEMS
CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);

-- ADDRESSES
CREATE POLICY "Users can manage own addresses" ON addresses FOR ALL USING (auth.uid() = user_id);

-- ORDERS
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ORDER ITEMS
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
CREATE POLICY "Brands can view their order items" ON order_items FOR SELECT USING (brand_id = auth.uid());

-- PITCHES
CREATE POLICY "Experts can view own pitches" ON pitches FOR SELECT USING (auth.uid() = expert_id);
CREATE POLICY "Brands can view sent pitches" ON pitches FOR SELECT USING (brand_id = auth.uid());
CREATE POLICY "Brands can create pitches" ON pitches FOR INSERT WITH CHECK (brand_id = auth.uid());
CREATE POLICY "Experts can respond to pitches" ON pitches FOR UPDATE USING (auth.uid() = expert_id);
CREATE POLICY "Brands can update pitch shipping" ON pitches FOR UPDATE USING (brand_id = auth.uid());

-- POSTS
CREATE POLICY "Published posts viewable" ON posts FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Experts can manage own posts" ON posts FOR ALL USING (auth.uid() = expert_id);

-- POST MEDIA
CREATE POLICY "Post media viewable" ON post_media FOR SELECT USING (TRUE);

-- POST LIKES
CREATE POLICY "Post likes viewable" ON post_likes FOR SELECT USING (TRUE);
CREATE POLICY "Users can like posts" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);


-- =====================================================
-- 21. SEED DATA
-- =====================================================

INSERT INTO categories (name, slug, description, display_order) VALUES
  ('Technology', 'technology', 'Gadgets, software, and tech accessories', 1),
  ('Audio & Music', 'audio-music', 'Headphones, speakers, and music gear', 2),
  ('Home & Living', 'home-living', 'Home decor, furniture, and appliances', 3),
  ('Fashion', 'fashion', 'Clothing, accessories, and footwear', 4),
  ('Health & Fitness', 'health-fitness', 'Fitness equipment and wellness', 5),
  ('Beauty', 'beauty', 'Skincare, makeup, and grooming', 6),
  ('Food & Beverage', 'food-beverage', 'Gourmet food and kitchen items', 7),
  ('Travel & Outdoor', 'travel-outdoor', 'Travel gear and outdoor equipment', 8),
  ('Gaming', 'gaming', 'Video games and gaming accessories', 9),
  ('Photography', 'photography', 'Cameras and photography equipment', 10);

INSERT INTO communities (name, slug, description, category_id) VALUES
  ('Audiophiles United', 'audiophiles-united', 'High-fidelity audio enthusiasts', (SELECT id FROM categories WHERE slug = 'audio-music')),
  ('Tech Reviewers', 'tech-reviewers', 'In-depth tech reviews', (SELECT id FROM categories WHERE slug = 'technology')),
  ('Home Chefs', 'home-chefs', 'Cooking enthusiasts sharing recipes', (SELECT id FROM categories WHERE slug = 'food-beverage')),
  ('Fitness Warriors', 'fitness-warriors', 'Fitness enthusiasts and gear reviews', (SELECT id FROM categories WHERE slug = 'health-fitness')),
  ('Skincare Addicts', 'skincare-addicts', 'Skincare routines and product reviews', (SELECT id FROM categories WHERE slug = 'beauty')),
  ('Gamers Hub', 'gamers-hub', 'Gaming news and reviews', (SELECT id FROM categories WHERE slug = 'gaming'));


-- =====================================================
-- DONE! Tables: 18 | Triggers: 12 | Policies: 30+
-- =====================================================

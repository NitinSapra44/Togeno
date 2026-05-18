-- =====================================================
-- Service Role Policies
-- These allow the backend (using service_role key) to bypass RLS
-- =====================================================

-- PRODUCTS - Allow service_role full access
CREATE POLICY "Service role full access to products" 
ON products FOR ALL 
USING (auth.role() = 'service_role');

-- COMMUNITIES - Allow service_role full access  
CREATE POLICY "Service role full access to communities" 
ON communities FOR ALL 
USING (auth.role() = 'service_role');

-- PITCHES - Allow service_role full access
CREATE POLICY "Service role full access to pitches" 
ON pitches FOR ALL 
USING (auth.role() = 'service_role');

-- POSTS - Allow service_role full access
CREATE POLICY "Service role full access to posts" 
ON posts FOR ALL 
USING (auth.role() = 'service_role');

-- POST_MEDIA - Allow service_role full access
CREATE POLICY "Service role full access to post_media" 
ON post_media FOR ALL 
USING (auth.role() = 'service_role');

-- POST_LIKES - Allow service_role full access
CREATE POLICY "Service role full access to post_likes" 
ON post_likes FOR ALL 
USING (auth.role() = 'service_role');

-- CATEGORIES - Allow service_role full access
CREATE POLICY "Service role full access to categories" 
ON categories FOR ALL 
USING (auth.role() = 'service_role');

-- COMMUNITY_MEMBERS - Allow service_role full access
CREATE POLICY "Service role full access to community_members" 
ON community_members FOR ALL 
USING (auth.role() = 'service_role');

-- PRODUCT_IMAGES - Allow service_role full access
CREATE POLICY "Service role full access to product_images" 
ON product_images FOR ALL 
USING (auth.role() = 'service_role');

-- CART_ITEMS - Allow service_role full access
CREATE POLICY "Service role full access to cart_items" 
ON cart_items FOR ALL 
USING (auth.role() = 'service_role');

-- ADDRESSES - Allow service_role full access
CREATE POLICY "Service role full access to addresses" 
ON addresses FOR ALL 
USING (auth.role() = 'service_role');

-- ORDERS - Allow service_role full access
CREATE POLICY "Service role full access to orders" 
ON orders FOR ALL 
USING (auth.role() = 'service_role');

-- ORDER_ITEMS - Allow service_role full access
CREATE POLICY "Service role full access to order_items" 
ON order_items FOR ALL 
USING (auth.role() = 'service_role');

-- NOTIFICATIONS - Allow service_role full access
CREATE POLICY "Service role full access to notifications" 
ON notifications FOR ALL 
USING (auth.role() = 'service_role');

-- EXPERT_DETAILS - Allow service_role full access
CREATE POLICY "Service role full access to expert_details" 
ON expert_details FOR ALL 
USING (auth.role() = 'service_role');

-- BRAND_DETAILS - Allow service_role full access
CREATE POLICY "Service role full access to brand_details" 
ON brand_details FOR ALL 
USING (auth.role() = 'service_role');

-- ============================================
-- SETUP SUPABASE - Les Épices d'Alizé
-- Exécutez ce script dans l'éditeur SQL de Supabase
-- Dashboard > SQL Editor > New Query > Coller > Run
-- ============================================

-- 1. Créer la table des produits
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  image TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Activer Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 3. Politique : tout le monde peut voir les produits (site public)
CREATE POLICY "Lecture publique des produits"
  ON products FOR SELECT
  USING (true);

-- 4. Politique : seuls les utilisateurs connectés peuvent ajouter des produits
CREATE POLICY "Ajout par utilisateurs authentifiés"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 5. Politique : seuls les utilisateurs connectés peuvent supprimer des produits
CREATE POLICY "Suppression par utilisateurs authentifiés"
  ON products FOR DELETE
  USING (auth.role() = 'authenticated');

-- 6. Politique : seuls les utilisateurs connectés peuvent modifier des produits
CREATE POLICY "Modification par utilisateurs authentifiés"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ============================================
-- STORAGE : Créer le bucket pour les images
-- ============================================

-- 7. Créer le bucket public pour les images de produits
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 8. Politique : tout le monde peut voir les images (elles sont publiques)
CREATE POLICY "Images publiques en lecture"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- 9. Politique : les utilisateurs connectés peuvent uploader des images
CREATE POLICY "Upload par utilisateurs authentifiés"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- 10. Politique : les utilisateurs connectés peuvent supprimer des images
CREATE POLICY "Suppression images par utilisateurs authentifiés"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

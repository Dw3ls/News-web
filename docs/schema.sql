-- ==========================================
-- 1. ENUM TYPES
-- ==========================================
CREATE TYPE public.user_role AS ENUM ('member', 'admin');
CREATE TYPE public.content_type AS ENUM ('berita', 'artikel', 'cerpen', 'lainnya');
CREATE TYPE public.post_status AS ENUM ('draft', 'published', 'archived');

-- ==========================================
-- 2. TABLES
-- ==========================================

-- Profiles (Terhubung dengan auth.users Supabase)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  role public.user_role DEFAULT 'member'::public.user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Categories
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Posts (Berita, Artikel, Cerpen, Lainnya)
CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL, -- Menyimpan HTML bersih dari Tiptap
  cover_image TEXT,
  content_type public.content_type DEFAULT 'artikel'::public.content_type NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status public.post_status DEFAULT 'draft'::public.post_status NOT NULL,
  reading_time INTEGER DEFAULT 1, -- Estimasi dalam menit
  meta_description TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Bookmarks (Fase 2)
CREATE TABLE public.bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, post_id)
);

-- Likes (Fase 2)
CREATE TABLE public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, post_id)
);

-- Comments (Fase 2)
CREATE TABLE public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 3. INDEXES (Optimasi Query)
-- ==========================================
CREATE INDEX idx_posts_slug ON public.posts(slug);
CREATE INDEX idx_posts_status_published ON public.posts(status, published_at DESC);
CREATE INDEX idx_posts_content_type ON public.posts(content_type);
CREATE INDEX idx_posts_category ON public.posts(category_id);

-- ==========================================
-- 4. TRIGGERS (Auto Profile & Updated At)
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Pengguna Baru'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ==========================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Helper function cek Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Policies: Profiles
CREATE POLICY "Profiles dapat dibaca publik" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "User dapat update profil sendiri" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Policies: Categories
CREATE POLICY "Categories dapat dibaca publik" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Hanya Admin bisa kelola categories" ON public.categories FOR ALL USING (public.is_admin());

-- Policies: Posts
CREATE POLICY "Post published dapat dibaca publik" ON public.posts
  FOR SELECT USING (status = 'published' OR public.is_admin());
CREATE POLICY "Hanya Admin bisa buat/edit/hapus post" ON public.posts
  FOR ALL USING (public.is_admin());

-- Policies: Bookmarks, Likes, Comments (Fase 2)
CREATE POLICY "User kelola bookmark sendiri" ON public.bookmarks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Likes dapat dilihat publik" ON public.likes FOR SELECT USING (true);
CREATE POLICY "User kelola like sendiri" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User hapus like sendiri" ON public.likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Komentar dapat dilihat publik" ON public.comments FOR SELECT USING (true);
CREATE POLICY "User login bisa komentar" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User atau Admin bisa hapus komentar" ON public.comments FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- 1. Perfiles de usuario
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  status TEXT CHECK (status IN ('disponible', 'ocupado', 'offline')) DEFAULT 'disponible',
  favorite_games TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Grupos / Comunidades
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Miembros del grupo
CREATE TABLE IF NOT EXISTS public.group_members (
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

-- 3. Beeps / Convocatorias
CREATE TABLE IF NOT EXISTS public.beeps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  game_title TEXT NOT NULL,
  beep_type TEXT CHECK (beep_type IN ('sonoro', 'silencioso')) DEFAULT 'sonoro',
  slots_total INT NOT NULL CHECK (slots_total > 0),
  slots_taken INT DEFAULT 0 CHECK (slots_taken <= slots_total),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour')
);

-- Respuestas a Beeps
CREATE TABLE IF NOT EXISTS public.beep_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  beep_id UUID REFERENCES public.beeps(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('accepted', 'declined')) NOT NULL,
  responded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(beep_id, user_id)
);

-- Suscripciones Push para el navegador
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subscription_json JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FUNCIÓN Y TRIGGER: Auto-limpieza de Beeps expirados (> 1 hora)
CREATE OR REPLACE FUNCTION delete_expired_beeps()
RETURNS trigger AS $$
BEGIN
  DELETE FROM public.beeps WHERE expires_at <= NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_delete_expired_beeps ON public.beeps;
CREATE TRIGGER trigger_delete_expired_beeps
BEFORE INSERT ON public.beeps
FOR EACH STATEMENT
EXECUTE FUNCTION delete_expired_beeps();

-- ============================================
-- Migración: Agregar facultad y carrera a profiles
-- Ejecutar en Supabase SQL Editor
-- ============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS faculty TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS career TEXT;

-- Actualizar profesores existentes (opcional: asigna valores por defecto)
-- UPDATE profiles SET faculty = '', career = '' WHERE role = 'PROFESOR' AND faculty IS NULL;

COMMENT ON COLUMN profiles.faculty IS 'Facultad donde el docente imparte clases';
COMMENT ON COLUMN profiles.career IS 'Carrera donde el docente imparte clases';

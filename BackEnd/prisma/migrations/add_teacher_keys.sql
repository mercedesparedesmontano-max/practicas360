-- ============================================
-- Migración: Tabla de claves para registro docente
-- Ejecutar en Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS teacher_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar una clave de prueba para el docente
INSERT INTO teacher_keys (key, description) VALUES
  ('DOC-2026-UTE-LVT', 'Clave principal para registro de docentes - Prácticas 360')
ON CONFLICT (key) DO NOTHING;

import { createClient } from '@supabase/supabase-js'

// TODO: Borra el texto de ejemplo abajo y pega tu URL (la que termina en .supabase.co)
const supabaseUrl = 'https://lzyulwhvnomgbprwktps.supabase.co'

// TODO: Borra el texto de ejemplo abajo y pega tu clave larga (la que empieza con eyj)
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6eXVsd2h2bm9tZ2JwcndrdHBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MzEwNjIsImV4cCI6MjA5NzQwNzA2Mn0.3z8PzTJTdO-DjrQEpZG6V2U-VRFlbJVow6xb54w1oGU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
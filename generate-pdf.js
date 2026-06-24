const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 60, bottom: 60, left: 50, right: 50 },
  info: {
    Title: 'Documentacion Tecnica - Practicas 360',
    Author: 'Practicas 360',
    Subject: 'Sistema de gestion de practicas preprofesionales'
  }
});

doc.pipe(fs.createWriteStream('docs/Documentacion_Practicas360.pdf'));

const C = { P: '#007A33', A: '#E60000', T: '#1e293b', M: '#64748b' };
let pageNum = 1;

doc.on('pageAdded', () => {
  pageNum++;
  doc.font('Helvetica').fontSize(7).fillColor(C.M)
    .text('Practicas 360 - Documentacion Tecnica', 50, doc.page.height - 40, { align: 'center' })
    .text(`Pagina ${pageNum}`, doc.page.width - 100, doc.page.height - 40, { width: 50, align: 'right' });
});

function h1(text) { doc.font('Helvetica-Bold').fontSize(24).fillColor(C.P).text(text); doc.moveDown(0.8); }
function h2(text) { doc.font('Helvetica-Bold').fontSize(14).fillColor(C.T).text(text); doc.moveDown(0.5); }
function h3(text) { doc.font('Helvetica-Bold').fontSize(11).fillColor(C.T).text(text); doc.moveDown(0.3); }
function p(text) { doc.font('Helvetica').fontSize(10).fillColor(C.T).text(text, { align: 'justify', lineGap: 3 }); doc.moveDown(0.5); }
function b(text) { doc.font('Helvetica').fontSize(10).fillColor(C.T).text(`  • ${text}`, { indent: 15, lineGap: 3 }); }
function sep() { doc.moveDown(0.3); doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke(); doc.moveDown(0.8); }
function note(text) { doc.font('Helvetica-Oblique').fontSize(9).fillColor(C.M).text(text, { indent: 15, lineGap: 2 }); doc.moveDown(0.3); }

function table(headers, rows, widths) {
  const h = 18;
  const startY = doc.y;
  if (startY + (rows.length + 1) * h > doc.page.height - 80) doc.addPage();
  let top = doc.y;
  doc.rect(50, top, doc.page.width - 100, h).fill(C.P);
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#fff');
  let x = 55;
  headers.forEach((hdr, i) => { doc.text(hdr, x, top + 5, { width: widths[i] }); x += widths[i]; });
  doc.y = top + h + 3;
  rows.forEach((row, ri) => {
    if (doc.y > doc.page.height - 60) { doc.addPage(); }
    const rt = doc.y;
    doc.rect(50, rt, doc.page.width - 100, h).fill(ri % 2 === 0 ? '#fff' : '#f8fafc');
    doc.font('Helvetica').fontSize(8).fillColor(C.T);
    let cx = 55;
    row.forEach((cell, ci) => { doc.text(String(cell), cx, rt + 5, { width: widths[ci] }); cx += widths[ci]; });
    doc.y = rt + h + 2;
  });
  doc.moveDown(0.5);
}

// === PORTADA ===
for (let i = 0; i < 8; i++) doc.moveDown(2);
doc.font('Helvetica-Bold').fontSize(42).fillColor(C.P).text('PRACTICAS 360', { align: 'center' });
doc.moveDown(0.3);
doc.font('Helvetica-Bold').fontSize(22).fillColor(C.A).text('Documentacion Tecnica', { align: 'center' });
doc.moveDown(1.5);
doc.strokeColor(C.P).lineWidth(3).moveTo(150, doc.y).lineTo(doc.page.width - 150, doc.y).stroke();
doc.moveDown(1.5);
doc.font('Helvetica').fontSize(12).fillColor(C.M).text('Sistema de Gestion de Practicas Preprofesionales', { align: 'center' });
doc.moveDown(0.2);
doc.font('Helvetica').fontSize(11).fillColor(C.T).text('Universidad Tecnologica UTE - LVT', { align: 'center' });
doc.moveDown(2);
doc.font('Helvetica').fontSize(10).fillColor(C.M).text('Version 1.0.0', { align: 'center' });
doc.text(new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' }), { align: 'center' });

// === 1. VISION GENERAL ===
doc.addPage();
h1('1. Vision General');
sep();
p('Practicas 360 es una plataforma web para la gestion y seguimiento de practicas preprofesionales de estudiantes universitarios. Permite a los estudiantes registrar sus actividades diarias, a los docentes supervisar y aprobar/rechazar informes, y generar automaticamente el informe institucional en formato Word.');
p('');
h2('Stack Tecnologico');
table(['Capa', 'Tecnologia'], [['Frontend', 'React 19 + Vite 8 + Tailwind CSS 4'], ['Backend', 'Node.js + Express 4 + TypeScript'], ['Base de datos', 'PostgreSQL (Supabase)'], ['ORM', 'Prisma 5'], ['Autenticacion', 'Supabase Auth + JWT propio'], ['IA', 'Groq (API compatible OpenAI)']], [120, 310]);

// === 2. ARQUITECTURA ===
doc.addPage();
h1('2. Arquitectura del Sistema');
sep();
p('El sistema sigue una arquitectura de cliente-servidor con un frontend SPA (Single Page Application) en React que se comunica tanto directamente con Supabase (para CRUD de informes) como con un backend Express (para autenticacion e IA).');
p('');
h2('Diagrama de Arquitectura');
p('');
p('Cliente Web (Navegador) -> Frontend React SPA (Puerto 5173) -> Proxy Vite /api -> Backend Express (Puerto 5000) -> Supabase PostgreSQL / Groq AI');
p('');
p('El frontend se comunica con Supabase directamente para las operaciones CRUD de informes diarios, mientras que el backend maneja la autenticacion mediante JWT y la integracion con inteligencia artificial a traves de Groq.');

// === 3. FRONTEND ===
doc.addPage();
h1('3. Frontend');
sep();
h2('3.1 Estructura de Archivos');
p('FrontEnd/ - index.html (entry point), vite.config.js (config + proxy), src/ - main.jsx (React entry), App.jsx (SPA), supabase.js (cliente Supabase), index.css (Tailwind + fuente Plus Jakarta Sans)');
p('');

h2('3.2 Arquitectura SPA Monolitica');
p('La aplicacion es una Single Page Application sin enrutador. Todo el estado y la UI se manejan en un unico componente App.jsx (~1400 lineas). Se alternan vistas mediante estados (vistaAlumno, vistaProfesor).');
p('');
h3('Estados Principales');
table(['Estado', 'Tipo', 'Proposito'], [['isLoggedIn', 'boolean', 'Usuario autenticado'], ['userLogged', 'object', 'Datos del usuario logueado'], ['vistaAlumno', 'string', "'informes' | 'perfil'"], ['vistaProfesor', 'string', "'alumnos' | 'dashboard' | 'perfil'"], ['informesGuardados', 'array', 'Informes del estudiante'], ['analyticsData', 'object', 'Dashboard del profesor'], ['cargandoIA', 'boolean', 'Estado de carga IA']], [130, 70, 280]);

// === 3.3 PANTALLAS ===
doc.addPage();
h2('3.3 Pantallas y Flujo de Navegacion');
h3('Login / Registro');
b('Inicio de sesion con email y contrasena via Supabase Auth');
b('Registro con dos roles: alumno o profesor');
b('Alumno: nombre, facultad, carrera, ciclo, paralelo');
b('Profesor: solo nombre');
p('');

h3('Vista Alumno');
table(['Seccion', 'Descripcion'], [['Nueva Actividad', 'Formulario: fecha, horas (1-8), titulo, descripcion, observaciones + boton IA'], ['Bitacora', 'Tabla de informes con fecha, horas, actividad, descripcion, estado y acciones'], ['Progreso', 'Barra de horas acumuladas vs meta de 160 horas'], ['Word', 'Descarga .docx con informes aprobados via docxtemplater'], ['Perfil', 'Datos personales y de la practica: nombre, cedula, empresa, area, tutor']], [100, 380]);
p('');

h3('Vista Profesor');
table(['Seccion', 'Descripcion'], [['Validar Curso', 'Contrasena del curso desbloquea acceso (tabla course_passwords)'], ['Alumnos', 'Lista filtrada por facultad/carrera/ciclo/paralelo'], ['Informes', 'Bitacora del alumno con botones Aprobar/Rechazar'], ['Dashboard', 'Graficos Recharts: barras de horas, pastel de estados, riesgo por alumno'], ['Mi Perfil', 'Edicion de nombre y correo del docente']], [100, 380]);

// === 3.4 ESTILOS ===
doc.addPage();
h2('3.4 Estilos y Diseno');
b('Framework CSS: Tailwind CSS 4');
b('Tipografia: Plus Jakarta Sans (Google Fonts)');
b('Paleta: Primario #007A33 (verde), Acento #E60000 (rojo), Fondo #f8fafc, Texto #1e293b');
b('Animaciones: Grid tecnologico, pulso en riesgo, flotacion suave (keyframes CSS inyectados via JS)');
b('Glassmorphism: Notificaciones con backdrop-filter: blur(12px)');

h2('3.5 Funcionalidades Clave');
h3('Mejorar con IA (Groq)');
p('Boton en formulario de actividad. Envia POST /api/ai/enhance-description con { title, currentDescription }. Recibe descripcion mejorada y la asigna al textarea. Feedback visual con estado cargandoIA.');
h3('Generacion de Word');
p('Usa docxtemplater + PizZip + file-saver. Carga plantilla public/plantilla_institucional.docx y renderiza con datos del estudiante + informes aprobados.');
h3('Dashboard del Profesor');
p('Recharts: BarChart para horas, PieChart para distribucion (Aprobados/Rechazados/Pendientes). Semaforo de riesgo: <4 registros = critico (rojo), 4-6 = moderado (ambar), >6 = bajo (verde).');

// === 4. BACKEND ===
doc.addPage();
h1('4. Backend');
sep();
h2('4.1 Estructura de Archivos');
p('BackEnd/ - package.json, tsconfig.json, .env, prisma/schema.prisma, src/ - app.ts (Express), db.ts (Prisma), controllers/ (auth, ai), routes/ (auth, ai), middlewares/ (auth JWT)');
p('');

h2('4.2 API Endpoints');
table(['Metodo', 'Ruta', 'Auth', 'Descripcion'], [['GET', '/health', 'No', 'Health check'], ['POST', '/api/auth/register', 'No', 'Registro usuario'], ['POST', '/api/auth/login', 'No', 'Login + JWT'], ['GET', '/api/auth/perfil-privado', 'JWT', 'Perfil protegido'], ['POST', '/api/ai/enhance-description', 'No', 'Mejorar descripcion con IA']], [60, 190, 40, 200]);

h2('4.3 Autenticacion');
p('Doble sistema: (1) Supabase Auth para registro/login en frontend via @supabase/supabase-js, (2) JWT propio con jsonwebtoken para sesiones de backend.');
p('Flujo: Frontend llama a supabase.auth.signInWithPassword() -> obtiene perfil de profiles -> si es alumno carga student_data -> almacena en userLogged.');
p('Middleware JWT: Extrae token de Authorization: Bearer <token>, verifica con JWT_SECRET, inyecta req.user = { id, role }. Si invalido, 403 Forbidden.');

// === 4.4 IA ===
doc.addPage();
h2('4.4 Integracion con IA (Groq)');
p('Endpoint: POST /api/ai/enhance-description');
p('');
h3('Request:');
p('{ "title": "Instalacion de redes informaticas", "currentDescription": "Instale los cables de red" }');
h3('Response:');
p('{ "description": "Se realizo la instalacion de redes informaticas..." }');
p('');
h3('Configuracion:');
b('Cliente OpenAI apuntando a https://api.groq.com/openai/v1');
b('Modelo: llama-3.3-70b-versatile');
b('Prompt: redacta descripciones tecnicas profesionales en espanol');
b('Temperatura: 0.7, max_tokens: 300');
b('API Key en variable de entorno GROQ_API_KEY');

// === 5. BD ===
doc.addPage();
h1('5. Base de Datos');
sep();
h2('5.1 Modelo Prisma');
p('Enums: Role (ALUMNO, PROFESOR, SUPERVISOR), ApprovalStatus (PENDIENTE, APROBADO, RECHAZADO)');
p('');

h3('Tabla: users');
table(['Columna', 'Tipo', 'Descripcion'], [['id', 'UUID (PK)', 'Identificador unico'], ['email', 'String (unico)', 'Correo electronico'], ['passwordHash', 'String', 'Hash bcrypt'], ['role', 'Role enum', 'ALUMNO | PROFESOR | SUPERVISOR']], [100, 100, 280]);
p('');

h3('Tabla: student_profiles');
table(['Columna', 'Tipo', 'Descripcion'], [['id', 'UUID (PK)', 'Identificador'], ['userId', 'UUID (FK)', 'Relacion con users'], ['fullName', 'String', 'Nombre completo'], ['nationalId', 'String (unico)', 'Cedula'], ['faculty', 'String', 'Facultad'], ['career', 'String', 'Carrera'], ['cycle', 'String', 'Ciclo'], ['parallel', 'String', 'Paralelo'], ['companyName', 'String', 'Empresa'], ['technicalArea', 'String', 'Area tecnica'], ['academicTutorId', 'UUID (FK)', 'Tutor academico']], [120, 100, 260]);

doc.addPage();
h3('Tabla: daily_reports');
table(['Columna', 'Tipo', 'Descripcion'], [['id', 'UUID (PK)', 'Identificador'], ['studentProfileId', 'UUID (FK)', 'Estudiante'], ['reportDate', 'DateTime', 'Fecha del reporte'], ['executedHours', 'Decimal(5,2)', 'Horas ejecutadas'], ['technicalDescription', 'String', 'Titulo actividad'], ['operationalNotes', 'String?', 'Descripcion tecnica'], ['approvalStatus', 'ApprovalStatus', 'PENDIENTE | APROBADO | RECHAZADO'], ['feedback', 'String?', 'Retroalimentacion']], [120, 110, 250]);
p('');
b('@@unique([studentProfileId, reportDate]): un reporte por dia por estudiante');
b('@@index([approvementStatus]): indice para busquedas por estado');

h2('5.2 Tablas Supabase (Frontend)');
p('Ademas del esquema Prisma, el frontend accede directamente a tablas en Supabase:');
b('profiles: id, role, full_name, email');
b('student_data: profile_id, faculty, career, cycle, parallel, company_name, technical_area, cedula, supervisor_name');
b('course_passwords: id, password, faculty, career, cycle, parallel');
note('NOTA: El backend (Prisma, camelCase) y el frontend (Supabase directo, snake_case) operan sobre esquemas no sincronizados.');

// === 6. CONFIG ===
doc.addPage();
h1('6. Configuracion del Entorno');
sep();
h2('Variables de Entorno (BackEnd/.env)');
p('PORT=5000');
p('DATABASE_URL=postgresql://user:pass@host:5432/postgres');
p('JWT_SECRET=clave_secreta');
p('GROQ_API_KEY=gsk_...');
p('');
h2('Proxy de Vite');
p('Todas las peticiones a /api/* se redirigen al backend en puerto 5000 mediante el proxy configurado en vite.config.js.');
p('server.proxy["/api"] = { target: "http://localhost:5000", changeOrigin: true }');

// === 7. FLUJO DE DATOS ===
doc.addPage();
h1('7. Flujo de Datos');
sep();
h2('7.1 Creacion de Informe');
p('1. Usuario llena formulario (fecha, horas, titulo, descripcion, observaciones)');
p('2. handleGuardarInforme() determina si es creacion o edicion');
p('3. Concatena descripcion + observaciones del alumno');
p('4. Ejecuta INSERT o UPDATE en tabla daily_reports via Supabase');
p('5. fetchReportsForStudent() refresca la bitacora');
p('');

h2('7.2 Mejora con IA');
p('1. Usuario hace clic en "Mejorar con IA"');
p('2. handleMejorarConIA() envia POST a /api/ai/enhance-description');
p('3. Backend construye prompt con titulo + descripcion actual');
p('4. Llama a Groq (llama-3.3-70b-versatile)');
p('5. Devuelve descripcion mejorada que se asigna al textarea');
p('');

h2('7.3 Aprobacion/Rechazo');
p('1. Docente selecciona estudiante y ve su bitacora');
p('2. Aprobar: UPDATE approval_status = APROBADO');
p('3. Rechazar: modal con motivo -> UPDATE approval_status = RECHAZADO + feedback');
p('4. Se refrescan los informes del estudiante');
p('');

h2('7.4 Generacion de Word');
p('1. Usuario hace clic en "Descargar Formato Institucional"');
p('2. Filtra informes con estado APROBADO');
p('3. Carga plantilla DOCX desde /plantilla_institucional.docx');
p('4. Renderiza con docxtemplater e informes aprobados');
p('5. Descarga el .docx generado via file-saver');

// === 8. DEPENDENCIAS ===
doc.addPage();
h1('8. Dependencias');
sep();
h2('Frontend');
p('React 19, React DOM 19, @supabase/supabase-js, docxtemplater, file-saver, pizzip, recharts, @vitejs/plugin-react, tailwindcss, typescript, vite');
p('');
h2('Backend');
p('Express 4, @prisma/client, bcryptjs, cors, dotenv, jsonwebtoken, openai, prisma (dev), ts-node-dev (dev), typescript (dev)');

// === 9. COMANDOS ===
doc.addPage();
h1('9. Comandos de Desarrollo');
sep();
h2('Frontend');
table(['Comando', 'Descripcion'], [['npm run dev', 'Servidor Vite (hot reload, puerto 5173)'], ['npm run build', 'Compila a produccion'], ['npm run preview', 'Vista previa del build'], ['npm run lint', 'Ejecuta ESLint']], [150, 340]);
p('');
h2('Backend');
table(['Comando', 'Descripcion'], [['npm run dev', 'Express + ts-node-dev (hot reload)'], ['npm run build', 'Compila TypeScript a JS'], ['npm run start', 'Ejecuta build en produccion'], ['npm run prisma:generate', 'Genera cliente Prisma']], [180, 310]);

// === 10. RECOMENDACIONES ===
doc.addPage();
h1('10. Recomendaciones Tecnicas');
sep();
h2('Deuda Tecnica');
table(['Problema', 'Impacto', 'Sugerencia'], [['SPA monolitica (~1400 lineas)', 'Mantenibilidad baja', 'Dividir en componentes'], ['Sin enrutador', 'Escalabilidad limitada', 'React Router'], ['Dualidad Prisma vs Supabase', 'Inconsistencia', 'Unificar CRUD via backend'], ['Tablas manuales', 'Sin migraciones', 'Prisma migrations'], ['Sin TypeScript frontend', 'Errores runtime', 'Migrar a TypeScript'], ['Sin testing', 'Calidad no verificable', 'Vitest + Playwright']], [165, 120, 195]);
p('');

h2('Mejoras Propuestas');
b('Modularizar App.jsx en componentes: LoginForm, ActivityForm, ReportsTable, TeacherDashboard, ProfileForm');
b('Estado global con Context API o Zustand');
b('Testing unitario (Vitest) y E2E (Playwright)');
b('CI/CD con GitHub Actions (lint, test, deploy)');
b('Estandarizar errores del backend');
b('Paginacion en tablas con muchos registros');
b('Internacionalizacion (espanol/ingles)');

// === FIN ===
doc.addPage();
h1('Acerca de este documento');
sep();
p('Generado automaticamente a partir del codigo fuente del proyecto Practicas 360.');
p('Tecnologia: Node.js con PDFKit.');
p('Fecha: ' + new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }));

doc.end();
console.log('PDF generado exitosamente en docs/Documentacion_Practicas360.pdf');

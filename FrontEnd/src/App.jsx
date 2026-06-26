import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

const generarEmailInstitucional = (nombreCompleto) => {
  const partes = nombreCompleto.trim().split(/\s+/);
  if (partes.length < 3) return '';
  const nombre = partes[0];
  const apellidos = partes.slice(1);
  const normalizar = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return [nombre, ...apellidos].map(normalizar).join('.') + '@utelvt.edu.ec';
};
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PIE_COLORS = { Aprobados: '#22c55e', Rechazados: '#ef4444', Pendientes: '#f59e0b' };

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('alumno');
  const [userLogged, setUserLogged] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [mensajeGlobal, setMensajeGlobal] = useState({ texto: '', tipo: '' });

  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regFacultad, setRegFacultad] = useState('');
  const [regCarrera, setRegCarrera] = useState('');
  const [regCiclo, setRegCiclo] = useState('');
  const [regParalelo, setRegParalelo] = useState('');

  const [regProfName, setRegProfName] = useState('');
  const [regProfEmail, setRegProfEmail] = useState('');
  const [regProfPassword, setRegProfPassword] = useState('');
  const [regProfFacultad, setRegProfFacultad] = useState('');
  const [regProfCarrera, setRegProfCarrera] = useState('');
  const [regProfKey, setRegProfKey] = useState('');
  const [regProfEmailManual, setRegProfEmailManual] = useState(false);

  const [vistaAlumno, setVistaAlumno] = useState('informes');
  const [vistaProfesor, setVistaProfesor] = useState('alumnos');

  const [perfilAlumno, setPerfilAlumno] = useState({
    nombre: '',
    cedula: '',
    empresa: '',
    area: '',
    tutorEmpresarial: ''
  });

  const [perfilDocente, setPerfilDocente] = useState({
    nombre: '',
    correo: ''
  });

  const [idInformeEdicion, setIdInformeEdicion] = useState(null);
  const [horas, setHoras] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [tituloActividad, setTituloActividad] = useState('');
  const [descripcionActividad, setDescripcionActividad] = useState('');

  const [reporteARechazar, setReporteARechazar] = useState(null);
  const [observacionRechazo, setObservacionRechazo] = useState("");

  const [analyticsData, setAnalyticsData] = useState(null);
  const [observacionAlumno, setObservacionAlumno] = useState("");
  const [cargandoIA, setCargandoIA] = useState(false);
  const estructuraUniversitaria = {
    'Facultad de Ingenierías': ['Ingeniería Mecánica', 'Electricidad', 'Ingeniería Química', 'Tecnologías de la Información (TI)'],
    'Facultad de Ciencias Administrativas y Económicas': ['Administración de Empresas', 'Comercio', 'Contabilidad y Auditoría'],
    'Facultad de la Pedagogía': ['Educación Básica', 'Educación Inicial', 'Pedagogía de la Lengua y la Literatura'],
    'Facultad de Ciencias Sociales y Services': ['Sociología', 'Trabajo Social', 'Turismo'],
    'Facultad de Ciencias Agropecuarias': ['Agronomía', 'Ingeniería Forestal', 'Zootecnia']
  };

  const [filtroFacultad, setFiltroFacultad] = useState('');
  const [filtroCarrera, setFiltroCarrera] = useState('');
  const [filtroCiclo, setFiltroCiclo] = useState('');
  const [filtroParalelo, setFiltroParalelo] = useState('');
  const [cursoPasswordInput, setCursoPasswordInput] = useState('');
  const [cursoDesbloqueado, setCursoDesbloqueado] = useState(false);

  const [estudiantesFiltrados, setEstudiantesFiltrados] = useState([]);
  const [idEstudianteSeleccionado, setIdEstudianteSeleccionado] = useState(null);
  const [informesGuardados, setInformesGuardados] = useState([]);
  const [informesEstudianteSeleccionado, setInformesEstudianteSeleccionado] = useState([]);

  const mostrarNotificacion = (texto, tipo = 'exito') => {
    setMensajeGlobal({ texto, tipo });
    setTimeout(() => {
      setMensajeGlobal({ texto: '', tipo: '' });
    }, 5000);
  };

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    setEmail('');
    setPassword('');
    setUserLogged(null);
    setPerfilAlumno({ nombre: '', cedula: '', empresa: '', area: '', tutorEmpresarial: '' });
    setPerfilDocente({ nombre: '', correo: '' });
    setFiltroFacultad('');
    setFiltroCarrera('');
    setFiltroCiclo('');
    setFiltroParalelo('');
    setCursoPasswordInput('');
    setCursoDesbloqueado(false);
    setEstudiantesFiltrados([]);
    setIdEstudianteSeleccionado(null);
    setAnalyticsData(null);
    setRegFullName('');
    setRegPassword('');
    setRegFacultad('');
    setRegCarrera('');
    setRegCiclo('');
    setRegParalelo('');
    setRegProfName('');
    setRegProfPassword('');
    setRegProfFacultad('');
    setRegProfCarrera('');
    setRegProfKey('');
    setRole('alumno');
    setIsRegisterMode(false);
    setIsLoggedIn(false);
  };

  const fetchReportsForStudent = async (studentId) => {
    try {
      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .eq('student_id', studentId)
        .order('report_date', { ascending: false });

      if (error) throw error;

      const mapped = data.map(item => ({
        id: item.id,
        idEstudiante: item.student_id,
        fechaOriginal: item.report_date,
        fechaFormateada: new Date(item.report_date + 'T00:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' }),
        horas: item.executed_hours,
        actividad: item.technical_description,
        descripcion: item.operational_notes || '',
        estado: item.approval_status.charAt(0) + item.approval_status.slice(1).toLowerCase(),
        observaciones: item.observaciones || ''
      }));
      setInformesGuardados(mapped);
    } catch (err) {
      console.error('Error al cargar informes:', err.message);
    }
  };

  const handleMejorarConIA = async () => {
    if (!tituloActividad.trim()) return;
    setCargandoIA(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/ai/enhance-description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: tituloActividad,
          currentDescription: descripcionActividad,
        }),
      });
      const data = await res.json();
      if (res.ok && data.description) {
        setDescripcionActividad(data.description);
      } else {
        mostrarNotificacion(data.message || 'Error al mejorar descripción', 'error');
      }
    } catch {
      mostrarNotificacion('Error de conexión con el servidor', 'error');
    } finally {
      setCargandoIA(false);
    }
  };

  const handleGuardarInforme = async () => {
    try {
      const notasFinales = observacionAlumno.trim()
        ? descripcionActividad + '\n\nObservaciones adicionales:\n' + observacionAlumno.trim()
        : descripcionActividad;

      if (idInformeEdicion) {
        const { error } = await supabase
          .from('daily_reports')
          .update({
            report_date: fecha,
            executed_hours: parseInt(horas),
            technical_description: tituloActividad,
            operational_notes: notasFinales,
            approval_status: 'PENDIENTE'
          })
          .eq('id', idInformeEdicion);

        if (error) throw error;
        mostrarNotificacion('Informe actualizado y enviado a revisión con éxito', 'exito');
        setIdInformeEdicion(null);
      } else {
        const { error } = await supabase
          .from('daily_reports')
          .insert([
            {
              student_id: userLogged.student_id,
              report_date: fecha,
              executed_hours: parseInt(horas),
              technical_description: tituloActividad,
              operational_notes: notasFinales,
              approval_status: 'PENDIENTE'
            }
          ]);

        if (error) throw error;
        mostrarNotificacion('Registro diario guardado con éxito', 'exito');
      }

      setFecha(new Date().toISOString().split('T')[0]);
      setHoras('');
      setTituloActividad('');
      setDescripcionActividad('');
      setObservacionAlumno('');
      fetchReportsForStudent(userLogged.student_id);
    } catch (err) {
      console.error(err);
      mostrarNotificacion('No se pudo procesar la solicitud del informe.', 'error');
    }
  };

  const generarInformeWordInstitucional = async () => {
    const informesAprobados = informesGuardados.filter(inf => inf.estado.toLowerCase() === 'aprobado');

    if (informesAprobados.length === 0) {
      mostrarNotificacion('No tienes informes con estado APROBADO para generar el formato institucional.', 'error');
      return;
    }

    try {
      mostrarNotificacion('Leyendo formato institucional de Word...', 'success');

      const response = await fetch('/plantilla_institucional.docx');
      if (!response.ok) {
        throw new Error('No se encontró "plantilla_institucional.docx" en la carpeta public.');
      }

      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      const opcionesFecha = { year: 'numeric', month: 'long', day: 'numeric' };
      const fechaHoy = new Date().toLocaleDateString('es-ES', opcionesFecha);

      doc.render({
        FACULTAD: userLogged?.facultad || 'FACULTAD DE INGENIERÍAS',
        CARRERA: userLogged?.carrera || 'CARRERA DE INGENIERÍA MECÁNICA',
        EMPRESA: perfilAlumno?.empresa || 'CELEC EP TERMOESMERALDAS',
        NOMBRE_ESTUDIANTE: userLogged?.nombre || 'ESTUDIANTE',
        NOMBRE_DOCENTE: perfilAlumno?.docenteAsignatura || 'ING. JURY ALFREDO RAMÍREZ TORO. MSc.',
        FECHA_ACTUAL: fechaHoy,
        empresa: perfilAlumno?.empresa || 'CELEC EP TERMOESMERALDAS',
        area_tecnica: perfilAlumno?.area || 'Área Técnica',
        nombre_docente: perfilAlumno?.docenteAsignatura || 'ING. JURY ALFREDO RAMÍREZ TORO. MSc.',
        informes: informesAprobados.map((item, index) => ({
          id: String(index + 1),
          fecha: String(item.fechaFormateada || item.fecha || ''),
          horas: String(item.horas || 0),
          actividad_completa: String(`${item.actividad || ''} - Descripción: ${item.descripcion || ''}`)
        }))
      });

      const out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      saveAs(out, `Informe_Final_Practicas_${(userLogged?.nombre || 'Estudiante').replace(/\s+/g, '_')}.docx`);
      mostrarNotificacion('¡Informe Institucional generado con éxito!', 'success');

    } catch (error) {
      console.error('Error al combinar correspondencia de Word:', error);
      mostrarNotificacion('Error al procesar la plantilla de Word.', 'error');
    }
  };

  const cargarInformeParaEditar = (informe) => {
    setIdInformeEdicion(informe.id);
    setFecha(informe.fechaOriginal);
    setHoras(informe.horas.toString());
    setTituloActividad(informe.actividad);
    setDescripcionActividad(informe.descripcion);
    mostrarNotificacion('Datos del informe cargados en el formulario. Corrija los campos y guarde los cambios.', 'exito');
  };

  const handleEliminarInforme = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este registro? Esta acción no se puede deshacer.')) return;

    try {
      const { error } = await supabase
        .from('daily_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;

      mostrarNotificacion('Registro eliminado con éxito', 'exito');
      fetchReportsForStudent(userLogged.student_id);
    } catch (err) {
      mostrarNotificacion('Error al eliminar el registro', 'error');
    }
  };

  const cancelarEdicion = () => {
    setIdInformeEdicion(null);
    setFecha(new Date().toISOString().split('T')[0]);
    setHoras('');
    setTituloActividad('');
    setDescripcionActividad('');
  };

  const handleActualizarPerfil = async (e) => {
    e.preventDefault();
    try {
      const { error: studentErr } = await supabase
        .from('student_data')
        .update({
          cedula: perfilAlumno.cedula,
          company_name: perfilAlumno.empresa,
          technical_area: perfilAlumno.area,
          supervisor_name: perfilAlumno.tutorEmpresarial
        })
        .eq('profile_id', userLogged.id);

      if (studentErr) throw studentErr;

      const { error: profileErr } = await supabase
        .from('profiles')
        .update({ full_name: perfilAlumno.nombre })
        .eq('id', userLogged.id);

      if (profileErr) throw profileErr;

      mostrarNotificacion('Perfil institucional guardado con éxito.', 'exito');
      setUserLogged(prev => ({
        ...prev,
        nombre: perfilAlumno.nombre,
        cedula: perfilAlumno.cedula,
        empresa: perfilAlumno.empresa,
        area: perfilAlumno.area,
        tutorEmpresarial: perfilAlumno.tutorEmpresarial
      }));
    } catch (err) {
      mostrarNotificacion('Error al actualizar el perfil: ' + err.message, 'error');
    }
  };

  const handleActualizarPerfilDocente = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: perfilDocente.nombre,
          email: perfilDocente.correo,
          faculty: perfilDocente.facultad,
          career: perfilDocente.carrera
        })
        .eq('id', userLogged.id);

      if (error) throw error;

      mostrarNotificacion('Datos del docente actualizados con éxito.', 'exito');
      setUserLogged(prev => ({ ...prev, nombre: perfilDocente.nombre, email: perfilDocente.correo, facultad: perfilDocente.facultad, carrera: perfilDocente.carrera }));
      setFiltroFacultad(perfilDocente.facultad);
      setFiltroCarrera(perfilDocente.carrera);
    } catch (err) {
      mostrarNotificacion('Error al actualizar datos: ' + err.message, 'error');
    }
  };

  useEffect(() => {
    if (role === 'alumno' && regFullName) {
      const g = generarEmailInstitucional(regFullName);
      if (g) setRegEmail(g);
    }
  }, [regFullName, role]);

  useEffect(() => {
    if (role === 'profesor' && regProfName && !regProfEmailManual) {
      const g = generarEmailInstitucional(regProfName);
      if (g) setRegProfEmail(g);
    }
  }, [regProfName, role, regProfEmailManual]);

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    try {
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authErr) throw authErr;

      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileErr || !profile) throw new Error('No se encontró el perfil de usuario.');

      if (profile.role === 'ALUMNO') {
        const { data: student, error: studentErr } = await supabase
          .from('student_data')
          .select('*')
          .eq('profile_id', profile.id)
          .single();

        if (studentErr) throw studentErr;

        setUserLogged({
          id: profile.id,
          student_id: student.id,
          nombre: profile.full_name,
          email: profile.email,
          rol: 'ALUMNO',
          facultad: student.faculty,
          carrera: student.career,
          ciclo: student.cycle,
          cedula: student.cedula || '',
          empresa: student.company_name || 'Sin Empresa',
          area: student.technical_area || 'No asignada',
          tutorEmpresarial: student.supervisor_name || 'No asignado'
        });

        setPerfilAlumno({
          nombre: profile.full_name,
          cedula: student.cedula || '',
          empresa: student.company_name || '',
          area: student.technical_area || '',
          tutorEmpresarial: student.supervisor_name || ''
        });

        fetchReportsForStudent(student.id);
      } else {
        setUserLogged({
          id: profile.id,
          nombre: profile.full_name,
          email: profile.email,
          rol: 'PROFESOR',
          facultad: profile.faculty || '',
          carrera: profile.career || ''
        });
        setPerfilDocente({
          nombre: profile.full_name,
          correo: profile.email,
          facultad: profile.faculty || '',
          carrera: profile.career || ''
        });
        setFiltroFacultad(profile.faculty || '');
        setFiltroCarrera(profile.career || '');
      }
      setIsLoggedIn(true);
    } catch (err) {
      mostrarNotificacion('Credenciales incorrectas o error de conexión.', 'error');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const targetEmail = role === 'alumno' ? regEmail : regProfEmail;
    const targetPassword = role === 'alumno' ? regPassword : regProfPassword;
    const targetName = role === 'alumno' ? regFullName : regProfName;

    try {
      if (role === 'profesor') {
        const CLAVE_MAESTRA = "DOC-2026-UTE-LVT";
        if (regProfKey.trim() !== CLAVE_MAESTRA) {
          mostrarNotificacion("La clave de registro docente es incorrecta", "error");
          return;
        }
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: targetEmail,
        password: targetPassword,
      });

      if (authError) throw authError;

      const profileData = {
        id: authData.user.id,
        email: targetEmail,
        full_name: targetName,
        role: role.toUpperCase(),
      };
      if (role === 'profesor') {
        profileData.faculty = regProfFacultad;
        profileData.career = regProfCarrera;
      }

      const { error: insertError } = await supabase.from('profiles').insert([
        profileData
      ]);

      if (insertError) throw insertError;

      if (role === 'alumno') {
        const { error: studentErr } = await supabase
          .from('student_data')
          .insert([
            {
              profile_id: authData.user.id,
              faculty: regFacultad,
              career: regCarrera,
              cycle: regCiclo,
              parallel: regParalelo,
              cedula: ''
            }
          ]);
        if (studentErr) throw studentErr;
      }

      mostrarNotificacion('Registro exitoso. Ahora puede iniciar sesión.', 'exito');
      setIsRegisterMode(false);
    } catch (error) {
      console.error(error);
      mostrarNotificacion(error.message, "error");
    }
  };

  const handleValidarCurso = async () => {
    if (!filtroCiclo || !filtroParalelo) {
      mostrarNotificacion('Seleccione ciclo y paralelo.', 'error');
      return;
    }
    if (!cursoPasswordInput.trim()) {
      mostrarNotificacion('Ingrese la clave del curso.', 'error');
      return;
    }

    const facultad = userLogged?.facultad || filtroFacultad;
    const carrera = userLogged?.carrera || filtroCarrera;
    if (!facultad || !carrera) {
      mostrarNotificacion('Complete su perfil docente con facultad y carrera.', 'error');
      return;
    }

    try {
      const { data: passData, error: passErr } = await supabase
        .from('course_passwords')
        .select('*')
        .ilike('password', cursoPasswordInput.trim())
        .eq('faculty', facultad)
        .eq('career', carrera)
        .eq('cycle', filtroCiclo)
        .eq('parallel', filtroParalelo);

      if (passErr) {
        console.error("Error al validar contraseña:", passErr.message);
        mostrarNotificacion('Error de conexión.', 'error');
        return;
      }

      if (!passData || passData.length === 0) {
        mostrarNotificacion('Clave incorrecta para este curso.', 'error');
        return;
      }

      setCursoDesbloqueado(true);
      mostrarNotificacion('Acceso concedido al curso', 'exito');

      const { data: alumnosData, error: alumnosErr } = await supabase
        .from('student_data')
        .select(`
          id,
          company_name,
          technical_area,
          profiles (
            full_name
          )
        `)
        .eq('faculty', facultad)
        .eq('career', carrera)
        .eq('cycle', filtroCiclo)
        .eq('parallel', filtroParalelo);

      if (alumnosErr) {
        console.error("Error al buscar alumnos:", alumnosErr.message);
        return;
      }

      if (alumnosData && alumnosData.length > 0) {
        const alumnosMapeados = alumnosData.map(al => ({
          id: al.id,
          nombre: al.profiles?.full_name || 'Estudiante sin nombre',
          empresa: al.company_name || 'Sin Empresa registrada',
          area: al.technical_area || 'Área no asignada'
        }));
        setEstudiantesFiltrados(alumnosMapeados);
      } else {
        setEstudiantesFiltrados([]);
      }

    } catch (err) {
      console.error('Error inesperado:', err);
      mostrarNotificacion('Ocurrió un problema al procesar el acceso.', 'error');
    }
  };

  const handleSeleccionarEstudianteDocente = async (studentId) => {
    setIdEstudianteSeleccionado(studentId);
    try {
      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .eq('student_id', studentId)
        .order('report_date', { ascending: false });

      if (error) throw error;

      const mapped = data.map(item => ({
        id: item.id,
        fechaFormateada: new Date(item.report_date + 'T00:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' }),
        horas: item.executed_hours,
        actividad: item.technical_description,
        descripcion: item.operational_notes || '',
        estado: item.approval_status.charAt(0) + item.approval_status.slice(1).toLowerCase(),
        observaciones: item.observaciones || ''
      }));
      setInformesEstudianteSeleccionado(mapped);
    } catch (err) {
      console.error("Error al cargar informes del estudiante:", err.message);
    }
  };

  const handleOpenRejectModal = (reportId) => {
    setReporteARechazar(reportId);
    setObservacionRechazo('');
  };

  const handleConfirmReject = async () => {
    if (!observacionRechazo.trim()) {
      mostrarNotificacion('Debe escribir el motivo del rechazo.', 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('daily_reports')
        .update({ approval_status: 'RECHAZADO', observaciones: observacionRechazo.trim() })
        .eq('id', reporteARechazar);

      if (error) throw error;

      mostrarNotificacion('Informe rechazado con éxito', 'exito');
      setReporteARechazar(null);
      setObservacionRechazo('');

      if (idEstudianteSeleccionado) {
        handleSeleccionarEstudianteDocente(idEstudianteSeleccionado);
      }
    } catch (err) {
      mostrarNotificacion('Error al rechazar el informe', 'error');
    }
  };

  const handleCancelReject = () => {
    setReporteARechazar(null);
    setObservacionRechazo('');
  };

  const handleAprobarInforme = async (id) => {
    try {
      const { error } = await supabase
        .from('daily_reports')
        .update({ approval_status: 'APROBADO' })
        .eq('id', id);

      if (error) throw error;

      mostrarNotificacion('Informe aprobado con éxito', 'exito');
      if (idEstudianteSeleccionado) {
        handleSeleccionarEstudianteDocente(idEstudianteSeleccionado);
      }
    } catch (err) {
      mostrarNotificacion('Error al aprobar el informe', 'error');
    }
  };

  const fetchAnalyticsData = async () => {
    if (!cursoDesbloqueado || estudiantesFiltrados.length === 0) return;

    try {
      const studentIds = estudiantesFiltrados.map(est => est.id);

      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .in('student_id', studentIds);

      if (error) throw error;

      const studentHours = {};
      const studentTotalRecords = {};
      let approved = 0, rejected = 0, pending = 0;

      (data || []).forEach(report => {
        const sid = report.student_id;
        studentTotalRecords[sid] = (studentTotalRecords[sid] || 0) + 1;

        if (report.approval_status === 'APROBADO') {
          studentHours[sid] = (studentHours[sid] || 0) + (report.executed_hours || 0);
          approved++;
        } else if (report.approval_status === 'RECHAZADO') {
          rejected++;
        } else {
          pending++;
        }
      });

      const studentsHoursArray = estudiantesFiltrados
        .map(est => ({
          id: est.id,
          name: est.nombre,
          shortName: est.nombre.split(' ').slice(0, 2).join(' '),
          hours: studentHours[est.id] || 0
        }))
        .filter(est => est.hours > 0)
        .sort((a, b) => b.hours - a.hours);

      const statusDistribution = [
        { name: 'Aprobados', value: approved, color: PIE_COLORS.Aprobados },
        { name: 'Rechazados', value: rejected, color: PIE_COLORS.Rechazados },
        { name: 'Pendientes', value: pending, color: PIE_COLORS.Pendientes }
      ].filter(item => item.value > 0);

      const riskData = estudiantesFiltrados.map(est => ({
        id: est.id,
        nombre: est.nombre,
        totalRecords: studentTotalRecords[est.id] || 0
      }));

      setAnalyticsData({ studentsHoursArray, statusDistribution, riskData });
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  const totalHorasEstudiante = informesGuardados.reduce((sum, inf) => sum + Number(inf.horas), 0);
  const estudianteAuditado = idEstudianteSeleccionado ? estudiantesFiltrados.find(est => est.id === idEstudianteSeleccionado) : null;

  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      @keyframes techGridMove {
        0% { background-position: 0px 0px; }
        100% { background-position: 40px 40px; }
      }
      @keyframes pulseLine {
        0%, 100% { opacity: 0.6; transform: scaleX(1); }
        50% { opacity: 1; transform: scaleX(1.02); }
      }
      @keyframes softFloat {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-6px); }
      }
      @keyframes riskPulse {
        0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
        50% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
      }
      .animate-grid-bg {
        background-size: 40px 40px;
        background-image: linear-gradient(to right, rgba(0, 122, 51, 0.04) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(0, 122, 51, 0.04) 1px, transparent 1px);
        animation: techGridMove 8s linear infinite;
      }
      .animate-pulse-line-green {
        animation: pulseLine 3s ease-in-out infinite;
      }
      .animate-float-card {
        animation: softFloat 6s ease-in-out infinite;
      }
      .animate-risk-pulse {
        animation: riskPulse 2s ease-in-out infinite;
      }
      .glass-container {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }
    `;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, []);

  const BannerNotificacion = () => {
    if (!mensajeGlobal.texto) return null;
    const esError = mensajeGlobal.tipo === 'error';
    return (
      <div className={`fixed bottom-5 right-5 max-w-md p-4 rounded-xl border shadow-lg z-50 font-sans transition-all duration-300 glass-container ${esError ? 'border-red-500 text-red-800 bg-red-50/90' : 'border-[#007A33] text-emerald-900 bg-emerald-50/90'}`}>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{esError ? 'Aviso del Sistema' : 'Confirmación'}</span>
          <p className="text-xs font-bold">{mensajeGlobal.texto}</p>
        </div>
      </div>
    );
  };

  const getRiskInfo = (totalRecords) => {
    if (totalRecords < 4) return { level: 'Peligro Crítico', color: 'red', pulse: true, bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', badge: 'bg-red-500' };
    if (totalRecords <= 6) return { level: 'Riesgo Moderado', color: 'amber', pulse: false, bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', badge: 'bg-amber-500' };
    return { level: 'Bajo Riesgo', color: 'green', pulse: false, bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', badge: 'bg-emerald-500' };
  };

  if (isLoggedIn && userLogged?.rol.toLowerCase() === 'alumno') {
    return (
      <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 animate-grid-bg" dir="ltr">
        <BannerNotificacion />
        <nav className="bg-[#007A33] border-b-4 border-[#E60000] text-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 flex justify-between min-h-14 sm:min-h-16 items-center gap-1 sm:gap-2">
            <div className="flex items-center gap-1 sm:gap-6 min-w-0">
              <div className="flex items-center gap-1 sm:gap-3 shrink-0">
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/20/ESCUDETO_UTE-LVT.png" alt="Logo UTE-LVT" className="h-8 sm:h-10 w-auto object-contain bg-white p-0.5 sm:p-1 rounded-lg" />
                <div className="flex flex-col">
                  <span className="text-[10px] sm:text-base font-black uppercase tracking-wide leading-tight sm:leading-normal">Prácticas 360</span>
                  <span className="hidden sm:block text-[9px] font-bold text-slate-100 uppercase tracking-widest">U.T. LVT</span>
                </div>
              </div>
              <div className="flex gap-1 bg-[#006329] p-0.5 sm:p-1 rounded-xl text-[10px] sm:text-xs font-bold overflow-x-auto">
                <button onClick={() => setVistaAlumno('informes')} className={`px-2 sm:px-4 py-1 sm:py-1.5 rounded-lg transition-all whitespace-nowrap ${vistaAlumno === 'informes' ? 'bg-white text-[#007A33]' : 'text-emerald-100'}`}>INFORME</button>
                <button onClick={() => setVistaAlumno('perfil')} className={`px-2 sm:px-4 py-1 sm:py-1.5 rounded-lg transition-all whitespace-nowrap ${vistaAlumno === 'perfil' ? 'bg-white text-[#007A33]' : 'text-emerald-100'}`}>PERFIL</button>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-4 shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black uppercase text-white">{userLogged?.nombre}</p>
                <p className="text-[10px] font-bold text-emerald-100 italic">{userLogged?.empresa}</p>
              </div>
              <button onClick={handleCerrarSesion} className="bg-[#E60000] hover:bg-[#C00000] text-white font-black text-[8px] sm:text-[10px] py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl uppercase tracking-wider transition-all shadow-md whitespace-nowrap">Salir</button>
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto py-8 px-4">
          {vistaAlumno === 'informes' && (
            <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
              <div className="mt-4 p-3 sm:p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
                <div>
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">¿Completaste tus horas?</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Genera automáticamente tu informe institucional en Word</p>
                </div>
                <button
                  type="button"
                  onClick={generarInformeWordInstitucional}
                  className="bg-[#007A33] hover:bg-emerald-800 text-white font-black text-[8px] sm:text-[10px] py-2 sm:py-3 px-3 sm:px-5 rounded-xl uppercase tracking-wider transition-all shadow-md flex items-center gap-2 whitespace-nowrap w-full sm:w-auto justify-center"
                >
                   Descargar Word (.docx)
                </button>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                <span>Horas cumplidas: {totalHorasEstudiante} hrs</span>
                <span>Meta: 120 hrs</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <div className="bg-[#007A33] h-full transition-all duration-500 rounded-full" style={{ width: `${Math.min((totalHorasEstudiante / 120) * 100, 100)}%` }}></div>
              </div>
            </div>
          )}

          {vistaAlumno === 'informes' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200 shadow-sm h-fit">
                <h3 className="text-[10px] sm:text-xs font-black text-slate-700 uppercase tracking-wider mb-3 sm:mb-4 border-b pb-2">
                  {idInformeEdicion ? 'CORREGIR ACTIVIDAD' : 'NUEVA ACTIVIDAD'}
                </h3>
                <form onSubmit={(e) => { e.preventDefault(); handleGuardarInforme(); }} className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Fecha</label>
                      <input type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-xs font-medium" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Horas</label>
                      <input type="number" required min="1" max="8" value={horas} onChange={(e) => setHoras(e.target.value)} placeholder="Max 8" className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-xs font-medium" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Actividad</label>
                    <input type="text" required value={tituloActividad} onChange={(e) => setTituloActividad(e.target.value)} placeholder="Ej: Redes o Mantenimiento" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Descripción</label>
                    <div className="relative">
                      <textarea required rows="10" value={descripcionActividad} onChange={(e) => setDescripcionActividad(e.target.value)} placeholder="Describe de forma técnica..." className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#007A33]" />
                      <button
                        type="button"
                        onClick={handleMejorarConIA}
                        disabled={cargandoIA || !tituloActividad.trim()}
                        className="absolute bottom-2 right-2 px-3 py-1 bg-[#007A33] text-white text-[10px] font-bold rounded-lg shadow hover:bg-[#005922] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1"
                      >
                        {cargandoIA ? 'Mejorando...' : (
                          <>
                            ✨
                            Mejorar con IA
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Observaciones Adicionales</label>
                    <textarea rows="2" value={observacionAlumno} onChange={(e) => setObservacionAlumno(e.target.value)} placeholder="Notas extras para el docente (opcional)" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#007A33]" />
                  </div>

                  <div className="space-y-2">
                    <button type="submit" className="w-full py-2.5 bg-[#007A33] text-white text-xs font-black uppercase rounded-xl tracking-wider shadow-md">
                      {idInformeEdicion ? 'GUARDAR CAMBIOS' : 'GUARDAR INFORME'}
                    </button>
                    {idInformeEdicion && (
                      <button type="button" onClick={cancelarEdicion} className="w-full py-2 bg-slate-100 text-slate-600 text-xs font-bold uppercase rounded-xl border border-slate-200">
                        CANCELAR EDICIÓN
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white p-3 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-[10px] sm:text-xs font-black text-slate-700 uppercase tracking-wider mb-3 sm:mb-4 border-b pb-2">BITÁCORA DE PRÁCTICAS</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y text-xs">
                    <thead className="bg-slate-50 font-bold text-slate-500 uppercase">
                      <tr>
                        <th className="px-4 py-2 text-left">Fecha/Horas</th>
                        <th className="px-4 py-2 text-left">Actividad</th>
                        <th className="px-4 py-2 text-left">Descripción</th>
                        <th className="px-4 py-2 text-center">Estado</th>
                        <th className="px-4 py-2 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {informesGuardados.map(item => (
                        <React.Fragment key={item.id}>
                          <tr className="hover:bg-slate-50/40">
                            <td className="px-4 py-3 font-bold text-slate-700">{item.fechaFormateada} <span className="block text-[10px] text-slate-400">{item.horas} hrs</span></td>
                            <td className="px-4 py-3 font-semibold text-slate-800">{item.actividad}</td>
                            <td className="px-4 py-3 text-slate-600 max-w-xs">
                              <p className="font-medium">"{item.descripcion}"</p>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${item.estado === 'Aprobado' ? 'bg-emerald-100 text-[#007A33]' : item.estado === 'Rechazado' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                                {item.estado}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex gap-1.5 justify-center items-center">
                                {item.estado === 'Rechazado' ? (
                                  <button onClick={() => cargarInformeParaEditar(item)} className="px-2.5 py-1 bg-[#007A33] text-white text-[9px] font-black uppercase rounded-lg shadow-sm hover:bg-emerald-800 transition-all">
                                    Editar
                                  </button>
                                ) : (
                                  <span className="text-slate-400 text-[9px] italic">Bloqueado</span>
                                )}
                                <button onClick={() => handleEliminarInforme(item.id)} className="px-2 py-1 bg-red-100 text-red-600 text-[9px] font-black uppercase rounded-lg hover:bg-red-200 transition-all" title="Eliminar registro">
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                          {item.estado === 'Rechazado' && item.observaciones && (
                            <tr>
                              <td colSpan="5" className="px-4 pb-3 pt-0">
                                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                                  <span className="text-red-500 font-black text-[10px] uppercase tracking-wider shrink-0 mt-0.5">Corrección:</span>
                                  <p className="text-[11px] text-red-700 font-medium">{item.observaciones}</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                      {informesGuardados.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center p-4 text-slate-400 italic">No tienes informes registrados todavía.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-black text-slate-700 uppercase mb-4 border-b pb-2">PERFIL Y DATOS DE LA PRÁCTICA</h3>
              <form onSubmit={handleActualizarPerfil} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase">Nombre del Estudiante</label>
                    <input type="text" required value={perfilAlumno.nombre} onChange={(e) => setPerfilAlumno({...perfilAlumno, nombre: e.target.value})} placeholder="Tu nombre completo" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-bold text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase">Cédula de Identidad</label>
                    <input type="text" required value={perfilAlumno.cedula} onChange={(e) => setPerfilAlumno({...perfilAlumno, cedula: e.target.value})} placeholder="Ej: 0850xxxxxx" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase">Facultad</label>
                    <input type="text" disabled value={userLogged?.facultad} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold text-slate-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase">Carrera / Ciclo</label>
                    <input type="text" disabled value={`${userLogged?.carrera} - ${userLogged?.ciclo}`} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold text-slate-500" />
                  </div>
                </div>
                <hr className="border-slate-100" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase">Empresa / Institución</label>
                    <input type="text" required value={perfilAlumno.empresa} onChange={(e) => setPerfilAlumno({...perfilAlumno, empresa: e.target.value})} placeholder="Ej: CNT Esmeraldas" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase">Área Técnico</label>
                    <input type="text" required value={perfilAlumno.area} onChange={(e) => setPerfilAlumno({...perfilAlumno, area: e.target.value})} placeholder="Ej: Redes" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase">Nombre del Tutor Empresarial</label>
                  <input type="text" required value={perfilAlumno.tutorEmpresarial} onChange={(e) => setPerfilAlumno({...perfilAlumno, tutorEmpresarial: e.target.value})} placeholder="Ej: Ing. Gabriel Rivas" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium" />
                </div>
                <button type="submit" className="w-full py-3 bg-[#007A33] text-white font-black text-xs uppercase rounded-xl shadow-md tracking-wider">GUARDAR PERFIL DE PRÁCTICAS</button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isLoggedIn && userLogged?.rol.toLowerCase() === 'profesor') {
    return (
      <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 antialiased animate-grid-bg" dir="ltr">
        <BannerNotificacion />
        {reporteARechazar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg mx-4 overflow-hidden">
              <div className="bg-red-50 px-6 py-4 border-b border-red-100">
                <h3 className="text-sm font-black text-red-700 uppercase tracking-wider">Motivo del Rechazo</h3>
                <p className="text-[11px] text-red-500 font-medium">Este campo es obligatorio para notificar al estudiante.</p>
              </div>
              <div className="p-6">
                <textarea
                  autoFocus
                  rows="4"
                  value={observacionRechazo}
                  onChange={(e) => setObservacionRechazo(e.target.value)}
                  placeholder="Describa detalladamente la razón del rechazo..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-red-400 resize-none"
                />
                <div className="flex gap-3 mt-4 justify-end">
                  <button onClick={handleCancelReject} className="px-5 py-2.5 bg-slate-100 text-slate-600 text-xs font-black uppercase rounded-xl border border-slate-200 hover:bg-slate-200 transition-all">
                    Cancelar
                  </button>
                  <button onClick={handleConfirmReject} className="px-5 py-2.5 bg-[#E60000] text-white text-xs font-black uppercase rounded-xl hover:bg-red-700 transition-all shadow-md">
                    Confirmar Rechazo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <nav className="bg-[#007A33] border-b-4 border-[#E60000] text-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 flex justify-between min-h-14 sm:min-h-16 items-center gap-1 sm:gap-2">
            <div className="flex items-center gap-1 sm:gap-6 min-w-0">
              <div className="flex items-center gap-1 sm:gap-3 shrink-0">
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/20/ESCUDETO_UTE-LVT.png" alt="Logo UTE-LVT" className="h-8 sm:h-10 w-auto object-contain bg-white p-0.5 sm:p-1 rounded-lg" />
                <div className="flex flex-col">
                  <span className="text-[10px] sm:text-base font-black uppercase tracking-wide leading-tight sm:leading-normal">Supervisión Académica</span>
                  <span className="hidden sm:block text-[10px] font-bold text-emerald-100 uppercase tracking-widest">UTLVTE - Vinculación</span>
                </div>
              </div>

              <div className="flex gap-1 bg-[#006329] p-0.5 sm:p-1 rounded-xl text-[10px] sm:text-xs font-bold overflow-x-auto">
                <button onClick={() => setVistaProfesor('alumnos')} className={`px-2 sm:px-4 py-1 sm:py-1.5 rounded-lg transition-all whitespace-nowrap ${vistaProfesor === 'alumnos' ? 'bg-white text-[#007A33]' : 'text-emerald-100'}`}>ALUMNOS</button>
                {cursoDesbloqueado && (
                  <button onClick={() => { setVistaProfesor('dashboard'); fetchAnalyticsData(); }} className={`px-2 sm:px-4 py-1 sm:py-1.5 rounded-lg transition-all whitespace-nowrap ${vistaProfesor === 'dashboard' ? 'bg-white text-[#007A33]' : 'text-emerald-100'}`}>Dashboard</button>
                )}
                <button onClick={() => setVistaProfesor('perfil')} className={`px-2 sm:px-4 py-1 sm:py-1.5 rounded-lg transition-all whitespace-nowrap ${vistaProfesor === 'perfil' ? 'bg-white text-[#007A33]' : 'text-emerald-100'}`}>MI PERFIL</button>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-4 shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black uppercase text-white">{userLogged?.nombre}</p>
                <p className="text-[9px] font-bold text-emerald-200 uppercase tracking-wider">Docente Tutor</p>
              </div>
              <button onClick={handleCerrarSesion} className="bg-[#E60000] hover:bg-[#C00000] text-white font-black text-[8px] sm:text-[10px] py-1.5 sm:py-2 px-2 sm:px-4 rounded-xl uppercase tracking-wider transition-all whitespace-nowrap">Salir</button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto py-6 px-4">
          {vistaProfesor === 'perfil' ? (
            <div className="max-w-lg mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-black text-slate-700 uppercase mb-4 border-b pb-2">MIS DATOS DE DOCENTE</h3>
              <form onSubmit={handleActualizarPerfilDocente} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Nombre Completo</label>
                  <input type="text" required value={perfilDocente.nombre} onChange={(e) => setPerfilDocente({ ...perfilDocente, nombre: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-bold text-slate-800 outline-none focus:border-[#007A33]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Correo Institucional</label>
                  <input type="email" required value={perfilDocente.correo} onChange={(e) => setPerfilDocente({ ...perfilDocente, correo: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium text-slate-700 outline-none focus:border-[#007A33]" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Facultad</label>
                    <select value={perfilDocente.facultad} onChange={(e) => { setPerfilDocente({ ...perfilDocente, facultad: e.target.value }); setCursoDesbloqueado(false); }} className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white outline-none">
                      <option value="">--- Seleccione ---</option>
                      {Object.keys(estructuraUniversitaria).map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Carrera</label>
                    <select value={perfilDocente.carrera} disabled={!perfilDocente.facultad} onChange={(e) => { setPerfilDocente({ ...perfilDocente, carrera: e.target.value }); setCursoDesbloqueado(false); }} className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white outline-none">
                      <option value="">--- Seleccione ---</option>
                      {perfilDocente.facultad && estructuraUniversitaria[perfilDocente.facultad]?.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full bg-[#007A33] hover:bg-emerald-800 text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider transition-all shadow-md">ACTUALIZAR DATOS INSTITUCIONALES</button>
              </form>
            </div>
          ) : vistaProfesor === 'dashboard' ? (
            <div className="space-y-6">
              {analyticsData ? (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden">
                      <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 to-white">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#007A33]/10 flex items-center justify-center">
                            <svg className="w-4 h-4 text-[#007A33]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Horas Aprobadas</h3>
                            <p className="text-[10px] text-slate-400 font-semibold">Top de estudiantes del curso</p>
                          </div>
                        </div>
                      </div>
                  <div className="p-3 sm:p-5">
                    {analyticsData.studentsHoursArray.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={analyticsData.studentsHoursArray} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                              <XAxis dataKey="shortName" tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} angle={-20} textAnchor="end" height={60} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                              <Bar dataKey="hours" name="Horas Aprobadas" fill="#007A33" radius={[6, 6, 0, 0]} maxBarSize={48} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-16 text-center">
                            <svg className="w-10 h-10 text-slate-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>
                            <p className="text-slate-400 text-xs font-semibold">No hay horas aprobadas registradas.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden">
                      <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-amber-50/80 to-white">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"/><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 3H19.5V9"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 12.5A8.5 8.5 0 1112.5 4"/></svg>
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Distribución de Estados</h3>
                            <p className="text-[10px] text-slate-400 font-semibold">General de bitácoras del curso</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-5">
                        {analyticsData.statusDistribution.length > 0 ? (
                          <ResponsiveContainer width="100%" height={320}>
                            <PieChart>
                              <Pie data={analyticsData.statusDistribution} cx="50%" cy="50%" outerRadius={110} innerRadius={60} dataKey="value" paddingAngle={3} cornerRadius={6}>
                                {analyticsData.statusDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                              <Legend
                                verticalAlign="bottom"
                                iconType="circle"
                                iconSize={10}
                                wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingTop: 12 }}
                                formatter={(value) => {
                                  const entry = analyticsData.statusDistribution.find(e => e.name === value);
                                  return `${value}: ${entry?.value || 0}`;
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-16 text-center">
                            <svg className="w-10 h-10 text-slate-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"/><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 3H19.5V9"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 12.5A8.5 8.5 0 1112.5 4"/></svg>
                            <p className="text-slate-400 text-xs font-semibold">No hay bitácoras registradas.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-800/10 flex items-center justify-center">
                          <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Semáforo de Riesgo</h3>
                          <p className="text-[10px] text-slate-400 font-semibold">Monitoreo de productividad por estudiante</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {analyticsData.riskData.map(est => {
                          const risk = getRiskInfo(est.totalRecords);
                          return (
                            <div key={est.id} className={`p-4 rounded-xl border ${risk.bg} ${risk.border} ${risk.pulse ? 'animate-risk-pulse' : 'hover:shadow-md'} transition-all duration-300`}>
                              <div className="flex items-center justify-between mb-2.5">
                                <p className="text-xs font-black text-slate-700 truncate max-w-[140px]">{est.nombre}</p>
                                <span className={`px-2.5 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-wider shadow-sm ${risk.badge}`}>{risk.level}</span>
                              </div>
                              <div className="flex items-end justify-between">
                                <p className={`text-[13px] font-black ${risk.text}`}>
                                  {est.totalRecords}
                                </p>
                                <p className={`text-[9px] font-bold ${risk.text} opacity-70`}>
                                  {est.totalRecords === 1 ? 'REGISTRO' : 'REGISTROS'}
                                </p>
                              </div>
                              <div className={`mt-2.5 h-1.5 rounded-full bg-white/60 overflow-hidden ${risk.pulse ? '' : ''}`}>
                                <div className={`h-full rounded-full ${risk.badge} ${risk.pulse ? 'animate-pulse' : ''}`} style={{ width: `${Math.min((est.totalRecords / 10) * 100, 100)}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-slate-300 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                  </div>
                  <p className="text-sm font-bold text-slate-400">Cargando datos de analítica...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase border-b pb-1.5 mb-3">SELECCIÓN DE CURSO</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-4 items-end">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Facultad</label>
                    <input type="text" value={userLogged?.facultad || filtroFacultad} disabled className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-100 text-slate-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Carrera</label>
                    <input type="text" value={userLogged?.carrera || filtroCarrera} disabled className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-100 text-slate-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Ciclo</label>
                    <select value={filtroCiclo} onChange={(e) => { setFiltroCiclo(e.target.value); setCursoDesbloqueado(false); }} className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50">
                      <option value="">--- Seleccione Ciclo ---</option>
                      {['3ro Ciclo', '4to Ciclo', '5to Ciclo', '6to Ciclo', '7mo Ciclo', '8vo Ciclo', '9no Ciclo'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Paralelo</label>
                    <select value={filtroParalelo} onChange={(e) => { setFiltroParalelo(e.target.value); setCursoDesbloqueado(false); }} className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50">
                      <option value="">--- Seleccione Paralelo ---</option>
                      {['Paralelo A', 'Paralelo B'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#007A33] uppercase mb-1">Clave del Curso</label>
                    <input type="password" value={cursoPasswordInput} onChange={(e) => setCursoPasswordInput(e.target.value)} placeholder="Contraseña" className="w-full p-2 border border-emerald-200 rounded-xl text-xs font-semibold bg-emerald-50/20" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#007A33] uppercase mb-1">Acción</label>
                    <button type="button" onClick={handleValidarCurso} className="w-full px-4 py-2 bg-[#007A33] text-white text-[11px] font-black uppercase rounded-xl hover:bg-emerald-800 transition-all shadow-md">Cargar</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <h4 className="text-[10px] sm:text-xs font-black text-slate-800 uppercase border-b pb-1.5 mb-2">ALUMNOS ({estudiantesFiltrados.length})</h4>

                  {!cursoDesbloqueado ? (
                    <p className="text-emerald-800 text-[11px] font-bold italic bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/50">Seleccione ciclo, paralelo e ingrese la clave del curso.</p>
                  ) : estudiantesFiltrados.length > 0 ? (
                    estudiantesFiltrados.map(est => (
                      <button key={est.id} onClick={() => handleSeleccionarEstudianteDocente(est.id)} className={`w-full text-left p-2.5 rounded-xl border text-xs font-bold transition-all ${est.id === idEstudianteSeleccionado ? 'border-[#007A33] bg-emerald-50 text-[#007A33]' : 'border-slate-100 hover:bg-slate-50 bg-white'}`}>
                        {est.nombre}
                        <span className="block text-[10px] text-slate-400 font-normal truncate">{est.empresa}</span>
                      </button>
                    ))
                  ) : (
                    <p className="text-slate-400 text-[11px] italic p-2">No hay alumnos.</p>
                  )}
                </div>

                <div className="lg:col-span-3 bg-white p-3 sm:p-5 rounded-2xl border border-slate-200 shadow-sm min-h-[300px]">
                  {estudianteAuditado ? (
                    <div>
                      <div className="border-b pb-3 mb-4">
                        <h4 className="text-[11px] sm:text-sm font-black text-slate-700 uppercase">REPORTES DE: {estudianteAuditado.nombre}</h4>
                        <p className="text-[11px] text-slate-500 font-medium">Empresa: {estudianteAuditado.empresa} | Departamento: {estudianteAuditado.area}</p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y text-xs">
                          <thead className="bg-slate-50 font-bold text-slate-500 uppercase">
                            <tr>
                              <th className="px-4 py-2 text-left">Fecha / Horas</th>
                              <th className="px-4 py-2 text-left">Actividad</th>
                              <th className="px-4 py-2 text-left">Descripción</th>
                              <th className="px-4 py-2 text-center">Estado</th>
                              <th className="px-4 py-2 text-center">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {informesEstudianteSeleccionado.map(inf => (
                              <tr key={inf.id} className="hover:bg-slate-50/50">
                                <td className="px-4 py-3 font-bold text-slate-700">{inf.fechaFormateada} <span className="block text-[10px] text-slate-400">{inf.horas} hrs</span></td>
                                <td className="px-4 py-3 font-semibold text-slate-800">{inf.actividad}</td>
                                <td className="px-4 py-3 text-slate-600 max-w-xs">
                                  <p className="font-medium">"{inf.descripcion}"</p>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${inf.estado === 'Aprobado' ? 'bg-emerald-100 text-[#007A33]' : inf.estado === 'Rechazado' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                                    {inf.estado}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <div className="flex gap-1.5 justify-center">
                                    <button onClick={() => handleAprobarInforme(inf.id)} className="px-2.5 py-1 bg-[#007A33] text-white text-[9px] font-black uppercase rounded-lg hover:bg-emerald-800 transition-all">Aprobar</button>
                                    <button onClick={() => handleOpenRejectModal(inf.id)} className="px-2.5 py-1 bg-[#E60000] text-white text-[9px] font-black uppercase rounded-lg hover:bg-red-700 transition-all">Rechazar</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {informesEstudianteSeleccionado.length === 0 && (
                              <tr>
                                <td colSpan="5" className="text-center p-4 italic text-slate-400">Este estudiante no ha guardado nuevas actividades.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center pt-16 space-y-2">
                      <p className="text-slate-400 text-xs italic">Selecciona un alumno del listado izquierdo.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-[#f1f5f9] flex flex-col justify-center items-center py-6 sm:py-12 px-3 sm:px-4 relative overflow-hidden animate-grid-bg" dir="ltr">
      <BannerNotificacion />

      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#007A33]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#E60000]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="text-center mb-4 sm:mb-6 space-y-2 sm:space-y-3 relative z-10 animate-float-card flex flex-col items-center">
        <img src="https://upload.wikimedia.org/wikipedia/commons/2/20/ESCUDETO_UTE-LVT.png" alt="Escudo Oficial UTE-LVT" className="h-20 sm:h-28 w-auto object-contain drop-shadow-xl mb-1 sm:mb-2" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight uppercase">PRACTICAS 360</h1>
          <div className="h-1 w-20 sm:w-24 bg-[#E60000] mx-auto my-1 sm:my-1.5 rounded-full animate-pulse-line-green"></div>
          <p className="hidden sm:block text-[10px] font-black text-[#007A33] uppercase tracking-widest">UNIVERSIDAD TÉCNICA LUIS VARGAS TORRES</p>
        </div>
      </div>

      <div className="glass-container p-4 sm:p-8 shadow-2xl rounded-3xl border border-white/60 w-full max-w-lg relative z-10">
        {isRegisterMode && (
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/50 rounded-2xl border border-slate-300/40">
              <button type="button" onClick={() => setRole('alumno')} className={`py-2.5 text-[11px] font-black rounded-xl uppercase tracking-wider transition-all ${role === 'alumno' ? 'bg-[#007A33] text-white shadow-md' : 'text-slate-600 font-bold hover:text-slate-900'}`}>Alumno</button>
              <button type="button" onClick={() => setRole('profesor')} className={`py-2.5 text-[11px] font-black rounded-xl uppercase tracking-wider transition-all ${role === 'profesor' ? 'bg-[#007A33] text-white shadow-md' : 'text-slate-600 font-bold hover:text-slate-900'}`}>Docente</button>
            </div>
          </div>
        )}

        {!isRegisterMode ? (
          <form className="space-y-4" onSubmit={handleSubmitLogin}>
            <div>
              <label className="block text-[10px] font-black text-[#007A33] tracking-wide mb-1 pl-1 uppercase">Correo Institucional</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@utelvt.edu.ec" className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:border-[#007A33] font-medium" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#007A33] tracking-wide mb-1 pl-1 uppercase">Contraseña</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:border-[#007A33] font-medium" />
            </div>

            <div className="pt-2">
              <button type="submit" className="w-full py-3.5 bg-[#007A33] hover:bg-emerald-800 text-white font-black text-xs uppercase rounded-xl tracking-widest transition-all shadow-md">Ingresar</button>
            </div>

            <div className="relative flex py-2 items-center justify-center">
              <div className="border-t border-slate-200 w-1/4"></div>
              <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">O</span>
              <div className="border-t border-slate-200 w-1/4"></div>
            </div>

            <p className="text-center text-xs font-bold text-slate-500">¿No tienes cuenta activa? <button type="button" onClick={() => setIsRegisterMode(true)} className="text-[#007A33] hover:text-emerald-800 underline font-black ml-1">Regístrate aquí</button></p>
          </form>
        ) : (
          <form className="space-y-3.5" onSubmit={handleRegisterSubmit}>
            <div className="text-center border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Formulario de Afiliación</h3>
            </div>
            {role === 'alumno' ? (
              <div className="space-y-2.5">
                <input type="text" required value={regFullName} onChange={(e) => setRegFullName(e.target.value)} placeholder="Nombres Completos (2 nombres + 2 apellidos)" className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white outline-none" />
                <div>
                  <input type="email" required value={regEmail} disabled readOnly className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-100 text-slate-500 outline-none" />
                  <span className="text-[9px] text-slate-400 font-medium pl-1">Generado automáticamente del nombre</span>
                </div>
                <input type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Contraseña" className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white outline-none" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select value={regFacultad} onChange={(e) => { setRegFacultad(e.target.value); setRegCarrera(''); }} className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white font-bold text-slate-700 outline-none">
                    <option value="">Facultad</option>
                    {Object.keys(estructuraUniversitaria).map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <select value={regCarrera} disabled={!regFacultad} onChange={(e) => setRegCarrera(e.target.value)} className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white font-bold text-slate-700 outline-none">
                    <option value="">Carrera</option>
                    {estructuraUniversitaria[regFacultad]?.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <select value={regCiclo} onChange={(e) => setRegCiclo(e.target.value)} className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white font-bold text-slate-700 outline-none">
                    <option value="">Ciclo</option>
                    {['3ro Ciclo', '4to Ciclo', '5to Ciclo', '6to Ciclo', '7mo Ciclo', '8vo Ciclo', '9no Ciclo'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={regParalelo} onChange={(e) => setRegParalelo(e.target.value)} className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white font-bold text-slate-700 outline-none">
                    <option value="">Paralelo</option>
                    {['Paralelo A', 'Paralelo B'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <input type="text" required value={regProfName} onChange={(e) => setRegProfName(e.target.value)} placeholder="Nombres Completos (2 nombres + 2 apellidos)" className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white font-medium" />
                <div>
                  <input type="email" required value={regProfEmail} disabled readOnly className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-100 text-slate-500 font-medium" />
                  <span className="text-[9px] text-slate-400 font-medium pl-1">Generado automáticamente del nombre</span>
                </div>
                <input type="password" required value={regProfPassword} onChange={(e) => setRegProfPassword(e.target.value)} placeholder="Contraseña" className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white font-medium" />
                <div className="grid grid-cols-2 gap-2.5">
                  <select value={regProfFacultad} onChange={(e) => { setRegProfFacultad(e.target.value); setRegProfCarrera(''); }} className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white font-bold text-slate-700 outline-none">
                    <option value="">Facultad</option>
                    {Object.keys(estructuraUniversitaria).map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <select value={regProfCarrera} disabled={!regProfFacultad} onChange={(e) => setRegProfCarrera(e.target.value)} className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white font-bold text-slate-700 outline-none">
                    <option value="">Carrera</option>
                    {estructuraUniversitaria[regProfFacultad]?.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <input type="password" required value={regProfKey} onChange={(e) => setRegProfKey(e.target.value)} placeholder="Clave de Registro Docente" className="block w-full px-3 py-2.5 border border-red-300 rounded-xl text-xs bg-red-50/30 font-medium placeholder:text-red-400" />
              </div>
            )}

            <div className="pt-2">
              <button type="submit" className="w-full py-3.5 bg-[#007A33] hover:bg-emerald-800 text-white text-xs font-black uppercase rounded-xl tracking-widest transition-all shadow-md">Crear Cuenta</button>
            </div>
            <p className="text-center text-xs font-bold text-slate-500">¿Ya tienes cuenta? <button type="button" onClick={() => setIsRegisterMode(false)} className="text-[#E60000] hover:text-red-700 underline font-black ml-1">Inicia sesión</button></p>
          </form>
        )}
      </div>
    </div>
  );
}

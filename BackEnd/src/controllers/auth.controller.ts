import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { prisma } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'clave_por_defecto';

const normalizeRole = (role: unknown): Role => {
  if (typeof role !== 'string') {
    return Role.ALUMNO;
  }

  const normalized = role.trim().toUpperCase();

  if (normalized in Role) {
    return Role[normalized as keyof typeof Role];
  }

  return Role.ALUMNO;
};

const parseDate = (value: unknown): Date | undefined => {
  if (!value || typeof value !== 'string') {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      email,
      password,
      rol,
      role,
      nombre,
      fullName,
      cedula,
      nationalId,
      facultad,
      faculty,
      carrera,
      career,
      ciclo,
      cycle,
      paralelo,
      parallel,
      empresa,
      companyName,
      areaEmpresa,
      technicalArea,
      fechaInicio,
      officialStartDate,
      fechaFin,
      tentativeEndDate,
      tutorId,
      academicTutorId,
      tutorEmpresarial,
      companySupervisorName,
      cargoTutorEmpresarial,
      companySupervisorPosition,
    } = req.body;

    // 1. Validación básica de credenciales
    if (!email || !password) {
      res.status(400).json({ message: 'Email y password son obligatorios.' });
      return;
    }

    const selectedRole = normalizeRole(role ?? rol);

    // 2. Validación preventiva para Perfil de Alumno (Evita el choque de "fullName is missing")
    const finalFullName = fullName ?? nombre;
    if (selectedRole === Role.ALUMNO && !finalFullName) {
      res.status(400).json({ message: 'El campo fullName (o nombre) es obligatorio para registrar un ALUMNO.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Creación del usuario en la Base de Datos
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: selectedRole,
        ...(selectedRole === Role.ALUMNO
          ? {
             studentProfile: {
  create: {
    fullName: finalFullName,
    nationalId: nationalId ?? cedula ?? "",
    faculty: faculty ?? facultad,
    career: career ?? carrera,
    cycle: cycle ?? ciclo,
    parallel: parallel ?? paralelo,
    // CAMBIA ESTAS DOS LÍNEAS PARA DARLES UN TEXTO VACÍO POR DEFECTO:
    companyName: companyName ?? empresa ?? "",
    technicalArea: technicalArea ?? areaEmpresa ?? "",
    
    officialStartDate: parseDate(officialStartDate ?? fechaInicio) ?? new Date(),
    tentativeEndDate: parseDate(tentativeEndDate ?? fechaFin) ?? new Date(),
    academicTutorId: academicTutorId ?? tutorId ?? undefined,
    companySupervisorName: companySupervisorName ?? tutorEmpresarial ?? undefined,
    companySupervisorPosition: companySupervisorPosition ?? cargoTutorEmpresarial ?? undefined,
  },
},
            }
          : {}),
      },
      include: {
        studentProfile: true,
      },
    });

    res.status(201).json({
      message: 'Usuario registrado con exito.',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        studentProfileId: user.studentProfile?.id,
      },
    });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      res.status(409).json({ message: 'El email o la cedula ya estan registrados.' });
      return;
    }

    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor al registrar usuario.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email y password son obligatorios.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { studentProfile: true },
    });

    if (!user) {
      res.status(401).json({ message: 'Credenciales incorrectas.' });
      return;
    }

    const passwordIsValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordIsValid) {
      res.status(401).json({ message: 'Credenciales incorrectas.' });
      return;
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });

    res.status(200).json({
      message: 'Inicio de sesion exitoso.',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        studentProfileId: user.studentProfile?.id,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor al iniciar sesion.' });
  }
};
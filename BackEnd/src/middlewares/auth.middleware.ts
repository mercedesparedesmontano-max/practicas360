import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'clave_por_defecto';

// Definimos la estructura de lo que viene dentro del Token (Payload)
interface TokenPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

// Extendemos la interfaz de Express para que acepte nuestra propiedad personalizada 'user'
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  // 1. Obtener el encabezado 'Authorization' de la petición
  const authHeader = req.headers['authorization'];
  
  // Los tokens suelen venir en formato: "Bearer TOKEN_LARGO_AQUÍ"
  const token = authHeader && authHeader.split(' ')[1];

  // 2. Si no viene ningún token, bloqueamos el acceso de inmediato
  if (!token) {
    res.status(401).json({ message: 'Acceso denegado. No se proporcionó un token de autenticación.' });
    return;
  }

  try {
    // 3. Verificar si el token es legítimo y no ha expirado
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    // 4. Inyectar los datos del usuario dentro de la petición actual
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    // 5. ¡Luz verde! Pasamos al siguiente controlador o ruta
    next();
  } catch (error) {
    // Si el token fue manipulado, expiró o es falso, devolvemos un Error 403 (Prohibido)
    res.status(403).json({ message: 'Token de autenticación inválido o expirado.' });
  }
};
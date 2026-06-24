import { authenticateToken } from '../middlewares/auth.middleware';
import { Router } from 'express';
import { register, login } from '../controllers/auth.controller'; // Verifica que los puntos estén bien (../)

const router = Router();

router.post('/register', register);
router.post('/login', login);

router.get('/perfil-privado', authenticateToken, (req, res) => {
  res.json({
    message: "¡Bienvenido a tu zona privada, alumno!",
    userLogged: req.user // Aquí verás los datos que el middleware extrajo del token
  });
}); 

export default router;
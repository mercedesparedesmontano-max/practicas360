import { Router } from 'express';
import { enhanceDescription } from '../controllers/ai.controller';

const router = Router();

router.post('/enhance-description', enhanceDescription);

export default router;

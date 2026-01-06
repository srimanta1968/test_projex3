import { Router } from 'express';
import { uiController } from '../controllers/uiController';

const router = Router();

// GET /api/ui/dashboard
router.get('/dashboard', uiController.getDashboard.bind(uiController));
router.get('/logs', uiController.getLogs.bind(uiController));
router.get('/sources', uiController.getSources.bind(uiController));

export default router;

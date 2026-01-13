import { Router, Request, Response, RequestHandler } from 'express';
import authController from '../controllers/authController';

/**
 * Auth Routes - handles user authentication endpoints
 */
const router: Router = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
const registerHandler: RequestHandler = authController.register as RequestHandler;
router.post('/register', registerHandler);

export default router;

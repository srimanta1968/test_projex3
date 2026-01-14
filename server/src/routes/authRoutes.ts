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

/**
 * @route POST /api/auth/login
 * @desc Login an existing user
 * @access Public
 */
const loginHandler: RequestHandler = authController.login as RequestHandler;
router.post('/login', loginHandler);

export default router;

//testing
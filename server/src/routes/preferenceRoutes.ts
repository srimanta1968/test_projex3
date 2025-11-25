import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { userPreferenceService } from '../services/UserPreferenceService';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/preferences
 * Get all preferences for the authenticated user
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const preferences = await userPreferenceService.getPreferences(authReq.user!.userId);
    res.json({ success: true, data: preferences });
  })
);

/**
 * GET /api/preferences/:type
 * Get a specific preference by type
 */
router.get(
  '/:type',
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const preference = await userPreferenceService.getPreferenceByType(
      authReq.user!.userId,
      req.params.type
    );
    res.json({ success: true, data: preference });
  })
);

/**
 * POST /api/preferences
 * Create or update a preference
 */
router.post(
  '/',
  [
    body('preference_type').notEmpty().withMessage('Preference type is required'),
    body('preference_value').notEmpty().withMessage('Preference value is required'),
    validateRequest,
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const preference = await userPreferenceService.setPreference(authReq.user!.userId, req.body);
    res.status(201).json({ success: true, data: preference });
  })
);

/**
 * PUT /api/preferences/:id
 * Update a specific preference
 */
router.put(
  '/:id',
  [
    body('preference_type').optional().notEmpty(),
    body('preference_value').optional().notEmpty(),
    validateRequest,
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const preference = await userPreferenceService.updatePreference(
      authReq.user!.userId,
      req.params.id,
      req.body
    );
    res.json({ success: true, data: preference });
  })
);

/**
 * DELETE /api/preferences/:id
 * Delete a preference
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    await userPreferenceService.deletePreference(authReq.user!.userId, req.params.id);
    res.json({ success: true, message: 'Preference deleted' });
  })
);

/**
 * POST /api/preferences/bulk
 * Set multiple preferences at once
 */
router.post(
  '/bulk',
  [
    body('preferences').isArray().withMessage('Preferences must be an array'),
    body('preferences.*.preference_type').notEmpty().withMessage('Preference type is required'),
    body('preferences.*.preference_value').notEmpty().withMessage('Preference value is required'),
    validateRequest,
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const preferences = await userPreferenceService.setMultiplePreferences(
      authReq.user!.userId,
      req.body.preferences
    );
    res.status(201).json({ success: true, data: preferences });
  })
);

export default router;

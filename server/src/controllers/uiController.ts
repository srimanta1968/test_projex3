import { Request, Response } from 'express';
import { uiService } from '../services/uiService';

export class UiController {
  /**
   * Get dashboard data
   */
  async getDashboard(req: Request, res: Response) {
    try {
      const data = await uiService.getDashboardData();

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Dashboard controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

// Singleton instance
export const uiController = new UiController();

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

  /**
   * Get logs with filtering
   */
  async getLogs(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const { source, level, startDate, endDate, search } = req.query;

      const result = await uiService.getLogs({
        page,
        limit,
        source: source as string,
        level: level as string,
        startDate: startDate as string,
        endDate: endDate as string,
        search: search as string
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get logs error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get available sources
   */
  async getSources(req: Request, res: Response) {
    try {
      const sources = await uiService.getSources();

      res.json({
        success: true,
        data: sources
      });
    } catch (error) {
      console.error('Get sources error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

// Singleton instance
export const uiController = new UiController();

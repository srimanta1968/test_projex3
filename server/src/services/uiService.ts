import { dataService } from './dataService';

export interface DashboardData {
  totalLogs: number;
  errorRate: number;
  activeSources: number;
  recentLogs: any[];
}

export class UiService {
  /**
   * Get dashboard statistics
   */
  async getDashboardData(): Promise<DashboardData> {
    try {
      // Get total logs count
      const cloudwatchCount = await dataService.query(
        'SELECT COUNT(*) as count FROM cloudwatch_logs'
      );

      const slackCount = await dataService.query(
        'SELECT COUNT(*) as count FROM slack_logs'
      );

      const customCount = await dataService.query(
        'SELECT COUNT(*) as count FROM custom_app_logs'
      );

      const totalLogs = parseInt(cloudwatchCount.rows[0].count) +
                        parseInt(slackCount.rows[0].count) +
                        parseInt(customCount.rows[0].count);

      // Get error rate (assuming log_level = 'ERROR' in cloudwatch_logs)
      const errorCount = await dataService.query(
        'SELECT COUNT(*) as count FROM cloudwatch_logs WHERE log_level = $1',
        ['ERROR']
      );

      const errorRate = totalLogs > 0 ? parseInt(errorCount.rows[0].count) / totalLogs : 0;

      // Get active sources (sources with logs in last 24 hours)
      const activeSources = await dataService.query(`
        SELECT COUNT(DISTINCT source) as count FROM (
          SELECT 'cloudwatch' as source FROM cloudwatch_logs WHERE created_at > NOW() - INTERVAL '24 hours'
          UNION
          SELECT 'slack' as source FROM slack_logs WHERE created_at > NOW() - INTERVAL '24 hours'
          UNION
          SELECT 'custom' as source FROM custom_app_logs WHERE created_at > NOW() - INTERVAL '24 hours'
        ) as active_sources
      `);

      // Get recent logs (last 10 from each source)
      const recentCloudwatch = await dataService.query(
        'SELECT id, timestamp, message, log_level as level, service_name as source FROM cloudwatch_logs ORDER BY created_at DESC LIMIT 10'
      );

      const recentSlack = await dataService.query(
        'SELECT id, timestamp, message, \'INFO\' as level, \'slack\' as source FROM slack_logs ORDER BY created_at DESC LIMIT 10'
      );

      const recentCustom = await dataService.query(
        'SELECT id, timestamp, log_content as message, log_type as level, application_name as source FROM custom_app_logs ORDER BY created_at DESC LIMIT 10'
      );

      const recentLogs = [
        ...recentCloudwatch.rows.map((row: any) => ({ ...row, timestamp: row.timestamp?.toISOString() })),
        ...recentSlack.rows.map((row: any) => ({ ...row, timestamp: row.timestamp?.toISOString() })),
        ...recentCustom.rows.map((row: any) => ({ ...row, timestamp: row.timestamp?.toISOString() }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 20);

      return {
        totalLogs,
        errorRate,
        activeSources: parseInt(activeSources.rows[0].count),
        recentLogs
      };
    } catch (error) {
      console.error('Dashboard data error:', error);
      // Return default data if query fails
      return {
        totalLogs: 0,
        errorRate: 0,
        activeSources: 0,
        recentLogs: []
      };
    }
  }
}

// Singleton instance
export const uiService = new UiService();

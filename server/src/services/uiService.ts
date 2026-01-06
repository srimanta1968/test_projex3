import { dataService } from './dataService';

export interface DashboardData {
  totalLogs: number;
  errorRate: number;
  activeSources: number;
  recentLogs: any[];
}

export interface LogFilter {
  page: number;
  limit: number;
  source?: string;
  level?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  level: string;
  source: string;
  type: string;
}

export class UiService {
  /**
   * Get logs with filtering
   */
  async getLogs(filter: LogFilter) {
    try {
      const { page, limit, source, level, startDate, endDate, search } = filter;
      const offset = (page - 1) * limit;
      const params: any[] = [];
      let paramIndex = 1;

      // Base query parts
      let whereConditions: string[] = [];

      if (startDate) {
        whereConditions.push(`timestamp >= $${paramIndex++}`);
        params.push(startDate);
      }
      if (endDate) {
        whereConditions.push(`timestamp <= $${paramIndex++}`);
        params.push(endDate);
      }
      if (level) {
        whereConditions.push(`level = $${paramIndex++}`);
        params.push(level);
      }
      // Note: source filtering logic would be more complex with UNION, 
      // simplified here to filter by the 'source' column in the projected union
      if (source) {
        whereConditions.push(`source = $${paramIndex++}`);
        params.push(source);
      }
      if (search) {
        whereConditions.push(`message LIKE $${paramIndex++}`);
        params.push(`%${search}%`);
      }

      const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

      // UNION Query
      // We construct the UNION first, then wrap it to apply WHERE and LIMIT
      // This is safer for performance on large datasets if indexed, but for prototype sub-query is fine
      const query = `
        SELECT * FROM (
          SELECT id, timestamp, message, log_level as level, service_name as source, 'cloudwatch' as type FROM cloudwatch_logs
          UNION ALL
          SELECT id, timestamp, message, 'INFO' as level, 'slack' as source, 'slack' as type FROM slack_logs
          UNION ALL
          SELECT id, timestamp, log_content as message, log_type as level, application_name as source, 'custom' as type FROM custom_app_logs
        ) as combined_logs
        ${whereClause}
        ORDER BY timestamp DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;

      params.push(limit, offset);

      const result = await dataService.query(query, params);

      // Get total count for pagination (simplified, separate query without limit)
      const countQuery = `
        SELECT COUNT(*) as total FROM (
          SELECT id, timestamp, message, log_level as level, service_name as source FROM cloudwatch_logs
          UNION ALL
          SELECT id, timestamp, message, 'INFO' as level, 'slack' as source FROM slack_logs
          UNION ALL
          SELECT id, timestamp, log_content as message, log_type as level, application_name as source FROM custom_app_logs
        ) as combined_logs
        ${whereClause}
      `;

      // We reuse params excluding limit/offset
      const countParams = params.slice(0, params.length - 2);
      const countResult = await dataService.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total);

      return {
        logs: result.rows,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };

    } catch (error) {
      console.error('Get logs error:', error);
      return { logs: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  /**
   * Get available sources
   */
  async getSources() {
    try {
      // Aggregate distinct sources
      const query = `
        SELECT DISTINCT source FROM (
          SELECT service_name as source FROM cloudwatch_logs
          UNION
          SELECT 'slack' as source
          UNION
          SELECT application_name as source FROM custom_app_logs
        ) as all_sources
        WHERE source IS NOT NULL
        ORDER BY source
      `;

      const result = await dataService.query(query);
      return result.rows.map((row: any) => row.source);
    } catch (error) {
      console.error('Get sources error:', error);
      return [];
    }
  }

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

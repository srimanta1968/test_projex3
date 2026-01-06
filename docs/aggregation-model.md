# Log Aggregation Model Design

## Overview

The log aggregation model defines how log data is collected, processed, and aggregated for analysis and reporting. This design supports real-time and batch aggregation of logs from multiple sources (CloudWatch, Slack, custom applications).

## Core Concepts

### 1. Raw Log Entry

- **Source**: CloudWatch, Slack, Application logs
- **Fields**: timestamp, level, message, source, metadata
- **Storage**: Raw logs table for audit trail

### 2. Parsed Log Entry

- **Parsing**: Extract structured data from raw messages
- **Fields**: timestamp, level, category, user_id, action, duration, error_code, etc.
- **Storage**: Parsed logs table with indexed fields

### 3. Aggregation Dimensions

- **Time-based**: By minute, hour, day, week, month
- **Category-based**: By log level, source, category, user
- **Metric-based**: Count, average duration, error rates, throughput

## Database Schema

### Tables

#### raw_logs

```sql
CREATE TABLE raw_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source VARCHAR(50) NOT NULL, -- 'cloudwatch', 'slack', 'application'
    external_id VARCHAR(255), -- AWS log stream ID, Slack channel ID, etc.
    timestamp TIMESTAMP NOT NULL,
    level VARCHAR(20), -- ERROR, WARN, INFO, DEBUG
    message TEXT NOT NULL,
    metadata JSONB, -- Additional structured data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### parsed_logs

```sql
CREATE TABLE parsed_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_log_id UUID REFERENCES raw_logs(id),
    timestamp TIMESTAMP NOT NULL,
    level VARCHAR(20) NOT NULL,
    category VARCHAR(100), -- 'auth', 'api', 'database', 'external'
    user_id VARCHAR(255), -- If identifiable
    action VARCHAR(100), -- 'login', 'api_call', 'db_query'
    duration_ms INTEGER, -- For performance logs
    error_code VARCHAR(50),
    status_code INTEGER,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### log_aggregations

```sql
CREATE TABLE log_aggregations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregation_type VARCHAR(50) NOT NULL, -- 'count_by_level', 'avg_duration', 'error_rate'
    time_bucket TIMESTAMP NOT NULL, -- Start of aggregation period
    bucket_size VARCHAR(20) NOT NULL, -- '1min', '1hour', '1day'
    dimensions JSONB NOT NULL, -- {'level': 'ERROR', 'source': 'cloudwatch'}
    metrics JSONB NOT NULL, -- {'count': 150, 'avg_duration': 250}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(aggregation_type, time_bucket, bucket_size, dimensions)
);
```

## Aggregation Logic

### 1. Time Bucket Calculation

```typescript
function getTimeBucket(timestamp: Date, bucketSize: string): Date {
  const date = new Date(timestamp);
  switch (bucketSize) {
    case "1min":
      date.setSeconds(0, 0);
      break;
    case "1hour":
      date.setMinutes(0, 0, 0);
      break;
    case "1day":
      date.setHours(0, 0, 0, 0);
      break;
  }
  return date;
}
```

### 2. Dimension Extraction

```typescript
function extractDimensions(parsedLog: ParsedLog): Record<string, any> {
  return {
    level: parsedLog.level,
    category: parsedLog.category,
    source: parsedLog.source,
    // Add more dimensions as needed
  };
}
```

### 3. Metric Calculation

```typescript
function calculateMetrics(
  logs: ParsedLog[],
  aggregationType: string
): Record<string, any> {
  switch (aggregationType) {
    case "count_by_level":
      return { count: logs.length };
    case "avg_duration":
      const durations = logs.map((l) => l.duration_ms).filter((d) => d);
      return {
        count: durations.length,
        avg_duration: durations.reduce((a, b) => a + b, 0) / durations.length,
      };
    case "error_rate":
      const errors = logs.filter((l) => l.level === "ERROR").length;
      return {
        total: logs.length,
        errors: errors,
        rate: errors / logs.length,
      };
  }
}
```

## Aggregation Pipeline

### Real-time Aggregation

1. Log received → Parse → Insert to parsed_logs
2. Extract dimensions and metrics
3. Update/insert aggregation record
4. Trigger alerts if thresholds exceeded

### Batch Aggregation

1. Run hourly/daily aggregation jobs
2. Process raw logs not yet parsed
3. Update aggregations for historical data
4. Generate reports and dashboards

## Performance Considerations

### Indexes

- raw_logs: (timestamp, source)
- parsed_logs: (timestamp, level, category)
- log_aggregations: (aggregation_type, time_bucket, bucket_size)

### Partitioning

- Partition raw_logs and parsed_logs by month
- Partition log_aggregations by aggregation_type and time_bucket

### Caching

- Cache recent aggregations in Redis
- Pre-compute common dashboard metrics
- Use materialized views for complex aggregations

## Monitoring and Alerts

### Metrics to Monitor

- Ingestion rate (logs/second)
- Parsing success rate
- Aggregation latency
- Storage usage

### Alerts

- Ingestion rate drops below threshold
- Parsing error rate exceeds 5%
- Aggregation job failures
- Storage capacity warnings

## Future Extensions

### Advanced Analytics

- Anomaly detection using ML
- Predictive alerting
- Log correlation analysis
- User behavior analysis

### Scalability

- Distributed aggregation workers
- Multi-region deployment
- Data archival policies
- Query optimization for large datasets

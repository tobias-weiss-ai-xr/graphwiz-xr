//! API client for backend services
//!
//! Provides typed functions for fetching statistics and system data
//! from Reticulum microservices.

/// Health check response from services
export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'error';
  timestamp: string;
  uptime?: number;
  version?: string;
}

/// Room statistics
export interface RoomStats {
  total: number;
  active: number;
  private: number;
}

/// User statistics
export interface UserStats {
  total: number;
  active: number;
  new_today: number;
}

/// Entity statistics
export interface EntityStats {
  total: number;
  by_type: Record<string, number>;
}

/// System statistics from backend
export interface SystemStatistics {
  rooms: RoomStats;
  users: UserStats;
  entities: EntityStats;
  server_start_time: string;
}

/// Log level
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/// Log entry
export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  context?: Record<string, unknown>;
}

/// Logs response with pagination
export interface LogsResponse {
  entries: LogEntry[];
  total: number;
  page: number;
  perPage: number;
}

/// Logs query parameters
export interface LogsQuery {
  service?: string;
  level?: LogLevel;
  startTime?: string;
  endTime?: string;
  search?: string;
  page?: number;
  perPage?: number;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

/**
 * Fetch health status for a specific service
 */
export async function fetchServiceHealth(
  serviceName: 'auth' | 'hub' | 'presence' | 'sfu' | 'storage'
): Promise<HealthResponse> {
  const servicePorts: Record<string, string> = {
    auth: '8011',
    hub: '8012',
    presence: '8013',
    sfu: '8014',
    storage: '8015'
  };

  try {
    const response = await fetch(
      `http://localhost:${servicePorts[serviceName]}/${serviceName}/health`,
      {
        signal: AbortSignal.timeout(5000)
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data as HealthResponse;
  } catch (error) {
    console.error(`Failed to fetch health for ${serviceName}:`, error);
    return {
      status: 'error',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Fetch room statistics from Hub service
 */
export async function fetchRoomStats(): Promise<RoomStats> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/rooms/stats`, {
      signal: AbortSignal.timeout(3000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch room stats`);
    }

    const data = await response.json();
    return {
      total: data.total || 0,
      active: data.active || 0,
      private: data.private || 0
    };
  } catch (error) {
    console.error('Failed to fetch room stats:', error);
    // Return zeros as fallback
    return { total: 0, active: 0, private: 0 };
  }
}

/**
 * Fetch user statistics from Auth service
 */
export async function fetchUserStats(): Promise<UserStats> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/stats`, {
      signal: AbortSignal.timeout(3000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch user stats`);
    }

    const data = await response.json();
    return {
      total: data.total || 0,
      active: data.active || 0,
      new_today: data.new_today || 0
    };
  } catch (error) {
    console.error('Failed to fetch user stats:', error);
    // Return zeros as fallback
    return { total: 0, active: 0, new_today: 0 };
  }
}

/**
 * Fetch entity statistics from Hub service
 */
export async function fetchEntityStats(): Promise<EntityStats> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/entities/stats`, {
      signal: AbortSignal.timeout(3000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch entity stats`);
    }

    const data = await response.json();
    return {
      total: data.total || 0,
      by_type: data.by_type || {}
    };
  } catch (error) {
    console.error('Failed to fetch entity stats:', error);
    // Return zeros as fallback
    return { total: 0, by_type: {} };
  }
}

/**
 * Fetch server uptime from Auth service
 */
export async function fetchServerUptime(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/server/uptime`, {
      signal: AbortSignal.timeout(3000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch server uptime`);
    }

    const data = await response.json();
    return data.uptime || '0:00:00';
  } catch (error) {
    console.error('Failed to fetch server uptime:', error);
    // Return default
    return '0:00:00';
  }
}

/**
 * Fetch all system statistics in parallel
 */
export async function fetchAllSystemStatistics(): Promise<SystemStatistics> {
  try {
    const [roomStats, userStats, entityStats /* uptime */] = await Promise.all([
      fetchRoomStats(),
      fetchUserStats(),
      fetchEntityStats(),
      fetchServerUptime()
    ]);

    return {
      rooms: roomStats,
      users: userStats,
      entities: entityStats,
      server_start_time: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to fetch system statistics:', error);
    // Return fallback values
    return {
      rooms: { total: 0, active: 0, private: 0 },
      users: { total: 0, active: 0, new_today: 0 },
      entities: { total: 0, by_type: {} },
      server_start_time: new Date().toISOString()
    };
  }
}

/**
 * Restart a specific service
 */
export async function restartService(
  serviceName: 'auth' | 'hub' | 'presence' | 'sfu' | 'storage'
): Promise<{ success: boolean; message: string }> {
  try {
    const servicePorts: Record<string, string> = {
      auth: '8011',
      hub: '8012',
      presence: '8013',
      sfu: '8014',
      storage: '8015'
    };

    const response = await fetch(
      `http://localhost:${servicePorts[serviceName]}/${serviceName}/admin/restart`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({ serviceName })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to restart ${serviceName}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to restart ${serviceName}:`, error);
    return { success: false, message: `${error}` };
  }
}

/**
 * Restart all services
 */
export async function restartAllServices(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`http://localhost:8011/auth/admin/restart-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to restart all services`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to restart all services:', error);
    return { success: false, message: `${error}` };
  }
}

/**
 * Emergency shutdown of all services
 */
export async function emergencyShutdown(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/shutdown`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to shutdown services`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to emergency shutdown:', error);
    return { success: false, message: `${error}` };
  }
}

/**
 * Fetch logs from a specific service
 */
export async function fetchLogsForService(
  serviceName: 'auth' | 'hub' | 'presence' | 'sfu' | 'storage',
  query: LogsQuery = {}
): Promise<LogsResponse> {
  const servicePorts: Record<string, string> = {
    auth: '8011',
    hub: '8012',
    presence: '8013',
    sfu: '8014',
    storage: '8015'
  };

  const params = new URLSearchParams();
  if (query.service) params.append('service', query.service);
  if (query.level) params.append('level', query.level);
  if (query.startTime) params.append('start_time', query.startTime);
  if (query.endTime) params.append('end_time', query.endTime);
  if (query.search) params.append('search', query.search);
  params.append('page', String(query.page || 1));
  params.append('per_page', String(query.perPage || 50));

  try {
    const response = await fetch(
      `http://localhost:${servicePorts[serviceName]}/${serviceName}/admin/logs?${params}`,
      {
        signal: AbortSignal.timeout(10000)
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch logs from ${serviceName}`);
    }

    const data = await response.json();
    return {
      entries: data.entries || [],
      total: data.total || 0,
      page: data.page || 1,
      perPage: data.per_page || 50
    };
  } catch (error) {
    console.error(`Failed to fetch logs from ${serviceName}:`, error);
    return {
      entries: [],
      total: 0,
      page: 1,
      perPage: 50
    };
  }
}

/**
 * Fetch logs from all services
 */
export async function fetchLogs(query: LogsQuery = {}): Promise<LogsResponse> {
  const services = ['auth', 'hub', 'presence', 'sfu', 'storage'] as const;

  try {
    const results = await Promise.all(
      services.map((service) => fetchLogsForService(service, { ...query, page: 1, perPage: 100 }))
    );

    const allEntries = results.flatMap((result) => result.entries);
    const filteredEntries = applyFilters(allEntries, query);

    const total = filteredEntries.length;
    const page = query.page || 1;
    const perPage = query.perPage || 50;
    const startIndex = (page - 1) * perPage;
    const paginatedEntries = filteredEntries.slice(startIndex, startIndex + perPage);

    return {
      entries: paginatedEntries,
      total,
      page,
      perPage
    };
  } catch (error) {
    console.error('Failed to fetch logs:', error);
    return {
      entries: [],
      total: 0,
      page: 1,
      perPage: 50
    };
  }
}

/**
 * Apply filters to log entries
 */
function applyFilters(entries: LogEntry[], query: LogsQuery): LogEntry[] {
  let filtered = [...entries];

  if (query.service) {
    filtered = filtered.filter((entry) => entry.service === query.service);
  }

  if (query.level) {
    filtered = filtered.filter((entry) => entry.level === query.level);
  }

  if (query.startTime) {
    const startTime = new Date(query.startTime).getTime();
    filtered = filtered.filter((entry) => new Date(entry.timestamp).getTime() >= startTime);
  }

  if (query.endTime) {
    const endTime = new Date(query.endTime).getTime();
    filtered = filtered.filter((entry) => new Date(entry.timestamp).getTime() <= endTime);
  }

  if (query.search) {
    const searchLower = query.search.toLowerCase();
    filtered = filtered.filter(
      (entry) =>
        entry.message.toLowerCase().includes(searchLower) ||
        entry.service.toLowerCase().includes(searchLower)
    );
  }

  return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Export logs as JSON
 */
export async function exportLogs(query: LogsQuery = {}): Promise<string> {
  const response = await fetchLogs({ ...query, perPage: 10000 });

  const exportData = {
    exportedAt: new Date().toISOString(),
    totalEntries: response.total,
    entries: response.entries
  };

  return JSON.stringify(exportData, null, 2);
}

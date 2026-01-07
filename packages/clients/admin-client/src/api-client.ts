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
 *  * Export logs as JSON
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

/**
 *  * List users with their roles (admin)
 */
export interface UserListResponse {
  users: UserWithRole[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface UserWithRole {
  id: number;
  display_name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  is_active: boolean;
  role: string | null;
}

export async function fetchUsers(
  page: number = 1,
  perPage: number = 50,
  search?: string
): Promise<UserListResponse> {
  try {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('per_page', String(perPage));
    if (search) params.append('search', search);

    const response = await fetch(`http://localhost:8011/api/v1/admin/users?${params}`, {
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch users`);
    }

    const data = await response.json();
    return data as UserListResponse;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return {
      users: [],
      total: 0,
      page: 1,
      perPage: 50,
      totalPages: 0
    };
  }
}

/**
 *  * Toggle user active status (ban/unban)
 */
export async function toggleUserStatus(
  userId: number,
  is_active: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`http://localhost:8011/api/v1/admin/users/${userId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active }),
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to update user status`);
    }

    const data = await response.json();
    return data as { success: boolean; message: string };
  } catch (error) {
    console.error('Failed to toggle user status:', error);
    return { success: false, message: `${error}` };
  }
}

/**
 *  * Update user role
 */
export async function updateUserRole(
  userId: number,
  role: string,
  granted_by: number
): Promise<{ success: boolean; message: string; role_assignment: any }> {
  try {
    const response = await fetch(`http://localhost:8011/api/v1/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, granted_by }),
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to update user role`);
    }

    const data = await response.json();
    return data as { success: boolean; message: string; role_assignment: any };
  } catch (error) {
    console.error('Failed to update user role:', error);
    return { success: false, message: `${error}`, role_assignment: null };
  }
}

/**
 *  * Revoke user role
 */
export async function revokeUserRole(
  userId: number
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`http://localhost:8011/api/v1/admin/users/${userId}/role`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to revoke user role`);
    }

    const data = await response.json();
    return data as { success: boolean; message: string };
  } catch (error) {
    console.error('Failed to revoke user role:', error);
    return { success: false, message: `${error}` };
  }
}

/**
 *  * List rooms (admin view)
 */
export interface RoomListResponse {
  rooms: RoomInfo[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface RoomInfo {
  id: number;
  room_id: string;
  name: string;
  description?: string;
  max_players: number;
  is_private: boolean;
  created_by: string;
  created_at: string;
  is_active: boolean;
}

export async function fetchRooms(
  page: number = 1,
  perPage: number = 50
): Promise<RoomListResponse> {
  try {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('per_page', String(perPage));

    const response = await fetch(`http://localhost:8012/api/v1/admin/rooms?${params}`, {
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch rooms`);
    }

    const data = await response.json();
    return data as RoomListResponse;
  } catch (error) {
    console.error('Failed to fetch rooms:', error);
    return {
      rooms: [],
      total: 0,
      page: 1,
      perPage: 50,
      totalPages: 0
    };
  }
}

/**
 *  * Update room configuration
 */
export interface UpdateRoomRequest {
  name?: string;
  description?: string;
  max_players?: number;
  is_private?: boolean;
}

export async function updateRoomConfig(
  roomId: number,
  config: UpdateRoomRequest
): Promise<{ success: boolean; message: string; room?: any }> {
  try {
    const response = await fetch(`http://localhost:8012/api/v1/admin/rooms/${roomId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to update room`);
    }

    const data = await response.json();
    return data as { success: boolean; message: string; room?: any };
  } catch (error) {
    console.error('Failed to update room config:', error);
    return { success: false, message: `${error}`, room: null };
  }
}

/**
 *  * Close (deactivate) a room
 */
export async function closeRoom(roomId: number): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`http://localhost:8012/api/v1/admin/rooms/${roomId}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to close room`);
    }

    const data = await response.json();
    return data as { success: boolean; message: string };
  } catch (error) {
    console.error('Failed to close room:', error);
    return { success: false, message: `${error}` };
  }
}

/**
 *  * Delete a room permanently
 */
export async function deleteRoom(roomId: number): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`http://localhost:8012/api/v1/admin/rooms/${roomId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to delete room`);
    }

    const data = await response.json();
    return data as { success: boolean; message: string };
  } catch (error) {
    console.error('Failed to delete room:', error);
    return { success: false, message: `${error}` };
  }
}

/**
 *  * Get room details
 */
export async function fetchRoomDetails(
  roomId: number
): Promise<{ success: boolean; room?: any; message?: string }> {
  try {
    const response = await fetch(`http://localhost:8012/api/v1/admin/rooms/${roomId}`, {
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch room details`);
    }

    const data = await response.json();
    return data as { success: boolean; room?: any; message?: string };
  } catch (error) {
    console.error('Failed to fetch room details:', error);
    return { success: false, room: null, message: `${error}` };
  }
}

/**
 *  * Historical Metrics API types
 */
export interface MetricsSummary {
  avg_active_rooms: number;
  max_active_rooms: number;
  avg_active_users: number;
  max_active_users: number;
  avg_latency_ms: number;
  max_latency_ms: number;
  total_points: number;
  time_range?: {
    start: string;
    end: string;
    hours: number;
  };
}

export interface MetricDataPoint {
  timestamp: string;
  active_rooms: number;
  active_users: number;
  total_entities: number;
  avg_latency_ms: number;
}

/**
 *  * Fetch historical metrics summary
 */
export async function fetchHistoricalMetrics(
  hours: number = 24
): Promise<{ summary: MetricsSummary }> {
  try {
    const params = new URLSearchParams();
    params.append('hours', String(hours));

    const response = await fetch(`http://localhost:8011/api/v1/admin/metrics?${params}`, {
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch historical metrics`);
    }

    const data = await response.json();
    return data as { summary: MetricsSummary };
  } catch (error) {
    console.error('Failed to fetch historical metrics:', error);
    // Return fallback empty summary
    return {
      summary: {
        avg_active_rooms: 0,
        max_active_rooms: 0,
        avg_active_users: 0,
        max_active_users: 0,
        avg_latency_ms: 0,
        max_latency_ms: 0,
        total_points: 0
      }
    };
  }
}

/**
 *  * Clear historical metrics
 */
export async function clearHistoricalMetrics(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`http://localhost:8011/api/v1/admin/metrics`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to clear historical metrics`);
    }

    const data = await response.json();
    return data as { success: boolean; message: string };
  } catch (error) {
    console.error('Failed to clear historical metrics:', error);
    return { success: false, message: `${error}` };
  }
}

/**
 * Room persistence types
 */
export interface RoomState {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  data?: Record<string, unknown>;
}

export interface LoadRoomResponse {
  success: boolean;
  message?: string;
  room_state?: RoomState | null;
}

export interface SaveRoomRequest {
  name?: string;
  description?: string;
  data?: Record<string, unknown>;
}

/**
 * Fetch room state by room ID
 */
export async function fetchRoomState(roomId: string): Promise<Response> {
  try {
    const response = await fetch(`http://localhost:8012/api/v1/rooms/${roomId}/state`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch room state`);
    }

    return response;
  } catch (error) {
    console.error('Failed to fetch room state:', error);
    throw error;
  }
}

/**
 * Save room state
 */
export async function saveRoomState(roomId: string, request: SaveRoomRequest): Promise<Response> {
  try {
    const response = await fetch(`http://localhost:8012/api/v1/rooms/${roomId}/state`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to save room state`);
    }

    return response;
  } catch (error) {
    console.error('Failed to save room state:', error);
    throw error;
  }
}

/**
 * Clear room state
 */
export async function clearRoomState(
  roomId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`http://localhost:8012/api/v1/rooms/${roomId}/state`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to clear room state`);
    }

    const data = await response.json();
    return data as { success: boolean; message: string };
  } catch (error) {
    console.error('Failed to clear room state:', error);
    return { success: false, message: `${error}` };
  }
}

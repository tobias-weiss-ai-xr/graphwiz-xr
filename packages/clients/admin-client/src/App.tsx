import { useState, useEffect } from 'react';

import {
  fetchServiceHealth,
  fetchAllSystemStatistics,
  restartService,
  restartAllServices,
  emergencyShutdown,
  type SystemStatistics
} from './api-client';
import LogsViewer from './LogsViewer';
import RestartModal from './RestartModal';
import UserManagement from './UserManagement';
import RoomManagement from './RoomManagement';
import RoomPersistence from './RoomPersistence';
import HistoricalMetrics from './HistoricalMetrics';

interface ServiceStatusUI {
  name: string;
  url: string;
  status: 'loading' | 'healthy' | 'degraded' | 'error' | 'restarting';
  latency?: number;
}

const SERVICE_PORTS: Record<string, number> = {
  auth: 8011,
  hub: 8012,
  presence: 8013,
  sfu: 8014,
  storage: 8015
};

export default function App() {
  const [services, setServices] = useState<ServiceStatusUI[]>([
    { name: 'Auth', url: 'http://localhost:8011', status: 'loading' },
    { name: 'Hub', url: 'http://localhost:8012', status: 'loading' },
    { name: 'Presence', url: 'http://localhost:8013', status: 'loading' },
    { name: 'SFU', url: 'http://localhost:8014', status: 'loading' },
    { name: 'Storage', url: 'http://localhost:8015', status: 'loading' }
  ]);
  const [stats, setStats] = useState<SystemStatistics>({
    rooms: { active: 0, total: 0, private: 0 },
    users: { active: 0, total: 0, new_today: 0 },
    entities: { total: 0, by_type: {} },
    server_start_time: new Date().toISOString()
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'users' | 'rooms' | 'persistence' | 'metrics'
  >('dashboard');
  const [restartingServices, setRestartingServices] = useState<Map<string, boolean>>(new Map());
  const [showLogsViewer, setShowLogsViewer] = useState(false);
  const [showRestartModal, setShowRestartModal] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      const results = await Promise.all(
        Object.entries(SERVICE_PORTS).map(async ([serviceName, port]) => {
          try {
            const start = Date.now();
            const health = await fetchServiceHealth(
              serviceName as 'auth' | 'hub' | 'presence' | 'sfu' | 'storage'
            );
            const latency = Date.now() - start;
            return {
              name: serviceName.charAt(0).toUpperCase() + serviceName.slice(1),
              url: `http://localhost:${port}`,
              status: health.status,
              latency
            } as ServiceStatusUI;
          } catch {
            return {
              name: serviceName.charAt(0).toUpperCase() + serviceName.slice(1),
              url: `http://localhost:${port}`,
              status: 'error' as const
            } as ServiceStatusUI;
          }
        })
      );
      setServices(results);
    };

    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const systemStats = await fetchAllSystemStatistics();
        setStats(systemStats);
      } catch (error) {
        console.error('Failed to fetch system statistics:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    checkHealth();
    fetchStats();
    const interval = setInterval(() => {
      checkHealth();
      fetchStats();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleRestart = async (serviceName: string) => {
    const serviceKey = serviceName.toLowerCase() as 'auth' | 'hub' | 'presence' | 'sfu' | 'storage';

    setRestartingServices((prev) => new Map(prev).set(serviceKey, true));
    setServices((prev) =>
      prev.map((s) => (s.name.toLowerCase() === serviceKey ? { ...s, status: 'restarting' } : s))
    );

    const result = await restartService(serviceKey);

    if (result.success) {
      alert(result.message);

      const pollUntilHealthy = async () => {
        const maxAttempts = 12;
        const intervalMs = 5000;

        for (let i = 0; i < maxAttempts; i++) {
          await new Promise((resolve) => setTimeout(resolve, intervalMs));

          try {
            const start = Date.now();
            const health = await fetchServiceHealth(serviceKey);
            const latency = Date.now() - start;

            setServices((prev) =>
              prev.map((s) =>
                s.name.toLowerCase() === serviceKey ? { ...s, status: health.status, latency } : s
              )
            );

            if (health.status === 'healthy') {
              setRestartingServices((prev) => {
                const newMap = new Map(prev);
                newMap.delete(serviceKey);
                return newMap;
              });
              return;
            }
          } catch (error) {
            console.error(`Health check failed for ${serviceKey}:`, error);
          }
        }

        setServices((prev) =>
          prev.map((s) => (s.name.toLowerCase() === serviceKey ? { ...s, status: 'error' } : s))
        );
        setRestartingServices((prev) => {
          const newMap = new Map(prev);
          newMap.delete(serviceKey);
          return newMap;
        });
      };

      pollUntilHealthy();
    } else {
      alert(`Failed to restart ${serviceName}: ${result.message}`);
      setServices((prev) =>
        prev.map((s) => (s.name.toLowerCase() === serviceKey ? { ...s, status: 'error' } : s))
      );
      setRestartingServices((prev) => {
        const newMap = new Map(prev);
        newMap.delete(serviceKey);
        return newMap;
      });
    }
  };

  const handleRestartAll = async () => {
    const result = await restartAllServices();

    if (result.success) {
      alert(result.message);

      services.forEach((service) => {
        const serviceKey = service.name.toLowerCase() as
          | 'auth'
          | 'hub'
          | 'presence'
          | 'sfu'
          | 'storage';
        setRestartingServices((prev) => new Map(prev).set(serviceKey, true));
        setServices((prev) =>
          prev.map((s) =>
            s.name.toLowerCase() === serviceKey ? { ...s, status: 'restarting' } : s
          )
        );
      });

      const pollAllUntilHealthy = async () => {
        const maxAttempts = 12;
        const intervalMs = 5000;

        for (let i = 0; i < maxAttempts; i++) {
          await new Promise((resolve) => setTimeout(resolve, intervalMs));

          const servicesData = ['auth', 'hub', 'presence', 'sfu', 'storage'] as const;

          const results = await Promise.all(
            servicesData.map(async (serviceName) => {
              try {
                const start = Date.now();
                const health = await fetchServiceHealth(serviceName);
                const latency = Date.now() - start;

                if (health.status === 'healthy') {
                  setRestartingServices((prev) => {
                    const newMap = new Map(prev);
                    newMap.delete(serviceName);
                    return newMap;
                  });

                  const port = SERVICE_PORTS[serviceName];
                  return {
                    name: serviceName.charAt(0).toUpperCase() + serviceName.slice(1),
                    url: `http://localhost:${port}`,
                    status: health.status as 'healthy',
                    latency
                  } as ServiceStatusUI;
                }
              } catch (error) {
                console.error(`Health check failed for ${serviceName}:`, error);
              }
              return null;
            })
          );

          const validResults = results.filter((r): r is ServiceStatusUI => r !== null);
          if (validResults.length > 0) {
            setServices((prev) => {
              const newServices = [...prev];
              validResults.forEach((result) => {
                const idx = newServices.findIndex((s) => s.name === result.name);
                if (idx !== -1) {
                  newServices[idx] = result;
                }
              });
              return newServices;
            });
          }

          if (Array.from(restartingServices.values()).every((v) => !v)) {
            return;
          }
        }

        setServices((prev) =>
          prev.map((s) =>
            restartingServices.has(s.name.toLowerCase()) ? { ...s, status: 'error' } : s
          )
        );
        setRestartingServices(new Map());
      };

      pollAllUntilHealthy();
    } else {
      alert(`Failed to restart all services: ${result.message}`);
    }
  };

  const handleEmergencyShutdown = async () => {
    if (
      !confirm('Are you sure you want to shut down all services? This will disconnect all users.')
    ) {
      return;
    }

    const result = await emergencyShutdown();
    if (result.success) {
      setServices(services.map((s) => ({ ...s, status: 'error' })));
      alert('Services are shutting down...');
    } else {
      alert(`Shutdown failed: ${result.message}`);
    }
  };

  const calculateUptime = (): string => {
    const startTime = new Date(stats.server_start_time);
    const now = new Date();
    const diff = now.getTime() - startTime.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}d ${hours}h ${minutes}m`;
  };

  const StatusIndicator = ({
    status,
    latency: _latency
  }: {
    status: ServiceStatusUI['status'];
    latency?: number;
  }) => {
    const colors = {
      loading: 'bg-yellow-500',
      healthy: 'bg-green-500',
      degraded: 'bg-orange-500',
      error: 'bg-red-500',
      restarting: 'bg-amber-500'
    };
    return (
      <div
        className={`w-3 h-3 rounded-full ${colors[status]} ${status === 'restarting' ? 'animate-pulse' : ''}`}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">GraphWiz-XR Admin</h1>
        <p className="text-gray-400">System Administration Dashboard</p>
      </header>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex space-x-1 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white border-transparent hover:border-gray-500'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white border-transparent hover:border-gray-500'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'rooms'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white border-transparent hover:border-gray-500'
            }`}
          >
            Rooms
          </button>
          <button
            onClick={() => setActiveTab('persistence')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'persistence'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white border-transparent hover:border-gray-500'
            }`}
          >
            Persistence
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'metrics'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white border-transparent hover:border-gray-500'
            }`}
          >
            Metrics
          </button>
        </div>
      </div>

      {/* Dashboard Tab Content */}
      {activeTab === 'dashboard' && (
        <>
          {/* Service Status */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Service Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {services.map((service) => (
                <div
                  key={service.name}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium">{service.name}</h3>
                    <StatusIndicator status={service.status} />
                  </div>
                  <p className="text-sm text-gray-400">{service.url}</p>
                  {service.latency !== undefined && service.status === 'healthy' && (
                    <p className="text-sm text-green-400 mt-2">{service.latency}ms</p>
                  )}
                  {service.status === 'error' && (
                    <p className="text-sm text-red-400 mt-2">Unavailable</p>
                  )}
                  {service.status === 'restarting' && (
                    <p className="text-sm text-amber-400 mt-2">Restarting...</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* System Statistics */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">System Statistics</h2>
            {loadingStats && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-gray-400"></div>
                <p className="mt-4 text-gray-400">Loading statistics...</p>
              </div>
            )}
            {!loadingStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-medium mb-2">Active Rooms</h3>
                  <p className="text-4xl font-bold text-blue-400">{stats.rooms.active}</p>
                  <p className="text-sm text-gray-400">Total: {stats.rooms.total}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-medium mb-2">Active Users</h3>
                  <p className="text-4xl font-bold text-green-400">{stats.users.active}</p>
                  <p className="text-sm text-gray-400">Total: {stats.users.total}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-medium mb-2">Total Entities</h3>
                  <p className="text-4xl font-bold text-purple-400">{stats.entities.total}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-medium mb-2">Uptime</h3>
                  <p className="text-4xl font-bold text-yellow-400">{calculateUptime()}</p>
                  <p className="text-sm text-gray-400">
                    Started: {new Date(stats.server_start_time).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition"
                disabled={loadingStats}
                onClick={() => setShowLogsViewer(true)}
              >
                View Logs
              </button>
              <button
                className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition"
                disabled={loadingStats}
                onClick={() => setShowRestartModal(true)}
              >
                Restart Services
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition"
                disabled={loadingStats}
                onClick={handleEmergencyShutdown}
              >
                Emergency Shutdown
              </button>
            </div>
          </section>
        </>
      )}

      {/* Users Tab Content */}
      {activeTab === 'users' && <UserManagement />}

      {/* Rooms Tab Content */}
      {activeTab === 'rooms' && <RoomManagement />}

      {/* Persistence Tab Content */}
      {activeTab === 'persistence' && <RoomPersistence />}

      {/* Metrics Tab Content */}
      {activeTab === 'metrics' && <HistoricalMetrics />}

      {/* Logs Modal - shared across all tabs */}
      {showLogsViewer && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 overflow-y-auto">
          <div className="min-h-screen px-4 flex items-center justify-center">
            <div className="bg-gray-900 rounded-lg max-w-6xl w-full mx-auto my-8">
              <div className="p-6 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">System Logs</h2>
                  <button
                    onClick={() => setShowLogsViewer(false)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6">
                <LogsViewer />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restart Modal - shared across all tabs */}
      {showRestartModal && (
        <RestartModal
          isOpen={showRestartModal}
          onClose={() => setShowRestartModal(false)}
          onRestartService={handleRestart}
          onRestartAll={handleRestartAll}
          restartingServices={restartingServices}
          services={services}
        />
      )}
    </div>
  );
}

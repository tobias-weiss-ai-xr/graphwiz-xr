import { useState, useEffect } from 'react';

interface ServiceStatus {
  name: string;
  url: string;
  status: 'loading' | 'healthy' | 'error';
  latency?: number;
}

interface SystemStats {
  activeRooms: number;
  activeUsers: number;
  totalEntities: number;
  uptime: string;
}

export default function App() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Auth', url: 'http://localhost:8011', status: 'loading' },
    { name: 'Hub', url: 'http://localhost:8012', status: 'loading' },
    { name: 'Presence', url: 'http://localhost:8013', status: 'loading' },
    { name: 'SFU', url: 'http://localhost:8014', status: 'loading' },
  ]);

  const [stats] = useState<SystemStats>({
    activeRooms: 0,
    activeUsers: 0,
    totalEntities: 0,
    uptime: '0:00:00',
  });

  useEffect(() => {
    // Check service health
    const checkHealth = async () => {
      const results = await Promise.all(
        services.map(async (service) => {
          try {
            const start = Date.now();
            const response = await fetch(`${service.url}/api/v1/health`, {
              signal: AbortSignal.timeout(5000),
            });
            const latency = Date.now() - start;
            return {
              ...service,
              status: response.ok ? 'healthy' : 'error',
              latency,
            } as ServiceStatus;
          } catch {
            return { ...service, status: 'error' } as ServiceStatus;
          }
        })
      );
      setServices(results);
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const StatusIndicator = ({ status }: { status: ServiceStatus['status'] }) => {
    const colors = {
      loading: 'bg-yellow-500',
      healthy: 'bg-green-500',
      error: 'bg-red-500',
    };
    return (
      <div className={`w-3 h-3 rounded-full ${colors[status]} animate-pulse`} />
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">GraphWiz-XR Admin</h1>
        <p className="text-gray-400">System Administration Dashboard</p>
      </header>

      {/* Service Status */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Service Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service) => (
            <div
              key={service.name}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">{service.name}</h3>
                <StatusIndicator status={service.status} />
              </div>
              <p className="text-sm text-gray-400">
                {service.url}
              </p>
              {service.latency !== undefined && service.status === 'healthy' && (
                <p className="text-sm text-green-400 mt-2">
                  {service.latency}ms
                </p>
              )}
              {service.status === 'error' && (
                <p className="text-sm text-red-400 mt-2">Unavailable</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* System Statistics */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">System Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-medium mb-2">Active Rooms</h3>
            <p className="text-4xl font-bold text-blue-400">{stats.activeRooms}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-medium mb-2">Active Users</h3>
            <p className="text-4xl font-bold text-green-400">{stats.activeUsers}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-medium mb-2">Total Entities</h3>
            <p className="text-4xl font-bold text-purple-400">{stats.totalEntities}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-medium mb-2">Uptime</h3>
            <p className="text-4xl font-bold text-yellow-400">{stats.uptime}</p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition">
            View Logs
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition">
            Restart Services
          </button>
          <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition">
            Emergency Shutdown
          </button>
        </div>
      </section>
    </div>
  );
}

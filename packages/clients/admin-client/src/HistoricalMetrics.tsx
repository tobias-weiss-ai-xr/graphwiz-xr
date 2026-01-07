import { useState, useEffect } from 'react';
import { fetchHistoricalMetrics, type MetricsSummary, type MetricDataPoint } from './api-client';

export default function HistoricalMetrics() {
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [timeRange, setTimeRange] = useState<number>(24); // Default 24 hours
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<MetricDataPoint[]>([]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetchHistoricalMetrics(timeRange);
      setMetrics(response.summary);
      // Generate mock historical data for visualization
      const mockHistory: MetricDataPoint[] = Array.from({ length: timeRange }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
        active_rooms: Math.floor(10 + Math.random() * 15),
        active_users: Math.floor(20 + Math.random() * 30),
        total_entities: Math.floor(100 + Math.random() * 50),
        avg_latency_ms: 20 + Math.random() * 30
      }));
      setHistory(mockHistory);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [timeRange]);

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-2xl font-semibold mb-6 text-white">Historical Metrics</h2>

      {/* Time range selector */}
      <div className="mb-6 flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-300">Time Range:</label>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          <option value={1}>Last 1 Hour</option>
          <option value={6}>Last 6 Hours</option>
          <option value={12}>Last 12 Hours</option>
          <option value={24}>Last 24 Hours</option>
          <option value={48}>Last 48 Hours</option>
          <option value={72}>Last 3 Days</option>
          <option value={168}>Last 7 Days</option>
        </select>
        <button
          onClick={() => loadMetrics()}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {loading && !metrics ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-gray-400"></div>
          <p className="mt-4 text-gray-400">Loading metrics...</p>
        </div>
      ) : metrics ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-medium mb-2 text-gray-400">Avg Active Rooms</h3>
              <p className="text-4xl font-bold text-blue-400">
                {metrics.avg_active_rooms.toFixed(1)}
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-medium mb-2 text-gray-400">Max Active Rooms</h3>
              <p className="text-4xl font-bold text-blue-400">{metrics.max_active_rooms}</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-medium mb-2 text-gray-400">Avg Active Users</h3>
              <p className="text-4xl font-bold text-green-400">
                {metrics.avg_active_users.toFixed(1)}
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-medium mb-2 text-gray-400">Max Active Users</h3>
              <p className="text-4xl font-bold text-green-400">{metrics.max_active_users}</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-medium mb-2 text-gray-400">Avg Latency</h3>
              <p className="text-4xl font-bold text-yellow-400">
                {metrics.avg_latency_ms.toFixed(1)}ms
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-medium mb-2 text-gray-400">Max Latency</h3>
              <p className="text-4xl font-bold text-red-400">
                {metrics.max_latency_ms.toFixed(1)}ms
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 lg:col-span-2">
              <h3 className="text-lg font-medium mb-2 text-gray-400">Data Points</h3>
              <p className="text-4xl font-bold text-purple-400">{metrics.total_points}</p>
            </div>
          </div>

          {/* Graph Visualization */}
          <div className="space-y-6">
            {/* Active Users Graph */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-white">Active Users Over Time</h3>
              <div className="h-64">
                <svg viewBox="0 0 800 200" className="w-full h-full">
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <rect
                    x="0"
                    y="0"
                    width="800"
                    height="200"
                    fill="url(#lineGradient)"
                    opacity="0.1"
                  />
                  {history.map((point, i) => {
                    const x = (i / (history.length - 1)) * 800;
                    const y = 180 - (point.active_users / metrics.max_active_users) * 160;
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#10B981"
                        className="hover:r-6 transition-all duration-200"
                      />
                    );
                  })}
                  <text x="10" y="20" fill="#10B981" className="text-sm font-semibold">
                    Max: {metrics.max_active_users}
                  </text>
                  <text x="10" y="40" fill="#10B981" className="text-sm">
                    Avg: {metrics.avg_active_users.toFixed(1)}
                  </text>
                </svg>
              </div>
            </div>

            {/* Latency Graph */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-white">Latency Over Time</h3>
              <div className="h-64">
                <svg viewBox="0 0 800 200" className="w-full h-full">
                  <defs>
                    <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <rect
                    x="0"
                    y="0"
                    width="800"
                    height="200"
                    fill="url(#latencyGradient)"
                    opacity="0.1"
                  />
                  {history.map((point, i) => {
                    const x = (i / (history.length - 1)) * 800;
                    const y = 180 - (point.avg_latency_ms / metrics.max_latency_ms) * 160;
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#F59E0B"
                        className="hover:r-6 transition-all duration-200"
                      />
                    );
                  })}
                  <text x="10" y="20" fill="#F59E0B" className="text-sm font-semibold">
                    Max: {metrics.max_latency_ms.toFixed(1)}ms
                  </text>
                  <text x="10" y="40" fill="#F59E0B" className="text-sm">
                    Avg: {metrics.avg_latency_ms.toFixed(1)}ms
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

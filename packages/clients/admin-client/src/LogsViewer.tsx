import { useState, useEffect, useCallback } from 'react';
import {
  fetchLogs,
  fetchLogsForService,
  exportLogs,
  type LogEntry,
  type LogLevel,
  type LogsQuery
} from './api-client';

const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  debug: 'bg-gray-600 text-gray-200',
  info: 'bg-blue-600 text-blue-200',
  warn: 'bg-yellow-600 text-yellow-200',
  error: 'bg-red-600 text-red-200'
};

const LOG_LEVEL_ICONS: Record<LogLevel, string> = {
  debug: '○',
  info: '●',
  warn: '⚠',
  error: '✕'
};

const DATE_RANGE_OPTIONS = [
  { label: 'Last 1 hour', value: 1, unit: 'hours' as const },
  { label: 'Last 24 hours', value: 1, unit: 'days' as const },
  { label: 'Last 7 days', value: 7, unit: 'days' as const },
  { label: 'Last 30 days', value: 30, unit: 'days' as const },
  { label: 'Last 90 days', value: 90, unit: 'days' as const }
];

const SERVICES = ['all', 'auth', 'hub', 'presence', 'sfu', 'storage'] as const;

export default function LogsViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | ''>('');
  const [dateRange, setDateRange] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage] = useState(50);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const fetchLogsData = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const startDate = new Date(now.getTime() - dateRange * 60 * 60 * 1000);

      const query: LogsQuery = {
        startTime: startDate.toISOString(),
        endTime: now.toISOString(),
        search: searchQuery || undefined,
        page,
        perPage
      };

      if (selectedService !== 'all') {
        query.service = selectedService;
      }

      if (selectedLevel) {
        query.level = selectedLevel;
      }

      const response =
        selectedService === 'all'
          ? await fetchLogs(query)
          : await fetchLogsForService(selectedService as any, query);

      setLogs(response.entries);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedService, selectedLevel, dateRange, searchQuery, page, perPage]);

  useEffect(() => {
    fetchLogsData();

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchLogsData, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchLogsData, autoRefresh]);

  const handleExport = async () => {
    try {
      const now = new Date();
      const startDate = new Date(now.getTime() - dateRange * 60 * 60 * 1000);

      const query: LogsQuery = {
        startTime: startDate.toISOString(),
        endTime: now.toISOString(),
        search: searchQuery || undefined
      };

      if (selectedService !== 'all') {
        query.service = selectedService;
      }

      if (selectedLevel) {
        query.level = selectedLevel;
      }

      const jsonData = await exportLogs(query);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export logs:', error);
      alert('Failed to export logs');
    }
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">System Logs</h2>
        <button
          onClick={handleExport}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          Export Logs
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Service</label>
            <select
              value={selectedService}
              onChange={(e) => {
                setSelectedService(e.target.value);
                setPage(1);
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SERVICES.map((service) => (
                <option key={service} value={service}>
                  {service === 'all'
                    ? 'All Services'
                    : service.charAt(0).toUpperCase() + service.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Log Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value as LogLevel | '');
                setPage(1);
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warn">Warn</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Time Range</label>
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(parseInt(e.target.value));
                setPage(1);
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DATE_RANGE_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Auto-Refresh</label>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`w-full py-2 px-4 rounded-lg transition font-medium ${
                autoRefresh
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
              }`}
            >
              {autoRefresh ? 'Enabled (30s)' : 'Disabled'}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-between items-center mb-4 text-sm text-gray-400">
          <span>Total: {total} entries</span>
          <span>
            Page {page} of {totalPages || 1}
          </span>
        </div>

        {loading && logs.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-gray-400"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No logs found matching your criteria
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`bg-gray-700 rounded-lg border border-gray-600 transition cursor-pointer hover:border-gray-500 ${
                    expandedEntry === log.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setExpandedEntry(expandedEntry === log.id ? null : log.id)}
                >
                  <div className="p-4 flex items-start gap-3">
                    <span
                      className={`text-lg ${LOG_LEVEL_COLORS[log.level]} px-2 py-1 rounded text-sm font-mono`}
                    >
                      {LOG_LEVEL_ICONS[log.level]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-600 rounded text-gray-300">
                          {log.service}
                        </span>
                      </div>
                      <p className="text-sm text-gray-200 break-words">{log.message}</p>
                    </div>
                  </div>
                  {expandedEntry === log.id &&
                    log.context &&
                    Object.keys(log.context).length > 0 && (
                      <div className="border-t border-gray-600 p-4 bg-gray-800">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Context</h4>
                        <pre className="text-xs text-gray-300 overflow-x-auto">
                          {JSON.stringify(log.context, null, 2)}
                        </pre>
                      </div>
                    )}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum =
                    totalPages <= 5
                      ? i + 1
                      : page <= 3
                        ? i + 1
                        : page >= totalPages - 2
                          ? totalPages - 4 + i
                          : page - 2 + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1 rounded transition ${
                        page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

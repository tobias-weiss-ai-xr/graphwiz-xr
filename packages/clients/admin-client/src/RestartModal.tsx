import { useState } from 'react';

interface RestartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestartService: (serviceName: string) => Promise<void>;
  onRestartAll: () => Promise<void>;
  restartingServices: Map<string, boolean>;
  services: Array<{
    name: string;
    status: 'loading' | 'healthy' | 'degraded' | 'error' | 'restarting';
  }>;
}

export default function RestartModal({
  isOpen,
  onClose,
  onRestartService,
  onRestartAll,
  restartingServices,
  services
}: RestartModalProps) {
  const [isRestartingAll, setIsRestartingAll] = useState(false);

  if (!isOpen) return null;

  const handleRestartService = async (serviceName: string) => {
    await onRestartService(serviceName);
  };

  const handleRestartAll = async () => {
    setIsRestartingAll(true);
    await onRestartAll();
    setIsRestartingAll(false);
  };

  const isAnyRestarting = Array.from(restartingServices.values()).some(Boolean) || isRestartingAll;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 flex items-center justify-center">
        <div className="bg-gray-900 rounded-lg max-w-3xl w-full mx-auto my-8 border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Restart Services</h2>
              <button
                onClick={onClose}
                disabled={isAnyRestarting}
                className="text-gray-400 hover:text-white text-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ×
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Restart All Services</h3>
              <button
                onClick={handleRestartAll}
                disabled={isAnyRestarting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {isRestartingAll ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Restarting All Services...
                  </div>
                ) : (
                  'Restart All Services'
                )}
              </button>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Restart Individual Services</h3>
              <div className="space-y-3">
                {services.map((service) => {
                  const isRestarting = restartingServices.get(service.name.toLowerCase()) || false;
                  return (
                    <div
                      key={service.name}
                      className="flex items-center justify-between bg-gray-800 rounded-lg p-4 border border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            service.status === 'healthy'
                              ? 'bg-green-500'
                              : service.status === 'loading'
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                          } ${isRestarting ? 'animate-pulse' : ''}`}
                        />
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-gray-400 capitalize">{service.status}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRestartService(service.name)}
                        disabled={isRestarting || isAnyRestarting}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isRestarting ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Restarting...
                          </div>
                        ) : (
                          'Restart'
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-900 border border-yellow-700 rounded-lg">
              <p className="text-sm text-yellow-200">
                <strong>⚠️ Warning:</strong> Restarting services will temporarily interrupt
                functionality. The process typically takes 10-30 seconds per service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

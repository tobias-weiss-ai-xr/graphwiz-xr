/**
 * React hook for WebTransport client
 */

import type {
  WorldState,
  PresenceEvent,
  EntitySpawn,
  ChatMessage,
} from '@graphwiz/protocol';
import { useEffect, useState, useCallback, useRef } from 'react';

import { WebTransportClient, type WebTransportClientConfig } from './WebTransportClient';

export interface UseWebTransportOptions extends Partial<WebTransportClientConfig> {
  autoConnect?: boolean;
}

export interface UseWebTransportReturn {
  client: WebTransportClient | null;
  connected: boolean;
  connecting: boolean;
  error: Error | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  myClientId: string | null;
}

export function useWebTransport(options: UseWebTransportOptions = {}): UseWebTransportReturn {
  const {
    serverUrl = 'https://localhost:8443',
    roomId = 'default-room',
    authToken,
    clientId,
    displayName = 'Anonymous',
    autoConnect = true,
  } = options;

  const [client, setClient] = useState<WebTransportClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [myClientId, setMyClientId] = useState<string | null>(null);

  const clientRef = useRef<WebTransportClient | null>(null);

  // Create client on mount
  useEffect(() => {
    const newClient = new WebTransportClient({
      serverUrl,
      roomId,
      authToken,
      clientId,
      displayName,
    });

    clientRef.current = newClient;
    setClient(newClient);

    return () => {
      // Cleanup on unmount
      if (newClient.connected) {
        newClient.disconnect().catch(console.error);
      }
    };
  }, [serverUrl, roomId, authToken, clientId, displayName]);

  // Set up disconnect handler
  useEffect(() => {
    if (!client) return;

    const cleanup = client.onDisconnect(() => {
      setConnected(false);
      setMyClientId(null);
    });

    return cleanup;
  }, [client]);

  // Auto connect if enabled
  useEffect(() => {
    if (!client || !autoConnect || connected) return;

    let cancelled = false;

    const doConnect = async () => {
      setConnecting(true);
      setError(null);

      try {
        await client.connect();
        if (!cancelled) {
          setConnected(true);
          setMyClientId(client.myClientId);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setConnected(false);
        }
      } finally {
        if (!cancelled) {
          setConnecting(false);
        }
      }
    };

    doConnect();

    return () => {
      cancelled = true;
    };
  }, [client, autoConnect]);

  const connect = useCallback(async () => {
    if (!client) return;

    setConnecting(true);
    setError(null);

    try {
      await client.connect();
      setConnected(true);
      setMyClientId(client.myClientId);
    } catch (err) {
      setError(err as Error);
      setConnected(false);
      throw err;
    } finally {
      setConnecting(false);
    }
  }, [client]);

  const disconnect = useCallback(async () => {
    if (!client) return;

    try {
      await client.disconnect();
      setConnected(false);
      setMyClientId(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [client]);

  return {
    client,
    connected,
    connecting,
    error,
    connect,
    disconnect,
    myClientId,
  };
}

/**
 * Hook for receiving world state updates
 */
export function useWorldState(client: WebTransportClient | null): WorldState | null {
  const [worldState, setWorldState] = useState<WorldState | null>(null);

  useEffect(() => {
    if (!client) return;

    const cleanup = client.onState((state) => {
      setWorldState(state);
    });

    return cleanup;
  }, [client]);

  return worldState;
}

/**
 * Hook for receiving presence updates
 */
export function usePresence(client: WebTransportClient | null): PresenceEvent[] {
  const [presenceEvents, setPresenceEvents] = useState<PresenceEvent[]>([]);

  useEffect(() => {
    if (!client) return;

    const cleanup = client.onPresence((event) => {
      setPresenceEvents((prev) => {
        // Remove previous update for same client if exists
        const filtered = prev.filter((e) => e.clientId !== event.clientId);

        // For leave events, don't add to list
        if (event.eventType === 1) {
          return filtered;
        }

        return [...filtered, event];
      });
    });

    return cleanup;
  }, [client]);

  return presenceEvents;
}

/**
 * Hook for entity management
 */
export function useEntities(client: WebTransportClient | null) {
  const [entities, setEntities] = useState<Map<string, EntitySpawn>>(new Map());

  useEffect(() => {
    if (!client) return;

    const cleanupSpawn = client.onEntitySpawn((spawn) => {
      setEntities((prev) => new Map(prev).set(spawn.entityId, spawn));
    });

    const cleanupDespawn = client.onEntityDespawn((despawn) => {
      setEntities((prev) => {
        const next = new Map(prev);
        next.delete(despawn.entityId);
        return next;
      });
    });

    const cleanupUpdate = client.onEntityUpdate((update) => {
      setEntities((prev) => {
        const existing = prev.get(update.entityId);
        if (existing) {
          const updated = {
            ...existing,
            components: { ...existing.components, ...update.components },
          };
          return new Map(prev).set(update.entityId, updated);
        }
        return prev;
      });
    });

    return () => {
      cleanupSpawn();
      cleanupDespawn();
      cleanupUpdate();
    };
  }, [client]);

  return {
    entities,
    spawnEntity: client?.spawnEntity.bind(client),
    despawnEntity: client?.despawnEntity.bind(client),
  };
}

/**
 * Hook for chat messages
 */
export function useChat(client: WebTransportClient | null): {
  messages: ChatMessage[];
  sendMessage: (message: string, type?: number) => void;
} {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!client) return;

    const cleanup = client.onChat((chat) => {
      setMessages((prev) => [...prev, chat]);
    });

    return cleanup;
  }, [client]);

  const sendMessage = useCallback(
    (message: string, type = 0) => {
      client?.sendChatMessage(message, type);
    },
    [client]
  );

  return {
    messages,
    sendMessage,
  };
}

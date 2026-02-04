/**
 * Network System
 *
 * ECS system that handles network synchronization of entities.
 */

import type { Message, MessageType } from '@graphwiz/protocol';

import type { Entity } from '../ecs/entity';
import { TransformComponent } from '../ecs/entity';
import { System } from '../ecs/system';

import type { NetworkClient } from './client';
import { NetworkSyncComponent } from './network-sync';

export class NetworkSystem extends System {
  private networkClient: NetworkClient;
  private updateInterval = 1000 / 30; // 30 updates per second
  private lastUpdateTime = 0;

  // Map network IDs to local entity IDs
  private networkToEntityMap = new Map<string, string>();
  // Map local entity IDs to network IDs
  private entityToNetworkMap = new Map<string, string>();

  constructor(networkClient: NetworkClient) {
    super();
    this.networkClient = networkClient;

    // Set up message handlers
    this.setupMessageHandlers();
  }

  /**
   * Update the network system
   */
  override update(_deltaTime: number): void {
    if (!this.world) return;

    const currentTime = Date.now();

    // Check if it's time to send updates
    if (currentTime - this.lastUpdateTime < this.updateInterval) {
      return;
    }

    this.lastUpdateTime = currentTime;

    // Sync all entities with NetworkSyncComponent
    const entities = this.world.getEntitiesWithComponents(TransformComponent);

    for (const entity of entities) {
      const transform = entity.getComponent(TransformComponent);
      const networkSync = entity.getComponent(NetworkSyncComponent);

      if (transform && networkSync && (networkSync as any).isOwner) {
        // Send position update if it's time
        if ((networkSync as any).shouldSync(currentTime)) {
          this.networkClient.sendPositionUpdate(
            (networkSync as any).networkId,
            { x: transform.position.x, y: transform.position.y, z: transform.position.z },
            {
              x: transform.rotation.x,
              y: transform.rotation.y,
              z: transform.rotation.z,
              w: 0, // Quaternion w - not using quaternions yet
            }
          );
          (networkSync as any).updateLastSyncTime(currentTime);
        }
      }
    }
  }

  /**
   * Set up message handlers for network messages
   */
  private setupMessageHandlers(): void {
    // Handle entity spawn
    this.networkClient.on(20 as MessageType, (message) => { // ENTITY_SPAWN = 20
      this.handleEntitySpawn(message);
    });

    // Handle entity update
    this.networkClient.on(21 as MessageType, (message) => { // ENTITY_UPDATE = 21
      this.handleEntityUpdate(message);
    });

    // Handle entity despawn
    this.networkClient.on(22 as MessageType, (message) => { // ENTITY_DESPAWN = 22
      this.handleEntityDespawn(message);
    });

    // Handle position updates
    this.networkClient.on(10 as MessageType, (message) => { // POSITION_UPDATE = 10
      this.handlePositionUpdate(message);
    });

    // Handle server hello (initial state)
    this.networkClient.on(2 as MessageType, (message) => { // SERVER_HELLO = 2
      this.handleServerHello(message);
    });

    // Handle presence events
    this.networkClient.on(40 as MessageType, (message) => { // PRESENCE_JOIN = 40
      this.handlePresenceJoin(message);
    });

    this.networkClient.on(41 as MessageType, (message) => { // PRESENCE_LEAVE = 41
      this.handlePresenceLeave(message);
    });
  }

  /**
   * Handle entity spawn message
   */
  private handleEntitySpawn(message: Message): void {
    if (!this.world) return;

    const spawn = message.payload as any;
    console.log('[NetworkSystem] Spawning entity:', spawn.entityId);

    // Check if entity already exists
    if (this.networkToEntityMap.has(spawn.entityId)) {
      return;
    }

    // Create new entity
    const entity = this.world.createEntity();

    // Add transform component
    const transform = new TransformComponent();
    entity.addComponent(TransformComponent, transform);

    // Add network sync component
    const networkSync = new NetworkSyncComponent({
      networkId: spawn.entityId,
      isOwner: spawn.ownerId === (this.networkClient as any).config.userId,
      syncRate: 30,
      interpolate: true,
      extrapolate: false,
    });
    entity.addComponent(NetworkSyncComponent, networkSync);

    // Store mappings
    this.networkToEntityMap.set(spawn.entityId, entity.id);
    this.entityToNetworkMap.set(entity.id, spawn.entityId);

    // Apply initial component data
    if (spawn.components) {
      this.applyComponents(entity, spawn.components);
    }
  }

  /**
   * Handle entity update message
   */
  private handleEntityUpdate(message: Message): void {
    const update = message.payload as any;
    const entityId = this.networkToEntityMap.get(update.entityId);

    if (!entityId || !this.world) return;

    const entity = this.world.getEntity(entityId);
    if (!entity) return;

    // Apply component updates
    if (update.components) {
      this.applyComponentUpdates(entity, update.components);
    }
  }

  /**
   * Handle entity despawn message
   */
  private handleEntityDespawn(message: Message): void {
    const despawn = message.payload as any;
    const entityId = this.networkToEntityMap.get(despawn.entityId);

    if (!entityId || !this.world) return;

    console.log('[NetworkSystem] Despawning entity:', despawn.entityId);

    // Remove entity from world
    this.world.removeEntity(entityId);

    // Remove mappings
    this.entityToNetworkMap.delete(entityId);
    this.networkToEntityMap.delete(despawn.entityId);
  }

  /**
   * Handle position update message
   */
  private handlePositionUpdate(message: Message): void {
    const update = message.payload as any;
    const entityId = this.networkToEntityMap.get(update.entityId);

    if (!entityId || !this.world) return;

    const entity = this.world.getEntity(entityId);
    if (!entity) return;

    const transform = entity.getComponent(TransformComponent);
    const networkSync = entity.getComponent(NetworkSyncComponent);

    if (transform && networkSync && !(networkSync as any).isOwner) {
      // Add to interpolation buffer
      (networkSync as any).addStateUpdate(
        { x: update.position?.x ?? 0, y: update.position?.y ?? 0, z: update.position?.z ?? 0 },
        { x: update.rotation?.x ?? 0, y: update.rotation?.y ?? 0, z: update.rotation?.z ?? 0 },
        update.timestamp ?? Date.now()
      );

      // Apply interpolated state
      const interpolatedState = (networkSync as any).getInterpolatedState(Date.now());
      if (interpolatedState) {
        transform.position.copy(interpolatedState.position);
        transform.rotation.copy(interpolatedState.rotation);
      }
    }
  }

  /**
   * Handle server hello message
   */
  private handleServerHello(message: Message): void {
    const hello = message.payload as any;
    console.log('[NetworkSystem] Received server hello:', hello);

    // Spawn initial entities from world state
    if (hello.initialState && hello.initialState.entities) {
      for (const entitySnapshot of hello.initialState.entities) {
        this.spawnEntityFromSnapshot(entitySnapshot);
      }
    }
  }

  /**
   * Handle presence join message
   */
  private handlePresenceJoin(message: Message): void {
    const event = message.payload as any;
    console.log('[NetworkSystem] User joined:', event.clientId);
  }

  /**
   * Handle presence leave message
   */
  private handlePresenceLeave(message: Message): void {
    const event = message.payload as any;
    console.log('[NetworkSystem] User left:', event.clientId);
  }

  /**
   * Spawn entity from snapshot
   */
  private spawnEntityFromSnapshot(snapshot: any): void {
    if (!this.world) return;

    console.log('[NetworkSystem] Spawning entity from snapshot:', snapshot.id);

    // Create new entity
    const entity = this.world.createEntity();

    // Add transform component
    const transform = new TransformComponent();
    if (snapshot.position) {
      transform.position.set(snapshot.position.x ?? 0, snapshot.position.y ?? 0, snapshot.position.z ?? 0);
    }
    if (snapshot.rotation) {
      transform.rotation.set(snapshot.rotation.x ?? 0, snapshot.rotation.y ?? 0, snapshot.rotation.z ?? 0);
    }
    entity.addComponent(TransformComponent, transform);

    // Add network sync component (not owner)
    const networkSync = new NetworkSyncComponent({
      networkId: snapshot.id,
      isOwner: false,
      syncRate: 30,
      interpolate: true,
      extrapolate: false,
    });
    entity.addComponent(NetworkSyncComponent, networkSync);

    // Store mappings
    this.networkToEntityMap.set(snapshot.id, entity.id);
    this.entityToNetworkMap.set(entity.id, snapshot.id);

    // Apply components
    if (snapshot.components) {
      this.applyComponents(entity, snapshot.components);
    }
  }

  /**
   * Apply components from map
   */
  private applyComponents(_entity: Entity, components: Record<string, unknown>): void {
    // Parse and apply components based on their type
    // This is a simplified implementation
    for (const [key, value] of Object.entries(components)) {
      console.log('[NetworkSystem] Applying component:', key, value);
    }
  }

  /**
   * Apply component updates from serialized data
   */
  private applyComponentUpdates(_entity: Entity, components: Record<string, unknown>): void {
    // Deserialize and apply component updates
    for (const [key, data] of Object.entries(components)) {
      console.log('[NetworkSystem] Updating component:', key, data);
    }
  }

  /**
   * Create a networked entity
   */
  createNetworkedEntity(
    templateId: string,
    position: { x: number; y: number; z: number },
    components: Record<string, unknown> = {}
  ): Entity | undefined {
    if (!this.world) return;

    // Create entity
    const entity = this.world.createEntity();

    // Add transform
    const transform = new TransformComponent();
    transform.position.set(position.x, position.y, position.z);
    entity.addComponent(TransformComponent, transform);

    // Generate network ID
    const networkId = `entity-${entity.id}`;

    // Add network sync component (owner)
    const networkSync = new NetworkSyncComponent({
      networkId,
      isOwner: true,
      syncRate: 30,
      interpolate: false,
      extrapolate: false,
    });
    entity.addComponent(NetworkSyncComponent, networkSync);

    // Store mappings
    this.networkToEntityMap.set(networkId, entity.id);
    this.entityToNetworkMap.set(entity.id, networkId);

    // Send spawn message to server
    this.networkClient.sendEntitySpawn({
      entityId: networkId,
      templateId,
      components,
    });

    console.log('[NetworkSystem] Creating networked entity:', networkId);

    return entity;
  }

  /**
   * Get local entity ID for a network ID
   */
  getLocalEntityId(networkId: string): string | undefined {
    return this.networkToEntityMap.get(networkId);
  }

  /**
   * Get network ID for a local entity
   */
  getNetworkId(entityId: string): string | undefined {
    return this.entityToNetworkMap.get(entityId);
  }
}

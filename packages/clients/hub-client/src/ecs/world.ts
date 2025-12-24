/**
 * ECS World
 *
 * Manages entities, components, and systems.
 */

import { Entity } from './entity';
import { System } from './system';

type ComponentConstructor = new (...args: any[]) => any;

export class World {
  private entities: Map<string, Entity> = new Map();
  private systems: System[] = [];
  private nextEntityId = 0;

  /**
   * Create a new entity
   */
  createEntity(): Entity {
    const id = `entity-${this.nextEntityId++}`;
    const entity = new Entity(id);
    this.entities.set(id, entity);
    return entity;
  }

  /**
   * Get an entity by ID
   */
  getEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  /**
   * Remove an entity
   */
  removeEntity(id: string): boolean {
    const entity = this.entities.get(id);
    if (entity) {
      entity.dispose();
      return this.entities.delete(id);
    }
    return false;
  }

  /**
   * Get all entities
   */
  getEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  /**
   * Get entities with specific components
   */
  getEntitiesWithComponents(...components: ComponentConstructor[]): Entity[] {
    return this.getEntities().filter((entity) =>
      components.every((comp) => entity.hasComponent(comp))
    );
  }

  /**
   * Add a system to the world
   */
  addSystem(system: System): void {
    this.systems.push(system);
    system.onAddToWorld(this);
  }

  /**
   * Remove a system from the world
   */
  removeSystem(system: System): void {
    const index = this.systems.indexOf(system);
    if (index !== -1) {
      this.systems.splice(index, 1);
      system.onRemoveFromWorld();
    }
  }

  /**
   * Update all systems
   */
  update(deltaTime: number): void {
    for (const system of this.systems) {
      system.update(deltaTime);
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    for (const entity of this.entities.values()) {
      entity.dispose();
    }
    this.entities.clear();

    for (const system of this.systems) {
      system.onRemoveFromWorld();
    }
    this.systems = [];
  }
}

/**
 * ECS World
 *
 * Manages entities, components, and systems.
 */
import { Entity } from './entity';
export class World {
    constructor() {
        this.entities = new Map();
        this.systems = [];
        this.nextEntityId = 0;
    }
    /**
     * Create a new entity
     */
    createEntity() {
        const id = `entity-${this.nextEntityId++}`;
        const entity = new Entity(id);
        this.entities.set(id, entity);
        return entity;
    }
    /**
     * Get an entity by ID
     */
    getEntity(id) {
        return this.entities.get(id);
    }
    /**
     * Remove an entity
     */
    removeEntity(id) {
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
    getEntities() {
        return Array.from(this.entities.values());
    }
    /**
     * Get entities with specific components
     */
    getEntitiesWithComponents(...components) {
        return this.getEntities().filter((entity) => components.every((comp) => entity.hasComponent(comp)));
    }
    /**
     * Add a system to the world
     */
    addSystem(system) {
        this.systems.push(system);
        system.onAddToWorld(this);
    }
    /**
     * Remove a system from the world
     */
    removeSystem(system) {
        const index = this.systems.indexOf(system);
        if (index !== -1) {
            this.systems.splice(index, 1);
            system.onRemoveFromWorld();
        }
    }
    /**
     * Update all systems
     */
    update(deltaTime) {
        for (const system of this.systems) {
            system.update(deltaTime);
        }
    }
    /**
     * Clean up resources
     */
    dispose() {
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

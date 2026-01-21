/**
 * ECS Entity
 *
 * Entities are unique identifiers that hold components.
 */
// Re-export all components
export * from './components';
export class Entity {
    constructor(id) {
        this.components = new Map();
        this.id = id;
    }
    /**
     * Add a component to this entity
     */
    addComponent(componentClass, component) {
        this.components.set(componentClass, component);
        return component;
    }
    /**
     * Get a component from this entity
     */
    getComponent(componentClass) {
        return this.components.get(componentClass);
    }
    /**
     * Check if entity has a component
     */
    hasComponent(componentClass) {
        return this.components.has(componentClass);
    }
    /**
     * Remove a component from this entity
     */
    removeComponent(componentClass) {
        return this.components.delete(componentClass);
    }
    /**
     * Get all components
     */
    getComponents() {
        return this.components;
    }
    /**
     * Clean up components
     */
    dispose() {
        for (const component of this.components.values()) {
            // Call dispose if available
            if (component && typeof component.dispose === 'function') {
                component.dispose();
            }
        }
        this.components.clear();
    }
}

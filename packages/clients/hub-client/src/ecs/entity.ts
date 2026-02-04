/**
 * ECS Entity
 *
 * Entities are unique identifiers that hold components.
 */

// Re-export all components
export * from './components';

type ComponentClass<T = unknown> = abstract new (...args: any[]) => T;

export class Entity {
  public readonly id: string;
  private components: Map<ComponentClass, unknown> = new Map();

  constructor(id: string) {
    this.id = id;
  }

  /**
   * Add a component to this entity
   */
  addComponent<T>(componentClass: ComponentClass<T>, component: T): T {
    this.components.set(componentClass, component);
    return component;
  }

  /**
   * Get a component from this entity
   */
  getComponent<T>(componentClass: ComponentClass<T>): T | undefined {
    return this.components.get(componentClass) as T | undefined;
  }

  /**
   * Check if entity has a component
   */
  hasComponent(componentClass: ComponentClass): boolean {
    return this.components.has(componentClass);
  }

  /**
   * Remove a component from this entity
   */
  removeComponent(componentClass: ComponentClass): boolean {
    return this.components.delete(componentClass);
  }

  /**
   * Get all components
   */
  getComponents(): Map<ComponentClass, unknown> {
    return this.components;
  }

  /**
   * Clean up components
   */
  dispose(): void {
    for (const component of this.components.values()) {
      // Call dispose if available
      if (component && typeof (component as any).dispose === 'function') {
        (component as any).dispose();
      }
    }
    this.components.clear();
  }
}

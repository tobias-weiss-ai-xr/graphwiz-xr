/**
 * ECS Entity
 *
 * Entities are unique identifiers that hold components.
 */

import { Vector3, Euler } from 'three';

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
    this.components.clear();
  }
}

/**
 * Transform component
 */
export class TransformComponent {
  constructor(
    public position: Vector3 = new Vector3(0, 0, 0),
    public rotation: Euler = new Euler(0, 0, 0),
    public scale: Vector3 = new Vector3(1, 1, 1)
  ) {}
}

/**
 * Mesh component
 */
export class MeshComponent {
  constructor(
    public geometry: string = 'box',
    public material: { color: number } = { color: 0x2196f3 }
  ) {}
}

/**
 * Network sync component
 */
export class NetworkSyncComponent {
  constructor(
    public networkId: string,
    public isOwner: boolean = false
  ) {}
}

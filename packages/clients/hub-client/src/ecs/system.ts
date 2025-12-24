/**
 * ECS System base class
 *
 * Systems operate on entities with specific components.
 */

import type { World } from './world';

export abstract class System {
  protected world?: World;

  /**
   * Called when system is added to world
   */
  onAddToWorld(world: World): void {
    this.world = world;
  }

  /**
   * Called when system is removed from world
   */
  onRemoveFromWorld(): void {
    this.world = undefined;
  }

  /**
   * Update the system
   */
  abstract update(deltaTime: number): void;
}

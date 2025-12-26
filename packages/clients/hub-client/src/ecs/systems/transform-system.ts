/**
 * Transform System
 *
 * Updates entity transforms each frame.
 */

import { TransformComponent } from '../entity';
import { System } from '../system';

export class TransformSystem extends System {
  override update(_deltaTime: number): void {
    if (!this.world) return;

    const entities = this.world.getEntitiesWithComponents(TransformComponent);

    for (const entity of entities) {
      const transform = entity.getComponent(TransformComponent);
      if (transform) {
        // Transform updates would happen here
        // For now, this is a placeholder for future logic
      }
    }
  }
}

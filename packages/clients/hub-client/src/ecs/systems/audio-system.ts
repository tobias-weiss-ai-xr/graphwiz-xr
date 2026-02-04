/**
 * Audio System
 *
 * Updates audio positions and manages spatial audio.
 */

import { AudioComponent, TransformComponent } from '../entity';
import { System } from '../system';

export class AudioSystem extends System {
  override update(_deltaTime: number): void {
    if (!this.world) return;

    const entities = this.world.getEntitiesWithComponents(AudioComponent, TransformComponent);

    for (const entity of entities) {
      const audio = entity.getComponent(AudioComponent);
      const transform = entity.getComponent(TransformComponent);

      if (audio && transform) {
        audio.setPosition(transform.position);
      }
    }
  }

  /**
   * Initialize all audio components
   */
  initializeAudio(): void {
    if (!this.world) return;

    const entities = this.world.getEntitiesWithComponents(AudioComponent);

    for (const entity of entities) {
      const audio = entity.getComponent(AudioComponent);
      if (audio) {
        audio.initialize().catch((err) => {
          console.error('[AudioSystem] Failed to initialize audio:', err);
        });
      }
    }
  }
}

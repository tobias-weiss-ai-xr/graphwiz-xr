/**
 * Animation System
 *
 * Updates all entity animations each frame.
 */
import { AnimationComponent } from '../entity';
import { System } from '../system';
export class AnimationSystem extends System {
    update(deltaTime) {
        if (!this.world)
            return;
        const entities = this.world.getEntitiesWithComponents(AnimationComponent);
        for (const entity of entities) {
            const animation = entity.getComponent(AnimationComponent);
            if (animation) {
                animation.update(deltaTime);
            }
        }
    }
}

/**
 * Physics System
 *
 * Simple physics simulation for entities.
 */
import { Vector3 } from 'three';
import { PhysicsComponent, TransformComponent } from '../entity';
import { System } from '../system';
const GRAVITY = new Vector3(0, -9.8, 0);
export class PhysicsSystem extends System {
    update(deltaTime) {
        if (!this.world)
            return;
        const entities = this.world.getEntitiesWithComponents(PhysicsComponent, TransformComponent);
        for (const entity of entities) {
            const physics = entity.getComponent(PhysicsComponent);
            const transform = entity.getComponent(TransformComponent);
            if (physics && transform) {
                // Skip static objects
                if (physics.isStatic)
                    continue;
                // Apply gravity
                if (!physics.isKinematic) {
                    physics.velocity.add(GRAVITY.clone().multiplyScalar(deltaTime));
                }
                // Apply velocity to position
                const deltaPos = physics.velocity.clone().multiplyScalar(deltaTime);
                transform.position.add(deltaPos);
                // Apply damping
                physics.velocity.multiplyScalar(1 - physics.linearDamping);
                physics.angularVelocity.multiplyScalar(1 - physics.angularDamping);
                // Simple ground collision (y = 0)
                if (transform.position.y < 0) {
                    transform.position.y = 0;
                    physics.velocity.y *= -physics.restitution;
                }
            }
        }
    }
}

/**
 * ECS System base class
 *
 * Systems operate on entities with specific components.
 */
export class System {
    /**
     * Called when system is added to world
     */
    onAddToWorld(world) {
        this.world = world;
    }
    /**
     * Called when system is removed from world
     */
    onRemoveFromWorld() {
        this.world = undefined;
    }
}

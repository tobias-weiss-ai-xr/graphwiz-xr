/**
 * Physics Module
 *
 * Exports all physics functionality for realistic 3D simulation.
 */

export { PhysicsWorld } from './physics-world';
export { PhysicsBodyComponent } from './physics-body-component';
export { CannonPhysicsSystem as PhysicsSystem } from './physics-system';
export type { CannonPhysicsSystemConfig as PhysicsSystemConfig } from './physics-system';
export {
  TriggerComponent,
  CollisionFilterComponent,
  RaycastComponent,
  CharacterControllerComponent,
} from './collision-component';

export type { PhysicsWorldConfig } from './physics-world';
export type { PhysicsBodyConfig, PhysicsShapeType } from './physics-body-component';

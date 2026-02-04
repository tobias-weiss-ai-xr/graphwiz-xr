/**
 * Billboard System
 *
 * Makes entities always face the camera.
 */

import type { Camera } from 'three';
import { Vector3, Quaternion, Matrix4 } from 'three';

import { BillboardComponent, TransformComponent } from '../entity';
import { System } from '../system';

export class BillboardSystem extends System {
  private camera: Camera | null = null;

  constructor() {
    super();
  }

  setCamera(camera: Camera): void {
    this.camera = camera;
  }

  override update(_deltaTime: number): void {
    if (!this.world || !this.camera) return;

    const entities = this.world.getEntitiesWithComponents(
      BillboardComponent,
      TransformComponent
    );

    for (const entity of entities) {
      const billboard = entity.getComponent(BillboardComponent);
      const transform = entity.getComponent(TransformComponent);

      if (billboard && transform) {
        // Get camera position
        const cameraPos = new Vector3();
        this.camera.getWorldPosition(cameraPos);

        // Make entity face camera
        const lookAtPos = cameraPos.clone();
        if (billboard.lockX) lookAtPos.x = transform.position.x;
        if (billboard.lockY) lookAtPos.y = transform.position.y;
        if (billboard.lockZ) lookAtPos.z = transform.position.z;

        transform.rotation.setFromQuaternion(
          new Quaternion().setFromRotationMatrix(
            new Matrix4().lookAt(lookAtPos, transform.position, new Vector3(0, 1, 0))
          )
        );
      }
    }
  }
}

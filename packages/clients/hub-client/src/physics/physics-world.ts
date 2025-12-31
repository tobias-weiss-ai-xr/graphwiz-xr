/**
 * Physics World Manager
 *
 * Manages the Cannon.js physics world for realistic physics simulation.
 */

import * as CANNON from 'cannon-es';

export interface PhysicsWorldConfig {
  gravity?: { x: number; y: number; z: number };
  solverIterations?: number;
  broadphase?: 'Naive' | 'SAP';
  allowSleep?: boolean;
}

export class PhysicsWorld {
  public readonly world: CANNON.World;
  private materials: Map<string, CANNON.Material> = new Map();
  private contactMaterials: CANNON.ContactMaterial[] = [];

  constructor(config: PhysicsWorldConfig = {}) {
    this.world = new CANNON.World();

    // Configure gravity
    const gravity = config.gravity || { x: 0, y: -9.82, z: 0 };
    this.world.gravity.set(gravity.x, gravity.y, gravity.z);

    // Configure solver
    (this.world.solver as any).iterations = config.solverIterations || 10;
    (this.world.solver as any).tolerance = 0.001;

    // Configure broadphase
    if (config.broadphase === 'SAP') {
      this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    } else {
      this.world.broadphase = new CANNON.NaiveBroadphase();
    }

    // Allow sleeping for performance
    this.world.allowSleep = config.allowSleep !== false;

    // Default material
    this.createMaterial('default', 0.3, 0.3);

    console.log('[PhysicsWorld] Initialized', {
      gravity,
      solverIterations: (this.world.solver as any).iterations,
      broadphase: config.broadphase || 'Naive',
      allowSleep: this.world.allowSleep,
    });
  }

  /**
   * Step the physics simulation
   */
  step(deltaTime: number): void {
    this.world.step(1 / 60, deltaTime, 3);
  }

  /**
   * Create a physics material
   */
  createMaterial(name: string, friction: number, restitution: number): CANNON.Material {
    if (this.materials.has(name)) {
      return this.materials.get(name)!;
    }

    const material = new CANNON.Material();
    (material as any).name = name;
    material.friction = friction;
    material.restitution = restitution;
    this.materials.set(name, material);

    console.log(`[PhysicsWorld] Created material: ${name}`, { friction, restitution });

    return material;
  }

  /**
   * Create contact material between two materials
   */
  createContactMaterial(
    material1Name: string,
    material2Name: string,
    friction: number,
    restitution: number
  ): CANNON.ContactMaterial {
    const mat1 = this.materials.get(material1Name);
    const mat2 = this.materials.get(material2Name);

    if (!mat1 || !mat2) {
      console.error(`[PhysicsWorld] Materials not found: ${material1Name}, ${material2Name}`);
      throw new Error(`Materials not found: ${material1Name}, ${material2Name}`);
    }

    const contactMaterial = new CANNON.ContactMaterial(mat1, mat2, {
      friction,
      restitution,
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 3,
    });

    this.contactMaterials.push(contactMaterial);
    this.world.addContactMaterial(contactMaterial);

    console.log(`[PhysicsWorld] Created contact material: ${material1Name} + ${material2Name}`, {
      friction,
      restitution,
    });

    return contactMaterial;
  }

  /**
   * Add a body to the world
   */
  addBody(body: CANNON.Body): void {
    this.world.addBody(body);
  }

  /**
   * Remove a body from the world
   */
  removeBody(body: CANNON.Body): void {
    this.world.removeBody(body);
  }

  /**
   * Add a constraint to the world
   */
  addConstraint(constraint: CANNON.Constraint): void {
    this.world.addConstraint(constraint);
  }

  /**
   * Remove a constraint from the world
   */
  removeConstraint(constraint: CANNON.Constraint): void {
    this.world.removeConstraint(constraint);
  }

  /**
   * Get material by name
   */
  getMaterial(name: string): CANNON.Material | undefined {
    return this.materials.get(name);
  }

  /**
   * Raycast for collision detection
   */
  raycast(
    from: CANNON.Vec3,
    to: CANNON.Vec3,
    result: CANNON.RaycastResult = new CANNON.RaycastResult()
  ): CANNON.RaycastResult {
    // Use raycastClosest for single hit detection
    this.world.raycastClosest(from, to, {}, result);
    return result;
  }

  /**
   * Raycast all hits
   */
  raycastAll(
    from: CANNON.Vec3,
    to: CANNON.Vec3,
    callback: (result: CANNON.RaycastResult) => void
  ): void {
    this.world.raycastAll(from, to, {}, callback);
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    // Remove all bodies
    for (let i = this.world.bodies.length - 1; i >= 0; i--) {
      this.world.removeBody(this.world.bodies[i]);
    }

    // Remove all constraints
    for (let i = this.world.constraints.length - 1; i >= 0; i--) {
      this.world.removeConstraint(this.world.constraints[i]);
    }

    // Remove contact materials
    for (const material of this.contactMaterials) {
      this.world.removeContactMaterial(material);
    }

    this.materials.clear();
    this.contactMaterials = [];

    console.log('[PhysicsWorld] Disposed');
  }

  /**
   * Get world statistics
   */
  getStats(): {
    bodies: number;
    constraints: number;
    contactMaterials: number;
    materials: number;
  } {
    return {
      bodies: this.world.bodies.length,
      constraints: this.world.constraints.length,
      contactMaterials: this.world.contactmaterials.length,
      materials: this.materials.size,
    };
  }
}

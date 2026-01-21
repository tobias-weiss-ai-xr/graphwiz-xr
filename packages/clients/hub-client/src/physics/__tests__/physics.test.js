/**
 * Physics System Tests
 *
 * Comprehensive tests for Cannon.js physics integration.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as CANNON from 'cannon-es';
import { Engine } from '../../core';
import { PhysicsSystem, PhysicsBodyComponent, PhysicsWorld } from '../../physics';
import { TransformComponent } from '../../ecs';
// Make CANNON available globally for tests
globalThis.CANNON = CANNON;
describe('PhysicsWorld', () => {
    let world;
    beforeEach(() => {
        world = new PhysicsWorld({
            gravity: { x: 0, y: -9.82, z: 0 },
            allowSleep: true,
        });
    });
    afterEach(() => {
        world.dispose();
    });
    it('should initialize with correct gravity', () => {
        expect(world.world.gravity.x).toBe(0);
        expect(world.world.gravity.y).toBe(-9.82);
        expect(world.world.gravity.z).toBe(0);
    });
    it('should create materials', () => {
        const material = world.createMaterial('test', 0.5, 0.7);
        expect(material).toBeDefined();
        expect(material.friction).toBe(0.5);
        expect(material.restitution).toBe(0.7);
    });
    it('should create contact materials', () => {
        world.createMaterial('mat1', 0.3, 0.3);
        world.createMaterial('mat2', 0.5, 0.5);
        const contact = world.createContactMaterial('mat1', 'mat2', 0.4, 0.4);
        expect(contact).toBeDefined();
        expect(world.world.contactmaterials.length).toBeGreaterThan(0);
    });
    it('should step physics simulation', () => {
        const deltaTime = 1 / 60;
        expect(() => world.step(deltaTime)).not.toThrow();
    });
    it('should add and remove bodies', () => {
        const body = new window.CANNON.Body({
            mass: 1,
            position: new window.CANNON.Vec3(0, 5, 0),
        });
        world.addBody(body);
        expect(world.world.bodies.length).toBe(1);
        world.removeBody(body);
        expect(world.world.bodies.length).toBe(0);
    });
    it('should return statistics', () => {
        const stats = world.getStats();
        expect(stats).toHaveProperty('bodies');
        expect(stats).toHaveProperty('constraints');
        expect(stats).toHaveProperty('contactMaterials');
        expect(stats).toHaveProperty('materials');
    });
    it('should perform raycast', () => {
        // Add a body
        const body = new window.CANNON.Body({
            mass: 0,
            position: new window.CANNON.Vec3(0, 0, 0),
        });
        body.addShape(new window.CANNON.Box(new window.CANNON.Vec3(1, 1, 1)));
        world.addBody(body);
        // Raycast down
        const from = new window.CANNON.Vec3(0, 5, 0);
        const to = new window.CANNON.Vec3(0, -5, 0);
        const result = world.raycast(from, to);
        expect(result.hasHit).toBe(true);
    });
});
describe('PhysicsBodyComponent', () => {
    it('should create box shape', () => {
        const component = new PhysicsBodyComponent({
            mass: 1,
            shape: 'box',
            size: { x: 1, y: 2, z: 3 },
        });
        expect(component.body).toBeDefined();
        expect(component.body.mass).toBe(1);
    });
    it('should create sphere shape', () => {
        const component = new PhysicsBodyComponent({
            mass: 1,
            shape: 'sphere',
            radius: 0.5,
        });
        expect(component.body).toBeDefined();
    });
    it('should create cylinder shape', () => {
        const component = new PhysicsBodyComponent({
            mass: 1,
            shape: 'cylinder',
            radius: 0.5,
            height: 2,
        });
        expect(component.body).toBeDefined();
    });
    it('should create static body', () => {
        const component = new PhysicsBodyComponent({
            mass: 0,
            shape: 'box',
            size: { x: 1, y: 1, z: 1 },
            isStatic: true,
        });
        expect(component.body.mass).toBe(0);
        expect(component.body.type).toBe(CANNON.Body.STATIC);
    });
    it('should link to transform component', () => {
        const component = new PhysicsBodyComponent({
            mass: 1,
            shape: 'box',
            size: { x: 1, y: 1, z: 1 },
        });
        const transform = new TransformComponent();
        transform.position.set(5, 10, 15);
        component.linkTransform(transform);
        component.syncFromTransform();
        expect(component.body.position.x).toBe(5);
        expect(component.body.position.y).toBe(10);
        expect(component.body.position.z).toBe(15);
    });
    it('should sync from transform', () => {
        const component = new PhysicsBodyComponent({
            mass: 1,
            shape: 'box',
            size: { x: 1, y: 1, z: 1 },
        });
        const transform = new TransformComponent();
        transform.position.set(3, 7, 11);
        component.linkTransform(transform);
        component.syncFromTransform();
        expect(component.body.position.x).toBe(3);
        expect(component.body.position.y).toBe(7);
        expect(component.body.position.z).toBe(11);
    });
    it('should apply force', () => {
        const component = new PhysicsBodyComponent({
            mass: 1,
            shape: 'box',
            size: { x: 1, y: 1, z: 1 },
        });
        expect(() => component.applyForce({ x: 0, y: 10, z: 0 })).not.toThrow();
    });
    it('should apply impulse', () => {
        const component = new PhysicsBodyComponent({
            mass: 1,
            shape: 'box',
            size: { x: 1, y: 1, z: 1 },
        });
        expect(() => component.applyImpulse({ x: 5, y: 0, z: 0 })).not.toThrow();
    });
    it('should set and get velocity', () => {
        const component = new PhysicsBodyComponent({
            mass: 1,
            shape: 'box',
            size: { x: 1, y: 1, z: 1 },
        });
        component.setVelocity({ x: 1, y: 2, z: 3 });
        const velocity = component.getVelocity();
        expect(velocity.x).toBe(1);
        expect(velocity.y).toBe(2);
        expect(velocity.z).toBe(3);
    });
    it('should wake up and sleep', () => {
        const component = new PhysicsBodyComponent({
            mass: 1,
            shape: 'box',
            size: { x: 1, y: 1, z: 1 },
        });
        expect(() => component.wakeUp()).not.toThrow();
        expect(() => component.sleep()).not.toThrow();
    });
});
describe('PhysicsSystem', () => {
    let engine;
    let physicsSystem;
    beforeEach(() => {
        engine = new Engine();
        physicsSystem = new PhysicsSystem({
            gravity: { x: 0, y: -9.82, z: 0 },
            allowSleep: true,
        });
        engine.getWorld().addSystem(physicsSystem);
    });
    afterEach(() => {
        physicsSystem.dispose();
        engine.stop();
    });
    it('should initialize', () => {
        expect(physicsSystem).toBeDefined();
        expect(physicsSystem.getStats().bodies).toBe(0);
    });
    it('should add physics body to entity', () => {
        const entity = engine.getWorld().createEntity();
        const transform = new TransformComponent();
        entity.addComponent(TransformComponent, transform);
        const body = new PhysicsBodyComponent({
            mass: 1,
            shape: 'box',
            size: { x: 1, y: 1, z: 1 },
        });
        physicsSystem.addPhysicsBody(entity.id, body);
        expect(physicsSystem.getStats().bodies).toBe(1);
        expect(physicsSystem.getStats().entities).toBe(1);
    });
    it('should remove physics body from entity', () => {
        const entity = engine.getWorld().createEntity();
        const transform = new TransformComponent();
        entity.addComponent(TransformComponent, transform);
        const body = new PhysicsBodyComponent({
            mass: 1,
            shape: 'box',
            size: { x: 1, y: 1, z: 1 },
        });
        physicsSystem.addPhysicsBody(entity.id, body);
        expect(physicsSystem.getStats().bodies).toBe(1);
        physicsSystem.removePhysicsBody(entity.id);
        expect(physicsSystem.getStats().bodies).toBe(0);
    });
    it('should apply force to entity', () => {
        const entity = engine.getWorld().createEntity();
        const transform = new TransformComponent();
        entity.addComponent(TransformComponent, transform);
        const body = new PhysicsBodyComponent({
            mass: 1,
            shape: 'box',
            size: { x: 1, y: 1, z: 1 },
        });
        physicsSystem.addPhysicsBody(entity.id, body);
        expect(() => {
            physicsSystem.applyForce(entity.id, { x: 0, y: 10, z: 0 });
        }).not.toThrow();
    });
    it('should apply impulse to entity', () => {
        const entity = engine.getWorld().createEntity();
        const transform = new TransformComponent();
        entity.addComponent(TransformComponent, transform);
        const body = new PhysicsBodyComponent({
            mass: 1,
            shape: 'box',
            size: { x: 1, y: 1, z: 1 },
        });
        physicsSystem.addPhysicsBody(entity.id, body);
        expect(() => {
            physicsSystem.applyImpulse(entity.id, { x: 5, y: 0, z: 0 });
        }).not.toThrow();
    });
    it('should set and get velocity', () => {
        const entity = engine.getWorld().createEntity();
        const transform = new TransformComponent();
        entity.addComponent(TransformComponent, transform);
        const body = new PhysicsBodyComponent({
            mass: 1,
            shape: 'box',
            size: { x: 1, y: 1, z: 1 },
        });
        physicsSystem.addPhysicsBody(entity.id, body);
        physicsSystem.setVelocity(entity.id, { x: 1, y: 2, z: 3 });
        const velocity = physicsSystem.getVelocity(entity.id);
        expect(velocity).not.toBeNull();
        expect(velocity.x).toBe(1);
        expect(velocity.y).toBe(2);
        expect(velocity.z).toBe(3);
    });
    it('should perform raycast', () => {
        // Create floor
        const floor = engine.getWorld().createEntity();
        const floorTransform = new TransformComponent();
        floorTransform.position.set(0, 0, 0);
        floor.addComponent(TransformComponent, floorTransform);
        const floorBody = new PhysicsBodyComponent({
            mass: 0,
            shape: 'box',
            size: { x: 10, y: 0.1, z: 10 },
        });
        // Rotate floor
        floorBody.body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        physicsSystem.addPhysicsBody(floor.id, floorBody);
        // Raycast down
        const result = physicsSystem.raycast({ x: 0, y: 5, z: 0 }, { x: 0, y: -5, z: 0 });
        expect(result.hasHit).toBe(true);
    });
    it('should update physics simulation', () => {
        const entity = engine.getWorld().createEntity();
        const transform = new TransformComponent();
        transform.position.set(0, 10, 0);
        entity.addComponent(TransformComponent, transform);
        const body = new PhysicsBodyComponent({
            mass: 1,
            shape: 'box',
            size: { x: 1, y: 1, z: 1 },
        });
        physicsSystem.addPhysicsBody(entity.id, body);
        engine.start();
        const initialY = transform.position.y;
        // Update physics
        physicsSystem.update(1 / 60);
        const newY = transform.position.y;
        // Box should have fallen
        expect(newY).toBeLessThan(initialY);
    });
    it('should return statistics', () => {
        const stats = physicsSystem.getStats();
        expect(stats).toHaveProperty('bodies');
        expect(stats).toHaveProperty('entities');
        expect(stats).toHaveProperty('constraints');
        expect(stats).toHaveProperty('contactMaterials');
    });
    it('should handle multiple bodies', () => {
        for (let i = 0; i < 10; i++) {
            const entity = engine.getWorld().createEntity();
            const transform = new TransformComponent();
            transform.position.set(0, 10 + i, 0);
            entity.addComponent(TransformComponent, transform);
            const body = new PhysicsBodyComponent({
                mass: 1,
                shape: 'box',
                size: { x: 1, y: 1, z: 1 },
            });
            physicsSystem.addPhysicsBody(entity.id, body);
        }
        expect(physicsSystem.getStats().bodies).toBe(10);
        expect(physicsSystem.getStats().entities).toBe(10);
    });
});
describe('Physics Simulation', () => {
    let engine;
    let physicsSystem;
    beforeEach(() => {
        engine = new Engine();
        physicsSystem = new PhysicsSystem({
            gravity: { x: 0, y: -9.82, z: 0 },
            allowSleep: false,
        });
        engine.getWorld().addSystem(physicsSystem);
        engine.start();
    });
    afterEach(() => {
        physicsSystem.dispose();
        engine.stop();
    });
    it('should simulate falling body', () => {
        const entity = engine.getWorld().createEntity();
        const transform = new TransformComponent();
        transform.position.set(0, 10, 0);
        entity.addComponent(TransformComponent, transform);
        const body = new PhysicsBodyComponent({
            mass: 1,
            shape: 'box',
            size: { x: 1, y: 1, z: 1 },
        });
        physicsSystem.addPhysicsBody(entity.id, body);
        const initialY = transform.position.y;
        // Simulate 60 frames
        for (let i = 0; i < 60; i++) {
            physicsSystem.update(1 / 60);
        }
        // Box should have fallen
        expect(transform.position.y).toBeLessThan(initialY);
    });
    it('should simulate bouncing body', () => {
        // Create floor
        const floor = engine.getWorld().createEntity();
        const floorTransform = new TransformComponent();
        floorTransform.position.set(0, 0, 0);
        floor.addComponent(TransformComponent, floorTransform);
        const floorBody = new PhysicsBodyComponent({
            mass: 0,
            shape: 'box',
            size: { x: 10, y: 0.1, z: 10 },
        });
        floorBody.body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        physicsSystem.addPhysicsBody(floor.id, floorBody);
        // Create bouncing box
        const box = engine.getWorld().createEntity();
        const boxTransform = new TransformComponent();
        boxTransform.position.set(0, 5, 0);
        box.addComponent(TransformComponent, boxTransform);
        const boxBody = new PhysicsBodyComponent({
            mass: 1,
            shape: 'box',
            size: { x: 0.5, y: 0.5, z: 0.5 },
            material: 'bouncy',
        });
        physicsSystem.addPhysicsBody(box.id, boxBody);
        const initialY = boxTransform.position.y;
        // Simulate 120 frames (2 seconds)
        for (let i = 0; i < 120; i++) {
            physicsSystem.update(1 / 60);
        }
        // Box should have bounced (gone down then up)
        // Final position should be above floor but below initial
        expect(boxTransform.position.y).toBeGreaterThan(0);
        expect(boxTransform.position.y).toBeLessThan(initialY);
    });
    it('should simulate stacked boxes', () => {
        // Create floor
        const floor = engine.getWorld().createEntity();
        const floorTransform = new TransformComponent();
        floorTransform.position.set(0, 0, 0);
        floor.addComponent(TransformComponent, floorTransform);
        const floorBody = new PhysicsBodyComponent({
            mass: 0,
            shape: 'box',
            size: { x: 10, y: 0.1, z: 10 },
        });
        floorBody.body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        physicsSystem.addPhysicsBody(floor.id, floorBody);
        // Create stack of boxes
        const boxSize = 0.5;
        const stackHeight = 5;
        const boxes = [];
        for (let i = 0; i < stackHeight; i++) {
            const box = engine.getWorld().createEntity();
            const boxTransform = new TransformComponent();
            boxTransform.position.set(0, boxSize / 2 + i * boxSize, 0);
            box.addComponent(TransformComponent, boxTransform);
            const boxBody = new PhysicsBodyComponent({
                mass: 1,
                shape: 'box',
                size: { x: boxSize, y: boxSize, z: boxSize },
            });
            physicsSystem.addPhysicsBody(box.id, boxBody);
            boxes.push(box.id);
        }
        // Simulate 60 frames
        for (let i = 0; i < 60; i++) {
            physicsSystem.update(1 / 60);
        }
        // Check that boxes are still above floor
        for (const boxId of boxes) {
            const entity = engine.getWorld().getEntity(boxId);
            const transform = entity?.getComponent(TransformComponent);
            expect(transform?.position.y).toBeGreaterThan(0);
        }
    });
});
describe('Physics Performance', () => {
    it('should handle 100 bodies efficiently', () => {
        const engine = new Engine();
        const physicsSystem = new PhysicsSystem({
            allowSleep: true,
        });
        engine.getWorld().addSystem(physicsSystem);
        const startTime = performance.now();
        // Create 100 bodies
        for (let i = 0; i < 100; i++) {
            const entity = engine.getWorld().createEntity();
            const transform = new TransformComponent();
            transform.position.set(Math.random() * 10 - 5, Math.random() * 10 + 2, Math.random() * 10 - 5);
            entity.addComponent(TransformComponent, transform);
            const body = new PhysicsBodyComponent({
                mass: 1,
                shape: 'box',
                size: { x: 0.5, y: 0.5, z: 0.5 },
            });
            physicsSystem.addPhysicsBody(entity.id, body);
        }
        const creationTime = performance.now() - startTime;
        // Create 100 bodies in reasonable time (relaxed threshold for CI environments)
        expect(creationTime).toBeLessThan(500);
        // Measure update time
        const updateStartTime = performance.now();
        physicsSystem.update(1 / 60);
        const updateTime = performance.now() - updateStartTime;
        // Single update should be fast (< 20ms for 100 bodies)
        expect(updateTime).toBeLessThan(20);
        physicsSystem.dispose();
        engine.stop();
    });
});

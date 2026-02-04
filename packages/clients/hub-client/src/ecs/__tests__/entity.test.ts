/**
 * Tests for ECS Entity and World
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Entity, World, TransformComponent } from '../index';

describe('Entity', () => {
  let entity: Entity;

  beforeEach(() => {
    entity = new Entity('test-entity');
  });

  afterEach(() => {
    entity.dispose();
  });

  describe('Initialization', () => {
    it('should create entity with ID', () => {
      expect(entity.id).toBe('test-entity');
    });

    it('should start with no components', () => {
      expect(entity.getComponents().size).toBe(0);
    });
  });

  describe('Component management', () => {
    it('should add component', () => {
      const transform = new TransformComponent();
      entity.addComponent(TransformComponent, transform);

      expect(entity.getComponents().size).toBe(1);
    });

    it('should get component', () => {
      const transform = new TransformComponent();
      transform.position.set(1, 2, 3);
      entity.addComponent(TransformComponent, transform);

      const retrieved = entity.getComponent(TransformComponent);
      expect(retrieved).toBeDefined();
      expect(retrieved?.position.x).toBe(1);
      expect(retrieved?.position.y).toBe(2);
      expect(retrieved?.position.z).toBe(3);
    });

    it('should return undefined for non-existent component', () => {
      const retrieved = entity.getComponent(TransformComponent);
      expect(retrieved).toBeUndefined();
    });

    it('should remove component', () => {
      const transform = new TransformComponent();
      entity.addComponent(TransformComponent, transform);

      expect(entity.getComponents().size).toBe(1);

      entity.removeComponent(TransformComponent);

      expect(entity.getComponents().size).toBe(0);
      expect(entity.getComponent(TransformComponent)).toBeUndefined();
    });

    it('should check if has component', () => {
      const transform = new TransformComponent();
      entity.addComponent(TransformComponent, transform);

      expect(entity.hasComponent(TransformComponent)).toBe(true);
      entity.removeComponent(TransformComponent);
      expect(entity.hasComponent(TransformComponent)).toBe(false);
    });

    it('should replace existing component', () => {
      const transform1 = new TransformComponent();
      transform1.position.set(1, 2, 3);

      const transform2 = new TransformComponent();
      transform2.position.set(4, 5, 6);

      entity.addComponent(TransformComponent, transform1);
      entity.addComponent(TransformComponent, transform2);

      const retrieved = entity.getComponent(TransformComponent);
      expect(retrieved?.position.x).toBe(4); // Should be replaced
    });
  });

  describe('Cleanup', () => {
    it('should dispose and clear components', () => {
      const transform = new TransformComponent();
      entity.addComponent(TransformComponent, transform);

      entity.dispose();

      expect(entity.getComponents().size).toBe(0);
    });
  });
});

describe('World', () => {
  let world: World;

  beforeEach(() => {
    world = new World();
  });

  afterEach(() => {
    world.dispose();
  });

  describe('Initialization', () => {
    it('should create world', () => {
      expect(world).toBeDefined();
    });

    it('should start with no entities', () => {
      expect(world.getEntities().length).toBe(0);
    });
  });

  describe('Entity creation', () => {
    it('should create entity', () => {
      const entity = world.createEntity();

      expect(entity).toBeDefined();
      expect(world.getEntities().length).toBe(1);
    });

    it('should generate unique IDs', () => {
      const entity1 = world.createEntity();
      const entity2 = world.createEntity();

      expect(entity1.id).not.toBe(entity2.id);
    });
  });

  describe('Entity retrieval', () => {
    it('should get entity by ID', () => {
      const entity = world.createEntity();

      const retrieved = world.getEntity(entity.id);
      expect(retrieved).toBe(entity);
    });

    it('should return undefined for non-existent entity', () => {
      const retrieved = world.getEntity('non-existent');
      expect(retrieved).toBeUndefined();
    });

    it('should get all entities', () => {
      world.createEntity();
      world.createEntity();
      world.createEntity();

      const entities = world.getEntities();
      expect(entities.length).toBe(3);
    });
  });

  describe('Entity removal', () => {
    it('should remove entity', () => {
      const entity = world.createEntity();

      expect(world.getEntities().length).toBe(1);

      world.removeEntity(entity.id);

      expect(world.getEntities().length).toBe(0);
    });

    it('should return true when removing existing entity', () => {
      const entity = world.createEntity();
      const result = world.removeEntity(entity.id);
      expect(result).toBe(true);
    });

    it('should return false when removing non-existent entity', () => {
      const result = world.removeEntity('non-existent');
      expect(result).toBe(false);
    });

    it('should dispose entity when removing', () => {
      const entity = world.createEntity();
      const disposeSpy = vi.spyOn(entity, 'dispose');

      world.removeEntity(entity.id);

      expect(disposeSpy).toHaveBeenCalled();
    });
  });

  describe('Entity queries', () => {
    it('should get all entities with component', () => {
      const entity1 = world.createEntity();
      const entity2 = world.createEntity();
      const entity3 = world.createEntity();

      const transform1 = new TransformComponent();
      const transform2 = new TransformComponent();

      entity1.addComponent(TransformComponent, transform1);
      entity2.addComponent(TransformComponent, transform2);
      // entity3 has no TransformComponent

      const entities = world.getEntitiesWithComponents(TransformComponent);

      expect(entities.length).toBe(2);
      expect(entities).toContain(entity1);
      expect(entities).toContain(entity2);
      expect(entities).not.toContain(entity3);
    });

    it('should return empty array when no entities have component', () => {
      world.createEntity();
      world.createEntity();

      const entities = world.getEntitiesWithComponents(TransformComponent);

      expect(entities).toEqual([]);
    });

    it('should get entities with multiple components', () => {
      const entity1 = world.createEntity();
      const entity2 = world.createEntity();

      const transform1 = new TransformComponent();
      entity1.addComponent(TransformComponent, transform1);
      // entity2 has no TransformComponent

      const entities = world.getEntitiesWithComponents(TransformComponent);
      expect(entities.length).toBe(1);
      expect(entities[0]).toBe(entity1);
    });
  });

  describe('Cleanup', () => {
    it('should dispose all entities', () => {
      world.createEntity();
      world.createEntity();
      world.createEntity();

      expect(world.getEntities().length).toBe(3);

      world.dispose();

      expect(world.getEntities().length).toBe(0);
    });
  });
});

describe('TransformComponent', () => {
  let transform: TransformComponent;

  beforeEach(() => {
    transform = new TransformComponent();
  });

  describe('Initialization', () => {
    it('should have default position at origin', () => {
      expect(transform.position.x).toBe(0);
      expect(transform.position.y).toBe(0);
      expect(transform.position.z).toBe(0);
    });

    it('should have default rotation (Euler)', () => {
      expect(transform.rotation.x).toBe(0);
      expect(transform.rotation.y).toBe(0);
      expect(transform.rotation.z).toBe(0);
    });

    it('should have default scale (uniform)', () => {
      expect(transform.scale.x).toBe(1);
      expect(transform.scale.y).toBe(1);
      expect(transform.scale.z).toBe(1);
    });
  });

  describe('Position manipulation', () => {
    it('should set position', () => {
      transform.position.set(1, 2, 3);

      expect(transform.position.x).toBe(1);
      expect(transform.position.y).toBe(2);
      expect(transform.position.z).toBe(3);
    });

    it('should copy position from another vector', () => {
      const source = { x: 5, y: 6, z: 7 };
      transform.position.copy(source);

      expect(transform.position.x).toBe(5);
      expect(transform.position.y).toBe(6);
      expect(transform.position.z).toBe(7);
    });
  });

  describe('Rotation manipulation', () => {
    it('should set rotation', () => {
      transform.rotation.set(1, 2, 3);
      expect(transform.rotation.x).toBe(1);
      expect(transform.rotation.y).toBe(2);
      expect(transform.rotation.z).toBe(3);
    });

    it('should copy rotation from another Euler', () => {
      const other = new TransformComponent();
      other.rotation.set(0, 0, 0);

      transform.rotation.copy(other.rotation);

      expect(transform.rotation.x).toBe(0);
      expect(transform.rotation.y).toBe(0);
      expect(transform.rotation.z).toBe(0);
    });
  });

  describe('Scale manipulation', () => {
    it('should set scale', () => {
      transform.scale.set(2, 3, 4);

      expect(transform.scale.x).toBe(2);
      expect(transform.scale.y).toBe(3);
      expect(transform.scale.z).toBe(4);
    });
  });

  describe('Transform operations', () => {
    it('should copy from another transform', () => {
      const other = new TransformComponent();
      other.position.set(10, 20, 30);
      other.rotation.set(1, 2, 3);
      other.scale.set(2, 2, 2);

      transform.copy(other);

      expect(transform.position.x).toBe(10);
      expect(transform.position.y).toBe(20);
      expect(transform.position.z).toBe(30);
      expect(transform.rotation.x).toBe(1);
      expect(transform.rotation.y).toBe(2);
      expect(transform.rotation.z).toBe(3);
      expect(transform.scale.x).toBe(2);
      expect(transform.scale.y).toBe(2);
      expect(transform.scale.z).toBe(2);
    });

    it('should clone transform', () => {
      transform.position.set(5, 6, 7);
      transform.rotation.set(0, 1, 0);
      transform.scale.set(3, 3, 3);

      const cloned = transform.clone();

      expect(cloned).not.toBe(transform);
      expect(cloned.position.x).toBe(5);
      expect(cloned.position.y).toBe(6);
      expect(cloned.position.z).toBe(7);
      expect(cloned.rotation.x).toBe(0);
      expect(cloned.rotation.y).toBe(1);
      expect(cloned.rotation.z).toBe(0);
      expect(cloned.scale.x).toBe(3);
      expect(cloned.scale.y).toBe(3);
      expect(cloned.scale.z).toBe(3);
    });
  });

  describe('Edge cases', () => {
    it('should handle NaN values gracefully', () => {
      transform.position.set(NaN, NaN, NaN);

      // Should not throw
      expect(transform.position.x).toBeNaN();
    });

    it('should handle Infinity values', () => {
      transform.position.set(Infinity, -Infinity, 0);

      expect(transform.position.x).toBe(Infinity);
      expect(transform.position.y).toBe(-Infinity);
    });
  });
});

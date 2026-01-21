import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * EntityRenderer Component
 *
 * Renders an ECS entity in the 3D scene using React Three Fiber.
 */
import { useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import { TransformComponent, ModelComponent, AnimationComponent } from '../ecs/entity';
export function EntityRenderer({ entity }) {
    const groupRef = useRef(null);
    const meshRef = useRef(null);
    const transform = entity.getComponent(TransformComponent);
    const model = entity.getComponent(ModelComponent);
    const animation = entity.getComponent(AnimationComponent);
    // Load model if present
    useEffect(() => {
        if (model && !model.isLoaded && !model.isLoading) {
            model.load().catch((err) => {
                console.error('Failed to load model:', err);
            });
        }
    }, [model]);
    // Update transform
    useFrame(() => {
        if (groupRef.current && transform) {
            groupRef.current.position.copy(transform.position);
            groupRef.current.rotation.copy(transform.rotation);
            groupRef.current.scale.copy(transform.scale);
        }
        // Update animation
        if (animation) {
            animation.update(0.016); // Approximate deltaTime
        }
    });
    if (!transform)
        return null;
    return (_jsxs("group", { ref: groupRef, children: [model && model.isLoaded && model.gltf && model.gltf.scene && (_jsx("primitive", { object: model.cloneScene() })), !model && (_jsxs("mesh", { ref: meshRef, castShadow: true, receiveShadow: true, children: [_jsx("boxGeometry", { args: [1, 1, 1] }), _jsx("meshStandardMaterial", { color: "#4CAF50" })] }))] }));
}

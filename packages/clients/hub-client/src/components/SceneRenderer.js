import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * SceneRenderer Component
 *
 * Renders the entire ECS world as a 3D scene.
 */
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { EntityRenderer } from './EntityRenderer';
export function SceneRenderer({ world, camera = { position: [10, 10, 10], fov: 75 }, controls = true, environment = true, shadows = true, }) {
    const entities = world.getEntities();
    return (_jsxs(Canvas, { shadows: shadows, camera: { position: camera.position, fov: camera.fov }, gl: { antialias: true, alpha: true }, children: [environment && _jsx(Environment, { preset: "city" }), shadows && (_jsxs(_Fragment, { children: [_jsx(ContactShadows, { position: [0, 0, 0], opacity: 0.5, scale: 20, blur: 2, far: 4 }), _jsx("ambientLight", { intensity: 0.5 }), _jsx("directionalLight", { position: [10, 10, 5], intensity: 1, castShadow: true, "shadow-mapSize-width": 2048, "shadow-mapSize-height": 2048 })] })), _jsx(PerspectiveCamera, { makeDefault: true, position: camera.position, fov: camera.fov }), controls && _jsx(OrbitControls, { makeDefault: true }), entities.map((entity) => (_jsx(EntityRenderer, { entity: entity }, entity.id))), _jsxs("mesh", { rotation: [-Math.PI / 2, 0, 0], position: [0, 0, 0], receiveShadow: true, children: [_jsx("planeGeometry", { args: [50, 50] }), _jsx("meshStandardMaterial", { color: "#f0f0f0" })] }), _jsx("gridHelper", { args: [50, 50, 0x888888, 0xcccccc], position: [0, 0.01, 0] })] }));
}

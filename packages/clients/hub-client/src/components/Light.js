import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Light Component
 *
 * Renders various types of lights in the 3D scene.
 */
import { useRef, useEffect } from 'react';
import { Color } from 'three';
export function Light({ component }) {
    const lightRef = useRef(null);
    useEffect(() => {
        if (lightRef.current) {
            lightRef.current.intensity = component.intensity;
            lightRef.current.color = component.color;
            lightRef.current.castShadow = component.castShadow;
            if (lightRef.current.shadow) {
                lightRef.current.shadow.mapSize.width = component.shadowMapSize;
                lightRef.current.shadow.mapSize.height = component.shadowMapSize;
            }
        }
    }, [component]);
    switch (component.type) {
        case 'ambient':
            return _jsx("ambientLight", { ref: lightRef, intensity: component.intensity });
        case 'directional':
            return (_jsx("directionalLight", { ref: lightRef, position: [5, 5, 5], intensity: component.intensity, castShadow: component.castShadow, "shadow-mapSize-width": component.shadowMapSize, "shadow-mapSize-height": component.shadowMapSize }));
        case 'point':
            return (_jsx("pointLight", { ref: lightRef, intensity: component.intensity, distance: component.distance, decay: component.decay, castShadow: component.castShadow }));
        case 'spot':
            return (_jsx("spotLight", { ref: lightRef, position: [0, 10, 0], angle: component.angle, penumbra: component.penumbra, intensity: component.intensity, castShadow: component.castShadow }));
        case 'hemisphere':
            return (_jsx("hemisphereLight", { ref: lightRef, intensity: component.intensity, groundColor: new Color(0x444444) }));
        default:
            return null;
    }
}

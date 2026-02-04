/**
 * Light Component
 *
 * Renders various types of lights in the 3D scene.
 */

import { useRef, useEffect } from 'react';
import { Color } from 'three';
import type { Light as ThreeLight } from 'three';

import type { LightComponent } from '../ecs/entity';

interface LightProps {
  component: LightComponent;
}

export function Light({ component }: LightProps) {
  const lightRef = useRef<ThreeLight>(null);

  useEffect(() => {
    if (lightRef.current) {
      lightRef.current.intensity = component.intensity;
      (lightRef.current as any).color = component.color;
      lightRef.current.castShadow = component.castShadow;

      if ((lightRef.current as any).shadow) {
        (lightRef.current as any).shadow.mapSize.width = component.shadowMapSize;
        (lightRef.current as any).shadow.mapSize.height = component.shadowMapSize;
      }
    }
  }, [component]);

  switch (component.type) {
    case 'ambient':
      return <ambientLight ref={lightRef as any} intensity={component.intensity} />;

    case 'directional':
      return (
        <directionalLight
          ref={lightRef as any}
          position={[5, 5, 5]}
          intensity={component.intensity}
          castShadow={component.castShadow}
          shadow-mapSize-width={component.shadowMapSize}
          shadow-mapSize-height={component.shadowMapSize}
        />
      );

    case 'point':
      return (
        <pointLight
          ref={lightRef as any}
          intensity={component.intensity}
          distance={component.distance}
          decay={component.decay}
          castShadow={component.castShadow}
        />
      );

    case 'spot':
      return (
        <spotLight
          ref={lightRef as any}
          position={[0, 10, 0]}
          angle={component.angle}
          penumbra={component.penumbra}
          intensity={component.intensity}
          castShadow={component.castShadow}
        />
      );

    case 'hemisphere':
      return (
        <hemisphereLight
          ref={lightRef as any}
          intensity={component.intensity}
          groundColor={new Color(0x444444)}
        />
      );

    default:
      return null;
  }
}

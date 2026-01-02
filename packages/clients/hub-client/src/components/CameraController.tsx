import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

/**
 * CameraController - Smoothly follows player with orbit controls
 *
 * Features:
 * - Smooth camera following with lerp
 * - OrbitControls for user camera control
 * - Target follows player position
 * - Configurable follow distance and height
 */
interface CameraControllerProps {
  targetPosition: [number, number, number];
  targetRotation: number;
  enabled?: boolean;
}

export function CameraController({
  targetPosition,
  targetRotation,
  enabled = true
}: CameraControllerProps) {
  const controlsRef = useRef<any>();
  const cameraOffset = useRef<[number, number, number]>([0, 5, 8]); // Height, back distance
  const currentCameraPosition = useRef<[number, number, number]>([0, 5, 8]);

  const { camera } = useThree();

  // Update controls target to follow player smoothly
  useFrame(() => {
    if (!enabled || !controlsRef.current) return;

    // Smoothly update camera target (player position + offset for height)
    const targetWithHeight: [number, number, number] = [
      targetPosition[0],
      targetPosition[1] + 1, // Look at player center (1 unit high)
      targetPosition[2]
    ];

    // Update controls target
    controlsRef.current.target.lerp(
      { x: targetWithHeight[0], y: targetWithHeight[1], z: targetWithHeight[2] },
      0.1
    );

    // Calculate ideal camera position based on player rotation
    const angle = targetRotation;
    const idealX = targetPosition[0] - Math.sin(angle) * cameraOffset.current[2];
    const idealY = targetPosition[1] + cameraOffset.current[1];
    const idealZ = targetPosition[2] - Math.cos(angle) * cameraOffset.current[2];

    // Smoothly move camera towards ideal position (lerp)
    currentCameraPosition.current[0] += (idealX - currentCameraPosition.current[0]) * 0.05;
    currentCameraPosition.current[1] += (idealY - currentCameraPosition.current[1]) * 0.05;
    currentCameraPosition.current[2] += (idealZ - currentCameraPosition.current[2]) * 0.05;

    // Apply position to camera
    camera.position.set(
      currentCameraPosition.current[0],
      currentCameraPosition.current[1],
      currentCameraPosition.current[2]
    );

    // Update controls
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={3}
      maxDistance={20}
      maxPolarAngle={Math.PI / 2.1} // Don't go below ground
      minPolarAngle={0.1}
      enablePan={false}
      enableZoom={true}
      zoomSpeed={0.5}
      rotateSpeed={0.5}
    />
  );
}

/**
 * FPS Counter Component
 *
 * Displays real-time FPS (frames per second) as an overlay
 */

import { useState, useRef, useEffect } from 'react';

export function FPSCounter() {
  const [fps, setFps] = useState(0);
  const [frameTime, setFrameTime] = useState(0);
  const frames = useRef(0);
  const lastTime = useRef(performance.now());
  const lastUpdate = useRef(performance.now());

  useEffect(() => {
    let animationFrameId: number;

    const updateFPS = () => {
      const now = performance.now();
      frames.current++;

      // Update FPS every 500ms
      if (now - lastUpdate.current >= 500) {
        const delta = now - lastUpdate.current;
        const currentFps = Math.round((frames.current * 1000) / delta);
        const avgFrameTime = Math.round(delta / frames.current);

        setFps(currentFps);
        setFrameTime(avgFrameTime);

        frames.current = 0;
        lastUpdate.current = now;
      }

      lastTime.current = now;
      animationFrameId = requestAnimationFrame(updateFPS);
    };

    animationFrameId = requestAnimationFrame(updateFPS);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // Color coding based on FPS
  const fpsColor = fps >= 55 ? '#00ff00' : fps >= 30 ? '#ffff00' : '#ff0000';
  const fpsStatus = fps >= 55 ? 'Good' : fps >= 30 ? 'OK' : 'Poor';

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: '#fff',
        padding: '8px 12px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '14px',
        zIndex: 10000,
        pointerEvents: 'none',
        userSelect: 'none',
        minWidth: '120px',
      }}
    >
      <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>Performance</div>
      <div style={{ color: fpsColor }}>
        {fps} FPS <span style={{ color: '#888', fontSize: '12px' }}>({fpsStatus})</span>
      </div>
      <div style={{ color: '#aaa', fontSize: '12px' }}>
        {frameTime}ms/frame
      </div>
    </div>
  );
}

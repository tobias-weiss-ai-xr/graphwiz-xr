import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { InstancedMesh } from 'three';
import * as THREE from 'three';

/**
 * Audio Visualizer Component
 *
 * 3D audio frequency visualization using Web Audio API
 * Creates animated bars that respond to audio frequencies
 */

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | HTMLVideoElement | null;
  position?: [number, number, number];
  barCount?: number;
  barRadius?: number;
  barHeight?: number;
  color?: string;
}

export function AudioVisualizer({
  audioElement,
  position = [0, 0, 0],
  barCount = 32,
  barRadius = 2,
  barHeight = 2,
  color = '#6366f1',
}: AudioVisualizerProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | any>(null);
  const dummyRef = useRef<THREE.Object3D | null>(null);

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Web Audio API
  useEffect(() => {
    if (!audioElement || isInitialized) return;

    try {
      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;

      // Connect audio element to analyser
      const source = audioContext.createMediaElementSource(audioElement);
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      // Create data array for frequency data
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      setIsInitialized(true);

      console.log('[AudioVisualizer] Initialized with', barCount, 'bars');
    } catch (error) {
      console.error('[AudioVisualizer] Failed to initialize:', error);
    }

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [audioElement, isInitialized, barCount]);

  // Update visualization
  useFrame(() => {
    if (!meshRef.current || !analyserRef.current || !dataArrayRef.current) {
      return;
    }

    // Initialize dummy object if needed
    if (!dummyRef.current) {
      dummyRef.current = new THREE.Object3D();
    }

    // Get frequency data
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);

    const data = dataArrayRef.current;
    const step = Math.floor(data.length / barCount);

    // Update each bar
    for (let i = 0; i < barCount; i++) {
      const frequencyIndex = i * step;
      const frequencyValue = data[frequencyIndex] || 0;

      // Calculate bar properties
      const angle = (i / barCount) * Math.PI * 2;
      const normalizedHeight = (frequencyValue / 255) * barHeight;
      const actualHeight = Math.max(0.1, normalizedHeight);

      // Position bar in circle
      const x = Math.cos(angle) * barRadius;
      const z = Math.sin(angle) * barRadius;
      const y = actualHeight / 2;

      dummyRef.current.position.set(x, y, z);
      dummyRef.current.rotation.y = -angle;
      dummyRef.current.scale.set(0.15, actualHeight, 0.15);
      dummyRef.current.updateMatrix();

      meshRef.current.setMatrixAt(i, dummyRef.current.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!isInitialized) {
    return null;
  }

  return (
    <group position={position}>
      {/* Frequency bars */}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, barCount]}
        castShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.8}
        />
      </instancedMesh>

      {/* Center glow */}
      <pointLight
        position={[0, 0.5, 0]}
        color={color}
        intensity={1}
        distance={5}
      />
    </group>
  );
}

/**
 * Waveform Visualizer
 *
 * Linear waveform visualization for audio
 */
interface WaveformVisualizerProps {
  audioElement: HTMLAudioElement | HTMLVideoElement | null;
  position?: [number, number, number];
  length?: number;
  amplitude?: number;
  color?: string;
}

export function WaveformVisualizer({
  audioElement,
  position = [0, 0, 0],
  length = 64,
  amplitude = 1,
  color = '#10b981',
}: WaveformVisualizerProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | any>(null);
  const dummyRef = useRef<THREE.Object3D | null>(null);

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!audioElement || isInitialized) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;

      const source = audioContext.createMediaElementSource(audioElement);
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      // Use time domain data for waveform
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      setIsInitialized(true);

      console.log('[WaveformVisualizer] Initialized with', length, 'bars');
    } catch (error) {
      console.error('[WaveformVisualizer] Failed to initialize:', error);
    }

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [audioElement, isInitialized, length]);

  useFrame(() => {
    if (!meshRef.current || !analyserRef.current || !dataArrayRef.current) {
      return;
    }

    // Initialize dummy object if needed
    if (!dummyRef.current) {
      dummyRef.current = new THREE.Object3D();
    }

    // Get waveform data (time domain)
    analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

    const data = dataArrayRef.current;
    const step = Math.floor(data.length / length);

    for (let i = 0; i < length; i++) {
      const dataIndex = i * step;
      const value = (data[dataIndex] || 128) / 128.0 - 0.5; // Normalize to -0.5 to 0.5

      const x = (i / length) * 10 - 5;
      const y = value * amplitude;
      const z = 0;

      dummyRef.current.position.set(x, y, z);
      dummyRef.current.rotation.set(0, 0, 0);
      dummyRef.current.scale.set(0.08, 0.08, Math.abs(value) * amplitude + 0.1);
      dummyRef.current.updateMatrix();

      meshRef.current.setMatrixAt(i, dummyRef.current.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!isInitialized) {
    return null;
  }

  return (
    <group position={position}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, length]}>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.9}
        />
      </instancedMesh>

      {/* Ambient glow */}
      <ambientLight intensity={0.3} />
    </group>
  );
}

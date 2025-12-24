/**
 * Shared utility functions
 */

import type { Vector3, Quaternion } from './types';

/**
 * Create a zero vector
 */
export function vec3(x = 0, y = 0, z = 0): Vector3 {
  return { x, y, z };
}

/**
 * Create identity quaternion
 */
export function quat(x = 0, y = 0, z = 0, w = 1): Quaternion {
  return { x, y, z, w };
}

/**
 * Calculate distance between two vectors
 */
export function distance(a: Vector3, b: Vector3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Linear interpolation between two vectors
 */
export function lerpVector3(a: Vector3, b: Vector3, t: number): Vector3 {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  };
}

/**
 * Spherical linear interpolation for quaternions
 */
export function slerpQuaternion(qa: Quaternion, qb: Quaternion, t: number): Quaternion {
  // Calculate cosine of the angle between quaternions
  let cosHalfTheta = qa.x * qb.x + qa.y * qb.y + qa.z * qb.z + qa.w * qb.w;

  // If qa and qb are the same, return qa
  if (cosHalfTheta >= 1.0) {
    return qa;
  }

  // Calculate temporary values
  const halfTheta = Math.acos(cosHalfTheta);
  const sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);

  let ratioA: number;
  let ratioB: number;

  if (Math.abs(sinHalfTheta) < 0.001) {
    ratioA = 1.0 - t;
    ratioB = t;
  } else {
    ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
    ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
  }

  return {
    x: qa.x * ratioA + qb.x * ratioB,
    y: qa.y * ratioA + qb.y * ratioB,
    z: qa.z * ratioA + qb.z * ratioB,
    w: qa.w * ratioA + qb.w * ratioB,
  };
}

/**
 * Format timestamp to human-readable string
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toISOString();
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Map a value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

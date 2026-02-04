/**
 * Avatar Configurator UI Component
 *
 * Allows users to customize their avatar with live 3D preview
 */

import { OrbitControls, Environment } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useState, useEffect, useCallback } from 'react';

import type { AvatarConfig, BodyTypeEnum } from './api';
import { AvatarPreview } from './AvatarPreview';
import { getAvatarPersistence } from './persistence';

interface AvatarConfiguratorProps {
  userId: string;
  onClose: () => void;
  onSave?: (config: AvatarConfig) => void;
}

const BODY_TYPES: { value: BodyTypeEnum; label: string; icon: string }[] = [
  { value: 'human', label: 'Human', icon: '👤' },
  { value: 'robot', label: 'Robot', icon: '🤖' },
  { value: 'alien', label: 'Alien', icon: '👽' },
  { value: 'animal', label: 'Animal', icon: '🐾' },
  { value: 'abstract', label: 'Abstract', icon: '🎨' },
];

const PRESET_COLORS = [
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#FF5722', // Orange
  '#9C27B0', // Purple
  '#F44336', // Red
  '#FFEB3B', // Yellow
  '#00BCD4', // Cyan
  '#FF9800', // Amber
  '#E91E63', // Pink
  '#795548', // Brown
  '#607D8B', // Blue Grey
  '#8BC34A', // Light Green
  '#03A9F4', // Light Blue
  '#FFC107', // Amber
  '#009688', // Teal
];

export function AvatarConfigurator({ userId, onClose, onSave }: AvatarConfiguratorProps) {
  const persistence = getAvatarPersistence();
  const [config, setConfig] = useState<AvatarConfig>({
    user_id: userId,
    body_type: 'human',
    primary_color: '#4CAF50',
    secondary_color: '#2196F3',
    height: 1.7,
    metadata: {},
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load avatar on mount
  useEffect(() => {
    persistence.loadAvatar(userId).then((loadedConfig) => {
      setConfig(loadedConfig);
    }).catch((error) => {
      console.error('[AvatarConfigurator] Failed to load avatar:', error);
    });
  }, [userId, persistence]);

  // Handle save
  const handleSave = useCallback(async () => {
    setIsLoading(true);
    setSaveSuccess(false);

    try {
      const savedConfig = await persistence.saveAvatar(userId, config);
      setConfig(savedConfig);
      setHasChanges(false);
      setSaveSuccess(true);
      onSave?.(savedConfig);

      // Close after successful save (with delay to show success)
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('[AvatarConfigurator] Failed to save avatar:', error);
      alert('Failed to save avatar configuration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, config, persistence, onSave, onClose]);

  // Update config helper
  const updateConfig = useCallback((updates: Partial<AvatarConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
    setSaveSuccess(false);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (!hasChanges || confirm('You have unsaved changes. Are you sure you want to close?')) {
            onClose();
          }
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1000,
          maxHeight: '90vh',
          background: 'rgba(30, 30, 30, 0.98)',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Panel - 3D Preview */}
        <div
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            position: 'relative',
            minHeight: 500,
          }}
        >
          <Canvas shadows camera={{ position: [3, 2, 4], fov: 50 }}>
            <color attach="background" args={['#1a1a2e']} />

            <ambientLight intensity={0.5} />
            <directionalLight
              position={[5, 10, 5]}
              intensity={1}
              castShadow
              shadow-mapSize={[1024, 1024]}
            />
            <pointLight position={[-5, 5, -5]} intensity={0.5} />

            <AvatarPreview config={config} animate={true} />

            <OrbitControls
              enablePan={false}
              enableZoom={true}
              minDistance={2}
              maxDistance={8}
              maxPolarAngle={Math.PI / 2}
            />

            <Environment preset="sunset" />
          </Canvas>

          {/* Height Indicator */}
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              background: 'rgba(0,0,0,0.7)',
              padding: '10px 16px',
              borderRadius: 8,
              color: 'white',
              fontSize: 14,
            }}
          >
            Height: {config.height.toFixed(2)}m
          </div>
        </div>

        {/* Right Panel - Configuration */}
        <div
          style={{
            width: 450,
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '24px 24px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 'bold',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span>🎭</span>
              <span>Avatar Customizer</span>
            </h2>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
              Customize your avatar appearance
            </p>
          </div>

          {/* Configuration Options */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 28,
            }}
          >
            {/* Body Type Selection */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: 12,
                }}
              >
                Body Type
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: 10,
                }}
              >
                {BODY_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => updateConfig({ body_type: type.value })}
                    style={{
                      padding: '12px 8px',
                      borderRadius: 10,
                      border: `2px solid ${
                        config.body_type === type.value
                          ? '#4CAF50'
                          : 'rgba(255,255,255,0.1)'
                      }`,
                      background:
                        config.body_type === type.value
                          ? 'rgba(76, 175, 80, 0.2)'
                          : 'rgba(255,255,255,0.05)',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: 24,
                      display: 'flex',
                      flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (config.body_type !== type.value) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (config.body_type !== type.value) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    }
                  }}
                  >
                    <span>{type.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 'normal' }}>
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Color */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: 12,
                }}
              >
                Primary Color
              </label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="color"
                  value={config.primary_color}
                  onChange={(e) => updateConfig({ primary_color: e.target.value })}
                  style={{
                    width: 60,
                    height: 40,
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: 'transparent',
                  }}
                />
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(8, 1fr)',
                    gap: 6,
                    flex: 1,
                  }}
                >
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => updateConfig({ primary_color: color })}
                      style={{
                        width: '100%',
                        aspectRatio: 1,
                        borderRadius: 6,
                        border: `2px solid ${
                          config.primary_color === color ? '#4CAF50' : 'rgba(255,255,255,0.2)'
                        }`,
                        background: color,
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Secondary Color */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: 12,
                }}
              >
                Secondary Color
              </label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="color"
                  value={config.secondary_color}
                  onChange={(e) => updateConfig({ secondary_color: e.target.value })}
                  style={{
                    width: 60,
                    height: 40,
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: 'transparent',
                  }}
                />
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(8, 1fr)',
                    gap: 6,
                    flex: 1,
                  }}
                >
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => updateConfig({ secondary_color: color })}
                      style={{
                        width: '100%',
                        aspectRatio: 1,
                        borderRadius: 6,
                        border: `2px solid ${
                          config.secondary_color === color ? '#4CAF50' : 'rgba(255,255,255,0.2)'
                        }`,
                        background: color,
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Height Slider */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <label
                  style={{
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  Height
                </label>
                <span
                  style={{
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.7)',
                    fontFamily: 'monospace',
                  }}
                >
                  {config.height.toFixed(2)}m
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={3.0}
                step={0.01}
                value={config.height}
                onChange={(e) => updateConfig({ height: parseFloat(e.target.value) })}
                style={{
                  width: '100%',
                  cursor: 'pointer',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 8,
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                <span>0.5m</span>
                <span>1.7m (average)</span>
                <span>3.0m</span>
              </div>
            </div>
          </div>

          {/* Footer - Actions */}
          <div
            style={{
              padding: '24px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              gap: 12,
            }}
          >
            <button
              onClick={() => {
                if (!hasChanges || confirm('Discard unsaved changes?')) {
                  onClose();
                }
              }}
              style={{
                flex: 1,
                padding: '14px 24px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: 10,
                color: 'white',
                fontSize: 16,
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={!hasChanges || isLoading}
              style={{
                flex: 2,
                padding: '14px 24px',
                background: saveSuccess
                  ? '#4CAF50'
                  : hasChanges
                  ? '#4CAF50'
                  : 'rgba(76, 175, 80, 0.3)',
                border: 'none',
                borderRadius: 10,
                color: 'white',
                fontSize: 16,
                fontWeight: 'bold',
                cursor: hasChanges && !isLoading ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                opacity: isLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (hasChanges && !isLoading) {
                  e.currentTarget.style.background = '#45a049';
                }
              }}
              onMouseLeave={(e) => {
                if (!saveSuccess) {
                  e.currentTarget.style.background = hasChanges
                    ? '#4CAF50'
                    : 'rgba(76, 175, 80, 0.3)';
                }
              }}
            >
              {saveSuccess ? '✓ Saved!' : isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

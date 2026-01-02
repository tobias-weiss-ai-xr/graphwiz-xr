import { useState, useEffect } from 'react';
import { getSettingsManager } from './settings-persistence';
import type { UserSettings } from './user-settings';

interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const settingsManager = getSettingsManager();
  const [settings, setSettings] = useState<UserSettings>(settingsManager.getSettings());
  const [activeTab, setActiveTab] = useState<'audio' | 'graphics' | 'network' | 'account'>('audio');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const unsubscribe = settingsManager.subscribe((newSettings) => {
      setSettings(newSettings);
    });

    return unsubscribe;
  }, [settingsManager]);

  const handleUpdate = (updates: Partial<UserSettings>) => {
    setSettings((prev: UserSettings) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const handleSave = () => {
    settingsManager.update(settings);
    setHasChanges(false);
    onClose();
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      settingsManager.reset();
      setSettings(settingsManager.getSettings());
      setHasChanges(false);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 200,
        width: 500,
        maxHeight: 'calc(100vh - 32px)',
        background: 'rgba(30, 30, 30, 0.98)',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.3)',
      }}>
        <h2 style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 'bold',
          color: 'white',
        }}>
          ⚙️ Settings
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            fontSize: 24,
            padding: 0,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(0,0,0,0.2)',
      }}>
        {[
          { key: 'audio' as const, label: '🔊 Audio', icon: '🔊' },
          { key: 'graphics' as const, label: '🎨 Graphics', icon: '🎨' },
          { key: 'network' as const, label: '🌐 Network', icon: '🌐' },
          { key: 'account' as const, label: '👤 Account', icon: '👤' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: '14px 16px',
              background: activeTab === tab.key ? 'rgba(33, 150, 243, 0.3)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #2196F3' : 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: activeTab === tab.key ? 'bold' : 'normal',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 20,
      }}>
        {activeTab === 'audio' && <AudioSettings settings={settings} onUpdate={handleUpdate} />}
        {activeTab === 'graphics' && <GraphicsSettings settings={settings} onUpdate={handleUpdate} />}
        {activeTab === 'network' && <NetworkSettings settings={settings} onUpdate={handleUpdate} />}
        {activeTab === 'account' && <AccountSettings settings={settings} onUpdate={handleUpdate} />}
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.3)',
      }}>
        <button
          onClick={handleReset}
          style={{
            padding: '8px 16px',
            background: 'rgba(244, 67, 54, 0.8)',
            border: 'none',
            borderRadius: 6,
            color: 'white',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          Reset to Defaults
        </button>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: 6,
              color: 'white',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              background: hasChanges ? '#4CAF50' : 'rgba(76, 175, 80, 0.5)',
              border: 'none',
              borderRadius: 6,
              color: 'white',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 'bold',
            }}
            disabled={!hasChanges}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// Audio Settings Tab
function AudioSettings({
  settings,
  onUpdate
}: {
  settings: UserSettings;
  onUpdate: (updates: Partial<UserSettings>) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SettingSlider
        label="Master Volume"
        value={settings.masterVolume}
        min={0}
        max={1}
        step={0.01}
        onChange={(value) => onUpdate({ masterVolume: value })}
        format={(v) => `${Math.round(v * 100)}%`}
      />

      <SettingSlider
        label="Voice Chat Volume"
        value={settings.voiceChatVolume}
        min={0}
        max={1}
        step={0.01}
        onChange={(value) => onUpdate({ voiceChatVolume: value })}
        format={(v) => `${Math.round(v * 100)}%`}
      />

      <SettingSlider
        label="Microphone Sensitivity"
        value={settings.micSensitivity}
        min={0}
        max={1}
        step={0.01}
        onChange={(value) => onUpdate({ micSensitivity: value })}
        format={(v) => `${Math.round(v * 100)}%`}
      />

      <SettingToggle
        label="Microphone Enabled"
        value={settings.micEnabled}
        onChange={(value) => onUpdate({ micEnabled: value })}
      />

      <SettingToggle
        label="Push to Talk"
        value={settings.pushToTalkEnabled}
        onChange={(value) => onUpdate({ pushToTalkEnabled: value })}
      />

      {settings.pushToTalkEnabled && (
        <SettingInput
          label="Push to Talk Key"
          value={settings.pushToTalkKey}
          onChange={(value) => onUpdate({ pushToTalkKey: value })}
          placeholder="Space"
        />
      )}
    </div>
  );
}

// Graphics Settings Tab
function GraphicsSettings({
  settings,
  onUpdate
}: {
  settings: UserSettings;
  onUpdate: (updates: Partial<UserSettings>) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SettingSelect
        label="Graphics Quality"
        value={settings.graphicsQuality}
        options={[
          { value: 'low', label: 'Low (Best Performance)' },
          { value: 'medium', label: 'Medium (Balanced)' },
          { value: 'high', label: 'High (Best Quality)' },
        ]}
        onChange={(value) => onUpdate({ graphicsQuality: value as any })}
      />

      <SettingToggle
        label="Shadows"
        value={settings.shadowsEnabled}
        onChange={(value) => onUpdate({ shadowsEnabled: value })}
      />

      <SettingToggle
        label="Post Processing"
        value={settings.postProcessingEnabled}
        onChange={(value) => onUpdate({ postProcessingEnabled: value })}
      />

      <SettingToggle
        label="VSync"
        value={settings.vsyncEnabled}
        onChange={(value) => onUpdate({ vsyncEnabled: value })}
      />

      <SettingSlider
        label="Target FPS"
        value={settings.targetFPS}
        min={30}
        max={144}
        step={1}
        onChange={(value) => onUpdate({ targetFPS: value })}
        format={(v) => `${v} FPS`}
      />
    </div>
  );
}

// Network Settings Tab
function NetworkSettings({
  settings,
  onUpdate
}: {
  settings: UserSettings;
  onUpdate: (updates: Partial<UserSettings>) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SettingToggle
        label="Force Relay Server"
        value={settings.forceRelay}
        onChange={(value) => onUpdate({ forceRelay: value })}
        description="Always use relay server (slower but more reliable)"
      />

      <SettingSlider
        label="Max Bitrate"
        value={settings.maxBitrate}
        min={500}
        max={5000}
        step={100}
        onChange={(value) => onUpdate({ maxBitrate: value })}
        format={(v) => `${v} kbps`}
      />

      <SettingSelect
        label="Audio Codec"
        value={settings.audioCodec}
        options={[
          { value: 'opus', label: 'Opus (Best Quality)' },
          { value: 'pcmu', label: 'PCMU (Legacy)' },
          { value: 'pcma', label: 'PCMA (Legacy)' },
        ]}
        onChange={(value) => onUpdate({ audioCodec: value as any })}
      />
    </div>
  );
}

// Account Settings Tab
function AccountSettings({
  settings,
  onUpdate
}: {
  settings: UserSettings;
  onUpdate: (updates: Partial<UserSettings>) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SettingInput
        label="Display Name"
        value={settings.displayName}
        onChange={(value) => onUpdate({ displayName: value })}
        placeholder="Player"
      />

      <SettingInput
        label="Status Message"
        value={settings.statusMessage}
        onChange={(value) => onUpdate({ statusMessage: value })}
        placeholder="What's on your mind?"
        multiline
      />

      <SettingToggle
        label="Share Presence"
        value={settings.sharePresence}
        onChange={(value) => onUpdate({ sharePresence: value })}
        description="Allow others to see when you're online"
      />

      <SettingToggle
        label="Share Position"
        value={settings.sharePosition}
        onChange={(value) => onUpdate({ sharePosition: value })}
        description="Allow others to see your position in the room"
      />
    </div>
  );
}

// Helper Components
function SettingSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}) {
  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 8,
      }}>
        <label style={{ color: 'white', fontSize: 14 }}>{label}</label>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%',
          cursor: 'pointer',
        }}
      />
    </div>
  );
}

function SettingToggle({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  description?: string;
}) {
  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ flex: 1 }}>
          <label style={{ color: 'white', fontSize: 14 }}>{label}</label>
          {description && (
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 }}>
              {description}
            </div>
          )}
        </div>
        <button
          onClick={() => onChange(!value)}
          style={{
            width: 50,
            height: 26,
            borderRadius: 13,
            background: value ? '#4CAF50' : 'rgba(255,255,255,0.2)',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            transition: 'background 0.2s',
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'white',
              position: 'absolute',
              top: 2,
              left: value ? 26 : 2,
              transition: 'left 0.2s',
            }}
          />
        </button>
      </div>
    </div>
  );
}

function SettingSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label style={{ color: 'white', fontSize: 14, display: 'block', marginBottom: 8 }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(0,0,0,0.3)',
          color: 'white',
          fontSize: 14,
          cursor: 'pointer',
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SettingInput({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <label style={{ color: 'white', fontSize: 14, display: 'block', marginBottom: 8 }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(0,0,0,0.3)',
            color: 'white',
            fontSize: 14,
            resize: 'vertical',
          }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(0,0,0,0.3)',
            color: 'white',
            fontSize: 14,
          }}
        />
      )}
    </div>
  );
}

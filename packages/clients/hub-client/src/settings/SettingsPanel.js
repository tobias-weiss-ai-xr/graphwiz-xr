import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { getSettingsManager } from './settings-persistence';
export function SettingsPanel({ onClose }) {
    const settingsManager = getSettingsManager();
    const [settings, setSettings] = useState(settingsManager.getSettings());
    const [activeTab, setActiveTab] = useState('audio');
    const [hasChanges, setHasChanges] = useState(false);
    useEffect(() => {
        const unsubscribe = settingsManager.subscribe((newSettings) => {
            setSettings(newSettings);
        });
        return unsubscribe;
    }, [settingsManager]);
    const handleUpdate = (updates) => {
        setSettings((prev) => ({ ...prev, ...updates }));
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
    return (_jsxs("div", { style: {
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
        }, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { style: {
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(0,0,0,0.3)',
                }, children: [_jsx("h2", { style: {
                            margin: 0,
                            fontSize: 18,
                            fontWeight: 'bold',
                            color: 'white',
                        }, children: "\u2699\uFE0F Settings" }), _jsx("button", { onClick: onClose, style: {
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255,255,255,0.6)',
                            cursor: 'pointer',
                            fontSize: 24,
                            padding: 0,
                            lineHeight: 1,
                        }, children: "\u00D7" })] }), _jsx("div", { style: {
                    display: 'flex',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(0,0,0,0.2)',
                }, children: [
                    { key: 'audio', label: '🔊 Audio', icon: '🔊' },
                    { key: 'graphics', label: '🎨 Graphics', icon: '🎨' },
                    { key: 'network', label: '🌐 Network', icon: '🌐' },
                    { key: 'account', label: '👤 Account', icon: '👤' },
                ].map((tab) => (_jsx("button", { onClick: () => setActiveTab(tab.key), style: {
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
                    }, children: tab.label }, tab.key))) }), _jsxs("div", { style: {
                    flex: 1,
                    overflowY: 'auto',
                    padding: 20,
                }, children: [activeTab === 'audio' && _jsx(AudioSettings, { settings: settings, onUpdate: handleUpdate }), activeTab === 'graphics' && _jsx(GraphicsSettings, { settings: settings, onUpdate: handleUpdate }), activeTab === 'network' && _jsx(NetworkSettings, { settings: settings, onUpdate: handleUpdate }), activeTab === 'account' && _jsx(AccountSettings, { settings: settings, onUpdate: handleUpdate })] }), _jsxs("div", { style: {
                    padding: '16px 20px',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(0,0,0,0.3)',
                }, children: [_jsx("button", { onClick: handleReset, style: {
                            padding: '8px 16px',
                            background: 'rgba(244, 67, 54, 0.8)',
                            border: 'none',
                            borderRadius: 6,
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: 13,
                        }, children: "Reset to Defaults" }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("button", { onClick: onClose, style: {
                                    padding: '10px 20px',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    borderRadius: 6,
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: 14,
                                }, children: "Cancel" }), _jsx("button", { onClick: handleSave, style: {
                                    padding: '10px 20px',
                                    background: hasChanges ? '#4CAF50' : 'rgba(76, 175, 80, 0.5)',
                                    border: 'none',
                                    borderRadius: 6,
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                }, disabled: !hasChanges, children: "Save Changes" })] })] })] }));
}
// Audio Settings Tab
function AudioSettings({ settings, onUpdate }) {
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 20 }, children: [_jsx(SettingSlider, { label: "Master Volume", value: settings.masterVolume, min: 0, max: 1, step: 0.01, onChange: (value) => onUpdate({ masterVolume: value }), format: (v) => `${Math.round(v * 100)}%` }), _jsx(SettingSlider, { label: "Voice Chat Volume", value: settings.voiceChatVolume, min: 0, max: 1, step: 0.01, onChange: (value) => onUpdate({ voiceChatVolume: value }), format: (v) => `${Math.round(v * 100)}%` }), _jsx(SettingSlider, { label: "Microphone Sensitivity", value: settings.micSensitivity, min: 0, max: 1, step: 0.01, onChange: (value) => onUpdate({ micSensitivity: value }), format: (v) => `${Math.round(v * 100)}%` }), _jsx(SettingToggle, { label: "Microphone Enabled", value: settings.micEnabled, onChange: (value) => onUpdate({ micEnabled: value }) }), _jsx(SettingToggle, { label: "Push to Talk", value: settings.pushToTalkEnabled, onChange: (value) => onUpdate({ pushToTalkEnabled: value }) }), settings.pushToTalkEnabled && (_jsx(SettingInput, { label: "Push to Talk Key", value: settings.pushToTalkKey, onChange: (value) => onUpdate({ pushToTalkKey: value }), placeholder: "Space" }))] }));
}
// Graphics Settings Tab
function GraphicsSettings({ settings, onUpdate }) {
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 20 }, children: [_jsx(SettingSelect, { label: "Graphics Quality", value: settings.graphicsQuality, options: [
                    { value: 'low', label: 'Low (Best Performance)' },
                    { value: 'medium', label: 'Medium (Balanced)' },
                    { value: 'high', label: 'High (Best Quality)' },
                ], onChange: (value) => onUpdate({ graphicsQuality: value }) }), _jsx(SettingToggle, { label: "Shadows", value: settings.shadowsEnabled, onChange: (value) => onUpdate({ shadowsEnabled: value }) }), _jsx(SettingToggle, { label: "Post Processing", value: settings.postProcessingEnabled, onChange: (value) => onUpdate({ postProcessingEnabled: value }) }), _jsx(SettingToggle, { label: "VSync", value: settings.vsyncEnabled, onChange: (value) => onUpdate({ vsyncEnabled: value }) }), _jsx(SettingSlider, { label: "Target FPS", value: settings.targetFPS, min: 30, max: 144, step: 1, onChange: (value) => onUpdate({ targetFPS: value }), format: (v) => `${v} FPS` })] }));
}
// Network Settings Tab
function NetworkSettings({ settings, onUpdate }) {
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 20 }, children: [_jsx(SettingToggle, { label: "Force Relay Server", value: settings.forceRelay, onChange: (value) => onUpdate({ forceRelay: value }), description: "Always use relay server (slower but more reliable)" }), _jsx(SettingSlider, { label: "Max Bitrate", value: settings.maxBitrate, min: 500, max: 5000, step: 100, onChange: (value) => onUpdate({ maxBitrate: value }), format: (v) => `${v} kbps` }), _jsx(SettingSelect, { label: "Audio Codec", value: settings.audioCodec, options: [
                    { value: 'opus', label: 'Opus (Best Quality)' },
                    { value: 'pcmu', label: 'PCMU (Legacy)' },
                    { value: 'pcma', label: 'PCMA (Legacy)' },
                ], onChange: (value) => onUpdate({ audioCodec: value }) })] }));
}
// Account Settings Tab
function AccountSettings({ settings, onUpdate }) {
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 20 }, children: [_jsx(SettingInput, { label: "Display Name", value: settings.displayName, onChange: (value) => onUpdate({ displayName: value }), placeholder: "Player" }), _jsx(SettingInput, { label: "Status Message", value: settings.statusMessage, onChange: (value) => onUpdate({ statusMessage: value }), placeholder: "What's on your mind?", multiline: true }), _jsx(SettingToggle, { label: "Share Presence", value: settings.sharePresence, onChange: (value) => onUpdate({ sharePresence: value }), description: "Allow others to see when you're online" }), _jsx(SettingToggle, { label: "Share Position", value: settings.sharePosition, onChange: (value) => onUpdate({ sharePosition: value }), description: "Allow others to see your position in the room" })] }));
}
// Helper Components
function SettingSlider({ label, value, min, max, step, onChange, format, }) {
    return (_jsxs("div", { children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                }, children: [_jsx("label", { style: { color: 'white', fontSize: 14 }, children: label }), _jsx("span", { style: { color: 'rgba(255,255,255,0.7)', fontSize: 13 }, children: format ? format(value) : value })] }), _jsx("input", { type: "range", min: min, max: max, step: step, value: value, onChange: (e) => onChange(parseFloat(e.target.value)), style: {
                    width: '100%',
                    cursor: 'pointer',
                } })] }));
}
function SettingToggle({ label, value, onChange, description, }) {
    return (_jsx("div", { children: _jsxs("div", { style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("label", { style: { color: 'white', fontSize: 14 }, children: label }), description && (_jsx("div", { style: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 }, children: description }))] }), _jsx("button", { onClick: () => onChange(!value), style: {
                        width: 50,
                        height: 26,
                        borderRadius: 13,
                        background: value ? '#4CAF50' : 'rgba(255,255,255,0.2)',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background 0.2s',
                    }, children: _jsx("div", { style: {
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: 'white',
                            position: 'absolute',
                            top: 2,
                            left: value ? 26 : 2,
                            transition: 'left 0.2s',
                        } }) })] }) }));
}
function SettingSelect({ label, value, options, onChange, }) {
    return (_jsxs("div", { children: [_jsx("label", { style: { color: 'white', fontSize: 14, display: 'block', marginBottom: 8 }, children: label }), _jsx("select", { value: value, onChange: (e) => onChange(e.target.value), style: {
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(0,0,0,0.3)',
                    color: 'white',
                    fontSize: 14,
                    cursor: 'pointer',
                }, children: options.map((opt) => (_jsx("option", { value: opt.value, children: opt.label }, opt.value))) })] }));
}
function SettingInput({ label, value, onChange, placeholder, multiline = false, }) {
    return (_jsxs("div", { children: [_jsx("label", { style: { color: 'white', fontSize: 14, display: 'block', marginBottom: 8 }, children: label }), multiline ? (_jsx("textarea", { value: value, onChange: (e) => onChange(e.target.value), placeholder: placeholder, rows: 3, style: {
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(0,0,0,0.3)',
                    color: 'white',
                    fontSize: 14,
                    resize: 'vertical',
                } })) : (_jsx("input", { type: "text", value: value, onChange: (e) => onChange(e.target.value), placeholder: placeholder, style: {
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(0,0,0,0.3)',
                    color: 'white',
                    fontSize: 14,
                } }))] }));
}

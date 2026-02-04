import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function MediaControls({ mediaState, onPlayPause, onSeek, onVolumeChange, onPlaybackRateChange, onLoopToggle, position = { x: 0, y: 0 }, visible = true, }) {
    // Handle seek bar interaction
    const handleSeekStart = () => {
        // Seek interaction started
    };
    const handleSeekEnd = () => {
        // Seek interaction ended
    };
    if (!visible) {
        return null;
    }
    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    const handleSeekChange = (e) => {
        const seekTime = (parseFloat(e.target.value) / 100) * mediaState.duration;
        onSeek(seekTime);
    };
    // Handle volume change
    const handleVolumeChange = (e) => {
        const volume = parseFloat(e.target.value);
        onVolumeChange(volume);
    };
    // Handle playback rate change
    const handleRateChange = (e) => {
        const rate = parseFloat(e.target.value);
        onPlaybackRateChange(rate);
    };
    const progress = mediaState.duration > 0 ? (mediaState.currentTime / mediaState.duration) * 100 : 0;
    return (_jsxs("div", { className: "media-controls", style: {
            position: 'absolute',
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0, 0, 0, 0.85)',
            padding: '16px',
            borderRadius: '12px',
            color: 'white',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            minWidth: '320px',
            maxWidth: '400px',
            zIndex: 1000,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        }, children: [_jsx("div", { style: {
                    display: 'inline-block',
                    padding: '4px 8px',
                    background: mediaState.type === 'video' ? '#6366f1' : '#10b981',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                }, children: mediaState.type }), _jsx("div", { style: {
                    fontSize: '12px',
                    opacity: 0.7,
                    marginBottom: '12px',
                    wordBreak: 'break-all',
                }, children: mediaState.url }), _jsxs("div", { style: { marginBottom: '12px' }, children: [_jsx("input", { type: "range", min: "0", max: "100", value: progress, onChange: handleSeekChange, onMouseDown: handleSeekStart, onMouseUp: handleSeekEnd, onTouchStart: handleSeekStart, onTouchEnd: handleSeekEnd, style: {
                            width: '100%',
                            height: '6px',
                            borderRadius: '3px',
                            background: '#374151',
                            outline: 'none',
                            cursor: 'pointer',
                        } }), _jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '12px',
                            marginTop: '4px',
                            opacity: 0.8,
                        }, children: [_jsx("span", { children: formatTime(mediaState.currentTime) }), _jsx("span", { children: formatTime(mediaState.duration) })] })] }), _jsxs("div", { style: {
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    marginBottom: '12px',
                }, children: [_jsx("button", { onClick: onPlayPause, style: {
                            flex: 1,
                            padding: '10px 16px',
                            background: '#6366f1',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }, onMouseEnter: (e) => e.currentTarget.style.background = '#4f46e5', onMouseLeave: (e) => e.currentTarget.style.background = '#6366f1', children: mediaState.isPlaying ? '⏸ Pause' : '▶ Play' }), _jsx("button", { onClick: onLoopToggle, style: {
                            padding: '10px 16px',
                            background: mediaState.loop ? '#10b981' : '#374151',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }, title: mediaState.loop ? 'Looping' : 'Not looping', children: "\uD83D\uDD01" })] }), _jsxs("div", { style: { marginBottom: '12px' }, children: [_jsxs("label", { style: {
                            display: 'block',
                            fontSize: '12px',
                            marginBottom: '6px',
                            opacity: 0.8,
                        }, children: ["Volume: ", Math.round(mediaState.volume * 100), "%"] }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.01", value: mediaState.volume, onChange: handleVolumeChange, style: {
                            width: '100%',
                            height: '4px',
                            borderRadius: '2px',
                            background: '#374151',
                            outline: 'none',
                            cursor: 'pointer',
                        } })] }), _jsxs("div", { children: [_jsxs("label", { style: {
                            display: 'block',
                            fontSize: '12px',
                            marginBottom: '6px',
                            opacity: 0.8,
                        }, children: ["Speed: ", mediaState.playbackRate, "x"] }), _jsxs("select", { value: mediaState.playbackRate, onChange: handleRateChange, style: {
                            width: '100%',
                            padding: '8px',
                            background: '#374151',
                            border: 'none',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '13px',
                            cursor: 'pointer',
                        }, children: [_jsx("option", { value: 0.25, children: "0.25x" }), _jsx("option", { value: 0.5, children: "0.5x" }), _jsx("option", { value: 0.75, children: "0.75x" }), _jsx("option", { value: 1, children: "1x (Normal)" }), _jsx("option", { value: 1.25, children: "1.25x" }), _jsx("option", { value: 1.5, children: "1.5x" }), _jsx("option", { value: 2, children: "2x" })] })] }), _jsx("div", { style: {
                    marginTop: '12px',
                    padding: '8px',
                    background: mediaState.isPlaying ? 'rgba(16, 185, 129, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                    borderRadius: '6px',
                    fontSize: '11px',
                    textAlign: 'center',
                    color: mediaState.isPlaying ? '#10b981' : '#9ca3af',
                }, children: mediaState.isPlaying ? '● Playing' : '○ Paused' })] }));
}

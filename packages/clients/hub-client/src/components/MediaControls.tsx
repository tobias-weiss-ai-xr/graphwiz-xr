import { MediaState } from './MediaPlayer';

/**
 * Media Controls UI Component
 *
 * HTML overlay controls for media playback
 * Shows when media player is hovered or clicked
 */

interface MediaControlsProps {
  mediaState: MediaState;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onPlaybackRateChange: (rate: number) => void;
  onLoopToggle: () => void;
  position?: { x: number; y: number };
  visible?: boolean;
}

export function MediaControls({
  mediaState,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onPlaybackRateChange,
  onLoopToggle,
  position = { x: 0, y: 0 },
  visible = true,
}: MediaControlsProps) {
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
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = (parseFloat(e.target.value) / 100) * mediaState.duration;
    onSeek(seekTime);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    onVolumeChange(volume);
  };

  // Handle playback rate change
  const handleRateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rate = parseFloat(e.target.value);
    onPlaybackRateChange(rate);
  };

  const progress = mediaState.duration > 0 ? (mediaState.currentTime / mediaState.duration) * 100 : 0;

  return (
    <div
      className="media-controls"
      style={{
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
      }}
    >
      {/* Media Type Badge */}
      <div
        style={{
          display: 'inline-block',
          padding: '4px 8px',
          background: mediaState.type === 'video' ? '#6366f1' : '#10b981',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}
      >
        {mediaState.type}
      </div>

      {/* Media URL */}
      <div
        style={{
          fontSize: '12px',
          opacity: 0.7,
          marginBottom: '12px',
          wordBreak: 'break-all',
        }}
      >
        {mediaState.url}
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '12px' }}>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeekChange}
          onMouseDown={handleSeekStart}
          onMouseUp={handleSeekEnd}
          onTouchStart={handleSeekStart}
          onTouchEnd={handleSeekEnd}
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            background: '#374151',
            outline: 'none',
            cursor: 'pointer',
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            marginTop: '4px',
            opacity: 0.8,
          }}
        >
          <span>{formatTime(mediaState.currentTime)}</span>
          <span>{formatTime(mediaState.duration)}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        {/* Play/Pause Button */}
        <button
          onClick={onPlayPause}
          style={{
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
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#4f46e5'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#6366f1'}
        >
          {mediaState.isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

        {/* Loop Toggle */}
        <button
          onClick={onLoopToggle}
          style={{
            padding: '10px 16px',
            background: mediaState.loop ? '#10b981' : '#374151',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title={mediaState.loop ? 'Looping' : 'Not looping'}
        >
          🔁
        </button>
      </div>

      {/* Volume Control */}
      <div style={{ marginBottom: '12px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            marginBottom: '6px',
            opacity: 0.8,
          }}
        >
          Volume: {Math.round(mediaState.volume * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={mediaState.volume}
          onChange={handleVolumeChange}
          style={{
            width: '100%',
            height: '4px',
            borderRadius: '2px',
            background: '#374151',
            outline: 'none',
            cursor: 'pointer',
          }}
        />
      </div>

      {/* Playback Rate */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            marginBottom: '6px',
            opacity: 0.8,
          }}
        >
          Speed: {mediaState.playbackRate}x
        </label>
        <select
          value={mediaState.playbackRate}
          onChange={handleRateChange}
          style={{
            width: '100%',
            padding: '8px',
            background: '#374151',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          <option value={0.25}>0.25x</option>
          <option value={0.5}>0.5x</option>
          <option value={0.75}>0.75x</option>
          <option value={1}>1x (Normal)</option>
          <option value={1.25}>1.25x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2x</option>
        </select>
      </div>

      {/* Status Indicator */}
      <div
        style={{
          marginTop: '12px',
          padding: '8px',
          background: mediaState.isPlaying ? 'rgba(16, 185, 129, 0.2)' : 'rgba(107, 114, 128, 0.2)',
          borderRadius: '6px',
          fontSize: '11px',
          textAlign: 'center',
          color: mediaState.isPlaying ? '#10b981' : '#9ca3af',
        }}
      >
        {mediaState.isPlaying ? '● Playing' : '○ Paused'}
      </div>
    </div>
  );
}

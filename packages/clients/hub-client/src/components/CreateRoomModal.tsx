import { useState } from 'react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (roomData: { name: string; maxParticipants: number; isPrivate: boolean }) => void;
}

export function CreateRoomModal({ isOpen, onClose, onCreateRoom }: CreateRoomModalProps) {
  const [roomName, setRoomName] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [isPrivate, setIsPrivate] = useState(false);

  if (!isOpen) return null;

  const handleCreate = () => {
    if (roomName.trim()) {
      onCreateRoom({
        name: roomName.trim(),
        maxParticipants,
        isPrivate
      });
      setRoomName('');
      setMaxParticipants(10);
      setIsPrivate(false);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 200,
        width: 400,
        background: 'rgba(0, 0, 0, 0.95)',
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
      }}
    >
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h2 style={{ margin: 0, color: 'white', fontSize: 20 }}>Create Room</h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: 24
          }}
        >
          ×
        </button>
      </div>

      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={{ display: 'block', color: 'white', fontSize: 14, marginBottom: 8 }}>
            Room Name
          </label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter room name..."
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: 14,
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: 'white', fontSize: 14, marginBottom: 8 }}>
            Max Participants: {maxParticipants}
          </label>
          <input
            type="range"
            min="2"
            max="50"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            style={{ width: 18, height: 18 }}
          />
          <label style={{ color: 'white', fontSize: 14, cursor: 'pointer' }}>Private Room</label>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: 12,
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: 6,
              color: 'white',
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!roomName.trim()}
            style={{
              flex: 1,
              padding: 12,
              background: roomName.trim() ? 'rgba(76, 175, 80, 0.8)' : 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: 6,
              color: 'white',
              cursor: roomName.trim() ? 'pointer' : 'not-allowed',
              fontSize: 14,
              fontWeight: 'bold'
            }}
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
}

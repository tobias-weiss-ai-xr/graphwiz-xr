import { useState } from 'react';

interface RoomBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinRoom: (roomId: string) => void;
  onCreateRoom: () => void;
  currentUserId?: string;
  storageVisible?: boolean;
}

interface Room {
  id: string;
  name: string;
  participantCount: number;
  maxParticipants: number;
  isPrivate: boolean;
}

export function RoomBrowser({
  isOpen,
  onClose,
  onJoinRoom,
  onCreateRoom,
  currentUserId: _currentUserId
}: RoomBrowserProps): JSX.Element | null {
  const [rooms] = useState<Room[]>([
    { id: 'lobby', name: 'Main Lobby', participantCount: 5, maxParticipants: 20, isPrivate: false },
    {
      id: 'hangout-1',
      name: 'Chill Zone',
      participantCount: 3,
      maxParticipants: 8,
      isPrivate: false
    },
    { id: 'game-1', name: 'Game Room', participantCount: 7, maxParticipants: 10, isPrivate: false }
  ]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 200,
        width: 600,
        maxHeight: '70vh',
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
        <h2 style={{ margin: 0, color: 'white', fontSize: 20 }}>Browse Rooms</h2>
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

      <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={onCreateRoom}
            style={{
              width: '100%',
              padding: 16,
              background: 'rgba(76, 175, 80, 0.8)',
              border: 'none',
              borderRadius: 8,
              color: 'white',
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            + Create New Room
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rooms.map((room) => (
            <div
              key={room.id}
              style={{
                padding: 20,
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => onJoinRoom(room.id)}
            >
              <div style={{ flex: 1 }}>
                <div style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
                  {room.name}
                  {room.isPrivate && <span style={{ marginLeft: 8, fontSize: 12 }}>🔒</span>}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                  {room.participantCount}/{room.maxParticipants} players
                </div>
              </div>
              <button
                style={{
                  marginTop: -4,
                  padding: '8px 16px',
                  background: 'rgba(33, 150, 243, 0.8)',
                  border: 'none',
                  borderRadius: 6,
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                Join
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

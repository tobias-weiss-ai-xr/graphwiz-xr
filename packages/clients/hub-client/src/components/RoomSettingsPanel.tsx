import type { RoomSettings as RoomSettingsType, Participant } from '../hooks/useRoomManager';

interface RoomSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  roomSettings: RoomSettingsType;
  participants: Participant[];
  currentUserId: string;
  onLeaveRoom: () => void;
  onKickParticipant: (participantId: string) => void;
  onMuteParticipant: (participantId: string) => void;
  onToggleHost: (participantId: string) => void;
}

export function RoomSettingsPanel({
  isOpen,
  onClose,
  roomSettings,
  participants,
  currentUserId,
  onLeaveRoom,
  onKickParticipant,
  onMuteParticipant,
  onToggleHost
}: RoomSettingsPanelProps) {
  const isHost = roomSettings.hostId === currentUserId;

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 200,
        width: 500,
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
        <h2 style={{ margin: 0, color: 'white', fontSize: 20 }}>Room Settings</h2>
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

      <div style={{ padding: 24, overflowY: 'auto' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
            {roomSettings.name}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
            {roomSettings.isPrivate && '🔒 '}Created{' '}
            {new Date(roomSettings.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 12px 0', color: 'white', fontSize: 14 }}>
            Participants ({participants.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {participants.map((participant) => (
              <div
                key={participant.id}
                style={{
                  padding: 12,
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 6,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ color: 'white', fontSize: 14 }}>
                    {participant.displayName}
                    {participant.isHost && <span style={{ marginLeft: 8, fontSize: 12 }}>👑</span>}
                  </div>
                  {participant.isMuted && <span style={{ fontSize: 12 }}>🔇</span>}
                </div>
                {isHost && participant.id !== currentUserId && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => onMuteParticipant(participant.id)}
                      style={{
                        padding: '4px 8px',
                        background: participant.isMuted
                          ? 'rgba(255,152,0,0.6)'
                          : 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: 4,
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: 12
                      }}
                    >
                      {participant.isMuted ? 'Unmute' : 'Mute'}
                    </button>
                    <button
                      onClick={() => onKickParticipant(participant.id)}
                      style={{
                        padding: '4px 8px',
                        background: 'rgba(244, 67, 54, 0.6)',
                        border: 'none',
                        borderRadius: 4,
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: 12
                      }}
                    >
                      Kick
                    </button>
                    <button
                      onClick={() => onToggleHost(participant.id)}
                      style={{
                        padding: '4px 8px',
                        background: 'rgba(156, 39, 176, 0.6)',
                        border: 'none',
                        borderRadius: 4,
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: 12
                      }}
                    >
                      Host
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onLeaveRoom}
          style={{
            width: '100%',
            padding: 12,
            background: 'rgba(244, 67, 54, 0.8)',
            border: 'none',
            borderRadius: 6,
            color: 'white',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 'bold'
          }}
        >
          Leave Room
        </button>
      </div>
    </div>
  );
}

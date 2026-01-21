import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function RoomSettingsPanel({ isOpen, onClose, roomSettings, participants, currentUserId, onLeaveRoom, onKickParticipant, onMuteParticipant, onToggleHost }) {
    const isHost = roomSettings.hostId === currentUserId;
    if (!isOpen)
        return null;
    return (_jsxs("div", { style: {
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
        }, children: [_jsxs("div", { style: {
                    padding: '20px 24px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }, children: [_jsx("h2", { style: { margin: 0, color: 'white', fontSize: 20 }, children: "Room Settings" }), _jsx("button", { onClick: onClose, style: {
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: 24
                        }, children: "\u00D7" })] }), _jsxs("div", { style: { padding: 24, overflowY: 'auto' }, children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("div", { style: { color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 4 }, children: roomSettings.name }), _jsxs("div", { style: { color: 'rgba(255,255,255,0.6)', fontSize: 12 }, children: [roomSettings.isPrivate && '🔒 ', "Created", ' ', new Date(roomSettings.createdAt).toLocaleDateString()] })] }), _jsxs("div", { style: { marginBottom: 24 }, children: [_jsxs("h3", { style: { margin: '0 0 12px 0', color: 'white', fontSize: 14 }, children: ["Participants (", participants.length, ")"] }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: participants.map((participant) => (_jsxs("div", { style: {
                                        padding: 12,
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: 6,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsxs("div", { style: { color: 'white', fontSize: 14 }, children: [participant.displayName, participant.isHost && _jsx("span", { style: { marginLeft: 8, fontSize: 12 }, children: "\uD83D\uDC51" })] }), participant.isMuted && _jsx("span", { style: { fontSize: 12 }, children: "\uD83D\uDD07" })] }), isHost && participant.id !== currentUserId && (_jsxs("div", { style: { display: 'flex', gap: 4 }, children: [_jsx("button", { onClick: () => onMuteParticipant(participant.id), style: {
                                                        padding: '4px 8px',
                                                        background: participant.isMuted
                                                            ? 'rgba(255,152,0,0.6)'
                                                            : 'rgba(255,255,255,0.1)',
                                                        border: 'none',
                                                        borderRadius: 4,
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        fontSize: 12
                                                    }, children: participant.isMuted ? 'Unmute' : 'Mute' }), _jsx("button", { onClick: () => onKickParticipant(participant.id), style: {
                                                        padding: '4px 8px',
                                                        background: 'rgba(244, 67, 54, 0.6)',
                                                        border: 'none',
                                                        borderRadius: 4,
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        fontSize: 12
                                                    }, children: "Kick" }), _jsx("button", { onClick: () => onToggleHost(participant.id), style: {
                                                        padding: '4px 8px',
                                                        background: 'rgba(156, 39, 176, 0.6)',
                                                        border: 'none',
                                                        borderRadius: 4,
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        fontSize: 12
                                                    }, children: "Host" })] }))] }, participant.id))) })] }), _jsx("button", { onClick: onLeaveRoom, style: {
                            width: '100%',
                            padding: 12,
                            background: 'rgba(244, 67, 54, 0.8)',
                            border: 'none',
                            borderRadius: 6,
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: 14,
                            fontWeight: 'bold'
                        }, children: "Leave Room" })] })] }));
}

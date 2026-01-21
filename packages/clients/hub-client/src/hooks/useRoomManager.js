import { useState, useCallback } from 'react';
export function useRoomManager(client) {
    const [currentRoomId, setCurrentRoomId] = useState(undefined);
    const [showBrowser, setShowBrowser] = useState(false);
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [roomSettings, setRoomSettings] = useState(null);
    const [participants, setParticipants] = useState([]);
    const handleJoinRoom = useCallback((roomId) => {
        if (client) {
            client.sendChatMessage(`Joining room: ${roomId}`);
            setCurrentRoomId(roomId);
            setShowBrowser(false);
            setRoomSettings({
                id: roomId,
                name: `Room ${roomId}`,
                maxParticipants: 10,
                isPrivate: false,
                createdAt: new Date().toISOString(),
                hostId: client.getClientId() || ''
            });
        }
    }, [client]);
    const handleCreateRoom = useCallback((roomData) => {
        if (client) {
            const roomId = `room-${Date.now()}`;
            client.sendChatMessage(`Creating room: ${roomData.name}`);
            setCurrentRoomId(roomId);
            setShowCreateRoom(false);
            setRoomSettings({
                id: roomId,
                name: roomData.name,
                maxParticipants: roomData.maxParticipants || 10,
                isPrivate: roomData.isPrivate || false,
                createdAt: new Date().toISOString(),
                hostId: client.getClientId() || ''
            });
        }
    }, [client]);
    const handleLeaveRoom = useCallback(() => {
        if (client) {
            client.sendChatMessage('Leaving room');
            setCurrentRoomId(undefined);
            setRoomSettings(null);
            setParticipants([]);
        }
    }, [client]);
    const handleKickParticipant = useCallback((participantId) => {
        console.log('Kick participant:', participantId);
        setParticipants((prev) => prev.filter((p) => p.id !== participantId));
    }, []);
    const handleMuteParticipant = useCallback((participantId) => {
        console.log('Mute participant:', participantId);
        setParticipants((prev) => prev.map((p) => (p.id === participantId ? { ...p, isMuted: !p.isMuted } : p)));
    }, []);
    const handleToggleHost = useCallback((participantId) => {
        console.log('Toggle host:', participantId);
        if (roomSettings) {
            setRoomSettings({ ...roomSettings, hostId: participantId });
            setParticipants((prev) => prev.map((p) => ({
                ...p,
                isHost: p.id === participantId
            })));
        }
    }, [roomSettings]);
    return {
        currentRoomId,
        showBrowser,
        showCreateRoom,
        showSettings,
        roomSettings,
        participants,
        setShowBrowser,
        setShowCreateRoom,
        setShowSettings,
        handleJoinRoom,
        handleCreateRoom,
        handleLeaveRoom,
        handleKickParticipant,
        handleMuteParticipant,
        handleToggleHost
    };
}

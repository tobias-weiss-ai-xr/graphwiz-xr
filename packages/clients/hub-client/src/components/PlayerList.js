import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { ModerationClient } from '../moderation-client';
export default function PlayerList({ players, currentClientId, isCurrentUserHost, roomId, presenceUrl, onPlayerKicked, onPlayerMuted }) {
    const [moderationClient, setModerationClient] = useState(null);
    const [kickingPlayerId, setKickingPlayerId] = useState(null);
    const [mutingPlayerId, setMutingPlayerId] = useState(null);
    const [kickedPlayerIds, setKickedPlayerIds] = useState(new Set());
    const [mutedPlayerIds, setMutedPlayerIds] = useState(new Set());
    // Initialize moderation client
    useEffect(() => {
        const client = new ModerationClient(presenceUrl);
        setModerationClient(client);
    }, [presenceUrl]);
    const handleKick = async (player) => {
        if (!isCurrentUserHost) {
            alert('Only the host can kick players');
            return;
        }
        if (player.isHost) {
            alert('Cannot kick the host');
            return;
        }
        if (!currentClientId) {
            alert('Not connected to room');
            return;
        }
        const reason = prompt(`Kick ${player.displayName} from room? (Optional reason)`) || '';
        if (reason !== null) {
            setKickingPlayerId(player.clientId);
            if (moderationClient) {
                const result = await moderationClient.kickPlayer({
                    roomId,
                    targetClientId: player.clientId,
                    kickedByClientId: currentClientId,
                    reason: reason || undefined
                });
                setKickingPlayerId(null);
                if (result.success) {
                    // Add to kicked list
                    setKickedPlayerIds(new Set([...kickedPlayerIds, player.clientId]));
                    // Notify parent component
                    onPlayerKicked?.(player.clientId);
                    alert(`${player.displayName} has been kicked from the room`);
                }
                else {
                    alert(`Failed to kick ${player.displayName}: ${result.message}`);
                }
            }
        }
    };
    const handleMute = async (player) => {
        if (!isCurrentUserHost) {
            alert('Only the host can mute players');
            return;
        }
        if (player.isHost) {
            alert('Cannot mute the host');
            return;
        }
        if (!currentClientId) {
            alert('Not connected to room');
            return;
        }
        const isCurrentlyMuted = mutedPlayerIds.has(player.clientId);
        const action = isCurrentlyMuted ? 'unmute' : 'mute';
        if (!confirm(`Are you sure you want to ${action} ${player.displayName}?`)) {
            return;
        }
        setMutingPlayerId(player.clientId);
        if (moderationClient) {
            const result = await moderationClient.mutePlayer({
                roomId,
                targetClientId: player.clientId,
                muted: !isCurrentlyMuted,
                reason: `${action}d by host`
            });
            setMutingPlayerId(null);
            if (result.success) {
                // Toggle muted state
                const newMutedIds = new Set(mutedPlayerIds);
                if (isCurrentlyMuted) {
                    newMutedIds.delete(player.clientId);
                }
                else {
                    newMutedIds.add(player.clientId);
                }
                setMutedPlayerIds(newMutedIds);
                // Notify parent component
                onPlayerMuted?.(player.clientId, !isCurrentlyMuted);
                alert(`${player.displayName} has been ${action}d`);
            }
            else {
                alert(`Failed to ${action} ${player.displayName}: ${result.message}`);
            }
        }
    };
    // Filter out kicked players
    const visiblePlayers = players.filter((p) => !kickedPlayerIds.has(p.clientId));
    return (_jsxs("div", { className: "player-list-container", children: [_jsxs("div", { className: "player-list-header", children: [_jsxs("h3", { className: "player-list-title", children: ["Players (", visiblePlayers.length, ")"] }), isCurrentUserHost && _jsx("span", { className: "host-badge", children: "You are Host" })] }), _jsx("div", { className: "player-list", children: visiblePlayers.length === 0 ? (_jsx("div", { className: "no-players", children: "No other players in the room" })) : (visiblePlayers.map((player) => {
                    const isKicking = kickingPlayerId === player.clientId;
                    const isMuting = mutingPlayerId === player.clientId;
                    const isMuted = mutedPlayerIds.has(player.clientId);
                    const isCurrentUser = player.clientId === currentClientId;
                    return (_jsxs("div", { className: `player-item ${isCurrentUser ? 'current-player' : ''} ${isMuted ? 'muted' : ''}`, children: [_jsxs("div", { className: "player-info", children: [_jsx("div", { className: "player-avatar", children: _jsx("span", { className: "player-avatar-text", children: player.displayName.charAt(0).toUpperCase() }) }), _jsxs("div", { className: "player-details", children: [_jsxs("div", { className: "player-name", children: [player.displayName, player.isHost && _jsx("span", { className: "host-tag", children: "Host" }), isCurrentUser && _jsx("span", { className: "you-tag", children: "You" })] }), _jsxs("div", { className: "player-id", children: ["ID: ", player.clientId.slice(0, 8), "..."] })] })] }), isCurrentUserHost && !isCurrentUser && !player.isHost && (_jsxs("div", { className: "player-actions", children: [_jsx("button", { onClick: () => handleMute(player), disabled: isMuting || isKicking, className: `mute-button ${isMuted ? 'muted' : ''}`, title: isMuted ? 'Unmute player' : 'Mute player', children: isMuting ? (_jsx("span", { className: "loading-spinner" })) : isMuted ? (_jsx("span", { className: "mute-icon", children: "\uD83D\uDD0A" })) : (_jsx("span", { className: "mute-icon", children: "\uD83D\uDD07" })) }), _jsx("button", { onClick: () => handleKick(player), disabled: isKicking, className: "kick-button", title: "Kick player", children: isKicking ? (_jsx("span", { className: "loading-spinner" })) : (_jsx("span", { className: "kick-icon", children: "\uD83D\uDEAA" })) })] }))] }, player.clientId));
                })) }), _jsx("style", { children: `
        .player-list-container {
          position: fixed;
          top: 16px;
          right: 16px;
          width: 320px;
          max-height: calc(100vh - 32px);
          background: rgba(17, 24, 39, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 1000;
        }

        .player-list-header {
          padding: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .player-list-title {
          color: #ffffff;
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }

        .host-badge {
          background: #f59e0b;
          color: #ffffff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .player-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }

        .player-list::-webkit-scrollbar {
          width: 6px;
        }

        .player-list::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }

        .player-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        .player-list::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .no-players {
          text-align: center;
          padding: 32px 16px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }

        .player-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          margin-bottom: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .player-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .player-item.current-player {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .player-item.muted {
          opacity: 0.6;
        }

        .player-info {
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 0;
        }

        .player-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          flex-shrink: 0;
        }

        .player-avatar-text {
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
        }

        .player-details {
          flex: 1;
          min-width: 0;
        }

        .player-name {
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .host-tag {
          background: #f59e0b;
          color: #ffffff;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 600;
        }

        .you-tag {
          background: #10b981;
          color: #ffffff;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 600;
        }

        .player-id {
          color: rgba(255, 255, 255, 0.5);
          font-size: 11px;
          margin-top: 2px;
        }

        .player-actions {
          display: flex;
          gap: 6px;
          margin-left: 12px;
        }

        .mute-button,
        .kick-button {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 16px;
        }

        .mute-button {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .mute-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
        }

        .mute-button.muted {
          background: rgba(239, 68, 68, 0.3);
        }

        .kick-button {
          background: rgba(255, 152, 0, 0.1);
          color: #ffffff;
        }

        .kick-button:hover:not(:disabled) {
          background: rgba(255, 152, 0, 0.2);
        }

        .mute-button:disabled,
        .kick-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .mute-icon,
        .kick-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      ` })] }));
}

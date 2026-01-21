import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { ModerationClient } from '../moderation-client';
import PlayerList from './PlayerList';
export default function ModerationPanel({ roomId, presenceUrl, currentClientId, isCurrentUserHost, players, onRoomLocked, onPlayerKicked, onPlayerMuted }) {
    const [isLocked, setIsLocked] = useState(false);
    const [showPlayerList, setShowPlayerList] = useState(true);
    const [locking, setLocking] = useState(false);
    // Create moderation client instance (recreated when presenceUrl changes)
    const moderationClient = new ModerationClient(presenceUrl);
    const handleToggleLock = async () => {
        if (!isCurrentUserHost) {
            alert('Only the host can lock/unlock the room');
            return;
        }
        if (!currentClientId) {
            alert('Not connected to room');
            return;
        }
        const newState = !isLocked;
        const action = newState ? 'lock' : 'unlock';
        if (!confirm(`Are you sure you want to ${action} the room?`)) {
            return;
        }
        setLocking(true);
        if (moderationClient) {
            const reason = prompt(`Reason for ${action}ing room? (Optional)`) || `${action}ed by host`;
            const result = await moderationClient.lockRoom({
                roomId,
                locked: newState,
                lockedByClientId: currentClientId,
                reason
            });
            setLocking(false);
            if (result.success) {
                setIsLocked(newState);
                onRoomLocked?.(newState);
                alert(`Room has been ${action}ed`);
            }
            else {
                alert(`Failed to ${action} room: ${result.message}`);
            }
        }
    };
    const handlePlayerKicked = (playerId) => {
        onPlayerKicked?.(playerId);
    };
    const handlePlayerMuted = (playerId, muted) => {
        onPlayerMuted?.(playerId, muted);
    };
    return (_jsxs("div", { className: "moderation-panel", children: [_jsxs("div", { className: "moderation-header", children: [_jsxs("div", { className: "moderation-title", children: [_jsx("span", { className: "moderation-icon", children: "\uD83D\uDEE1\uFE0F" }), _jsx("span", { className: "moderation-text", children: "Moderation" })] }), _jsxs("div", { className: "moderation-actions", children: [isCurrentUserHost && (_jsx("button", { onClick: handleToggleLock, disabled: locking, className: `lock-button ${isLocked ? 'locked' : ''}`, title: isLocked ? 'Unlock room' : 'Lock room', children: locking ? (_jsx("span", { className: "loading-spinner" })) : (_jsxs(_Fragment, { children: [_jsx("span", { className: "lock-icon", children: isLocked ? '🔓' : '🔒' }), _jsx("span", { className: "lock-text", children: isLocked ? 'Locked' : 'Lock' })] })) })), _jsxs("button", { onClick: () => setShowPlayerList(!showPlayerList), className: "toggle-button", title: showPlayerList ? 'Hide player list' : 'Show player list', children: [_jsx("span", { className: "toggle-icon", children: showPlayerList ? '👁️' : '👥' }), _jsxs("span", { className: "toggle-text", children: ["Players (", players.length, ")"] })] })] })] }), isLocked && (_jsxs("div", { className: "locked-banner", children: [_jsx("span", { className: "locked-icon-large", children: "\uD83D\uDD12" }), _jsxs("span", { className: "locked-text", children: ["This room is currently ", _jsx("strong", { children: "locked" }), ". Only the host can unlock it."] })] })), showPlayerList && (_jsx(PlayerList, { players: players, currentClientId: currentClientId, isCurrentUserHost: isCurrentUserHost, roomId: roomId, presenceUrl: presenceUrl, onPlayerKicked: handlePlayerKicked, onPlayerMuted: handlePlayerMuted })), _jsx("style", { children: `
        .moderation-panel {
          position: fixed;
          top: 16px;
          right: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 1001;
        }

        .moderation-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(17, 24, 39, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 12px 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        }

        .moderation-title {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
        }

        .moderation-icon {
          font-size: 20px;
        }

        .moderation-text {
          font-size: 15px;
        }

        .moderation-actions {
          display: flex;
          gap: 8px;
        }

        .lock-button,
        .toggle-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .lock-button {
          background: rgba(59, 130, 246, 0.8);
          color: #ffffff;
        }

        .lock-button:hover:not(:disabled) {
          background: rgba(59, 130, 246, 1);
        }

        .lock-button.locked {
          background: rgba(239, 68, 68, 0.8);
        }

        .lock-button.locked:hover:not(:disabled) {
          background: rgba(239, 68, 68, 1);
        }

        .lock-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .toggle-button {
          background: rgba(16, 185, 129, 0.8);
          color: #ffffff;
        }

        .toggle-button:hover {
          background: rgba(16, 185, 129, 1);
        }

        .lock-icon,
        .toggle-icon {
          font-size: 14px;
        }

        .lock-text,
        .toggle-text {
          font-size: 12px;
        }

        .locked-banner {
          background: rgba(239, 68, 68, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 12px 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          gap: 12px;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .locked-icon-large {
          font-size: 24px;
          flex-shrink: 0;
        }

        .locked-text {
          color: #ffffff;
          font-size: 14px;
          line-height: 1.4;
        }

        .locked-text strong {
          color: #fca5a5;
        }

        .loading-spinner {
          width: 12px;
          height: 12px;
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
      ` })] }));
}

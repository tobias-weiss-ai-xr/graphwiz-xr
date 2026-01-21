import { jsx as _jsx } from "react/jsx-runtime";
export function RoomButton({ currentRoomId, onOpenBrowser, onOpenSettings, onLeaveRoom, storageVisible }) {
    // Hide button when storage panel is open
    if (storageVisible !== undefined && storageVisible) {
        return null;
    }
    return (_jsx("button", { onClick: currentRoomId ? onOpenSettings : onOpenBrowser, style: {
            position: 'absolute',
            bottom: 16,
            right: 16,
            zIndex: 105,
            padding: '12px 16px',
            background: currentRoomId ? 'rgba(76, 175, 80, 0.8)' : 'rgba(33, 150, 243, 0.8)',
            border: 'none',
            borderRadius: 8,
            color: 'white',
            cursor: 'pointer',
            fontFamily: 'sans-serif'
        }, children: currentRoomId ? (_jsx("span", { onClick: (e) => {
                e.stopPropagation();
                onLeaveRoom();
            }, children: "Leave Room" })) : ('🚪 Join Room') }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
const COMMON_EMOJIS = [
    '😀', '😂', '😍', '🥳', '😎', '🤔', '😮', '🥺',
    '👍', '👎', '👏', '🙌', '💪', '🎉', '❤️', '🔥',
    '✨', '🌟', '💯', '🚀', '💡', '🎯', '🏆', '👑',
    '😱', '🤯', '😭', '🤣', '😇', '🥲', '😈', '👻',
];
export function EmojiPicker({ onSelect, onClose }) {
    const [filter, setFilter] = useState('');
    const filteredEmojis = filter
        ? COMMON_EMOJIS.filter(e => e.includes(filter))
        : COMMON_EMOJIS;
    return (_jsxs("div", { style: {
            position: 'absolute',
            bottom: 320,
            left: 16,
            zIndex: 200,
            background: 'rgba(30, 30, 30, 0.95)',
            borderRadius: 12,
            padding: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.1)',
            minWidth: 320,
            maxWidth: 400,
        }, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                }, children: [_jsx("span", { style: {
                            color: 'white',
                            fontSize: 16,
                            fontWeight: 'bold',
                        }, children: "Emoji Reactions" }), _jsx("button", { onClick: onClose, style: {
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255,255,255,0.6)',
                            cursor: 'pointer',
                            fontSize: 24,
                            padding: 0,
                            lineHeight: 1,
                        }, children: "\u00D7" })] }), _jsx("input", { type: "text", placeholder: "Search emojis...", value: filter, onChange: (e) => setFilter(e.target.value), style: {
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(0,0,0,0.3)',
                    color: 'white',
                    fontSize: 14,
                    marginBottom: 12,
                    boxSizing: 'border-box',
                } }), _jsx("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(8, 1fr)',
                    gap: 6,
                    maxHeight: 200,
                    overflowY: 'auto',
                    padding: 4,
                }, children: filteredEmojis.map((emoji) => (_jsx("button", { onClick: () => onSelect(emoji), style: {
                        fontSize: 28,
                        padding: 8,
                        borderRadius: 8,
                        border: '1px solid transparent',
                        background: 'rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }, onMouseEnter: (e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                        e.currentTarget.style.transform = 'scale(1.1)';
                    }, onMouseLeave: (e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.transform = 'scale(1)';
                    }, children: emoji }, emoji))) }), filteredEmojis.length === 0 && (_jsx("div", { style: {
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: 14,
                    textAlign: 'center',
                    padding: 20,
                }, children: "No emojis found" }))] }));
}

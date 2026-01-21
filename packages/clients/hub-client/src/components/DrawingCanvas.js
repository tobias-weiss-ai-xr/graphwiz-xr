import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
export const DrawingCanvas = forwardRef(({ width = 1024, height = 1024, settings, onClear, onExport }, ref) => {
    const canvasRef = useRef(null);
    const textureRef = useRef(null);
    const isDrawingRef = useRef(false);
    const lastPositionRef = useRef(null);
    const pointsRef = useRef([]);
    const drawingHistoryRef = useRef([]);
    const [drawingHistory, setDrawingHistory] = useState([]);
    // Initialize canvas
    useEffect(() => {
        if (!canvasRef.current)
            return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        // Set canvas size
        canvas.width = width;
        canvas.height = height;
        // Set initial context
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = settings.color;
        ctx.strokeStyle = settings.color;
        ctx.lineWidth = settings.brushSize;
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.NearestFilter;
        textureRef.current = texture;
        return () => {
            // Cleanup
            if (textureRef.current) {
                textureRef.current.dispose();
            }
            textureRef.current = null;
        };
    }, [width, height]);
    // Helper functions (not memoized to avoid circular dependencies)
    const saveToHistory = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setDrawingHistory((prev) => {
            const newHistory = [...prev, imageData];
            drawingHistoryRef.current = newHistory;
            return newHistory;
        });
    }, []);
    const restoreFromHistory = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        // Clear and restore each saved state
        const history = drawingHistoryRef.current;
        history.forEach((savedData, index) => {
            if (index < history.length - 1) {
                ctx.putImageData(savedData, 0, 0);
            }
        });
    }, []);
    // Handle pointer events for drawing
    const handlePointerDown = useCallback((e) => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        isDrawingRef.current = true;
        lastPositionRef.current = { x, y };
        pointsRef.current = [{ x, y }];
    }, []);
    const handlePointerMove = (e) => {
        const canvas = canvasRef.current;
        if (!canvas || !isDrawingRef.current)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (settings.mode === 'brush' || settings.mode === 'eraser') {
            // Draw brush stroke
            ctx.beginPath();
            ctx.globalCompositeOperation =
                settings.mode === 'eraser' ? 'destination-out' : 'source-over';
            ctx.lineWidth = settings.brushSize;
            ctx.fillStyle = settings.color;
            ctx.strokeStyle = settings.color;
            ctx.arc(x, y, settings.brushSize / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        else if (settings.mode === 'line') {
            // Draw line
            if (lastPositionRef.current && pointsRef.current.length > 1) {
                ctx.beginPath();
                ctx.moveTo(lastPositionRef.current.x, lastPositionRef.current.y);
                ctx.lineTo(x, y);
                ctx.stroke();
            }
        }
        else if (settings.mode === 'rectangle') {
            // Draw rectangle preview
            if (lastPositionRef.current) {
                const w = x - lastPositionRef.current.x;
                const h = y - lastPositionRef.current.y;
                // Clear canvas (except for drawing history)
                ctx.clearRect(0, 0, width, height);
                // Restore drawing history
                restoreFromHistory();
                // Draw rectangle
                ctx.fillStyle = settings.color;
                ctx.fillRect(lastPositionRef.current.x, lastPositionRef.current.y, w, h);
            }
        }
        else if (settings.mode === 'circle') {
            // Draw circle preview
            if (lastPositionRef.current) {
                const radius = Math.sqrt(Math.pow(x - lastPositionRef.current.x, 2) + Math.pow(y - lastPositionRef.current.y, 2));
                // Clear canvas (except for drawing history)
                ctx.clearRect(0, 0, width, height);
                // Restore drawing history
                restoreFromHistory();
                // Draw circle
                ctx.beginPath();
                ctx.arc(lastPositionRef.current.x, lastPositionRef.current.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = settings.color;
                ctx.fill();
            }
        }
        pointsRef.current = [...pointsRef.current, { x, y }];
        lastPositionRef.current = { x, y };
        // Update texture
        if (textureRef.current) {
            textureRef.current.needsUpdate = true;
        }
    };
    const handlePointerUp = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        // Save drawing history
        saveToHistory();
        isDrawingRef.current = false;
        pointsRef.current = [];
        lastPositionRef.current = null;
        // Update texture
        if (textureRef.current) {
            textureRef.current.needsUpdate = true;
        }
    }, [saveToHistory]);
    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        ctx.clearRect(0, 0, width, height);
        setDrawingHistory([]);
        drawingHistoryRef.current = [];
        onClear();
        // Update texture
        if (textureRef.current) {
            textureRef.current.needsUpdate = true;
        }
    }, [width, height, onClear]);
    const exportCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const dataUrl = canvas.toDataURL('image/png');
        onExport(dataUrl);
    }, [onExport]);
    const undo = useCallback(() => {
        if (drawingHistory.length > 1) {
            const canvas = canvasRef.current;
            if (!canvas)
                return;
            const ctx = canvas.getContext('2d');
            if (!ctx)
                return;
            // Remove current state and restore previous
            const previousState = drawingHistory[drawingHistory.length - 2];
            setDrawingHistory((prev) => {
                const newHistory = prev.slice(0, -1);
                drawingHistoryRef.current = newHistory;
                return newHistory;
            });
            // Restore previous state
            if (previousState) {
                ctx.putImageData(previousState, 0, 0);
            }
            // Update texture
            if (textureRef.current) {
                textureRef.current.needsUpdate = true;
            }
        }
    }, [drawingHistory]);
    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        clear: clearCanvas,
        export: exportCanvas,
        undo
    }));
    return (_jsxs("group", { children: [_jsxs("mesh", { children: [_jsx("planeGeometry", { args: [width, height] }), textureRef.current && (_jsx("meshBasicMaterial", { map: textureRef.current, transparent: true, side: THREE.DoubleSide }))] }), _jsx("canvas", { ref: canvasRef, style: {
                    position: 'absolute',
                    left: '-9999px',
                    top: '-9999px',
                    visibility: 'hidden'
                }, width: width, height: height, onPointerDown: handlePointerDown, onPointerMove: handlePointerMove, onPointerUp: handlePointerUp })] }));
});
DrawingCanvas.displayName = 'DrawingCanvas';

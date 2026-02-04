import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
export function MediaPlayer({ position, rotation = [0, 0, 0], scale = [1, 1, 1], mediaState, onStateChange, width = 4, height = 2.25, isHovered = false, onHover }) {
    const meshRef = useRef(null);
    const videoRef = useRef(null);
    const audioRef = useRef(null);
    const textureRef = useRef(null);
    const { camera, raycaster, pointer } = useThree();
    const [isInitialized, setIsInitialized] = useState(false);
    const lastSyncTime = useRef(0);
    // Initialize media element
    useEffect(() => {
        if (isInitialized)
            return;
        if (mediaState.type === 'video') {
            // Create video element
            const video = document.createElement('video');
            video.src = mediaState.url;
            video.crossOrigin = 'anonymous';
            video.playsInline = true;
            video.loop = mediaState.loop;
            video.volume = mediaState.volume;
            video.playbackRate = mediaState.playbackRate;
            video.addEventListener('loadedmetadata', () => {
                onStateChange({
                    duration: video.duration,
                });
            });
            video.addEventListener('timeupdate', () => {
                // Sync time periodically (every 500ms) to avoid excessive network traffic
                const now = Date.now();
                if (now - lastSyncTime.current > 500 && mediaState.isPlaying) {
                    lastSyncTime.current = now;
                    onStateChange({
                        currentTime: video.currentTime,
                    });
                }
            });
            video.addEventListener('ended', () => {
                if (!mediaState.loop) {
                    onStateChange({
                        isPlaying: false,
                    });
                }
            });
            videoRef.current = video;
            // Create video texture
            const texture = new THREE.VideoTexture(video);
            texture.colorSpace = THREE.SRGBColorSpace;
            textureRef.current = texture;
            setIsInitialized(true);
            console.log('[MediaPlayer] Video initialized:', mediaState.url);
        }
        else if (mediaState.type === 'audio') {
            // Create audio element
            const audio = document.createElement('audio');
            audio.src = mediaState.url;
            audio.crossOrigin = 'anonymous';
            audio.loop = mediaState.loop;
            audio.volume = mediaState.volume;
            audio.playbackRate = mediaState.playbackRate;
            audio.addEventListener('loadedmetadata', () => {
                onStateChange({
                    duration: audio.duration,
                });
            });
            audio.addEventListener('timeupdate', () => {
                const now = Date.now();
                if (now - lastSyncTime.current > 500 && mediaState.isPlaying) {
                    lastSyncTime.current = now;
                    onStateChange({
                        currentTime: audio.currentTime,
                    });
                }
            });
            audio.addEventListener('ended', () => {
                if (!mediaState.loop) {
                    onStateChange({
                        isPlaying: false,
                    });
                }
            });
            audioRef.current = audio;
            setIsInitialized(true);
            console.log('[MediaPlayer] Audio initialized:', mediaState.url);
        }
        return () => {
            // Cleanup
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.src = '';
                videoRef.current = null;
            }
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
                audioRef.current = null;
            }
            if (textureRef.current) {
                textureRef.current.dispose();
                textureRef.current = null;
            }
        };
    }, [isInitialized, mediaState.type, mediaState.url, mediaState.loop, mediaState.volume, mediaState.playbackRate, onStateChange]);
    // Sync play/pause state
    useEffect(() => {
        if (!isInitialized)
            return;
        const mediaElement = mediaState.type === 'video' ? videoRef.current : audioRef.current;
        if (!mediaElement)
            return;
        if (mediaState.isPlaying) {
            mediaElement.play().catch(err => {
                console.error('[MediaPlayer] Failed to play:', err);
            });
        }
        else {
            mediaElement.pause();
        }
    }, [mediaState.isPlaying, isInitialized, mediaState.type]);
    // Sync seek position
    useEffect(() => {
        if (!isInitialized)
            return;
        const mediaElement = mediaState.type === 'video' ? videoRef.current : audioRef.current;
        if (!mediaElement)
            return;
        const timeDiff = Math.abs(mediaElement.currentTime - mediaState.currentTime);
        // Only seek if difference is significant (> 0.5s) to avoid jitter
        if (timeDiff > 0.5) {
            mediaElement.currentTime = mediaState.currentTime;
        }
    }, [mediaState.currentTime, isInitialized, mediaState.type]);
    // Sync volume
    useEffect(() => {
        if (!isInitialized)
            return;
        const mediaElement = mediaState.type === 'video' ? videoRef.current : audioRef.current;
        if (!mediaElement)
            return;
        mediaElement.volume = mediaState.volume;
    }, [mediaState.volume, isInitialized, mediaState.type]);
    // Sync playback rate
    useEffect(() => {
        if (!isInitialized)
            return;
        const mediaElement = mediaState.type === 'video' ? videoRef.current : audioRef.current;
        if (!mediaElement)
            return;
        mediaElement.playbackRate = mediaState.playbackRate;
    }, [mediaState.playbackRate, isInitialized, mediaState.type]);
    // Sync loop setting
    useEffect(() => {
        if (!isInitialized)
            return;
        const mediaElement = mediaState.type === 'video' ? videoRef.current : audioRef.current;
        if (!mediaElement)
            return;
        mediaElement.loop = mediaState.loop;
    }, [mediaState.loop, isInitialized, mediaState.type]);
    // Update video texture
    useFrame(() => {
        if (textureRef.current && mediaState.type === 'video') {
            textureRef.current.needsUpdate = true;
        }
    });
    // Check hover state
    useFrame(() => {
        if (!meshRef.current || !onHover)
            return;
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObject(meshRef.current);
        const hovered = intersects.length > 0;
        if (hovered !== isHovered) {
            onHover(hovered);
        }
    });
    if (!isInitialized) {
        return null;
    }
    // Get material based on media type
    const material = mediaState.type === 'video' && textureRef.current
        ? _jsx("meshStandardMaterial", { map: textureRef.current, toneMapped: false })
        : _jsx("meshStandardMaterial", { color: "#4a5568", emissive: "#2d3748", emissiveIntensity: 0.5 });
    return (_jsxs("group", { position: position, rotation: rotation, scale: scale, children: [_jsxs("mesh", { ref: meshRef, castShadow: true, children: [_jsx("boxGeometry", { args: [width, height, 0.1] }), material] }), isHovered && (_jsxs("mesh", { position: [0, 0, -0.06], children: [_jsx("boxGeometry", { args: [width + 0.1, height + 0.1, 0.05] }), _jsx("meshStandardMaterial", { color: "#ffffff", emissive: "#ffffff", emissiveIntensity: 0.3, transparent: true, opacity: 0.3 })] })), mediaState.type === 'audio' && mediaState.isPlaying && (_jsxs("mesh", { position: [0, 0, 0.06], children: [_jsx("planeGeometry", { args: [width * 0.8, height * 0.8] }), _jsx("meshBasicMaterial", { color: "#6366f1", transparent: true, opacity: 0.5 })] }))] }));
}
/**
 * Hook to manage media state with network synchronization
 */
export function useMediaSync(wsClient, myClientId, initialMedia) {
    const [mediaState, setMediaState] = useState({
        ...initialMedia,
        lastUpdate: Date.now(),
        clientId: myClientId,
    });
    // Update media state locally
    const updateMediaState = (updates) => {
        const newState = {
            ...mediaState,
            ...updates,
            lastUpdate: Date.now(),
            clientId: myClientId,
        };
        setMediaState(newState);
        // Broadcast to other players
        if (wsClient && wsClient.connected()) {
            wsClient.sendEntityUpdate({
                entityId: newState.mediaId,
                components: {
                    mediaState: newState,
                },
            });
        }
    };
    // Listen for remote updates
    useEffect(() => {
        if (!wsClient)
            return;
        const unsubscribe = wsClient.on(21, (message) => {
            if (message.payload?.components?.mediaState) {
                const remoteState = message.payload.components.mediaState;
                // Only update if it's the same media and remote update is newer
                if (remoteState.mediaId === mediaState.mediaId) {
                    setMediaState(prev => {
                        if (remoteState.lastUpdate > prev.lastUpdate && remoteState.clientId !== myClientId) {
                            return {
                                ...prev,
                                ...remoteState,
                            };
                        }
                        return prev;
                    });
                }
            }
        });
        return () => {
            if (unsubscribe)
                unsubscribe();
        };
    }, [wsClient, mediaState.mediaId, myClientId]);
    return { mediaState, updateMediaState };
}

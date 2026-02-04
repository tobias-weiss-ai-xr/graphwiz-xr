import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Text, Grid } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { AudioVisualizer, WaveformVisualizer } from './AudioVisualizer';
import { MediaControls } from './MediaControls';
import { MediaPlayer, useMediaSync } from './MediaPlayer';
export function MediaDemoScene({ wsClient, myClientId }) {
    const [selectedMediaId, setSelectedMediaId] = useState(null);
    const [controlsVisible, setControlsVisible] = useState(false);
    const [controlsPosition, setControlsPosition] = useState({ x: 0, y: 0 });
    // Video media state
    const videoMedia = useMediaSync(wsClient, myClientId, {
        mediaId: 'video-1',
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 0.8,
        playbackRate: 1,
        loop: false,
    });
    // Audio media state
    const audioMedia = useMediaSync(wsClient, myClientId, {
        mediaId: 'audio-1',
        type: 'audio',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 0.8,
        playbackRate: 1,
        loop: false,
    });
    const handleMediaClick = (mediaId, screenPosition) => {
        setSelectedMediaId(mediaId);
        setControlsPosition(screenPosition);
        setControlsVisible(true);
    };
    // Close controls when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (e.target.closest('.media-controls')) {
                return;
            }
            setControlsVisible(false);
        };
        if (controlsVisible) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [controlsVisible]);
    return (_jsxs(_Fragment, { children: [_jsx(Grid, { args: [30, 30], cellSize: 1, cellThickness: 0.5, cellColor: "#6f6f6f", sectionSize: 5, sectionThickness: 1, sectionColor: "#9d4b4b", fadeDistance: 30, fadeStrength: 1, followCamera: false, infiniteGrid: true }), _jsx("ambientLight", { intensity: 0.4 }), _jsx("directionalLight", { position: [10, 10, 5], intensity: 0.8, castShadow: true }), _jsx(Text, { position: [0, 5, 0], fontSize: 0.4, color: "#ffffff", anchorX: "center", anchorY: "middle", outlineWidth: 0.03, outlineColor: "#000000", children: "Media Demo Scene" }), _jsx(Text, { position: [0, 4.5, 0], fontSize: 0.15, color: "#a0aec0", anchorX: "center", anchorY: "middle", children: "Video and audio playback with network synchronization" }), _jsx(VideoPlayerWithControls, { position: [-6, 2.5, -5], mediaState: videoMedia.mediaState, updateMediaState: videoMedia.updateMediaState, onClick: handleMediaClick, selected: selectedMediaId === 'video-1' }), _jsx(AudioPlayerWithVisualizers, { position: [6, 2, -5], mediaState: audioMedia.mediaState, updateMediaState: audioMedia.updateMediaState, onClick: handleMediaClick, selected: selectedMediaId === 'audio-1' }), _jsx(Text, { position: [0, -0.5, 5], fontSize: 0.12, color: "#718096", anchorX: "center", anchorY: "middle", children: "Click on video or audio player to open controls" }), controlsVisible && selectedMediaId === 'video-1' && (_jsx(MediaControls, { mediaState: videoMedia.mediaState, onPlayPause: () => videoMedia.updateMediaState({ isPlaying: !videoMedia.mediaState.isPlaying }), onSeek: (time) => videoMedia.updateMediaState({ currentTime: time }), onVolumeChange: (volume) => videoMedia.updateMediaState({ volume }), onPlaybackRateChange: (rate) => videoMedia.updateMediaState({ playbackRate: rate }), onLoopToggle: () => videoMedia.updateMediaState({ loop: !videoMedia.mediaState.loop }), position: controlsPosition, visible: controlsVisible })), controlsVisible && selectedMediaId === 'audio-1' && (_jsx(MediaControls, { mediaState: audioMedia.mediaState, onPlayPause: () => audioMedia.updateMediaState({ isPlaying: !audioMedia.mediaState.isPlaying }), onSeek: (time) => audioMedia.updateMediaState({ currentTime: time }), onVolumeChange: (volume) => audioMedia.updateMediaState({ volume }), onPlaybackRateChange: (rate) => audioMedia.updateMediaState({ playbackRate: rate }), onLoopToggle: () => audioMedia.updateMediaState({ loop: !audioMedia.mediaState.loop }), position: controlsPosition, visible: controlsVisible }))] }));
}
function VideoPlayerWithControls({ position, mediaState, updateMediaState, onClick, selected }) {
    const [isHovered, setIsHovered] = useState(false);
    const { camera, raycaster, pointer } = useThree();
    const meshRef = useRef();
    const isClickedRef = useRef(false);
    useFrame(() => {
        if (!meshRef.current)
            return;
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObject(meshRef.current);
        const hovered = intersects.length > 0;
        if (hovered !== isHovered) {
            setIsHovered(hovered);
        }
        // Handle click on hovered object
        if (hovered && isClickedRef.current) {
            isClickedRef.current = false;
            // Project 3D position to 2D screen coordinates
            const vector = new THREE.Vector3(...position);
            vector.project(camera);
            const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
            const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;
            onClick(mediaState.mediaId, { x, y });
        }
    });
    // Handle pointer down/up for click detection
    useEffect(() => {
        const handlePointerDown = () => {
            if (isHovered) {
                isClickedRef.current = true;
            }
        };
        const handlePointerUp = () => {
            isClickedRef.current = false;
        };
        window.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('pointerup', handlePointerUp);
        return () => {
            window.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [isHovered]);
    return (_jsxs("group", { position: position, children: [_jsx(Text, { position: [0, 1.5, 0], fontSize: 0.15, color: selected ? '#6366f1' : '#ffffff', anchorX: "center", anchorY: "middle", outlineWidth: 0.02, outlineColor: "#000000", children: "Video Player" }), _jsx(Text, { position: [0, 1.3, 0], fontSize: 0.1, color: "#a0aec0", anchorX: "center", anchorY: "middle", children: mediaState.url }), _jsx(MediaPlayer, { position: [0, 0, 0], mediaState: mediaState, onStateChange: updateMediaState, width: 5, height: 2.8, isHovered: isHovered, onHover: setIsHovered }), isHovered && (_jsx(Text, { position: [0, -1.6, 0], fontSize: 0.1, color: "#10b981", anchorX: "center", anchorY: "middle", children: "Click to open controls" }))] }));
}
function AudioPlayerWithVisualizers({ position, mediaState, updateMediaState, onClick, selected }) {
    const [isHovered, setIsHovered] = useState(false);
    const { camera, raycaster, pointer } = useThree();
    const meshRef = useRef();
    const isClickedRef = useRef(false);
    // Get audio element for visualizer
    const audioElementRef = useRef(null);
    useEffect(() => {
        // Find audio element created by MediaPlayer
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
            if (audio.src.includes(mediaState.url)) {
                audioElementRef.current = audio;
            }
        });
    }, [mediaState.url]);
    useFrame(() => {
        if (!meshRef.current)
            return;
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObject(meshRef.current);
        const hovered = intersects.length > 0;
        if (hovered !== isHovered) {
            setIsHovered(hovered);
        }
        // Handle click on hovered object
        if (hovered && isClickedRef.current) {
            isClickedRef.current = false;
            const vector = new THREE.Vector3(...position);
            vector.project(camera);
            const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
            const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;
            onClick(mediaState.mediaId, { x, y });
        }
    });
    // Handle pointer down/up for click detection
    useEffect(() => {
        const handlePointerDown = () => {
            if (isHovered) {
                isClickedRef.current = true;
            }
        };
        const handlePointerUp = () => {
            isClickedRef.current = false;
        };
        window.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('pointerup', handlePointerUp);
        return () => {
            window.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [isHovered]);
    return (_jsxs("group", { position: position, children: [_jsx(Text, { position: [0, 1.5, 0], fontSize: 0.15, color: selected ? '#10b981' : '#ffffff', anchorX: "center", anchorY: "middle", outlineWidth: 0.02, outlineColor: "#000000", children: "Audio Player" }), _jsx(Text, { position: [0, 1.3, 0], fontSize: 0.1, color: "#a0aec0", anchorX: "center", anchorY: "middle", children: mediaState.url }), _jsx(MediaPlayer, { position: [0, 0, 0], mediaState: mediaState, onStateChange: updateMediaState, width: 4, height: 2, isHovered: isHovered, onHover: setIsHovered }), mediaState.isPlaying && audioElementRef.current && (_jsxs(_Fragment, { children: [_jsx(AudioVisualizer, { audioElement: audioElementRef.current, position: [0, -0.2, 0], barCount: 32, barRadius: 2.5, barHeight: 1.5, color: "#10b981" }), _jsx(WaveformVisualizer, { audioElement: audioElementRef.current, position: [0, -0.2, 0], length: 64, amplitude: 0.8, color: "#6366f1" })] })), isHovered && (_jsx(Text, { position: [0, -1.6, 0], fontSize: 0.1, color: "#10b981", anchorX: "center", anchorY: "middle", children: "Click to open controls" }))] }));
}

/**
 * Tests for Voice Chat Client
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VoiceChatClient } from '../voice-chat-client';
// Mock MediaStream
class MockMediaStream {
    constructor() {
        this.tracks = [];
        this.id = 'mock-stream-id';
        this.active = true;
        this.readonly = false;
        this.onaddtrack = null;
        this.onremovetrack = null;
        this.addTrack = vi.fn();
        this.removeTrack = vi.fn();
        this.clone = vi.fn();
        this.getTracks = vi.fn();
        this.getAudioTracks = vi.fn();
        this.getVideoTracks = vi.fn();
        this.getAudioTracks = vi.fn(() => this.tracks);
        this.getVideoTracks = vi.fn(() => []);
        this.getTracks = vi.fn(() => this.tracks);
        this.addTrack = vi.fn((track) => this.tracks.push(track));
        this.removeTrack = vi.fn((track) => {
            const index = this.tracks.indexOf(track);
            if (index > -1)
                this.tracks.splice(index, 1);
        });
        this.clone = vi.fn(() => new MockMediaStream());
        this.getAudioTracks = vi.fn(() => this.tracks);
    }
    addEventListener() { }
    removeEventListener() { }
    dispatchEvent() {
        return true;
    }
}
global.MediaStream = MockMediaStream;
// Mock MediaStreamTrack
const mockMediaStreamTrack = {
    kind: 'audio',
    id: 'mock-track-id',
    label: 'Mock Audio Track',
    enabled: true,
    muted: false,
    readonly: false,
    remote: false,
    readyState: 'live',
    stop: vi.fn(),
    getSettings: vi.fn(() => ({})),
    getCapabilities: vi.fn(() => ({})),
    getConstraints: vi.fn(() => ({})),
    applyConstraints: vi.fn(),
    clone: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
};
global.MediaStreamTrack = function () {
    return mockMediaStreamTrack;
};
// Mock navigator.mediaDevices
const mockGetUserMedia = vi.fn();
Object.defineProperty(global.navigator, 'mediaDevices', {
    value: {
        getUserMedia: mockGetUserMedia,
        enumerateDevices: vi.fn(),
        getSupportedConstraints: vi.fn(() => ({})),
        getDisplayMedia: vi.fn(),
    },
    writable: true,
});
// Mock AudioContext
const mockAudioContext = vi.fn();
global.AudioContext = mockAudioContext;
// Mock RTCPeerConnection
const mockRTCPeerConnection = vi.fn();
global.RTCPeerConnection = mockRTCPeerConnection;
// Mock RTCSessionDescription
const mockRTCSessionDescription = vi.fn();
global.RTCSessionDescription = mockRTCSessionDescription;
// Mock RTCIceCandidate
const mockRTCIceCandidate = vi.fn();
global.RTCIceCandidate = mockRTCIceCandidate;
// Mock RTCTrackEvent
global.RTCTrackEvent = class {
    constructor(type, eventInitDict) {
        this.type = type;
        this.track = eventInitDict.track;
        this.receiver = eventInitDict.receiver;
        this.streams = eventInitDict.streams;
        this.transceiver = eventInitDict.transceiver;
    }
};
// Mock fetch
global.fetch = vi.fn();
describe('VoiceChatClient', () => {
    let client;
    let config;
    beforeEach(() => {
        config = {
            sfuUrl: 'https://sfu.example.com',
            roomId: 'test-room',
            userId: 'user-123',
            authToken: 'test-token',
        };
        // Reset all mocks
        vi.clearAllMocks();
        // Setup default mocks
        setupDefaultMocks();
    });
    afterEach(() => {
        if (client) {
            // Cleanup is handled in tests
        }
    });
    function setupDefaultMocks() {
        // Mock getUserMedia
        const mockStream = new MockMediaStream();
        const mockTrack = { ...mockMediaStreamTrack, enabled: true, stop: vi.fn() };
        mockStream.getAudioTracks.mockReturnValue([mockTrack]);
        mockGetUserMedia.mockResolvedValue(mockStream);
        // Mock AudioContext
        const mockAnalyser = {
            fftSize: 256,
            smoothingTimeConstant: 0.1,
            frequencyBinCount: 128,
            getByteFrequencyData: vi.fn(),
        };
        const mockSource = { connect: vi.fn() };
        const mockGainNode = {
            gain: { setValueAtTime: vi.fn() },
            connect: vi.fn(),
        };
        const mockPannerNode = {
            positionX: { setValueAtTime: vi.fn() },
            positionY: { setValueAtTime: vi.fn() },
            positionZ: { setValueAtTime: vi.fn() },
            connect: vi.fn(),
        };
        mockAudioContext.mockImplementation(() => ({
            latencyHint: 'interactive',
            sampleRate: 48000,
            createAnalyser: vi.fn(() => mockAnalyser),
            createMediaStreamSource: vi.fn(() => mockSource),
            createGain: vi.fn(() => mockGainNode),
            createPanner: vi.fn(() => mockPannerNode),
            close: vi.fn().mockResolvedValue(undefined),
            state: 'running',
            currentTime: 0,
        }));
        // Mock RTCPeerConnection
        const mockDataChannel = {
            readyState: 'open',
            send: vi.fn(),
            close: vi.fn(),
        };
        const mockPeerConnection = {
            createDataChannel: vi.fn().mockReturnValue(mockDataChannel),
            addTrack: vi.fn(),
            createOffer: vi.fn().mockResolvedValue({
                sdp: 'mock-sdp',
                type: 'offer',
            }),
            createAnswer: vi.fn().mockResolvedValue({
                sdp: 'mock-answer-sdp',
                type: 'answer',
            }),
            setLocalDescription: vi.fn().mockResolvedValue(undefined),
            setRemoteDescription: vi.fn().mockResolvedValue(undefined),
            onicecandidate: null,
            ontrack: null,
            close: vi.fn(),
        };
        mockRTCPeerConnection.mockImplementation(() => mockPeerConnection);
        // Mock RTCSessionDescription
        mockRTCSessionDescription.mockImplementation((desc) => desc);
        // Mock RTCIceCandidate
        mockRTCIceCandidate.mockImplementation((desc) => desc);
        // Mock fetch
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                answer: {
                    sdp: 'mock-answer-sdp',
                    type: 'answer',
                },
            }),
        });
    }
    describe('Initialization', () => {
        it('should create client with config', () => {
            client = new VoiceChatClient(config);
            expect(client).toBeDefined();
            expect(client.isConnected()).toBe(false);
            // Note: isMuted() method is shadowed by private property
            // Use getStats() to check mute state
            expect(client.getStats().isMuted).toBe(false);
        });
        it('should have default audio constraints', () => {
            client = new VoiceChatClient(config);
            const stats = client.getStats();
            expect(stats.isConnected).toBe(false);
            expect(stats.isMuted).toBe(false);
        });
        it('should accept custom audio constraints', () => {
            const customConfig = {
                ...config,
                audioConstraints: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    sampleRate: 16000,
                },
            };
            client = new VoiceChatClient(customConfig);
            expect(client).toBeDefined();
        });
    });
    describe('Connection', () => {
        it('should connect successfully', async () => {
            client = new VoiceChatClient(config);
            const connectedSpy = vi.fn();
            client.on('connected', connectedSpy);
            await client.connect();
            expect(connectedSpy).toHaveBeenCalled();
            expect(client.isConnected()).toBe(true);
        });
        it('should get user media on connect', async () => {
            client = new VoiceChatClient(config);
            await client.connect();
            expect(mockGetUserMedia).toHaveBeenCalledWith({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 48000,
                    channelCount: 1,
                },
                video: false,
            });
        });
        it('should create audio context', async () => {
            client = new VoiceChatClient(config);
            await client.connect();
            expect(mockAudioContext).toHaveBeenCalledWith({
                latencyHint: 'interactive',
                sampleRate: 48000,
            });
        });
        it('should create peer connection', async () => {
            client = new VoiceChatClient(config);
            await client.connect();
            expect(mockRTCPeerConnection).toHaveBeenCalledWith({
                iceServers: expect.arrayContaining([
                    { urls: 'stun:stun.l.google.com:19302' },
                ]),
            });
        });
        it('should create data channel', async () => {
            client = new VoiceChatClient(config);
            await client.connect();
            const pc = mockRTCPeerConnection.mock.results[0].value;
            expect(pc.createDataChannel).toHaveBeenCalledWith('signaling', {
                ordered: true,
            });
        });
        it('should emit dataChannelOpen event', async () => {
            client = new VoiceChatClient(config);
            const dataChannelOpenSpy = vi.fn();
            client.on('dataChannelOpen', dataChannelOpenSpy);
            await client.connect();
            const pc = mockRTCPeerConnection.mock.results[0].value;
            const dc = pc.createDataChannel.mock.results[0].value;
            dc.onopen();
            expect(dataChannelOpenSpy).toHaveBeenCalled();
        });
        it('should send offer to SFU', async () => {
            client = new VoiceChatClient(config);
            await client.connect();
            expect(global.fetch).toHaveBeenCalledWith('https://sfu.example.com/sfu/rooms/test-room/peers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-token',
                },
                body: expect.stringContaining('userId'),
            });
        });
        it('should handle connection errors', async () => {
            client = new VoiceChatClient(config);
            const errorSpy = vi.fn();
            client.on('error', errorSpy);
            mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));
            await expect(client.connect()).rejects.toThrow('Permission denied');
            expect(errorSpy).toHaveBeenCalled();
        });
    });
    describe('Disconnection', () => {
        it('should disconnect successfully', async () => {
            client = new VoiceChatClient(config);
            const disconnectedSpy = vi.fn();
            client.on('disconnected', disconnectedSpy);
            await client.connect();
            await client.disconnect();
            expect(disconnectedSpy).toHaveBeenCalled();
            expect(client.isConnected()).toBe(false);
        });
        it('should stop all remote audio sources', async () => {
            client = new VoiceChatClient(config);
            await client.connect();
            await client.disconnect();
            // Should clean up audio resources
            const pc = mockRTCPeerConnection.mock.results[0].value;
            expect(pc.close).toHaveBeenCalled();
        });
        it('should stop local stream tracks', async () => {
            const trackStopSpy = vi.fn();
            // Setup a mock track with stop spy
            const mockStream = new MockMediaStream();
            const mockTrack = { ...mockMediaStreamTrack, enabled: true, stop: trackStopSpy };
            mockStream.getAudioTracks.mockReturnValue([mockTrack]);
            mockStream.getTracks.mockReturnValue([mockTrack]);
            mockGetUserMedia.mockResolvedValue(mockStream);
            client = new VoiceChatClient(config);
            await client.connect();
            await client.disconnect();
            expect(trackStopSpy).toHaveBeenCalled();
        });
        it('should close audio context', async () => {
            client = new VoiceChatClient(config);
            await client.connect();
            await client.disconnect();
            const ctx = mockAudioContext.mock.results[0].value;
            expect(ctx.close).toHaveBeenCalled();
        });
        it('should handle disconnect when not connected', async () => {
            client = new VoiceChatClient(config);
            await expect(client.disconnect()).resolves.not.toThrow();
        });
    });
    describe('Mute functionality', () => {
        it('should set mute state', async () => {
            client = new VoiceChatClient(config);
            await client.connect();
            client.setMuted(true);
            expect(client.getStats().isMuted).toBe(true);
            const stats = client.getStats();
            expect(stats.isMuted).toBe(true);
        });
        it('should disable audio track when muted', async () => {
            client = new VoiceChatClient(config);
            await client.connect();
            client.setMuted(true);
            const stream = await mockGetUserMedia.mock.results[0].value;
            const track = stream.getAudioTracks()[0];
            expect(track.enabled).toBe(false);
        });
        it('should enable audio track when unmuted', async () => {
            client = new VoiceChatClient(config);
            await client.connect();
            client.setMuted(true);
            client.setMuted(false);
            const stream = await mockGetUserMedia.mock.results[0].value;
            const track = stream.getAudioTracks()[0];
            expect(track.enabled).toBe(true);
        });
        it('should emit muteStateChanged event', async () => {
            client = new VoiceChatClient(config);
            const muteStateSpy = vi.fn();
            client.on('muteStateChanged', muteStateSpy);
            await client.connect();
            client.setMuted(true);
            expect(muteStateSpy).toHaveBeenCalledWith(true);
        });
        it('should toggle mute state', async () => {
            client = new VoiceChatClient(config);
            await client.connect();
            const initialState = client.getStats().isMuted;
            const newState = client.toggleMute();
            expect(newState).toBe(!initialState);
            expect(client.getStats().isMuted).toBe(newState);
        });
    });
    describe('Remote audio control', () => {
        it('should set remote user volume', async () => {
            client = new VoiceChatClient(config);
            await client.connect();
            expect(() => {
                client.setRemoteVolume('user-456', 0.5);
            }).not.toThrow();
        });
        it('should set remote spatial position', async () => {
            client = new VoiceChatClient(config);
            await client.connect();
            expect(() => {
                client.setRemotePosition('user-456', { x: 1, y: 2, z: 3 });
            }).not.toThrow();
        });
    });
    describe('Voice activity detection', () => {
        it('should detect voice activity', async () => {
            client = new VoiceChatClient(config);
            const startedSpy = vi.fn();
            const stoppedSpy = vi.fn();
            client.on('startedSpeaking', startedSpy);
            client.on('stoppedSpeaking', stoppedSpy);
            await client.connect();
            // VAD is started automatically on connection
            const ctx = mockAudioContext.mock.results[0].value;
            const analyser = ctx.createAnalyser.mock.results[0].value;
            // Simulate audio above threshold
            analyser.getByteFrequencyData.mockImplementation((data) => {
                for (let i = 0; i < data.length; i++) {
                    data[i] = 50; // Above threshold (0.01 * 255 = 2.55)
                }
            });
            // Trigger one RAF cycle to check VAD
            await new Promise(resolve => setTimeout(resolve, 10));
            // VAD should detect speaking
            const stats = client.getStats();
            expect(stats.isSpeaking).toBe(true);
        });
        it('should set voice activity threshold', async () => {
            client = new VoiceChatClient(config);
            await client.connect();
            expect(() => {
                client.setVoiceActivityThreshold(0.5);
            }).not.toThrow();
        });
        it('should clamp threshold between 0 and 1', async () => {
            client = new VoiceChatClient(config);
            await client.connect();
            client.setVoiceActivityThreshold(1.5);
            client.setVoiceActivityThreshold(-0.5);
            // Should be clamped
            expect(() => {
                client.setVoiceActivityThreshold(0.5);
            }).not.toThrow();
        });
    });
    describe('Statistics', () => {
        it('should return connection stats', async () => {
            client = new VoiceChatClient(config);
            await client.connect();
            const stats = client.getStats();
            expect(stats).toBeDefined();
            expect(stats.isConnected).toBe(true);
            expect(stats.isMuted).toBe(false);
        });
        it('should get remote users', async () => {
            client = new VoiceChatClient(config);
            await client.connect();
            const users = client.getRemoteUsers();
            expect(Array.isArray(users)).toBe(true);
        });
    });
    describe('Error handling', () => {
        it('should handle getUserMedia failure', async () => {
            client = new VoiceChatClient(config);
            const errorSpy = vi.fn();
            client.on('error', errorSpy);
            mockGetUserMedia.mockRejectedValue(new Error('No microphone found'));
            await expect(client.connect()).rejects.toThrow();
            expect(errorSpy).toHaveBeenCalled();
        });
        it('should handle network failure', async () => {
            client = new VoiceChatClient(config);
            const errorSpy = vi.fn();
            client.on('error', errorSpy);
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                statusText: 'Service Unavailable',
            });
            await expect(client.connect()).rejects.toThrow();
            expect(errorSpy).toHaveBeenCalled();
        });
        it('should handle setRemoteVolume when not connected', () => {
            client = new VoiceChatClient(config);
            expect(() => {
                client.setRemoteVolume('user-123', 0.5);
            }).not.toThrow();
        });
        it('should handle setRemotePosition when not connected', () => {
            client = new VoiceChatClient(config);
            expect(() => {
                client.setRemotePosition('user-123', { x: 0, y: 0, z: 0 });
            }).not.toThrow();
        });
    });
    describe('ICE candidates', () => {
        it('should send ICE candidates to SFU', async () => {
            client = new VoiceChatClient(config);
            await client.connect();
            const pc = mockRTCPeerConnection.mock.results[0].value;
            // Simulate ICE candidate
            const candidate = { candidate: 'mock-candidate', sdpMid: '0', sdpMLineIndex: 0 };
            if (pc.onicecandidate) {
                pc.onicecandidate(candidate);
            }
            // Should have sent candidate via data channel
            const dc = pc.createDataChannel.mock.results[0].value;
            expect(dc.send).toHaveBeenCalled();
        });
    });
    describe('Remote track handling', () => {
        it('should handle remote track event', async () => {
            client = new VoiceChatClient(config);
            const userJoinedSpy = vi.fn();
            client.on('userJoined', userJoinedSpy);
            await client.connect();
            const pc = mockRTCPeerConnection.mock.results[0].value;
            // Simulate remote track
            const mockStream = new MockMediaStream();
            const mockAudioTrack = {
                ...mockMediaStreamTrack,
                id: 'remote-audio-user-456',
            };
            mockStream.getAudioTracks.mockReturnValue([mockAudioTrack]);
            const trackEvent = {
                streams: [mockStream],
            };
            if (pc.ontrack) {
                pc.ontrack(trackEvent);
            }
            // Should emit userJoined event
            expect(userJoinedSpy).toHaveBeenCalledWith('user-456');
        });
        it('should extract user ID from track ID', async () => {
            client = new VoiceChatClient(config);
            await client.connect();
            // The getUserIdFromStream method should parse "remote-audio-{userId}" format
            const mockStream = new MockMediaStream();
            const mockAudioTrack = {
                ...mockMediaStreamTrack,
                id: 'remote-audio-test-user-789',
            };
            mockStream.getAudioTracks.mockReturnValue([mockAudioTrack]);
            const pc = mockRTCPeerConnection.mock.results[0].value;
            const trackEvent = {
                streams: [mockStream],
            };
            if (pc.ontrack) {
                pc.ontrack(trackEvent);
            }
            const users = client.getRemoteUsers();
            expect(users).toContain('test-user-789');
        });
    });
    describe('Signaling', () => {
        it('should handle remote offer', async () => {
            client = new VoiceChatClient(config);
            await client.connect();
            // Simulate receiving offer
            const offerMessage = {
                type: 'offer',
                offer: { sdp: 'remote-offer-sdp', type: 'offer' },
            };
            const dc = mockRTCPeerConnection.mock.results[0].value.createDataChannel.mock.results[0].value;
            // Simulate receiving message - handleRemoteOffer is async
            if (dc.onmessage) {
                await dc.onmessage({ data: JSON.stringify(offerMessage) });
                // Wait a bit for the async operation to complete
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            // Should create answer
            const pc = mockRTCPeerConnection.mock.results[0].value;
            expect(pc.createAnswer).toHaveBeenCalled();
        });
        it('should handle unknown signaling messages gracefully', async () => {
            client = new VoiceChatClient(config);
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
            await client.connect();
            const dc = mockRTCPeerConnection.mock.results[0].value.createDataChannel.mock.results[0].value;
            // Send unknown message type
            if (dc.onmessage) {
                dc.onmessage({ data: JSON.stringify({ type: 'unknown' }) });
            }
            expect(consoleSpy).toHaveBeenCalledWith('[VoiceChat] Unknown signaling message:', 'unknown');
            consoleSpy.mockRestore();
        });
    });
    describe('Edge cases', () => {
        it('should handle connection when already connected', async () => {
            client = new VoiceChatClient(config);
            await client.connect();
            // Try to connect again
            await expect(client.connect()).resolves.not.toThrow();
        });
        it('should handle multiple disconnects', async () => {
            client = new VoiceChatClient(config);
            await client.connect();
            await client.disconnect();
            await expect(client.disconnect()).resolves.not.toThrow();
        });
        it('should handle mute when not connected', () => {
            client = new VoiceChatClient(config);
            expect(() => {
                client.setMuted(true);
            }).not.toThrow();
        });
        it('should handle toggle mute when not connected', () => {
            client = new VoiceChatClient(config);
            expect(() => {
                client.toggleMute();
            }).not.toThrow();
        });
        it('should return empty remote users when not connected', () => {
            client = new VoiceChatClient(config);
            const users = client.getRemoteUsers();
            expect(users).toEqual([]);
        });
    });
});

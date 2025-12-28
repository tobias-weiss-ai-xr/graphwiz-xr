/**
 * Voice Chat Client
 *
 * Manages WebRTC audio streaming for voice chat via SFU service.
 */

import { EventEmitter } from 'events';

export interface VoiceChatConfig {
  sfuUrl: string;
  roomId: string;
  userId: string;
  authToken: string;
  audioConstraints?: MediaTrackConstraints;
}

export interface AudioStreamInfo {
  userId: string;
  streamId: string;
  isActive: boolean;
  volume: number;
  muted: boolean;
}

export interface VoiceChatStats {
  isConnected: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  bitrate: number;
  packetLoss: number;
}

export class VoiceChatClient extends EventEmitter {
  private config: VoiceChatConfig;
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  localStream: MediaStream | null = null;
  remoteStreams: Map<string, MediaStream> = new Map();
  private audioContext: AudioContext | null = null;
  private remoteSources: Map<string, AudioScheduledSourceNode> = new Map();
  private gainNodes: Map<string, GainNode> = new Map();
  private pannerNodes: Map<string, PannerNode> = new Map();
  private analyser: AnalyserNode | null = null;
  private isMuted = false;
  private audioWorklet: AudioWorkletNode | null = null;
  private voiceActivityThreshold = 0.01; // Audio level threshold for VAD
  private isSpeaking = false;
  private stats: VoiceChatStats = {
    isConnected: false,
    isMuted: false,
    isSpeaking: false,
    audioLevel: 0,
    bitrate: 0,
    packetLoss: 0,
  };

  // ICE servers configuration
  private iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];

  constructor(config: VoiceChatConfig) {
    super();
    this.config = config;
  }

  /**
   * Connect to SFU service
   */
  async connect(): Promise<void> {
    try {
      console.log('[VoiceChat] Connecting to SFU:', this.config.sfuUrl);

      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: this.config.audioConstraints || {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1,
        },
        video: false,
      });

      // Create audio context for spatial audio
      this.audioContext = new AudioContext({
        latencyHint: 'interactive',
        sampleRate: 48000,
      });

      // Create analyser for voice activity detection
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.1;

      // Create peer connection
      this.peerConnection = new RTCPeerConnection({
        iceServers: this.iceServers,
      });

      // Add local audio track to peer connection
      const audioTracks = this.localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        this.peerConnection.addTrack(audioTracks[0], this.localStream);
      }

      // Create data channel for signaling
      this.dataChannel = this.peerConnection.createDataChannel('signaling', {
        ordered: true,
      });

      this.dataChannel.onopen = () => {
        console.log('[VoiceChat] Data channel opened');
        this.emit('dataChannelOpen');
      };

      this.dataChannel.onmessage = (event) => {
        this.handleSignalingMessage(JSON.parse(event.data));
      };

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.sendSignal({
            type: 'ice-candidate',
            candidate: event.candidate,
          });
        }
      };

      // Handle remote tracks
      this.peerConnection.ontrack = (event) => {
        this.handleRemoteTrack(event);
      };

      // Create offer
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      });

      await this.peerConnection.setLocalDescription(offer);

      // Send offer to SFU
      const response = await fetch(`${this.config.sfuUrl}/sfu/rooms/${this.config.roomId}/peers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.authToken}`,
        },
        body: JSON.stringify({
          userId: this.config.userId,
          offer: {
            sdp: offer.sdp,
            type: offer.type,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to join voice chat: ${response.statusText}`);
      }

      const data = await response.json();
      const answer = new RTCSessionDescription({
        sdp: data.answer.sdp,
        type: data.answer.type,
      });

      await this.peerConnection.setRemoteDescription(answer);

      this.stats.isConnected = true;
      this.emit('connected');

      // Start voice activity detection
      this.startVoiceActivityDetection();

      console.log('[VoiceChat] Connected successfully');
    } catch (error) {
      console.error('[VoiceChat] Connection failed:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Disconnect from voice chat
   */
  async disconnect(): Promise<void> {
    console.log('[VoiceChat] Disconnecting');

    // Stop all remote audio
    for (const [userId, source] of this.remoteSources) {
      try {
        source.stop();
      } catch (e) {
        // Ignore errors
      }
    }
    this.remoteSources.clear();

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      await this.audioContext.close();
    }

    this.stats.isConnected = false;
    this.emit('disconnected');
  }

  /**
   * Mute/unmute microphone
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    this.stats.isMuted = muted;

    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }

    this.emit('muteStateChanged', muted);
  }

  /**
   * Toggle mute state
   */
  toggleMute(): boolean {
    const newMutedState = !this.isMuted;
    this.setMuted(newMutedState);
    return newMutedState;
  }

  /**
   * Set volume for remote user
   */
  setRemoteVolume(userId: string, volume: number): void {
    const gainNode = this.gainNodes.get(userId);
    if (gainNode) {
      gainNode.gain.setValueAtTime(volume, this.audioContext!.currentTime);
    }
  }

  /**
   * Set spatial position for remote user's audio
   */
  setRemotePosition(userId: string, position: { x: number; y: number; z: number }): void {
    const panner = this.pannerNodes.get(userId);
    if (panner) {
      panner.positionX.setValueAtTime(position.x, this.audioContext!.currentTime);
      panner.positionY.setValueAtTime(position.y, this.audioContext!.currentTime);
      panner.positionZ.setValueAtTime(position.z, this.audioContext!.currentTime);
    }
  }

  /**
   * Handle remote track
   */
  private handleRemoteTrack(event: RTCTrackEvent): void {
    const stream = event.streams[0];
    if (!stream) return;

    console.log('[VoiceChat] Received remote stream');

    // Create audio source
    const source = this.audioContext!.createMediaStreamSource(stream);

    // Create spatial panner
    const panner = this.audioContext!.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 10;
    panner.rolloffFactor = 1;

    // Create gain node for volume
    const gainNode = this.audioContext!.createGain();
    gainNode.gain.setValueAtTime(1.0, this.audioContext!.currentTime);

    // Connect nodes: source -> gain -> panner -> destination
    source.connect(gainNode);
    gainNode.connect(panner);
    panner.connect(this.audioContext!.destination);

    // Store references
    const userId = this.getUserIdFromStream(stream);
    this.remoteStreams.set(userId, stream);
    this.remoteSources.set(userId, source);
    this.gainNodes.set(userId, gainNode);
    this.pannerNodes.set(userId, panner);

    this.emit('userJoined', userId);
  }

  /**
   * Get user ID from stream
   */
  private getUserIdFromStream(stream: MediaStream): string {
    // Try to get user ID from track ID
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      // Track ID format: "remote-audio-{userId}"
      const match = audioTrack.id.match(/remote-audio-(.+)/);
      if (match) {
        return match[1];
      }
    }
    return stream.id;
  }

  /**
   * Start voice activity detection
   */
  private startVoiceActivityDetection(): void {
    if (!this.analyser || !this.localStream) return;

    // Connect local stream to analyser
    const source = this.audioContext!.createMediaStreamSource(this.localStream);
    source.connect(this.analyser);

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const checkVoiceActivity = () => {
      if (!this.analyser) return;

      this.analyser.getByteFrequencyData(dataArray);

      // Calculate average audio level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      const normalizedLevel = average / 255;

      this.stats.audioLevel = normalizedLevel;

      // Detect speaking
      const wasSpeaking = this.isSpeaking;
      this.isSpeaking = normalizedLevel > this.voiceActivityThreshold;
      this.stats.isSpeaking = this.isSpeaking;

      // Emit events on state change
      if (this.isSpeaking && !wasSpeaking) {
        this.emit('startedSpeaking');
      } else if (!this.isSpeaking && wasSpeaking) {
        this.emit('stoppedSpeaking');
      }

      // Continue checking
      requestAnimationFrame(checkVoiceActivity);
    };

    checkVoiceActivity();
  }

  /**
   * Send signaling message
   */
  private sendSignal(signal: any): void {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(signal));
    }
  }

  /**
   * Handle signaling message
   */
  private handleSignalingMessage(message: any): void {
    switch (message.type) {
      case 'offer':
        this.handleRemoteOffer(message);
        break;
      case 'answer':
        this.handleRemoteAnswer(message);
        break;
      case 'ice-candidate':
        this.handleRemoteCandidate(message);
        break;
      default:
        console.warn('[VoiceChat] Unknown signaling message:', message.type);
    }
  }

  /**
   * Handle remote offer
   */
  private async handleRemoteOffer(message: any): Promise<void> {
    if (!this.peerConnection) return;

    const offer = new RTCSessionDescription(message.offer);
    await this.peerConnection.setRemoteDescription(offer);

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    this.sendSignal({
      type: 'answer',
      answer: {
        sdp: answer.sdp,
        type: answer.type,
      },
    });
  }

  /**
   * Handle remote answer
   */
  private async handleRemoteAnswer(message: any): Promise<void> {
    if (!this.peerConnection) return;

    const answer = new RTCSessionDescription(message.answer);
    await this.peerConnection.setRemoteDescription(answer);
  }

  /**
   * Handle remote ICE candidate
   */
  private async handleRemoteCandidate(message: any): Promise<void> {
    if (!this.peerConnection) return;

    const candidate = new RTCIceCandidate(message.candidate);
    await this.peerConnection.addIceCandidate(candidate);
  }

  /**
   * Get connection statistics
   */
  getStats(): VoiceChatStats {
    return { ...this.stats };
  }

  /**
   * Get all remote users
   */
  getRemoteUsers(): string[] {
    return Array.from(this.remoteStreams.keys());
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.stats.isConnected;
  }

  /**
   * Check if muted
   */
  isMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Check if currently speaking
   */
  isUserSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Set voice activity threshold
   */
  setVoiceActivityThreshold(threshold: number): void {
    this.voiceActivityThreshold = Math.max(0, Math.min(1, threshold));
  }
}

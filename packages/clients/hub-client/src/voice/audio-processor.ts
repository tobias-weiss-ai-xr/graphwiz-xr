/**
 * AudioWorklet Processor for Voice Processing
 *
 * Provides basic audio processing including:
 * - Noise suppression (spectral subtraction)
 * - Echo cancellation (simple adaptive filter)
 * - Automatic gain control
 *
 * Uses Web Audio API built-in features only, no external libraries.
 */

// Processor definition as a string for use with Blob URL
// This runs in a separate thread (AudioWorkletGlobalScope)
const PROCESSOR_CODE = `
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    
    // Noise suppression state
    this.noiseFloor = new Float32Array(128); // Frequency bin noise estimates
    this.noiseSmoothing = 0.95; // How fast noise floor adapts
    this.suppressionRatio = 8.0; // How aggressively to suppress noise (dB)
    
    // Echo cancellation state (simple FIR filter)
    this.echoPathLength = 64;
    this.echoPath = new Float32Array(this.echoPathLength).fill(0);
    this.echoCancellationEnabled = true;
    
    // Automatic gain control
    this.currentGain = 1.0;
    this.targetLevel = 0.1; // Target RMS level
    this.gainSmoothing = 0.05;
    
    // Statistics for monitoring
    this.inputLevel = 0;
    this.outputLevel = 0;
  }
  
  // Calculate RMS (root mean square) of audio data
  calculateRMS(data) {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    return Math.sqrt(sum / data.length);
  }
  
  // FFT for frequency domain processing
  // Simple DFT implementation (not as fast as FFT but sufficient for basic processing)
  computeMagnitudeSpectrum(input) {
    const size = input.length;
    const magnitude = new Float32Array(size / 2);
    
    for (let bin = 0; bin < size / 2; bin++) {
      let real = 0;
      let imag = 0;
      
      for (let n = 0; n < size; n++) {
        const phase = (2 * Math.PI * bin * n) / size;
        real += input[n] * Math.cos(phase);
        imag -= input[n] * Math.sin(phase);
      }
      
      magnitude[bin] = Math.sqrt(real * real + imag * imag) / size;
    }
    
    return magnitude;
  }
  
  // Apply spectral subtraction for noise suppression
  applyNoiseSuppression(input, magnitude) {
    const output = new Float32Array(input.length);
    const spectrumSize = magnitude.length;
    
    // Update noise floor estimate during quiet periods
    for (let bin = 0; bin < spectrumSize; bin++) {
      if (magnitude[bin] < this.noiseFloor[bin] * 2) {
        // Input is likely noise, update estimate
        this.noiseFloor[bin] = 
          this.noiseSmoothing * this.noiseFloor[bin] + 
          (1 - this.noiseSmoothing) * magnitude[bin];
      }
    }
    
    // Apply spectral subtraction in frequency domain (simplified)
    for (let i = 0; i < input.length; i++) {
      // Simple time-domain noise gate based on magnitude estimate
      const frequencyBin = (i % (input.length / 2)) / (input.length / 2);
      const noiseEstimate = this.noiseFloor[Math.floor(frequencyBin * spectrumSize)] * 100;
      
      // Gate: suppress if below noise threshold
      let gain = 1.0;
      if (Math.abs(input[i]) < noiseEstimate * 2) {
        gain = Math.max(0.1, 1 - (noiseEstimate * 2) / Math.abs(input[i]));
      }
      
      output[i] = input[i] * gain;
    }
    
    return output;
  }
  
  // Simple adaptive echo cancellation using LMS algorithm
  applyEchoCancellation(input) {
    if (!this.echoCancellationEnabled) {
      return input;
    }
    
    const output = new Float32Array(input.length);
    const blockSize = 64; // Process in blocks for efficiency
    
    for (let block = 0; block < input.length / blockSize; block++) {
      const blockStart = block * blockSize;
      const echoEstimate = new Float32Array(blockSize);
      
      // Estimate echo using adaptive filter (simplified LMS)
      for (let i = 0; i < blockSize; i++) {
        echoEstimate[i] = 0;
        for (let j = 0; j < this.echoPathLength && j <= i; j++) {
          // Use past samples as reference (simulated for demo)
          const refIndex = (blockOffset - j + input.length) % input.length;
          echoEstimate[i] += this.echoPath[j] * (input[refIndex] * 0.1);
        }
      }
      
      // Subtract echo estimate and update filter coefficients
      for (let i = 0; i < blockSize; i++) {
        output[blockStart + i] = input[blockStart + i] - echoEstimate[i];
        const error = output[blockStart + i] * 0.01; // Small learning rate
        for (let j = 0; j < this.echoPathLength && j <= i; j++) {
          const refIndex = (blockStart - j + input.length) % input.length;
          this.echoPath[j] += error * (input[refIndex] * 0.1) * 0.01;
        }
      }
    }
    
    return output;
  }
  
  // Apply automatic gain control
  applyAGC(input, output) {
    // Calculate current RMS level
    const rms = this.calculateRMS(input);
    
    // Update gain target (with smoothing)
    if (rms > 0) {
      const targetGain = this.targetLevel / rms;
      this.currentGain += this.gainSmoothing * (targetGain - this.currentGain);
      this.currentGain = Math.max(0.1, Math.min(10.0, this.currentGain));
    }
    
    // Apply gain
    for (let i = 0; i < input.length; i++) {
      output[i] = input[i] * this.currentGain;
    }
    
    return this.currentGain;
  }
  
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    
    if (input.length === 0 || output.length === 0) {
      return true; // Pass through if no data
    }
    
    // Assume mono input
    const inputChannel = input[0];
    const outputChannel = output[0];
    const length = inputChannel.length;
    
    // Create output buffer
    const processed = new Float32Array(length);
    
    // Step 1: Noise suppression (frequency domain)
    const magnitude = this.computeMagnitudeSpectrum(inputChannel);
    const noiseSuppressed = this.applyNoiseSuppression(inputChannel, magnitude);
    
    // Step 2: Echo cancellation (time domain adaptive filter)
    const echoCancelled = this.applyEchoCancellation(noiseSuppressed);
    
    // Step 3: Automatic gain control
    this.applyAGC(echoCancelled, processed);
    
    // Update statistics
    this.inputLevel = this.calculateRMS(inputChannel);
    this.outputLevel = this.calculateRMS(processed);
    
    // Copy to output
    for (let i = 0; i < length; i++) {
      outputChannel[i] = processed[i];
    }
    
    // Send periodic status updates
    this.port.postMessage({
      type: 'status',
      inputLevel: this.inputLevel,
      outputLevel: this.outputLevel,
      currentGain: this.currentGain
    });
    
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);
`;

// Generate Blob URL for the processor code
function createAudioWorkletBlob(): string {
  const blob = new Blob([PROCESSOR_CODE], { type: 'application/javascript' });
  return URL.createObjectURL(blob);
}

// Audio Worklet options
export const getAudioWorkletUrl = /* #__PURE__ */ createAudioWorkletBlob;

/**
 * Interface for AudioWorklet processor messages
 */
export interface AudioProcessorMessage {
  type: 'status';
  inputLevel: number;
  outputLevel: number;
  currentGain: number;
}

/**
 * Initialize AudioWorklet on the given AudioContext
 *
 * @param audioContext - The AudioContext to load the worklet into
 * @returns Promise that resolves when the worklet is loaded
 */
export async function initializeAudioWorklet(audioContext: AudioContext): Promise<void> {
  const workletUrl = getAudioWorkletUrl();

  try {
    await audioContext.audioWorklet.addModule(workletUrl);
  } finally {
    // Clean up blob URL after loading
    URL.revokeObjectURL(workletUrl);
  }
}

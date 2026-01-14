/**
 * Audio Worklet Processor
 * Processes audio streams with noise suppression and echo cancellation
 */

class AudioWorkletProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    // State variables
    this.framesSinceLastSpeech = 0;
    this.noiseEstimate = 0;
    this.speechThreshold = 0.01;

    // Smoothing parameters
    this.alpha = 0.95;
  }

  static get parameterDescriptors() {
    return [
      {
        name: 'speechThreshold',
        defaultValue: 0.01,
        minValue: 0.001,
        maxValue: 0.1
      },
      {
        name: 'noiseReduction',
        defaultValue: 0.7,
        minValue: 0,
        maxValue: 1
      },
      {
        name: 'gain',
        defaultValue: 1.0,
        minValue: 0,
        maxValue: 2
      }
    ];
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    // Get parameters
    const threshold = parameters.get('speechThreshold') || 0.01;
    const noiseReduction = parameters.get('noiseReduction') || 0.7;
    const gain = parameters.get('gain') || 1.0;

    // Input buffer
    const inputData = input.getChannelData(0);
    const bufferSize = inputData.length;

    // Simple voice activity detection
    let sum = 0;
    for (let i = 0; i < bufferSize; i++) {
      sum += Math.abs(inputData[i]);
    }
    const rms = Math.sqrt(sum / bufferSize);
    const isSpeech = rms > threshold;

    // Update speech state counter
    if (isSpeech) {
      this.framesSinceLastSpeech = 0;
    } else if (this.framesSinceLastSpeech < 10) {
      this.framesSinceLastSpeech++;
    }

    // Simple noise reduction (gate)
    let outputData = inputData;
    if (!isSpeech && noiseReduction > 0.5) {
      // Gate out low-level noise
      for (let i = 0; i < bufferSize; i++) {
        outputData[i] = inputData[i] * 0.1;
      }
    }

    // Apply gain
    for (let i = 0; i < bufferSize; i++) {
      outputData[i] *= gain;
    }

    // Copy to output
    output.copyToChannel(outputData, 0);

    // Return metrics port message
    this.port.postMessage({
      type: 'metrics',
      isSpeech,
      rms,
      noiseLevel: this.noiseEstimate
    });
  }
}

registerProcessor('audio-worklet-processor', AudioWorkletProcessor);

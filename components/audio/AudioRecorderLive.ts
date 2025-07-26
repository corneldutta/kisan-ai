import { EventEmitter } from 'events';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export interface AudioChunk {
  data: string; // base64 encoded PCM data
  timestamp: number;
  sampleRate: number;
  channels: number;
}

export class AudioRecorderLive extends EventEmitter {
  private recording: Audio.Recording | null = null;
  private isRecording = false;
  private isPaused = false;
  private chunkDurationMs = 100; // 100ms chunks for low latency
  private sampleRate = 16000; // Required by Gemini Live API
  private channels = 1; // Mono audio

  constructor() {
    super();
    this.setupAudioMode();
  }

  private async setupAudioMode() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
    } catch (error) {
      console.error('Error setting up audio mode:', error);
    }
  }

  async startRecording(): Promise<boolean> {
    try {
      if (this.isRecording) {
        console.log('Already recording');
        return true;
      }

      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        this.emit('error', { message: 'Microphone permission not granted' });
        return false;
      }

      // Clean up any existing recording
      if (this.recording) {
        try {
          await this.recording.stopAndUnloadAsync();
        } catch (error) {
          console.log('Error cleaning up previous recording:', error);
        }
        this.recording = null;
      }

      // Configure recording options for Gemini Live API
      const recordingOptions: Audio.RecordingOptions = {
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: this.sampleRate,
          numberOfChannels: this.channels,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: this.sampleRate,
          numberOfChannels: this.channels,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/wav',
          bitsPerSecond: 128000,
        },
      };

      // Start recording
      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      this.recording = recording;
      this.isRecording = true;
      this.isPaused = false;

      this.emit('recordingStarted');
      
      // Start chunking for real-time streaming
      this.startChunking();
      
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.emit('error', { message: 'Failed to start recording', error });
      return false;
    }
  }

  async pauseRecording(): Promise<boolean> {
    if (!this.recording || !this.isRecording || this.isPaused) {
      return false;
    }

    try {
      await this.recording.pauseAsync();
      this.isPaused = true;
      this.emit('recordingPaused');
      return true;
    } catch (error) {
      console.error('Failed to pause recording:', error);
      this.emit('error', { message: 'Failed to pause recording', error });
      return false;
    }
  }

  async resumeRecording(): Promise<boolean> {
    if (!this.recording || !this.isRecording || !this.isPaused) {
      return false;
    }

    try {
      await this.recording.startAsync();
      this.isPaused = false;
      this.emit('recordingResumed');
      return true;
    } catch (error) {
      console.error('Failed to resume recording:', error);
      this.emit('error', { message: 'Failed to resume recording', error });
      return false;
    }
  }

  async stopRecording(): Promise<string | null> {
    if (!this.recording || !this.isRecording) {
      return null;
    }

    try {
      this.isRecording = false;
      this.isPaused = false;
      
      const currentRecording = this.recording;
      this.recording = null;
      
      await currentRecording.stopAndUnloadAsync();
      const uri = currentRecording.getURI();
      
      this.emit('recordingStopped', { uri });
      
      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.emit('error', { message: 'Failed to stop recording', error });
      return null;
    }
  }

  private startChunking() {
    if (!this.isRecording) return;

    const chunkInterval = setInterval(async () => {
      if (!this.isRecording || this.isPaused) {
        clearInterval(chunkInterval);
        return;
      }

      try {
        // Get recording status for chunk processing
        const status = await this.recording?.getStatusAsync();
        if (status && status.isRecording) {
          // For real implementation, we would need native module
          // to access raw audio data directly. For now, we'll simulate
          this.processAudioChunk();
        }
      } catch (error) {
        console.error('Error processing audio chunk:', error);
      }
    }, this.chunkDurationMs);
  }

  private processAudioChunk() {
    // This is a placeholder for actual audio chunk processing
    // In a real implementation, you would need a native module 
    // to access raw PCM data from the microphone in real-time
    
    // For now, we'll emit a simulated chunk
    const chunk: AudioChunk = {
      data: this.generateSimulatedChunk(),
      timestamp: Date.now(),
      sampleRate: this.sampleRate,
      channels: this.channels,
    };

    this.emit('audioChunk', chunk);
  }

  private generateSimulatedChunk(): string {
    // Generate simulated 16-bit PCM data for testing
    // This should be replaced with actual audio data from native module
    const samples = Math.floor(this.sampleRate * this.chunkDurationMs / 1000);
    const buffer = new ArrayBuffer(samples * 2); // 2 bytes per 16-bit sample
    const view = new Int16Array(buffer);
    
    // Generate silence or white noise for testing
    for (let i = 0; i < samples; i++) {
      view[i] = 0; // Silence
    }
    
    // Convert to base64
    const uint8Array = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < uint8Array.byteLength; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    
    return btoa(binary);
  }

  async convertToBase64PCM(uri: string): Promise<string | null> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error('Audio file does not exist');
      }

      // Read file as base64
      const base64Data = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // For WAV files, we need to extract just the PCM data
      // This is a simplified version - in production you'd need proper WAV parsing
      return base64Data;
    } catch (error) {
      console.error('Error converting audio to base64 PCM:', error);
      this.emit('error', { message: 'Failed to convert audio', error });
      return null;
    }
  }

  getRecordingStatus() {
    return {
      isRecording: this.isRecording,
      isPaused: this.isPaused,
      sampleRate: this.sampleRate,
      channels: this.channels,
    };
  }

  cleanup() {
    if (this.recording) {
      this.recording.stopAndUnloadAsync().catch(console.error);
      this.recording = null;
    }
    this.isRecording = false;
    this.isPaused = false;
    this.removeAllListeners();
  }
} 
import { EventEmitter } from 'events';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export interface AudioPlaybackChunk {
  data: string; // base64 encoded PCM data
  timestamp: number;
  sampleRate: number; // Expected to be 24kHz from Gemini
  channels: number;
}

export class AudioStreamerLive extends EventEmitter {
  private audioQueue: AudioPlaybackChunk[] = [];
  private isPlaying = false;
  private currentSound: Audio.Sound | null = null;
  private playbackRate = 1.0;
  private volume = 1.0;
  private bufferSize = 5; // Number of chunks to buffer before starting playback
  private tempDir: string = '';

  constructor() {
    super();
    this.setupAudioMode();
    this.initializeTempDir();
  }

  private async setupAudioMode() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
    } catch (error) {
      console.error('Error setting up audio mode:', error);
    }
  }

  private async initializeTempDir() {
    try {
      this.tempDir = `${FileSystem.documentDirectory}audio_stream/`;
      const dirInfo = await FileSystem.getInfoAsync(this.tempDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.tempDir, { intermediates: true });
      }
    } catch (error) {
      console.error('Error creating temp directory:', error);
    }
  }

  async addAudioChunk(chunk: AudioPlaybackChunk) {
    this.audioQueue.push(chunk);
    this.emit('chunkAdded', { queueLength: this.audioQueue.length });
    
    // Start playback if we have enough buffered chunks and not already playing
    if (this.audioQueue.length >= this.bufferSize && !this.isPlaying) {
      await this.startPlayback();
    }
  }

  private async startPlayback() {
    if (this.isPlaying || this.audioQueue.length === 0) {
      return;
    }

    this.isPlaying = true;
    this.emit('playbackStarted');
    
    try {
      await this.playNextChunk();
    } catch (error) {
      console.error('Error starting playback:', error);
      this.emit('error', { message: 'Failed to start playback', error });
      this.isPlaying = false;
    }
  }

  private async playNextChunk() {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      this.emit('playbackCompleted');
      return;
    }

    const chunk = this.audioQueue.shift();
    if (!chunk) {
      await this.playNextChunk();
      return;
    }

    try {
      // Convert base64 PCM to playable audio file
      const audioUri = await this.createPlayableAudioFile(chunk);
      if (!audioUri) {
        // Skip this chunk and play next
        await this.playNextChunk();
        return;
      }

      // Clean up previous sound
      if (this.currentSound) {
        await this.currentSound.unloadAsync();
      }

      // Create and play sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        {
          shouldPlay: true,
          volume: this.volume,
          rate: this.playbackRate,
        }
      );

      this.currentSound = sound;
      
      // Set up playback completion handler
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          this.onChunkPlaybackComplete(audioUri);
        }
      });

      this.emit('chunkPlaying', { 
        timestamp: chunk.timestamp,
        queueLength: this.audioQueue.length 
      });

    } catch (error) {
      console.error('Error playing audio chunk:', error);
      this.emit('error', { message: 'Failed to play audio chunk', error });
      // Continue with next chunk
      await this.playNextChunk();
    }
  }

  private async onChunkPlaybackComplete(audioUri: string) {
    try {
      // Clean up temporary file
      await FileSystem.deleteAsync(audioUri, { idempotent: true });
      
      // Play next chunk in queue
      await this.playNextChunk();
    } catch (error) {
      console.error('Error on chunk playback complete:', error);
    }
  }

  private async createPlayableAudioFile(chunk: AudioPlaybackChunk): Promise<string | null> {
    try {
      // Convert base64 PCM to WAV format
      const wavData = this.convertPCMToWAV(
        chunk.data, 
        chunk.sampleRate, 
        chunk.channels
      );
      
      if (!wavData) {
        return null;
      }

      // Write to temporary file
      const fileName = `audio_chunk_${chunk.timestamp}.wav`;
      const filePath = `${this.tempDir}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, wavData, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return filePath;
    } catch (error) {
      console.error('Error creating playable audio file:', error);
      return null;
    }
  }

  private convertPCMToWAV(base64PCM: string, sampleRate: number, channels: number): string | null {
    try {
      // Decode base64 PCM data
      const binaryString = atob(base64PCM);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create WAV header
      const dataLength = bytes.length;
      const fileLength = 44 + dataLength;
      const buffer = new ArrayBuffer(fileLength);
      const view = new DataView(buffer);
      
      // WAV header
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      writeString(0, 'RIFF');
      view.setUint32(4, fileLength - 8, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true); // Format chunk size
      view.setUint16(20, 1, true); // PCM format
      view.setUint16(22, channels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * channels * 2, true); // Byte rate
      view.setUint16(32, channels * 2, true); // Block align
      view.setUint16(34, 16, true); // Bits per sample
      writeString(36, 'data');
      view.setUint32(40, dataLength, true);

      // Copy PCM data
      const wavBytes = new Uint8Array(buffer);
      wavBytes.set(bytes, 44);

      // Convert to base64 for file writing
      let binary = '';
      for (let i = 0; i < wavBytes.byteLength; i++) {
        binary += String.fromCharCode(wavBytes[i]);
      }
      
      return btoa(binary);
    } catch (error) {
      console.error('Error converting PCM to WAV:', error);
      return null;
    }
  }

  async stop() {
    this.isPlaying = false;
    this.audioQueue = [];
    
    if (this.currentSound) {
      try {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
        this.currentSound = null;
      } catch (error) {
        console.error('Error stopping audio:', error);
      }
    }
    
    // Clean up temporary files
    await this.cleanupTempFiles();
    
    this.emit('playbackStopped');
  }

  async pause() {
    if (this.currentSound && this.isPlaying) {
      try {
        await this.currentSound.pauseAsync();
        this.emit('playbackPaused');
      } catch (error) {
        console.error('Error pausing audio:', error);
        this.emit('error', { message: 'Failed to pause audio', error });
      }
    }
  }

  async resume() {
    if (this.currentSound && this.isPlaying) {
      try {
        await this.currentSound.playAsync();
        this.emit('playbackResumed');
      } catch (error) {
        console.error('Error resuming audio:', error);
        this.emit('error', { message: 'Failed to resume audio', error });
      }
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.currentSound) {
      this.currentSound.setVolumeAsync(this.volume);
    }
  }

  setPlaybackRate(rate: number) {
    this.playbackRate = Math.max(0.5, Math.min(2.0, rate));
    if (this.currentSound) {
      this.currentSound.setRateAsync(this.playbackRate, true);
    }
  }

  private async cleanupTempFiles() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.tempDir);
      if (dirInfo.exists && dirInfo.isDirectory) {
        const files = await FileSystem.readDirectoryAsync(this.tempDir);
        for (const file of files) {
          await FileSystem.deleteAsync(`${this.tempDir}${file}`, { idempotent: true });
        }
      }
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }

  getStatus() {
    return {
      isPlaying: this.isPlaying,
      queueLength: this.audioQueue.length,
      volume: this.volume,
      playbackRate: this.playbackRate,
    };
  }

  clear() {
    this.audioQueue = [];
    this.emit('queueCleared');
  }

  async cleanup() {
    await this.stop();
    await this.cleanupTempFiles();
    this.removeAllListeners();
  }
} 
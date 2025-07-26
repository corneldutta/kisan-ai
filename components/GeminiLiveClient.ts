import { EventEmitter } from 'events';

export interface LiveMessage {
  id: string;
  text?: string;
  audioData?: string; // base64 encoded audio
  imageData?: string; // base64 encoded image
  timestamp: Date;
  isUser: boolean;
  isVoice?: boolean;
}

export interface GeminiLiveConfig {
  serverUrl: string;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

export class GeminiLiveClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: GeminiLiveConfig;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private isConnecting = false;
  private isConnected = false;
  private messageQueue: any[] = [];

  constructor(config: GeminiLiveConfig) {
    super();
    this.config = config;
    this.maxReconnectAttempts = config.reconnectAttempts || 5;
    this.reconnectDelay = config.reconnectDelay || 2000;
  }

  async connect(): Promise<boolean> {
    if (this.isConnecting || this.isConnected) {
      return true;
    }

    this.isConnecting = true;
    
    try {
      this.ws = new WebSocket(this.config.serverUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        // Send any queued messages
        this.flushMessageQueue();
        
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        this.isConnected = false;
        this.isConnecting = false;
        
        this.emit('disconnected', { code: event.code, reason: event.reason });
        
        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect();
        }
      };

      return true;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.isConnecting = false;
      this.emit('error', error);
      return false;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  private handleMessage(data: string) {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'ready':
          this.emit('ready');
          break;
          
        case 'audio':
          this.emit('audioData', message.data);
          break;
          
        case 'text':
          this.emit('textData', message.data);
          break;
          
        case 'turn_complete':
          this.emit('turnComplete');
          break;
          
        case 'interrupted':
          this.emit('interrupted', message.data);
          break;
          
        case 'function_call':
          this.emit('functionCall', message.data);
          break;
          
        case 'function_response':
          this.emit('functionResponse', message.data);
          break;
          
        case 'error':
          this.emit('error', message.data);
          break;
          
        case 'transcription':
          this.emit('transcription', message.data);
          break;
          
        case 'image_analysis':
          this.emit('imageAnalysis', message.data);
          break;
          
        default:
          console.log('Unknown message type:', message.type);
          break;
      }
    } catch (error) {
      console.error('Error parsing message:', error);
      this.emit('error', { message: 'Failed to parse server message', error });
    }
  }

  sendAudioChunk(audioData: string) {
    const message = {
      type: 'audio_chunk',
      data: audioData,
      timestamp: Date.now()
    };
    
    this.sendMessage(message);
  }

  sendImage(imageData: string, prompt?: string) {
    const message = {
      type: 'image',
      data: {
        image: imageData,
        prompt: prompt || 'Analyze this crop image for diseases or issues'
      },
      timestamp: Date.now()
    };
    
    this.sendMessage(message);
  }

  sendText(text: string) {
    const message = {
      type: 'text',
      data: text,
      timestamp: Date.now()
    };
    
    this.sendMessage(message);
  }

  sendInterrupt() {
    const message = {
      type: 'interrupt',
      timestamp: Date.now()
    };
    
    this.sendMessage(message);
  }

  private sendMessage(message: any) {
    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for later sending
      this.messageQueue.push(message);
      
      // Attempt to connect if not connected
      if (!this.isConnected && !this.isConnecting) {
        this.connect();
      }
    }
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
      }
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client initiated disconnect');
      this.ws = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
    this.messageQueue = [];
  }

  isReady(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }
} 
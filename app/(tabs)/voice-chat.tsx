import { ConnectivityBanner } from '@/components/ConnectivityBanner';
import { useConnectivity } from '@/components/ConnectivityContext';
import { Message, useConversation } from '@/components/ConversationContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { useRef, useState, useEffect } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function VoiceChatScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { messages, addMessage } = useConversation();
  const router = useRouter();
  const { isConnected, isInternetReachable } = useConnectivity();
  const isOnline = isConnected && isInternetReachable !== false;
  const MAX_RECORDING_TIME = 15; // 15 seconds

  const startRecording = async () => {
    if (!isOnline) {
      Alert.alert(
        'No Internet Connection',
        'Voice recording requires an internet connection. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Clean up any existing recording
      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch (error) {
          console.log('Error cleaning up previous recording:', error);
        }
        recordingRef.current = null;
      }

      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant microphone permission');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = newRecording;
      setRecording(newRecording);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= MAX_RECORDING_TIME) {
            stopRecording();
            return MAX_RECORDING_TIME;
          }
          return newTime;
        });
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const pauseRecording = async () => {
    if (recordingRef.current && isRecording && !isPaused) {
      try {
        await recordingRef.current.pauseAsync();
        setIsPaused(true);
        // Pause timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } catch (err) {
        console.error('Failed to pause recording', err);
      }
    }
  };

  const resumeRecording = async () => {
    if (recordingRef.current && isRecording && isPaused) {
      try {
        await recordingRef.current.startAsync();
        setIsPaused(false);
        // Resume timer
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => {
            const newTime = prev + 1;
            if (newTime >= MAX_RECORDING_TIME) {
              stopRecording();
              return MAX_RECORDING_TIME;
            }
            return newTime;
          });
        }, 1000);
      } catch (err) {
        console.error('Failed to resume recording', err);
      }
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setRecording(null);
      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);

      if (uri) {
        setIsProcessing(true);
        
        // Add user voice message to conversation
        const userMessage: Message = {
          id: Date.now().toString(),
          text: '',
          isUser: true,
          timestamp: new Date(),
          isVoice: true,
          audioUri: uri,
        };
        addMessage(userMessage);

        try {
          // Send audio to API
          await sendAudioToAPI(uri);
        } catch (error) {
          console.error('Error processing audio:', error);
          // Add error message
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: "Couldn't process audio message. Try again.",
            isUser: false,
            timestamp: new Date(),
          };
          addMessage(errorMessage);
        } finally {
          setIsProcessing(false);
        }
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Failed to stop recording');
      setIsProcessing(false);
    }
  };

  const playAudio = async (audioUri: string) => {
    try {
      // Stop any currently playing audio
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      soundRef.current = sound;
      setPlayingAudio(audioUri);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingAudio(null);
        }
      });

      await sound.playAsync();
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio');
    }
  };

  const stopAudio = async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setPlayingAudio(null);
    }
  };

  const sendAudioToAPI = async (audioUri: string) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Create file object for upload
      const audioFile = {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'voice_message.m4a',
      } as any;
      
      formData.append('audio', audioFile);

      const response = await fetch('https://fastapi-service-666271187622.us-central1.run.app/api/voice-note-audio', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Get the audio response as array buffer
        const audioArrayBuffer = await response.arrayBuffer();
        
        // Convert to base64
        const uint8Array = new Uint8Array(audioArrayBuffer);
        let binary = '';
        for (let i = 0; i < uint8Array.length; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        const base64Audio = btoa(binary);
        
        // Save the response audio to local file
        const responseAudioPath = `${FileSystem.documentDirectory}response_${Date.now()}.wav`;
        
        await FileSystem.writeAsStringAsync(responseAudioPath, base64Audio, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        // Add AI response message with audio
        const aiMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: '',
          isUser: false,
          timestamp: new Date(),
          isVoice: true,
          audioUri: responseAudioPath,
        };
        addMessage(aiMessage);
        
        // Auto-play the response after a short delay
        setTimeout(() => {
          playAudio(responseAudioPath);
        }, 500);
      } else {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const switchToTextMode = () => {
    router.push('/(tabs)/text-chat');
  };

  const handleMenuPress = () => {
    Alert.alert('Menu', 'Opening side menu...');
  };

  const handleSearchPress = () => {
    Alert.alert('Search', 'Opening search...');
  };

  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'Opening notifications...');
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          message.isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        {message.imageUri && (
          <Image source={{ uri: message.imageUri }} style={styles.messageImage} />
        )}
        <Text
          style={[
            styles.messageText,
            message.isUser ? styles.userText : styles.aiText,
          ]}
        >
          {message.text}
        </Text>
        {message.audioUri && (
          <TouchableOpacity
            style={styles.audioButton}
            onPress={() => {
              if (playingAudio === message.audioUri) {
                stopAudio();
              } else {
                playAudio(message.audioUri!);
              }
            }}
          >
            <IconSymbol 
              name={playingAudio === message.audioUri ? "stop.fill" : "play.fill"} 
              size={20} 
              color={message.isUser ? "#FFFFFF" : "#31A05F"} 
            />
            <Text style={[styles.audioText, { color: message.isUser ? "#FFFFFF" : "#31A05F" }]}>
              {playingAudio === message.audioUri ? "Stop" : "Play"}
            </Text>
          </TouchableOpacity>
        )}
        {message.isVoice && !message.audioUri && (
          <IconSymbol 
            name="speaker.wave.2.fill" 
            size={16} 
            color={message.isUser ? "#FFFFFF" : "#4B4B4B"} 
            style={styles.voiceIcon}
          />
        )}
      </View>
      <Text style={styles.timestamp}>
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ConnectivityBanner />
      {/* Top Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
          <IconSymbol name="line.3.horizontal" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Kisan Mitra</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={handleSearchPress}>
            <IconSymbol name="magnifyingglass" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleNotificationPress}>
            <IconSymbol name="bell" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Messages */}
      <ScrollView style={styles.chatContainer} contentContainerStyle={styles.chatContent}>
        {messages.map(renderMessage)}
      </ScrollView>

      {/* Voice Recording Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={styles.textButton} 
          onPress={switchToTextMode}
        >
          <IconSymbol name="text.bubble" size={24} color="#31A05F" />
        </TouchableOpacity>
        
        <View style={styles.recordingControls}>
          {!isRecording ? (
            <TouchableOpacity
              style={[
                styles.recordButton,
                (!isOnline || isProcessing) && styles.recordButtonDisabled
              ]}
              onPress={startRecording}
              disabled={!isOnline || isProcessing}
            >
              {isProcessing ? (
                <IconSymbol name="hourglass" size={32} color="#FFFFFF" />
              ) : (
                <IconSymbol name="mic.fill" size={32} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.recordingActiveControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={isPaused ? resumeRecording : pauseRecording}
              >
                <IconSymbol 
                  name={isPaused ? "play.fill" : "pause.fill"} 
                  size={24} 
                  color="#31A05F" 
                />
              </TouchableOpacity>
              
              <View style={styles.timerContainer}>
                <Text style={styles.timerText}>
                  {recordingTime}s / {MAX_RECORDING_TIME}s
                </Text>
                {recordingTime >= MAX_RECORDING_TIME - 3 && (
                  <Text style={styles.warningText}>Time limit reached!</Text>
                )}
              </View>
              
              <TouchableOpacity
                style={styles.stopButton}
                onPress={stopRecording}
              >
                <IconSymbol name="xmark" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <View style={{ width: 40 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFEF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#31A05F',
    paddingTop: 50,
  },
  menuButton: {
    padding: 8,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#EFEFEF',
  },
  chatContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 4,
  },
  userBubble: {
    backgroundColor: '#31A05F',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'System',
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#4B4B4B',
  },
  timestamp: {
    fontSize: 12,
    color: '#4B4B4B',
    marginHorizontal: 8,
    fontFamily: 'System',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#D3EDDF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  textButton: {
    padding: 8,
  },
  recordingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  recordingActiveControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timerContainer: {
    alignItems: 'center',
    minWidth: 80,
  },
  timerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#31A05F',
    fontFamily: 'System',
  },
  warningText: {
    fontSize: 10,
    color: '#FF6B35',
    fontFamily: 'System',
    marginTop: 2,
  },
  recordButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#31A05F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  recordButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#31A05F',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stopButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  voiceIcon: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  messageImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#31A05F',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 8,
  },
  audioText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'System',
  },
}); 
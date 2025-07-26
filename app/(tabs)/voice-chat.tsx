import { IconSymbol } from '@/components/ui/IconSymbol';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useRef, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isVoice?: boolean;
}

export default function VoiceChatScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I am your Kisan Mitra. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const startRecording = async () => {
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
      } catch (err) {
        console.error('Failed to resume recording', err);
      }
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      setIsRecording(false);
      setIsPaused(false);
      
      const currentRecording = recordingRef.current;
      recordingRef.current = null;
      setRecording(null);
      
      await currentRecording.stopAndUnloadAsync();
      const uri = currentRecording.getURI();
      
      // Simulate voice message processing
      const newMessage: Message = {
        id: Date.now().toString(),
        text: "I heard your question about crop diseases. Let me analyze this...",
        isUser: true,
        timestamp: new Date(),
        isVoice: true,
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "Based on your description, it sounds like a fungal infection. I recommend using copper-based fungicide. Apply it early morning or evening. Would you like specific product recommendations available in your area?",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
        
        // Speak the response
        Speech.speak(aiResponse.text, { language: 'en' });
      }, 2000);
      
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const switchToTextMode = () => {
    Alert.alert('Switch to Text', 'Switching to text mode...');
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
        <Text
          style={[
            styles.messageText,
            message.isUser ? styles.userText : styles.aiText,
          ]}
        >
          {message.text}
        </Text>
        {message.isVoice && (
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
          style={[styles.controlButton, styles.pauseButton]}
          onPress={isPaused ? resumeRecording : pauseRecording}
          disabled={!isRecording}
        >
          <IconSymbol 
            name={isPaused ? "play.fill" : "pause.fill"} 
            size={24} 
            color={isRecording ? "#31A05F" : "#4B4B4B"} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordingButton]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <IconSymbol 
            name={isRecording ? "xmark" : "mic.fill"} 
            size={32} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlButton, styles.switchButton]} 
          onPress={switchToTextMode}
        >
          <IconSymbol name="text.bubble" size={24} color="#31A05F" />
        </TouchableOpacity>
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
    paddingBottom: 100,
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
  voiceIcon: {
    marginTop: 4,
    alignSelf: 'flex-end',
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
    justifyContent: 'space-around',
    paddingHorizontal: 32,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#D3EDDF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pauseButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D3EDDF',
  },
  recordButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EF9920',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  recordingButton: {
    backgroundColor: '#EF9920',
    transform: [{ scale: 1.1 }],
  },
  switchButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D3EDDF',
  },
}); 
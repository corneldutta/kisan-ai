import { useConnectivity } from '@/components/ConnectivityContext';
import { Message, useConversation } from '@/components/ConversationContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Audio } from 'expo-av';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function TextChatScreen() {
  const [inputText, setInputText] = useState('');
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const { messages, addMessage } = useConversation();
  const { isConnected, isInternetReachable } = useConnectivity();
  const router = useRouter();

  // Check if we're in offline mode
  const isOffline = !isConnected || !isInternetReachable;

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

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    addMessage(newMessage);
    const userInput = inputText.trim();
    setInputText('');

    // If offline, send SMS instead of API call
    if (isOffline) {
      try {
        const phoneNumber = '+12184174439';
        const message = encodeURIComponent(userInput);
        const smsUrl = `sms:${phoneNumber}?body=${message}`;
        
        const canOpen = await Linking.canOpenURL(smsUrl);
        if (canOpen) {
          await Linking.openURL(smsUrl);
          
          // Add a confirmation message
          const smsSentMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: `📱 Message sent via SMS. You'll receive a response in the SMS app.`,
            isUser: false,
            timestamp: new Date(),
          };
          addMessage(smsSentMessage);
        } else {
          // Fallback: just open SMS app with the number
          const fallbackUrl = `sms:${phoneNumber}`;
          await Linking.openURL(fallbackUrl);
          
          const fallbackMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: `📱 SMS app opened. Please manually type: "${userInput}" and send to ${phoneNumber}`,
            isUser: false,
            timestamp: new Date(),
          };
          addMessage(fallbackMessage);
        }
      } catch (error) {
        console.error('SMS error:', error);
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: `Error: Failed to open SMS app. Please manually send "${userInput}"`,
          isUser: false,
          timestamp: new Date(),
        };
        addMessage(errorResponse);
      }
      return;
    }

    // Online mode - Make API call
    try {
      const formData = new FormData();
      formData.append('From', '7619436585'); // Hardcoded phone number as requested
      formData.append('Body', userInput);

      console.log(userInput);

      const response = await fetch('https://fastapi-service-666271187622.us-central1.run.app/sms', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const responseData = await response.text();
        // Extract message content from XML response
        const messageMatch = responseData.match(/<Message>([^]*?)<\/Message>/);
        const messageContent = messageMatch ? messageMatch[1].trim() : responseData;
        
        const apiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: messageContent,
          isUser: false,
          timestamp: new Date(),
        };
        addMessage(apiResponse);
      } else {
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: `Error: ${response.status} - ${response.statusText}`,
          isUser: false,
          timestamp: new Date(),
        };
        addMessage(errorResponse);
      }
    } catch (error) {
      console.error('API call error:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `Error: Failed to connect to the API. Please try again.`,
        isUser: false,
        timestamp: new Date(),
      };
      addMessage(errorResponse);
    }
  };



  const switchToVoiceMode = () => {
    router.push('/(tabs)/voice-chat');
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
      {/* Top Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
          <IconSymbol name="line.3.horizontal" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Kisan Mitra</Text>
          {isOffline && (
            <View style={styles.offlineIndicator}>
              <IconSymbol name="wifi.slash" size={12} color="#FFD700" />
              <Text style={styles.offlineText}>SMS Mode</Text>
            </View>
          )}
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

      <KeyboardAvoidingView 
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Chat Messages */}
        <ScrollView style={styles.chatContainer} contentContainerStyle={styles.chatContent}>
          {messages.map(renderMessage)}
        </ScrollView>

        {/* Text Input Controls */}
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.voiceButton} 
            onPress={switchToVoiceMode}
          >
            <IconSymbol name="mic.fill" size={24} color="#31A05F" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={isOffline ? "Type message to send via SMS..." : "Type your message..."}
            placeholderTextColor="#4B4B4B"
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity
            style={[styles.sendButton, inputText.trim() ? styles.sendButtonActive : {}]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <IconSymbol 
              name={isOffline ? "message.fill" : "paperplane.fill"}
              size={20} 
              color={inputText.trim() ? "#FFFFFF" : "#4B4B4B"} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Offline SMS Info */}
        {isOffline && (
          <View style={styles.offlineInfoContainer}>
            <IconSymbol name="info.circle.fill" size={16} color="#FF6B35" />
            <Text style={styles.offlineInfoText}>
              Messages will be sent via SMS
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFEF',
  },
  flex: {
    flex: 1,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#D3EDDF',
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D3EDDF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#EFEFEF',
    color: '#4B4B4B',
    fontFamily: 'System',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D3EDDF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonActive: {
    backgroundColor: '#31A05F',
  },
  voiceButton: {
    padding: 8,
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
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  offlineText: {
    fontSize: 10,
    color: '#FFD700',
    marginLeft: 4,
    fontWeight: '600',
    fontFamily: 'System',
  },
  offlineInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#FFE0B2',
  },
  offlineInfoText: {
    fontSize: 12,
    color: '#E65100',
    marginLeft: 8,
    fontFamily: 'System',
    flex: 1,
  },
}); 
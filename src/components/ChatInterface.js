import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SpeechService from '../services/SpeechService';

export default function ChatInterface({ messages, onSendMessage, showBilingualText = false }) {
    const [inputText, setInputText] = useState('');
    const flatListRef = useRef(null);

    useEffect(() => {
        // Scroll to bottom when new messages arrive
        if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const handleSend = () => {
        if (inputText.trim()) {
            onSendMessage(inputText.trim());
            setInputText('');
        }
    };

    const handleSpeakMessage = (text) => {
        const language = SpeechService.detectLanguage(text);
        SpeechService.speakWithExpo(text, language);
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderMessage = ({ item }) => (
        <View style={[
            styles.messageContainer,
            item.isBot ? styles.botMessage : styles.userMessage
        ]}>
            <View style={[
                styles.messageBubble,
                item.isBot ? styles.botBubble : styles.userBubble
            ]}>
                <Text style={[
                    styles.messageText,
                    item.isBot ? styles.botText : styles.userText
                ]}>
                    {item.text}
                </Text>
                {showBilingualText && item.textEnglish && item.isBot && (
                    <Text style={[
                        styles.messageTextEnglish,
                        styles.botTextEnglish
                    ]}>
                        {item.textEnglish}
                    </Text>
                )}
                <View style={styles.messageFooter}>
                    <Text style={styles.messageTime}>
                        {formatTime(item.timestamp)}
                    </Text>
                    {item.isBot && (
                        <TouchableOpacity
                            style={styles.speakButton}
                            onPress={() => handleSpeakMessage(item.text)}
                        >
                            <Ionicons name="volume-high" size={14} color="#666" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id.toString()}
                style={styles.messagesList}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Type your message... / ನಿಮ್ಮ ಸಂದೇಶ ಟೈಪ್ ಮಾಡಿ..."
                    placeholderTextColor="#999"
                    multiline
                    maxLength={500}
                    onSubmitEditing={handleSend}
                    returnKeyType="send"
                />
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        { opacity: inputText.trim() ? 1 : 0.5 }
                    ]}
                    onPress={handleSend}
                    disabled={!inputText.trim()}
                >
                    <Ionicons name="send" size={20} color="white" />
                </TouchableOpacity>
            </View>

            {/* Quick Reply Buttons */}
            <View style={styles.quickReplies}>
                <TouchableOpacity
                    style={styles.quickReplyButton}
                    onPress={() => onSendMessage('ಬೆಳೆ ರೋಗ ತಿಳಿಸಿ')}
                >
                    <Text style={styles.quickReplyText}>🌱 Crop Disease</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.quickReplyButton}
                    onPress={() => onSendMessage('ಇಂದಿನ ಬೆಲೆ')}
                >
                    <Text style={styles.quickReplyText}>💰 Market Price</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.quickReplyButton}
                    onPress={() => onSendMessage('ಹವಾಮಾನ ಮಾಹಿತಿ')}
                >
                    <Text style={styles.quickReplyText}>🌤️ Weather</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    messagesList: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    messageContainer: {
        marginVertical: 3,
        maxWidth: '80%',
    },
    botMessage: {
        alignSelf: 'flex-start',
    },
    userMessage: {
        alignSelf: 'flex-end',
    },
    messageBubble: {
        padding: 12,
        borderRadius: 18,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    botBubble: {
        backgroundColor: '#e3f2fd',
        borderBottomLeftRadius: 4,
    },
    userBubble: {
        backgroundColor: '#4CAF50',
        borderBottomRightRadius: 4,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
    },
    messageTextEnglish: {
        fontSize: 12,
        lineHeight: 16,
        marginTop: 5,
        fontStyle: 'italic',
    },
    botText: {
        color: '#1565c0',
    },
    botTextEnglish: {
        color: '#1976d2',
        opacity: 0.8,
    },
    userText: {
        color: 'white',
    },
    messageFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },
    messageTime: {
        fontSize: 10,
        color: '#666',
        opacity: 0.7,
    },
    speakButton: {
        padding: 2,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 8,
        maxHeight: 100,
        fontSize: 14,
        backgroundColor: '#f5f5f5',
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    quickReplies: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: 'white',
        justifyContent: 'space-around',
    },
    quickReplyButton: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    quickReplyText: {
        fontSize: 11,
        color: '#333',
        fontWeight: '500',
    },
});
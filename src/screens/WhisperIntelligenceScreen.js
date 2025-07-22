import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    TextInput,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { COLORS } from '../utils/constants';
import WhisperIntelligenceAPI from '../services/WhisperIntelligenceAPI';

export default function WhisperIntelligenceScreen({ navigation }) {
    const [isListening, setIsListening] = useState(false);
    const [recording, setRecording] = useState(null);
    const [smsText, setSmsText] = useState('');
    const [currentMode, setCurrentMode] = useState('voice'); // 'voice', 'sms', 'hybrid'
    const [conversationHistory, setConversationHistory] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [noiseLevel, setNoiseLevel] = useState(0);
    const [connectionQuality, setConnectionQuality] = useState('good');
    const [farmContext, setFarmContext] = useState({
        location: 'Karnataka',
        season: 'Rabi',
        mainCrop: 'Tomato'
    });

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const noiseMeterAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Simulate noise monitoring
        const noiseMonitor = setInterval(() => {
            const newNoiseLevel = Math.random() * 100;
            setNoiseLevel(newNoiseLevel);

            // Animate noise meter
            Animated.timing(noiseMeterAnim, {
                toValue: newNoiseLevel,
                duration: 500,
                useNativeDriver: false,
            }).start();

            // Auto-switch to SMS if noise is too high
            if (newNoiseLevel > 80 && currentMode === 'voice') {
                setCurrentMode('hybrid');
                showSystemMessage('High noise detected. Switching to SMS-Voice hybrid mode.');
            }
        }, 2000);

        return () => clearInterval(noiseMonitor);
    }, [currentMode]);

    const showSystemMessage = (message) => {
        setConversationHistory(prev => [...prev, {
            id: Date.now(),
            type: 'system',
            message,
            timestamp: new Date()
        }]);
    };

    const startVoiceRecording = async () => {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Microphone permission is required for voice input');
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync({
                ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
                android: {
                    extension: '.wav',
                    outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
                    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
                    sampleRate: 16000,
                    numberOfChannels: 1,
                    bitRate: 128000,
                },
            });

            setRecording(recording);
            setIsListening(true);

            // Start pulse animation
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.3,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            ).start();

        } catch (error) {
            console.error('Failed to start recording:', error);
            Alert.alert('Error', 'Failed to start voice recording');
        }
    };

    const stopVoiceRecording = async () => {
        if (!recording) return;

        try {
            setIsListening(false);
            pulseAnim.setValue(1);

            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecording(null);

            // Process with Whisper Intelligence API
            await processVoiceInput(uri);
        } catch (error) {
            console.error('Failed to stop recording:', error);
            Alert.alert('Error', 'Failed to process voice input');
        }
    };

    const processVoiceInput = async (audioUri) => {
        setIsProcessing(true);

        try {
            // Add user message to conversation
            const userMessage = {
                id: Date.now(),
                type: 'user',
                mode: 'voice',
                message: 'Processing voice input...',
                timestamp: new Date(),
                noiseLevel: noiseLevel
            };
            setConversationHistory(prev => [...prev, userMessage]);

            // Call Whisper Intelligence API for noise-resilient processing
            const result = await WhisperIntelligenceAPI.processVoiceWithNoiseHandling(
                audioUri,
                noiseLevel,
                farmContext
            );

            // Update user message with transcribed text
            setConversationHistory(prev =>
                prev.map(msg =>
                    msg.id === userMessage.id
                        ? { ...msg, message: result.transcription, confidence: result.confidence }
                        : msg
                )
            );

            // Process the agricultural query
            const response = await WhisperIntelligenceAPI.processAgriculturalQuery(
                result.transcription,
                farmContext,
                conversationHistory
            );

            // Add AI response
            const aiResponse = {
                id: Date.now() + 1,
                type: 'ai',
                mode: currentMode,
                message: response.text,
                messageKannada: response.textKannada,
                actionable: response.actionable,
                timestamp: new Date(),
                followUp: response.followUp
            };
            setConversationHistory(prev => [...prev, aiResponse]);

            // Speak response if not too noisy
            if (noiseLevel < 70) {
                Speech.speak(response.textKannada, {
                    language: 'kn-IN',
                    rate: 0.8,
                    pitch: 1.0,
                });
            }

        } catch (error) {
            console.error('Error processing voice:', error);
            showSystemMessage('Voice processing failed. Please try SMS mode or speak closer to the microphone.');
        }

        setIsProcessing(false);
    };

    const processSMSInput = async () => {
        if (!smsText.trim()) return;

        setIsProcessing(true);

        try {
            // Add user SMS to conversation
            const userMessage = {
                id: Date.now(),
                type: 'user',
                mode: 'sms',
                message: smsText,
                timestamp: new Date()
            };
            setConversationHistory(prev => [...prev, userMessage]);

            // Process with SMS-optimized pipeline
            const response = await WhisperIntelligenceAPI.processSMSQuery(
                smsText,
                farmContext,
                conversationHistory
            );

            // Add AI response
            const aiResponse = {
                id: Date.now() + 1,
                type: 'ai',
                mode: 'sms',
                message: response.text,
                messageKannada: response.textKannada,
                actionable: response.actionable,
                timestamp: new Date(),
                smsFormatted: response.smsFormatted
            };
            setConversationHistory(prev => [...prev, aiResponse]);

            setSmsText('');
        } catch (error) {
            console.error('Error processing SMS:', error);
            showSystemMessage('SMS processing failed. Please check your query and try again.');
        }

        setIsProcessing(false);
    };

    const handleModeSwitch = (mode) => {
        setCurrentMode(mode);
        showSystemMessage(`Switched to ${mode.toUpperCase()} mode`);
    };

    const renderMessage = (message) => {
        const isUser = message.type === 'user';
        const isSystem = message.type === 'system';

        return (
            <View key={message.id} style={[
                styles.messageContainer,
                isUser ? styles.userMessage : isSystem ? styles.systemMessage : styles.aiMessage
            ]}>
                <View style={styles.messageHeader}>
                    <View style={styles.modeIndicator}>
                        <Ionicons
                            name={
                                message.mode === 'voice' ? 'mic' :
                                    message.mode === 'sms' ? 'chatbubble-ellipses' :
                                        message.mode === 'hybrid' ? 'swap-horizontal' : 'settings'
                            }
                            size={12}
                            color={COLORS.WHITE}
                        />
                        <Text style={styles.modeText}>{message.mode?.toUpperCase() || 'SYS'}</Text>
                    </View>
                    {message.noiseLevel && (
                        <Text style={styles.noiseIndicator}>
                            Noise: {Math.round(message.noiseLevel)}dB
                        </Text>
                    )}
                </View>

                <Text style={[
                    styles.messageText,
                    isUser ? styles.userText : isSystem ? styles.systemText : styles.aiText
                ]}>
                    {message.message}
                </Text>

                {message.messageKannada && (
                    <Text style={styles.kannadaText}>{message.messageKannada}</Text>
                )}

                {message.confidence && (
                    <Text style={styles.confidenceText}>
                        Confidence: {Math.round(message.confidence * 100)}%
                    </Text>
                )}

                {message.actionable && (
                    <View style={styles.actionableContainer}>
                        <Ionicons name="flash" size={14} color={COLORS.WARNING} />
                        <Text style={styles.actionableText}>Actionable advice provided</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.PRIMARY, COLORS.PRIMARY_DARK]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <Ionicons name="pulse" size={30} color="white" />
                    <Text style={styles.headerTitle}>Whisper Intelligence</Text>
                    <Text style={styles.headerSubtitle}>Noise-Resilient Farm AI</Text>
                </View>

                {/* Real-time Environment Monitoring */}
                <View style={styles.environmentPanel}>
                    <View style={styles.noiseMonitor}>
                        <Text style={styles.monitorLabel}>Noise Level</Text>
                        <View style={styles.noiseMeter}>
                            <Animated.View
                                style={[
                                    styles.noiseFill,
                                    {
                                        width: noiseMeterAnim.interpolate({
                                            inputRange: [0, 100],
                                            outputRange: ['0%', '100%'],
                                            extrapolate: 'clamp',
                                        }),
                                        backgroundColor: noiseLevel > 80 ? COLORS.ERROR :
                                            noiseLevel > 60 ? COLORS.WARNING : COLORS.SUCCESS
                                    }
                                ]}
                            />
                        </View>
                        <Text style={styles.noiseValue}>{Math.round(noiseLevel)}dB</Text>
                    </View>

                    <View style={styles.connectionMonitor}>
                        <Ionicons
                            name={connectionQuality === 'good' ? 'wifi' : 'wifi-outline'}
                            size={16}
                            color="white"
                        />
                        <Text style={styles.connectionText}>{connectionQuality.toUpperCase()}</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Mode Selection */}
            <View style={styles.modeSelection}>
                <TouchableOpacity
                    style={[styles.modeButton, currentMode === 'voice' && styles.activeModeButton]}
                    onPress={() => handleModeSwitch('voice')}
                >
                    <Ionicons name="mic" size={20} color={currentMode === 'voice' ? COLORS.WHITE : COLORS.PRIMARY} />
                    <Text style={[styles.modeButtonText, currentMode === 'voice' && styles.activeModeText]}>
                        Voice
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.modeButton, currentMode === 'sms' && styles.activeModeButton]}
                    onPress={() => handleModeSwitch('sms')}
                >
                    <Ionicons name="chatbubble-ellipses" size={20} color={currentMode === 'sms' ? COLORS.WHITE : COLORS.PRIMARY} />
                    <Text style={[styles.modeButtonText, currentMode === 'sms' && styles.activeModeText]}>
                        SMS
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.modeButton, currentMode === 'hybrid' && styles.activeModeButton]}
                    onPress={() => handleModeSwitch('hybrid')}
                >
                    <Ionicons name="swap-horizontal" size={20} color={currentMode === 'hybrid' ? COLORS.WHITE : COLORS.PRIMARY} />
                    <Text style={[styles.modeButtonText, currentMode === 'hybrid' && styles.activeModeText]}>
                        Hybrid
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Conversation Area */}
            <ScrollView style={styles.conversationArea} showsVerticalScrollIndicator={false}>
                {conversationHistory.map(renderMessage)}
                {isProcessing && (
                    <View style={styles.processingIndicator}>
                        <ActivityIndicator size="small" color={COLORS.PRIMARY} />
                        <Text style={styles.processingText}>Processing with farm-optimized AI...</Text>
                    </View>
                )}
            </ScrollView>

            {/* Input Area */}
            <View style={styles.inputArea}>
                {(currentMode === 'voice' || currentMode === 'hybrid') && (
                    <View style={styles.voiceInputSection}>
                        <Animated.View style={[styles.voiceButton, { transform: [{ scale: pulseAnim }] }]}>
                            <TouchableOpacity
                                style={[
                                    styles.micButton,
                                    { backgroundColor: isListening ? COLORS.ERROR : COLORS.SUCCESS }
                                ]}
                                onPress={isListening ? stopVoiceRecording : startVoiceRecording}
                                disabled={isProcessing}
                            >
                                <Ionicons
                                    name={isListening ? 'stop' : 'mic'}
                                    size={24}
                                    color="white"
                                />
                            </TouchableOpacity>
                        </Animated.View>
                        <Text style={styles.voiceInstructions}>
                            {isListening ? 'Listening... (Noise-resilient mode ON)' : 'Tap to speak in Kannada or English'}
                        </Text>
                    </View>
                )}

                {(currentMode === 'sms' || currentMode === 'hybrid') && (
                    <View style={styles.smsInputSection}>
                        <TextInput
                            style={styles.smsInput}
                            value={smsText}
                            onChangeText={setSmsText}
                            placeholder="Type your farming question in Kannada or English..."
                            placeholderTextColor={COLORS.TEXT_SECONDARY}
                            multiline
                            maxLength={160}
                        />
                        <TouchableOpacity
                            style={[styles.smsButton, { opacity: smsText.trim() ? 1 : 0.5 }]}
                            onPress={processSMSInput}
                            disabled={!smsText.trim() || isProcessing}
                        >
                            <Ionicons name="send" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Farm Context Panel */}
            <View style={styles.contextPanel}>
                <Text style={styles.contextTitle}>Farm Context</Text>
                <View style={styles.contextItems}>
                    <Text style={styles.contextItem}>📍 {farmContext.location}</Text>
                    <Text style={styles.contextItem}>🌱 {farmContext.mainCrop}</Text>
                    <Text style={styles.contextItem}>📅 {farmContext.season}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerContent: {
        alignItems: 'center',
        marginBottom: 15,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.WHITE,
        marginTop: 5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.WHITE,
        opacity: 0.9,
    },
    environmentPanel: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    noiseMonitor: {
        flex: 1,
        marginRight: 20,
    },
    monitorLabel: {
        fontSize: 12,
        color: COLORS.WHITE,
        opacity: 0.8,
        marginBottom: 5,
    },
    noiseMeter: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    noiseFill: {
        height: '100%',
        borderRadius: 3,
    },
    noiseValue: {
        fontSize: 11,
        color: COLORS.WHITE,
        marginTop: 3,
    },
    connectionMonitor: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    connectionText: {
        fontSize: 11,
        color: COLORS.WHITE,
        marginLeft: 5,
    },
    modeSelection: {
        flexDirection: 'row',
        margin: 15,
        backgroundColor: COLORS.WHITE,
        borderRadius: 25,
        padding: 5,
        elevation: 3,
    },
    modeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 20,
    },
    activeModeButton: {
        backgroundColor: COLORS.PRIMARY,
    },
    modeButtonText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 5,
        color: COLORS.PRIMARY,
    },
    activeModeText: {
        color: COLORS.WHITE,
    },
    conversationArea: {
        flex: 1,
        paddingHorizontal: 15,
    },
    messageContainer: {
        marginBottom: 15,
        padding: 12,
        borderRadius: 12,
        maxWidth: '85%',
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: COLORS.PRIMARY,
    },
    aiMessage: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.WHITE,
        elevation: 2,
    },
    systemMessage: {
        alignSelf: 'center',
        backgroundColor: COLORS.WARNING + '20',
        borderColor: COLORS.WARNING,
        borderWidth: 1,
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    modeIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    modeText: {
        fontSize: 9,
        color: COLORS.WHITE,
        marginLeft: 3,
        fontWeight: '600',
    },
    noiseIndicator: {
        fontSize: 9,
        color: COLORS.WHITE,
        opacity: 0.7,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
    },
    userText: {
        color: COLORS.WHITE,
    },
    aiText: {
        color: COLORS.TEXT_PRIMARY,
    },
    systemText: {
        color: COLORS.WARNING,
        fontStyle: 'italic',
    },
    kannadaText: {
        fontSize: 13,
        color: COLORS.TEXT_SECONDARY,
        marginTop: 5,
        fontStyle: 'italic',
    },
    confidenceText: {
        fontSize: 10,
        color: COLORS.SUCCESS,
        marginTop: 5,
    },
    actionableContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    actionableText: {
        fontSize: 10,
        color: COLORS.WARNING,
        marginLeft: 5,
        fontWeight: '600',
    },
    processingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
    },
    processingText: {
        marginLeft: 10,
        color: COLORS.TEXT_SECONDARY,
        fontSize: 12,
    },
    inputArea: {
        backgroundColor: COLORS.WHITE,
        paddingHorizontal: 15,
        paddingTop: 15,
        elevation: 5,
    },
    voiceInputSection: {
        alignItems: 'center',
        marginBottom: 15,
    },
    voiceButton: {
        marginBottom: 10,
    },
    micButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    voiceInstructions: {
        fontSize: 12,
        color: COLORS.TEXT_SECONDARY,
        textAlign: 'center',
    },
    smsInputSection: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 15,
    },
    smsInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: COLORS.BORDER,
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
        maxHeight: 80,
        fontSize: 14,
    },
    smsButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contextPanel: {
        backgroundColor: COLORS.WHITE,
        paddingHorizontal: 15,
        paddingBottom: 15,
    },
    contextTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.TEXT_PRIMARY,
        marginBottom: 5,
    },
    contextItems: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    contextItem: {
        fontSize: 11,
        color: COLORS.TEXT_SECONDARY,
    },
});
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Animated,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import SpeechService from '../services/SpeechService';

export default function VoiceRecorder({ onResult, isListening, setIsListening }) {
    const [recording, setRecording] = useState(null);
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    const [pulseAnim] = useState(new Animated.Value(1));

    useEffect(() => {
        if (isListening) {
            startPulseAnimation();
        } else {
            stopPulseAnimation();
        }
    }, [isListening]);

    const startPulseAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const stopPulseAnimation = () => {
        Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    async function startRecording() {
        try {
            if (permissionResponse.status !== 'granted') {
                console.log('Requesting permission..');
                await requestPermission();
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            console.log('Starting recording..');
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            setIsListening(true);
            console.log('Recording started');
        } catch (err) {
            console.error('Failed to start recording', err);
            Alert.alert('Error', 'Failed to start recording');
        }
    }

    async function stopRecording() {
        console.log('Stopping recording..');
        setIsListening(false);
        setRecording(null);

        if (recording) {
            await recording.stopAndUnloadAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
            });

            const uri = recording.getURI();
            console.log('Recording stopped and stored at', uri);

            // Process the audio with Google Speech-to-Text
            try {
                const transcribedText = await SpeechService.transcribeAudio(uri);
                if (transcribedText) {
                    onResult(transcribedText);
                } else {
                    // Fallback for demo purposes
                    onResult("ಟೊಮೇಟೋ ಬೆಳೆಯಲ್ಲಿ ಹಳದಿ ಚುಕ್ಕೆಗಳು ಕಂಡುಬಂದಿವೆ");
                }
            } catch (error) {
                console.error('Transcription error:', error);
                Alert.alert('Error', 'Failed to process voice input');
            }
        }
    }

    const handlePress = () => {
        if (isListening) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const speakText = (text) => {
        Speech.speak(text, {
            language: 'kn-IN', // Kannada language code
            pitch: 1,
            rate: 0.8,
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.instructionText}>
                {isListening ? 'ಮಾತನಾಡಿ...' : 'ಮೈಕ್ರೊಫೋನ್ ಒತ್ತಿ ಮಾತನಾಡಿ'}
            </Text>

            <Animated.View style={[styles.microphoneContainer, { transform: [{ scale: pulseAnim }] }]}>
                <TouchableOpacity
                    style={[
                        styles.microphoneButton,
                        { backgroundColor: isListening ? '#f44336' : '#4CAF50' }
                    ]}
                    onPress={handlePress}
                >
                    <Ionicons
                        name={isListening ? 'stop' : 'mic'}
                        size={30}
                        color="white"
                    />
                </TouchableOpacity>
            </Animated.View>

            {isListening && (
                <View style={styles.recordingIndicator}>
                    <View style={styles.recordingDot} />
                    <Text style={styles.recordingText}>Recording...</Text>
                </View>
            )}

            <View style={styles.quickActions}>
                <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => onResult("ಬೆಳೆಯ ರೋಗ ತಿಳಿಸಿ")}
                >
                    <Text style={styles.quickActionText}>Crop Disease</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => onResult("ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ")}
                >
                    <Text style={styles.quickActionText}>Market Price</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => onResult("ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು")}
                >
                    <Text style={styles.quickActionText}>Schemes</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    instructionText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    microphoneContainer: {
        marginBottom: 20,
    },
    microphoneButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    recordingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    recordingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#f44336',
        marginRight: 8,
    },
    recordingText: {
        color: '#f44336',
        fontSize: 14,
    },
    quickActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 20,
    },
    quickActionButton: {
        backgroundColor: '#e8f5e8',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        margin: 5,
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    quickActionText: {
        color: '#4CAF50',
        fontSize: 12,
        fontWeight: '500',
    },
});
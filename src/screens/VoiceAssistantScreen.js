import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import VoiceRecorder from '../components/VoiceRecorder';
import ChatInterface from '../components/ChatInterface';
import { COLORS, APP_CONFIG } from '../utils/constants';

export default function VoiceAssistantScreen({ navigation }) {
    const [isListening, setIsListening] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        {
            id: 1,
            text: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಕೃಷಿ ಸಹಾಯಕ. ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
            textEnglish: "Hello! I am your personal agricultural assistant. How can I help you?",
            isBot: true,
            timestamp: new Date(),
        }
    ]);

    const handleVoiceResult = (text) => {
        // Add user message
        const userMessage = {
            id: Date.now(),
            text: text,
            isBot: false,
            timestamp: new Date(),
        };
        setChatMessages(prev => [...prev, userMessage]);

        // Process voice command and add bot response
        processVoiceCommand(text);
    };

    const processVoiceCommand = async (command) => {
        // Simulate AI processing
        setTimeout(() => {
            let response = "ನಾನು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಕಾಯಿರಿ...";
            let responseEnglish = "I understand your question. Please wait a moment...";

            if (command.toLowerCase().includes('tomato') || command.includes('ಟೊಮೇಟೋ')) {
                response = "ಟೊಮೇಟೋ ಬೆಳೆಗೆ ಸಂಬಂಧಿಸಿದ ಮಾಹಿತಿಗಾಗಿ, ದಯವಿಟ್ಟು ಬೆಳೆ ನಿರ್ಣಯ ವಿಭಾಗವನ್ನು ಬಳಸಿ.";
                responseEnglish = "For tomato crop related information, please use the Crop Diagnosis section.";
            } else if (command.toLowerCase().includes('price') || command.includes('ಬೆಲೆ')) {
                response = "ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳಿಗಾಗಿ ಮಾರುಕಟ್ಟೆ ವಿಶ್ಲೇಷಣೆ ವಿಭಾಗವನ್ನು ಪರಿಶೀಲಿಸಿ.";
                responseEnglish = "For today's market prices, check the Market Analysis section.";
            } else if (command.toLowerCase().includes('scheme') || command.includes('ಯೋಜನೆ')) {
                response = "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಮಾಹಿತಿಗಾಗಿ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ವಿಭಾಗವನ್ನು ನೋಡಿ.";
                responseEnglish = "For government scheme information, check the Government Schemes section.";
            }

            const botMessage = {
                id: Date.now(),
                text: response,
                textEnglish: responseEnglish,
                isBot: true,
                timestamp: new Date(),
            };
            setChatMessages(prev => [...prev, botMessage]);
        }, 1000);
    };

    return (
        <ScrollView style={styles.container}>
            <LinearGradient
                colors={[COLORS.PRIMARY, COLORS.PRIMARY_DARK]}
                style={styles.header}
            >
                <Ionicons name="mic" size={40} color="white" style={styles.headerIcon} />
                <Text style={styles.headerTitle}>Voice Assistant</Text>
                <Text style={styles.headerTitleKannada}>ಧ್ವನಿ ಸಹಾಯಕ</Text>
                <Text style={styles.headerSubtitle}>
                    Speak in Kannada or English
                </Text>
                <Text style={styles.headerSubtitleKannada}>
                    ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಮಾತನಾಡಿ
                </Text>
            </LinearGradient>

            {/* Voice Interface */}
            <View style={styles.voiceSection}>
                <VoiceRecorder
                    onResult={handleVoiceResult}
                    isListening={isListening}
                    setIsListening={setIsListening}
                />
            </View>

            {/* Chat Interface */}
            <View style={styles.chatSection}>
                <Text style={styles.sectionTitle}>Conversation / ಸಂಭಾಷಣೆ</Text>
                <ChatInterface
                    messages={chatMessages}
                    onSendMessage={(text) => handleVoiceResult(text)}
                    showBilingualText={true}
                />
            </View>

            {/* Voice Commands Help */}
            <View style={styles.helpSection}>
                <Text style={styles.sectionTitle}>Voice Commands / ಧ್ವನಿ ಆಜ್ಞೆಗಳು</Text>
                <View style={styles.commandCard}>
                    <Ionicons name="leaf" size={20} color={COLORS.SUCCESS} />
                    <View style={styles.commandText}>
                        <Text style={styles.commandEnglish}>"Check my tomato crop"</Text>
                        <Text style={styles.commandKannada}>"ನನ್ನ ಟೊಮೇಟೋ ಬೆಳೆಯನ್ನು ಪರಿಶೀಲಿಸಿ"</Text>
                    </View>
                </View>

                <View style={styles.commandCard}>
                    <Ionicons name="trending-up" size={20} color={COLORS.SECONDARY} />
                    <View style={styles.commandText}>
                        <Text style={styles.commandEnglish}>"What are today's prices?"</Text>
                        <Text style={styles.commandKannada}>"ಇಂದಿನ ಬೆಲೆಗಳು ಏನು?"</Text>
                    </View>
                </View>

                <View style={styles.commandCard}>
                    <Ionicons name="document-text" size={20} color={COLORS.ACCENT} />
                    <View style={styles.commandText}>
                        <Text style={styles.commandEnglish}>"Show government schemes"</Text>
                        <Text style={styles.commandKannada}>"ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ತೋರಿಸಿ"</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
    },
    header: {
        padding: 30,
        paddingTop: 60,
        alignItems: 'center',
    },
    headerIcon: {
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.WHITE,
        marginBottom: 5,
    },
    headerTitleKannada: {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.WHITE,
        marginBottom: 15,
    },
    headerSubtitle: {
        fontSize: 16,
        color: COLORS.WHITE,
        opacity: 0.9,
        marginBottom: 3,
    },
    headerSubtitleKannada: {
        fontSize: 14,
        color: COLORS.WHITE,
        opacity: 0.8,
    },
    voiceSection: {
        padding: 20,
        backgroundColor: COLORS.WHITE,
        margin: 15,
        borderRadius: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    chatSection: {
        padding: 20,
        backgroundColor: COLORS.WHITE,
        margin: 15,
        borderRadius: 15,
        elevation: 3,
        minHeight: 300,
    },
    helpSection: {
        padding: 20,
        backgroundColor: COLORS.WHITE,
        margin: 15,
        borderRadius: 15,
        elevation: 3,
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: COLORS.TEXT_PRIMARY,
    },
    commandCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        marginBottom: 10,
        backgroundColor: COLORS.GRAY_LIGHT,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.PRIMARY,
    },
    commandText: {
        flex: 1,
        marginLeft: 15,
    },
    commandEnglish: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.TEXT_PRIMARY,
        marginBottom: 3,
    },
    commandKannada: {
        fontSize: 13,
        color: COLORS.TEXT_SECONDARY,
    },
});
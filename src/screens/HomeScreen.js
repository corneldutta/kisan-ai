import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

export default function HomeScreen({ navigation }) {
    const coreFeatures = [
        {
            title: 'Whisper Intelligence',
            subtitle: 'ಪಿಸುಮಾತು ಬುದ್ಧಿವಂತಿಕೆ',
            icon: 'radio-outline',
            color: COLORS.INFO,
            screen: 'WhisperIntelligence',
        },
    ];

    const serviceFeatures = [
        {
            title: 'Voice Assistant',
            subtitle: 'ಧ್ವನಿ ಸಹಾಯಕ',
            icon: 'mic-outline',
            color: COLORS.INFO,
            screen: 'VoiceAssistant',
        },
        {
            title: 'Crop Diagnosis',
            subtitle: 'ಬೆಳೆ ರೋಗ ನಿರ್ಣಯ',
            icon: 'leaf-outline',
            color: COLORS.SUCCESS,
            screen: 'CropDiagnosis',
        },
        {
            title: 'Market Prices',
            subtitle: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು',
            icon: 'trending-up-outline',
            color: COLORS.SECONDARY,
            screen: 'MarketAnalysis',
        },
        {
            title: 'Government Schemes',
            subtitle: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು',
            icon: 'document-text-outline',
            color: COLORS.ACCENT,
            screen: 'GovernmentSchemes',
        },
    ];

    const renderContent = () => {
        const content = [
            // Header section
            {
                id: 'header',
                type: 'header',
                component: (
                    <LinearGradient
                        colors={[COLORS.PRIMARY, COLORS.PRIMARY_DARK]}
                        style={styles.header}
                    >
                        <Text style={styles.subtitleText}>ಇಂದು ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?</Text>
                        <Text style={styles.subtitleTextEnglish}>How can I help you today?</Text>
                    </LinearGradient>
                )
            },
            // Core Features section
            {
                id: 'coreFeatures',
                type: 'coreFeatures',
                component: (
                    <View style={styles.featuresSection}>
                        <Text style={styles.sectionTitle}>Core</Text>
                        <Text style={styles.sectionTitleKannada}>ಮೂಲ</Text>
                        {coreFeatures.map((feature, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.featureCard, { borderLeftColor: feature.color }]}
                                onPress={() => navigation.navigate(feature.screen)}
                            >
                                <View style={styles.featureContent}>
                                    <View style={[styles.iconContainer, { backgroundColor: feature.color }]}>
                                        <Ionicons name={feature.icon} size={24} color="white" />
                                    </View>
                                    <View style={styles.featureText}>
                                        <Text style={styles.featureTitle}>{feature.title}</Text>
                                        <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )
            },
            // Services Features section
            {
                id: 'serviceFeatures',
                type: 'serviceFeatures',
                component: (
                    <View style={styles.featuresSection}>
                        <Text style={styles.sectionTitle}>Services</Text>
                        <Text style={styles.sectionTitleKannada}>ಸೇವೆಗಳು</Text>
                        {serviceFeatures.map((feature, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.featureCard, { borderLeftColor: feature.color }]}
                                onPress={() => navigation.navigate(feature.screen)}
                            >
                                <View style={styles.featureContent}>
                                    <View style={[styles.iconContainer, { backgroundColor: feature.color }]}>
                                        <Ionicons name={feature.icon} size={24} color="white" />
                                    </View>
                                    <View style={styles.featureText}>
                                        <Text style={styles.featureTitle}>{feature.title}</Text>
                                        <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )
            },
            // Stats section
            {
                id: 'stats',
                type: 'stats',
                component: (
                    <View style={styles.statsSection}>
                        <Text style={styles.sectionTitle}>Today's Overview</Text>
                        <Text style={styles.sectionTitleKannada}>ಇಂದಿನ ಅವಲೋಕನ</Text>
                        <View style={styles.statsGrid}>
                            <View style={styles.statCard}>
                                <Text style={styles.statNumber}>₹45/kg</Text>
                                <Text style={styles.statLabel}>Tomato Price</Text>
                                <Text style={styles.statLabelKannada}>ಟೊಮೇಟೋ ಬೆಲೆ</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statNumber}>28°C</Text>
                                <Text style={styles.statLabel}>Temperature</Text>
                                <Text style={styles.statLabelKannada}>ತಾಪಮಾನ</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statNumber}>65%</Text>
                                <Text style={styles.statLabel}>Humidity</Text>
                                <Text style={styles.statLabelKannada}>ಆರ್ದ್ರತೆ</Text>
                            </View>
                        </View>
                    </View>
                )
            }
        ];
        return content;
    };

    const renderItem = ({ item }) => (
        <View style={styles.sectionContainer}>
            {item.component}
        </View>
    );

    return (
        <FlatList
            style={styles.container}
            data={renderContent()}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
    },
    sectionContainer: {
        marginBottom: 0,
    },
    header: {
        padding: 15,
        paddingTop: 10,
        alignItems: 'center',
    },
    subtitleText: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.WHITE,
        marginBottom: 5,
        textAlign: 'center',
    },
    subtitleTextEnglish: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.WHITE,
        opacity: 0.9,
        textAlign: 'center',
    },
    featuresSection: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: COLORS.TEXT_PRIMARY,
    },
    sectionTitleKannada: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 15,
        color: COLORS.TEXT_SECONDARY,
    },
    featureCard: {
        backgroundColor: COLORS.WHITE,
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        elevation: 2,
        borderLeftWidth: 4,
    },
    featureContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.TEXT_PRIMARY,
    },
    featureSubtitle: {
        fontSize: 14,
        color: COLORS.TEXT_SECONDARY,
        marginTop: 2,
    },
    statsSection: {
        padding: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statCard: {
        backgroundColor: COLORS.WHITE,
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 5,
        elevation: 2,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.PRIMARY,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.TEXT_SECONDARY,
        marginTop: 3,
    },
    statLabelKannada: {
        fontSize: 11,
        color: COLORS.TEXT_SECONDARY,
        marginTop: 2,
    },
});
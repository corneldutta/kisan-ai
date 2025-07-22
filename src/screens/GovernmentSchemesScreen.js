import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GoogleAIService from '../services/GoogleAIService';

export default function GovernmentSchemesScreen() {
    const [schemes, setSchemes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = [
        { name: 'All', icon: 'grid-outline', color: '#4CAF50' },
        { name: 'Financial', icon: 'card-outline', color: '#2196F3' },
        { name: 'Insurance', icon: 'shield-outline', color: '#FF9800' },
        { name: 'Technology', icon: 'laptop-outline', color: '#9C27B0' },
        { name: 'Subsidy', icon: 'gift-outline', color: '#F44336' },
    ];

    useEffect(() => {
        loadSchemes();
    }, []);

    const loadSchemes = async () => {
        try {
            setIsLoading(true);
            const schemesData = await GoogleAIService.analyzeGovernmentSchemes();
            setSchemes(schemesData);
        } catch (error) {
            console.error('Error loading schemes:', error);
            setSchemes(getDefaultSchemes());
        } finally {
            setIsLoading(false);
        }
    };

    const getDefaultSchemes = () => [
        {
            name: 'PM-KISAN Samman Nidhi',
            nameKannada: 'ಪ್ರಧಾನಮಂತ್ರಿ ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ',
            category: 'Financial',
            description: 'Direct income support of ₹6000 per year to farmer families',
            descriptionKannada: 'ರೈತ ಕುಟುಂಬಗಳಿಗೆ ವರ್ಷಕ್ಕೆ ₹6000 ನೇರ ಆದಾಯ ಬೆಂಬಲ',
            benefit: '₹6000 per year in 3 installments',
            eligibility: 'All farmer families with cultivable land',
            eligibilityKannada: 'ಬೆಳೆಯಬಹುದಾದ ಭೂಮಿ ಹೊಂದಿರುವ ಎಲ್ಲಾ ರೈತ ಕುಟುಂಬಗಳು',
            applicationLink: 'https://pmkisan.gov.in/',
            documents: ['Aadhaar Card', 'Land Records', 'Bank Account Details'],
            status: 'Active',
            lastDate: 'Ongoing',
            helpline: '011-24300606',
            icon: 'card',
            color: '#4CAF50'
        },
        {
            name: 'Pradhan Mantri Fasal Bima Yojana',
            nameKannada: 'ಪ್ರಧಾನಮಂತ್ರಿ ಫಸಲ್ ಬೀಮಾ ಯೋಜನೆ',
            category: 'Insurance',
            description: 'Comprehensive crop insurance coverage against natural calamities',
            descriptionKannada: 'ನೈಸರ್ಗಿಕ ವಿಪತ್ತುಗಳ ವಿರುದ್ಧ ಸಮಗ್ರ ಬೆಳೆ ವಿಮೆ ರಕ್ಷಣೆ',
            benefit: 'Up to ₹2 lakh crop insurance coverage',
            eligibility: 'All farmers with insurable interest in the crop',
            eligibilityKannada: 'ಬೆಳೆಯಲ್ಲಿ ವಿಮಾ ಆಸಕ್ತಿ ಹೊಂದಿರುವ ಎಲ್ಲಾ ರೈತರು',
            applicationLink: 'https://pmfby.gov.in/',
            documents: ['Aadhaar', 'Land Records', 'Sowing Certificate', 'Bank Details'],
            status: 'Active',
            lastDate: 'Before sowing season',
            helpline: '14447',
            icon: 'shield-checkmark',
            color: '#FF9800'
        },
        {
            name: 'Soil Health Card Scheme',
            nameKannada: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಯೋಜನೆ',
            category: 'Technology',
            description: 'Free soil testing and customized fertilizer recommendations',
            descriptionKannada: 'ಉಚಿತ ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಮತ್ತು ಅನುಕೂಲಿತ ಗೊಬ್ಬರ ಶಿಫಾರಸುಗಳು',
            benefit: 'Free soil analysis and nutrient management advice',
            eligibility: 'All farmers',
            eligibilityKannada: 'ಎಲ್ಲಾ ರೈತರು',
            applicationLink: 'https://soilhealth.dac.gov.in/',
            documents: ['Farmer ID', 'Land Records'],
            status: 'Active',
            lastDate: 'Ongoing',
            helpline: '011-23382012',
            icon: 'leaf',
            color: '#2196F3'
        },
        {
            name: 'Kisan Credit Card',
            nameKannada: 'ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್',
            category: 'Financial',
            description: 'Credit facility for agriculture and allied activities',
            descriptionKannada: 'ಕೃಷಿ ಮತ್ತು ಸಂಬಂಧಿತ ಚಟುವಟಿಕೆಗಳಿಗೆ ಕ್ರೆಡಿಟ್ ಸೌಲಭ್ಯ',
            benefit: 'Low interest credit up to ₹3 lakh',
            eligibility: 'Farmers with land ownership or tenant farmers',
            eligibilityKannada: 'ಭೂ ಮಾಲೀಕತ್ವ ಅಥವಾ ಗುತ್ತಿಗೆ ರೈತರು',
            applicationLink: 'Contact local bank branches',
            documents: ['Land Records', 'Identity Proof', 'Address Proof'],
            status: 'Active',
            lastDate: 'Ongoing',
            helpline: 'Contact local bank',
            icon: 'card-outline',
            color: '#9C27B0'
        },
        {
            name: 'PM Kisan Maandhan Yojana',
            nameKannada: 'ಪಿಎಂ ಕಿಸಾನ್ ಮಾನಧನ್ ಯೋಜನೆ',
            category: 'Financial',
            description: 'Pension scheme for small and marginal farmers',
            descriptionKannada: 'ಸಣ್ಣ ಮತ್ತು ಕನಿಷ್ಠ ರೈತರಿಗೆ ಪಿಂಚಣಿ ಯೋಜನೆ',
            benefit: '₹3000 monthly pension after 60 years',
            eligibility: 'Small farmers aged 18-40 years',
            eligibilityKannada: '18-40 ವರ್ಷ ವಯಸ್ಸಿನ ಸಣ್ಣ ರೈತರು',
            applicationLink: 'https://maandhan.in/',
            documents: ['Aadhaar', 'Land Records', 'Bank Account'],
            status: 'Active',
            lastDate: 'Ongoing',
            helpline: '1800-3000-3468',
            icon: 'people',
            color: '#607D8B'
        }
    ];

    const filteredSchemes = selectedCategory === 'All'
        ? schemes
        : schemes.filter(scheme => scheme.category === selectedCategory);

    const openLink = async (url) => {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            Alert.alert('Error', 'Cannot open this link');
        }
    };

    const renderSchemeCard = (scheme, index) => (
        <View key={index} style={styles.schemeCard}>
            <View style={styles.schemeHeader}>
                <View style={[styles.schemeIcon, { backgroundColor: scheme.color }]}>
                    <Ionicons name={scheme.icon} size={24} color="white" />
                </View>
                <View style={styles.schemeTitle}>
                    <Text style={styles.schemeName}>{scheme.name}</Text>
                    <Text style={styles.schemeNameKannada}>{scheme.nameKannada}</Text>
                    <View style={[styles.categoryBadge, { backgroundColor: scheme.color + '20' }]}>
                        <Text style={[styles.categoryText, { color: scheme.color }]}>
                            {scheme.category}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.schemeContent}>
                <Text style={styles.schemeDescription}>{scheme.description}</Text>
                <Text style={styles.schemeDescriptionKannada}>{scheme.descriptionKannada}</Text>

                <View style={styles.benefitSection}>
                    <Ionicons name="gift" size={16} color="#4CAF50" />
                    <Text style={styles.benefitText}>{scheme.benefit}</Text>
                </View>

                <View style={styles.eligibilitySection}>
                    <Text style={styles.sectionLabel}>Eligibility:</Text>
                    <Text style={styles.eligibilityText}>{scheme.eligibility}</Text>
                    <Text style={styles.eligibilityTextKannada}>{scheme.eligibilityKannada}</Text>
                </View>

                <View style={styles.documentsSection}>
                    <Text style={styles.sectionLabel}>Required Documents:</Text>
                    <View style={styles.documentsList}>
                        {scheme.documents.map((doc, idx) => (
                            <View key={idx} style={styles.documentItem}>
                                <Ionicons name="document-outline" size={12} color="#666" />
                                <Text style={styles.documentText}>{doc}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.schemeFooter}>
                    <View style={styles.statusContainer}>
                        <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                        <Text style={styles.statusText}>{scheme.status}</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.applyButton}
                        onPress={() => openLink(scheme.applicationLink)}
                    >
                        <Text style={styles.applyButtonText}>Apply Now</Text>
                        <Ionicons name="arrow-forward" size={16} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={styles.helplineContainer}>
                    <Ionicons name="call" size={14} color="#666" />
                    <Text style={styles.helplineText}>Helpline: {scheme.helpline}</Text>
                </View>
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Loading schemes...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <LinearGradient
                colors={['#FF9800', '#F57C00']}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Government Schemes</Text>
                <Text style={styles.headerSubtitle}>ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು</Text>
                <Text style={styles.headerDescription}>
                    Navigate through available agricultural schemes
                </Text>
            </LinearGradient>

            {/* Category Filter */}
            <View style={styles.categorySection}>
                <Text style={styles.sectionTitle}>Categories</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.categoryList}>
                        {categories.map((category, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.categoryCard,
                                    selectedCategory === category.name && styles.selectedCategory
                                ]}
                                onPress={() => setSelectedCategory(category.name)}
                            >
                                <Ionicons
                                    name={category.icon}
                                    size={20}
                                    color={selectedCategory === category.name ? 'white' : category.color}
                                />
                                <Text style={[
                                    styles.categoryName,
                                    selectedCategory === category.name && styles.selectedCategoryText
                                ]}>
                                    {category.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Schemes List */}
            <View style={styles.schemesSection}>
                <Text style={styles.sectionTitle}>
                    Available Schemes ({filteredSchemes.length})
                </Text>
                {filteredSchemes.map((scheme, index) => renderSchemeCard(scheme, index))}
            </View>

            {/* Quick Tips */}
            <View style={styles.tipsSection}>
                <Text style={styles.sectionTitle}>Application Tips</Text>
                <View style={styles.tipCard}>
                    <Ionicons name="bulb" size={20} color="#FF9800" />
                    <View style={styles.tipContent}>
                        <Text style={styles.tipText}>
                            • Keep all documents ready before applying
                        </Text>
                        <Text style={styles.tipText}>
                            • Check eligibility criteria carefully
                        </Text>
                        <Text style={styles.tipText}>
                            • Contact helpline for any doubts
                        </Text>
                        <Text style={styles.tipText}>
                            • Apply before the last date
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    header: {
        padding: 20,
        paddingTop: 40,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'white',
        opacity: 0.9,
        marginTop: 5,
    },
    headerDescription: {
        fontSize: 14,
        color: 'white',
        opacity: 0.8,
        marginTop: 10,
        textAlign: 'center',
    },
    categorySection: {
        padding: 20,
        backgroundColor: 'white',
        margin: 10,
        borderRadius: 10,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    categoryList: {
        flexDirection: 'row',
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginRight: 10,
        borderRadius: 20,
        backgroundColor: '#f8f9fa',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedCategory: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    categoryName: {
        fontSize: 12,
        fontWeight: '500',
        color: '#666',
        marginLeft: 8,
    },
    selectedCategoryText: {
        color: 'white',
        fontWeight: 'bold',
    },
    schemesSection: {
        padding: 20,
    },
    schemeCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    schemeHeader: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    schemeIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    schemeTitle: {
        flex: 1,
    },
    schemeName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 3,
    },
    schemeNameKannada: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    categoryBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '600',
    },
    schemeContent: {
        marginTop: 10,
    },
    schemeDescription: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        marginBottom: 5,
    },
    schemeDescriptionKannada: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
        marginBottom: 15,
    },
    benefitSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8f5e8',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
    },
    benefitText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2e7d32',
        marginLeft: 8,
        flex: 1,
    },
    eligibilitySection: {
        marginBottom: 15,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    eligibilityText: {
        fontSize: 13,
        color: '#666',
        marginBottom: 3,
    },
    eligibilityTextKannada: {
        fontSize: 12,
        color: '#999',
    },
    documentsSection: {
        marginBottom: 15,
    },
    documentsList: {
        marginTop: 5,
    },
    documentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3,
    },
    documentText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 6,
    },
    schemeFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 10,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        color: '#666',
    },
    applyButton: {
        backgroundColor: '#4CAF50',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    applyButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        marginRight: 5,
    },
    helplineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    helplineText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 6,
    },
    tipsSection: {
        margin: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        elevation: 2,
        marginBottom: 20,
    },
    tipCard: {
        flexDirection: 'row',
        backgroundColor: '#fff8e1',
        padding: 15,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#FF9800',
    },
    tipContent: {
        flex: 1,
        marginLeft: 10,
    },
    tipText: {
        fontSize: 13,
        color: '#333',
        marginBottom: 5,
        lineHeight: 18,
    },
});
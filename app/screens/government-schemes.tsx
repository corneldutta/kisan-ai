import { IconSymbol } from '@/components/ui/IconSymbol';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Scheme {
    name: string;
    nameKannada: string;
    category: string;
    description: string;
    descriptionKannada: string;
    benefit: string;
    eligibility: string;
    eligibilityKannada: string;
    applicationLink: string;
    documents: string[];
    status: string;
    lastDate: string;
    helpline: string;
    icon: string;
    color: string;
}

interface Category {
    name: string;
    icon: string;
    color: string;
}

export default function GovernmentSchemesScreen() {
    const [schemes, setSchemes] = useState<Scheme[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories: Category[] = [
        { name: 'All', icon: 'grid', color: '#4CAF50' },
        { name: 'Financial', icon: 'card', color: '#2196F3' },
        { name: 'Insurance', icon: 'shield', color: '#FF9800' },
        { name: 'Technology', icon: 'photo.fill', color: '#9C27B0' },
        { name: 'Subsidy', icon: 'gift', color: '#F44336' },
    ];

    useEffect(() => {
        loadSchemes();
    }, []);

    const loadSchemes = async () => {
        try {
            setIsLoading(true);
            // Simulated schemes data - replace with actual API call
            const schemesData = getDefaultSchemes();
            setSchemes(schemesData);
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error('Error loading schemes:', error);
            setSchemes(getDefaultSchemes());
        } finally {
            setIsLoading(false);
        }
    };

    const getDefaultSchemes = (): Scheme[] => [
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
            icon: 'shield',
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
            icon: 'leaf.fill',
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
            icon: 'card',
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
            icon: 'person.2.fill',
            color: '#607D8B'
        }
    ];

    const filteredSchemes = selectedCategory === 'All'
        ? schemes
        : schemes.filter(scheme => scheme.category === selectedCategory);

    const openLink = async (url: string) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', 'Cannot open this link');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to open link');
        }
    };

    const renderSchemeCard = (scheme: Scheme, index: number) => (
        <View key={index} style={styles.schemeCard}>
            <View style={styles.schemeHeader}>
                <View style={[styles.schemeIcon, { backgroundColor: scheme.color }]}>
                    <IconSymbol name={scheme.icon as any} size={24} color="white" />
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
                    <IconSymbol name="gift" size={16} color="#4CAF50" />
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
                                <IconSymbol name="newspaper.fill" size={12} color="#666" />
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
                        <IconSymbol name="paperplane.fill" size={16} color="white" />
                        <Text style={styles.applyButtonText}>Apply Now</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.helplineSection}>
                    <Text style={styles.helplineText}>Helpline: {scheme.helpline}</Text>
                    <Text style={styles.lastDateText}>Last Date: {scheme.lastDate}</Text>
                </View>
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#31A05F" />
                <Text style={styles.loadingText}>Loading government schemes...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Government Schemes</Text>
                    <Text style={styles.headerSubtitle}>ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು</Text>
                    <Text style={styles.headerDescription}>
                        Find and apply for government schemes for farmers
                    </Text>
                </View>

                {/* Category Filter */}
                <View style={styles.categorySection}>
                    <Text style={styles.sectionTitle}>Filter by Category</Text>
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
                                    <IconSymbol 
                                        name={category.icon as any} 
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
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    header: {
        padding: 20,
        paddingTop: 10,
        alignItems: 'center',
        backgroundColor: '#31A05F',
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
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
        alignItems: 'center',
        padding: 15,
        marginRight: 10,
        borderRadius: 10,
        backgroundColor: '#f8f9fa',
        borderWidth: 2,
        borderColor: 'transparent',
        minWidth: 80,
    },
    selectedCategory: {
        backgroundColor: '#31A05F',
        borderColor: '#31A05F',
    },
    categoryName: {
        fontSize: 12,
        fontWeight: '500',
        color: '#666',
        marginTop: 5,
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
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000000',
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
        marginBottom: 2,
    },
    schemeNameKannada: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    schemeContent: {
        gap: 12,
    },
    schemeDescription: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    schemeDescriptionKannada: {
        fontSize: 12,
        color: '#666',
        lineHeight: 18,
    },
    benefitSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8f5e8',
        padding: 10,
        borderRadius: 8,
    },
    benefitText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4CAF50',
        marginLeft: 8,
    },
    eligibilitySection: {
        backgroundColor: '#f8f9fa',
        padding: 10,
        borderRadius: 8,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    eligibilityText: {
        fontSize: 12,
        color: '#333',
        marginBottom: 2,
    },
    eligibilityTextKannada: {
        fontSize: 11,
        color: '#666',
    },
    documentsSection: {
        backgroundColor: '#f8f9fa',
        padding: 10,
        borderRadius: 8,
    },
    documentsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    documentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    documentText: {
        fontSize: 10,
        color: '#666',
        marginLeft: 4,
    },
    schemeFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
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
        color: '#4CAF50',
        fontWeight: '500',
    },
    applyButton: {
        backgroundColor: '#31A05F',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    applyButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
    },
    helplineSection: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    helplineText: {
        fontSize: 11,
        color: '#666',
        marginBottom: 2,
    },
    lastDateText: {
        fontSize: 11,
        color: '#666',
    },
}); 
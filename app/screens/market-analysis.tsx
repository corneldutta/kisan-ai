import { IconSymbol } from '@/components/ui/IconSymbol';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface MarketPriceResponse {
    crop: string;
    location: {
        district: string;
        state: string;
    };
    price_analysis: {
        current_price: string;
        yesterday_price: string;
        price_change: string;
        percentage_change: string;
        trend: string;
        forecast: {
            [key: string]: string;
        };
        recommendation: string;
        key_factor: string;
        data_source: string;
    };
}

interface Commodity {
    name: string;
    icon: string;
    color: string;
}

interface District {
    name: string;
    value: string;
}

export default function MarketAnalysisScreen() {
    const [marketData, setMarketData] = useState<MarketPriceResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCommodity, setSelectedCommodity] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [showStateModal, setShowStateModal] = useState(false);
    const [showDistrictModal, setShowDistrictModal] = useState(false);

    const commodities: Commodity[] = [
        { name: 'Tomato', icon: '🍅', color: '#f44336' },
        { name: 'Onion', icon: '🧅', color: '#9c27b0' },
        { name: 'Potato', icon: '🥔', color: '#795548' },
        { name: 'Rice', icon: '🌾', color: '#4caf50' },
        { name: 'Wheat', icon: '🌾', color: '#ff9800' },
    ];

    const districts: District[] = [
        { name: 'Bengaluru', value: 'Bengaluru' },
        { name: 'Mysuru', value: 'Mysuru' },
        { name: 'Mangaluru', value: 'Mangaluru' },
        { name: 'Hubballi', value: 'Hubballi' },
        { name: 'Belagavi', value: 'Belagavi' },
        { name: 'Kalaburagi', value: 'Kalaburagi' },
        { name: 'Vijayapura', value: 'Vijayapura' },
        { name: 'Ballari', value: 'Ballari' },
        { name: 'Tumakuru', value: 'Tumakuru' },
        { name: 'Davangere', value: 'Davangere' },
    ];

    useEffect(() => {
        if (selectedState && selectedDistrict && selectedCommodity) {
            loadMarketData();
        }
    }, [selectedCommodity, selectedState, selectedDistrict]);

    const loadMarketData = async () => {
        try {
            setIsLoading(true);
            
            const formData = new FormData();
            formData.append('crop_name', selectedCommodity.toLowerCase());
            formData.append('state', selectedState);
            formData.append('district', selectedDistrict);

            const response = await fetch('https://fastapi-service-666271187622.us-central1.run.app/getmarketprice', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: MarketPriceResponse = await response.json();
            setMarketData(data);
        } catch (error) {
            console.error('Error loading market data:', error);
            Alert.alert('Error', 'Failed to load market data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadMarketData();
        setRefreshing(false);
    };

    const getTrendIcon = (trend: string) => {
        if (trend.toLowerCase().includes('increase')) {
            return 'arrow.up';
        } else if (trend.toLowerCase().includes('decrease') || trend.toLowerCase().includes('fall') || trend.toLowerCase().includes('down')) {
            return 'arrow.down';
        } else {
            return 'minus';
        }
    };

    const getTrendColor = (trend: string) => {
        if (trend.toLowerCase().includes('increase')) {
            return '#4CAF50';
        } else if (trend.toLowerCase().includes('decrease') || trend.toLowerCase().includes('fall') || trend.toLowerCase().includes('down')) {
            return '#f44336';
        } else {
            return '#9E9E9E';
        }
    };

    const renderDropdownItem = (item: { name: string; value: string }, onSelect: (value: string) => void) => (
        <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => onSelect(item.value)}
        >
            <Text style={styles.dropdownItemText}>{item.name}</Text>
        </TouchableOpacity>
    );

    const renderForecastItem = (date: string, price: string) => (
        <View key={date} style={styles.forecastItem}>
            <Text style={styles.forecastDate}>{new Date(date).toLocaleDateString()}</Text>
            <Text style={styles.forecastPrice}>₹{price}</Text>
        </View>
    );

    if (isLoading && !marketData) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#31A05F" />
                <Text style={styles.loadingText}>Loading market data...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Market Analysis</Text>
                    <Text style={styles.headerSubtitle}>ಮಾರುಕಟ್ಟೆ ವಿಶ್ಲೇಷಣೆ</Text>
                    <Text style={styles.lastUpdated}>
                        Last updated: {new Date().toLocaleTimeString()}
                    </Text>
                </View>

                {/* Location Selection */}
                <View style={styles.locationSection}>
                    <Text style={styles.sectionTitle}>Select Location</Text>
                    <Text style={styles.sectionSubtitle}>ಸ್ಥಳವನ್ನು ಆಯ್ಕೆಮಾಡಿ</Text>
                    <View style={styles.locationRow}>
                        <View style={styles.dropdownContainer}>
                            <Text style={styles.dropdownLabel}>State *</Text>
                            <TouchableOpacity
                                style={[styles.dropdownButton, !selectedState && styles.dropdownButtonEmpty]}
                                onPress={() => setShowStateModal(true)}
                            >
                                <Text style={[styles.dropdownButtonText, !selectedState && styles.dropdownButtonTextEmpty]}>
                                    {selectedState || 'Select State'}
                                </Text>
                                <IconSymbol name="chevron.down" size={16} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dropdownContainer}>
                            <Text style={styles.dropdownLabel}>District *</Text>
                            <TouchableOpacity
                                style={[styles.dropdownButton, !selectedDistrict && styles.dropdownButtonEmpty]}
                                onPress={() => setShowDistrictModal(true)}
                                disabled={!selectedState}
                            >
                                <Text style={[styles.dropdownButtonText, !selectedDistrict && styles.dropdownButtonTextEmpty]}>
                                    {selectedDistrict || 'Select District'}
                                </Text>
                                <IconSymbol name="chevron.down" size={16} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Commodity Selection */}
                <View style={styles.commoditySection}>
                    <Text style={styles.sectionTitle}>Select Commodity</Text>
                    <Text style={styles.sectionSubtitle}>ಬೆಳೆಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.commodityList}>
                            {commodities.map((commodity, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.commodityCard,
                                        selectedCommodity === commodity.name.toLowerCase() && styles.selectedCommodity
                                    ]}
                                    onPress={() => setSelectedCommodity(commodity.name.toLowerCase())}
                                >
                                    <Text style={styles.commodityIcon}>{commodity.icon}</Text>
                                    <Text style={[
                                        styles.commodityName,
                                        selectedCommodity === commodity.name.toLowerCase() && styles.selectedCommodityText
                                    ]}>
                                        {commodity.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Current Price Analysis */}
                {!selectedState || !selectedDistrict ? (
                    <View style={styles.selectionRequiredSection}>
                        <IconSymbol name="leaf.fill" size={48} color="#FF9800" />
                        <Text style={styles.selectionRequiredTitle}>Location Selection Required</Text>
                        <Text style={styles.selectionRequiredSubtitle}>ಸ್ಥಳ ಆಯ್ಕೆ ಅಗತ್ಯವಿದೆ</Text>
                        <Text style={styles.selectionRequiredText}>
                            Please select both State and District to view market analysis data.
                        </Text>
                        <Text style={styles.selectionRequiredTextKannada}>
                            ಮಾರುಕಟ್ಟೆ ವಿಶ್ಲೇಷಣೆ ಡೇಟಾವನ್ನು ವೀಕ್ಷಿಸಲು ರಾಜ್ಯ ಮತ್ತು ಜಿಲ್ಲೆ ಎರಡನ್ನೂ ಆಯ್ಕೆಮಾಡಿ.
                        </Text>
                    </View>
                ) : isLoading ? (
                    <View style={styles.loadingDataSection}>
                        <ActivityIndicator size="large" color="#31A05F" />
                        <Text style={styles.loadingDataText}>Loading market data...</Text>
                    </View>
                ) : marketData && (
                    <>
                        <View style={styles.priceAnalysisSection}>
                            <Text style={styles.sectionTitle}>Current Price Analysis - {marketData.crop.charAt(0).toUpperCase() + marketData.crop.slice(1)}</Text>
                            <Text style={styles.sectionSubtitle}>ಪ್ರಸ್ತುತ ಬೆಲೆ ವಿಶ್ಲೇಷಣೆ</Text>
                            
                            <View style={styles.priceCard}>
                                <View style={styles.priceHeader}>
                                    <Text style={styles.marketName}>{selectedDistrict} Market</Text>
                                    <View style={[styles.trendContainer, { backgroundColor: (parseFloat(marketData.price_analysis.percentage_change) >= 0 ? '#4CAF50' : '#f44336') + '20' }]}>
                                        <IconSymbol
                                            name={parseFloat(marketData.price_analysis.percentage_change) >= 0 ? 'arrow.up' : 'arrow.down'}
                                            size={16}
                                            color={parseFloat(marketData.price_analysis.percentage_change) >= 0 ? '#4CAF50' : '#f44336'}
                                        />
                                        <Text style={[styles.changeText, { color: parseFloat(marketData.price_analysis.percentage_change) >= 0 ? '#4CAF50' : '#f44336' }]}>
                                            {marketData.price_analysis.percentage_change}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.priceContent}>
                                    <Text style={styles.priceAmount}>₹{marketData.price_analysis.current_price}</Text>
                                    <Text style={styles.priceUnit}>/quintal</Text>
                                </View>
                                <View style={styles.priceComparison}>
                                    <Text style={styles.comparisonText}>
                                        Yesterday: ₹{marketData.price_analysis.yesterday_price} 
                                        ({parseInt(marketData.price_analysis.price_change) > 0 ? '+' : ''}{marketData.price_analysis.price_change})
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Market Forecast */}
                        <View style={styles.forecastSection}>
                            <View style={styles.forecastHeader}>
                                <IconSymbol name="chart.line.uptrend.xyaxis" size={24} color="#FF9800" />
                                <View style={styles.forecastTitleContainer}>
                                    <Text style={styles.sectionTitle}>7-Day Price AI Prediction</Text>
                                    <Text style={styles.sectionSubtitle}>7 ದಿನದ ಬೆಲೆ ಭವಿಷ್ಯವಾಣಿ</Text>
                                </View>
                            </View>
                            <View style={styles.forecastCard}>
                                <View style={styles.forecastGrid}>
                                    {Object.entries(marketData.price_analysis.forecast).map(([date, price]) => 
                                        renderForecastItem(date, price)
                                    )}
                                </View>
                            </View>
                        </View>

                    

                    </>
                )}
            </ScrollView>

            {/* State Dropdown Modal */}
            <Modal
                visible={showStateModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowStateModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select State</Text>
                            <TouchableOpacity onPress={() => setShowStateModal(false)}>
                                <IconSymbol name="xmark" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={[{ name: 'Karnataka', value: 'Karnataka' }]}
                            renderItem={({ item }) => renderDropdownItem(item, (value) => {
                                setSelectedState(value);
                                setShowStateModal(false);
                            })}
                            keyExtractor={(item) => item.value}
                        />
                    </View>
                </View>
            </Modal>

            {/* District Dropdown Modal */}
            <Modal
                visible={showDistrictModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowDistrictModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select District</Text>
                            <TouchableOpacity onPress={() => setShowDistrictModal(false)}>
                                <IconSymbol name="xmark" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={districts}
                            renderItem={({ item }) => renderDropdownItem(item, (value) => {
                                setSelectedDistrict(value);
                                setShowDistrictModal(false);
                            })}
                            keyExtractor={(item) => item.value}
                        />
                    </View>
                </View>
            </Modal>
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
    lastUpdated: {
        fontSize: 12,
        color: 'white',
        opacity: 0.8,
        marginTop: 10,
    },
    locationSection: {
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
    locationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    dropdownContainer: {
        flex: 1,
    },
    dropdownLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    dropdownButtonEmpty: {
        backgroundColor: '#f0f0f0',
        borderColor: '#ccc',
    },
    dropdownButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    dropdownButtonTextEmpty: {
        color: '#999',
        fontStyle: 'italic',
    },
    selectionRequiredSection: {
        padding: 40,
        alignItems: 'center',
        backgroundColor: 'white',
        margin: 10,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    selectionRequiredTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 15,
        marginBottom: 10,
    },
    selectionRequiredText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 8,
    },
    selectionRequiredSubtitle: {
        fontSize: 16,
        color: '#FF9800',
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: '600',
    },
    selectionRequiredTextKannada: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        fontStyle: 'italic',
    },
    loadingDataSection: {
        padding: 40,
        alignItems: 'center',
        backgroundColor: 'white',
        margin: 10,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    loadingDataText: {
        marginTop: 10,
        color: '#666',
        fontSize: 14,
    },
    commoditySection: {
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
        marginBottom: 5,
        color: '#333',
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
        fontStyle: 'italic',
    },
    commodityList: {
        flexDirection: 'row',
    },
    commodityCard: {
        alignItems: 'center',
        padding: 15,
        marginRight: 10,
        borderRadius: 10,
        backgroundColor: '#f8f9fa',
        borderWidth: 2,
        borderColor: 'transparent',
        minWidth: 80,
    },
    selectedCommodity: {
        backgroundColor: '#e8f5e8',
        borderColor: '#31A05F',
    },
    commodityIcon: {
        fontSize: 24,
        marginBottom: 5,
    },
    commodityName: {
        fontSize: 12,
        fontWeight: '500',
        color: '#666',
    },
    selectedCommodityText: {
        color: '#31A05F',
        fontWeight: 'bold',
    },
    priceAnalysisSection: {
        padding: 20,
    },
    priceCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    priceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    marketName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        flex: 1,
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    changeText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    priceContent: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    priceAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#31A05F',
    },
    priceUnit: {
        fontSize: 14,
        color: '#666',
        marginLeft: 5,
    },
    priceComparison: {
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingTop: 8,
    },
    comparisonText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
    },
    forecastSection: {
        margin: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    forecastHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    forecastTitleContainer: {
        flex: 1,
        marginLeft: 10,
    },
    forecastCard: {
        backgroundColor: '#fff3e0',
        padding: 15,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#FF9800',
    },
    forecastGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    forecastItem: {
        width: '48%',
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 6,
        marginBottom: 8,
        alignItems: 'center',
    },
    forecastDate: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    forecastPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FF9800',
    },
    adviceSection: {
        margin: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    adviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    adviceCard: {
        backgroundColor: '#e8f5e8',
        padding: 15,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    adviceText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        marginBottom: 8,
    },
    adviceLabel: {
        fontWeight: 'bold',
        color: '#31A05F',
    },
    actionsSection: {
        margin: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 20,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        backgroundColor: '#31A05F',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 2,
        justifyContent: 'center',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '500',
        marginLeft: 5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    dropdownItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#333',
    },
}); 
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GoogleAIService from '../services/GoogleAIService';
import MarketDataService from '../services/MarketDataService';

export default function MarketAnalysisScreen() {
    const [marketData, setMarketData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCommodity, setSelectedCommodity] = useState('Tomato');

    const commodities = [
        { name: 'Tomato', icon: '🍅', color: '#f44336' },
        { name: 'Onion', icon: '🧅', color: '#9c27b0' },
        { name: 'Potato', icon: '🥔', color: '#795548' },
        { name: 'Rice', icon: '🌾', color: '#4caf50' },
        { name: 'Wheat', icon: '🌾', color: '#ff9800' },
    ];

    useEffect(() => {
        loadMarketData();
    }, [selectedCommodity]);

    const loadMarketData = async () => {
        try {
            setIsLoading(true);
            const data = await GoogleAIService.getMarketPrices(selectedCommodity);
            setMarketData(data);
        } catch (error) {
            console.error('Error loading market data:', error);
            Alert.alert('Error', 'Failed to load market data');
        } finally {
            setIsLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadMarketData();
        setRefreshing(false);
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up':
                return 'trending-up';
            case 'down':
                return 'trending-down';
            default:
                return 'remove';
        }
    };

    const getTrendColor = (trend) => {
        switch (trend) {
            case 'up':
                return '#4CAF50';
            case 'down':
                return '#f44336';
            default:
                return '#9E9E9E';
        }
    };

    const renderPriceCard = (priceData, index) => (
        <View key={index} style={styles.priceCard}>
            <View style={styles.priceHeader}>
                <Text style={styles.marketName}>{priceData.market}</Text>
                <View style={[styles.trendContainer, { backgroundColor: getTrendColor(priceData.trend) + '20' }]}>
                    <Ionicons
                        name={getTrendIcon(priceData.trend)}
                        size={16}
                        color={getTrendColor(priceData.trend)}
                    />
                    <Text style={[styles.changeText, { color: getTrendColor(priceData.trend) }]}>
                        {priceData.change}
                    </Text>
                </View>
            </View>
            <View style={styles.priceContent}>
                <Text style={styles.priceAmount}>₹{priceData.price}</Text>
                <Text style={styles.priceUnit}>{priceData.unit}</Text>
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Loading market data...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <LinearGradient
                colors={['#2196F3', '#1976D2']}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Market Analysis</Text>
                <Text style={styles.headerSubtitle}>ಮಾರುಕಟ್ಟೆ ವಿಶ್ಲೇಷಣೆ</Text>
                <Text style={styles.lastUpdated}>
                    Last updated: {new Date().toLocaleTimeString()}
                </Text>
            </LinearGradient>

            {/* Commodity Selection */}
            <View style={styles.commoditySection}>
                <Text style={styles.sectionTitle}>Select Commodity</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.commodityList}>
                        {commodities.map((commodity, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.commodityCard,
                                    selectedCommodity === commodity.name && styles.selectedCommodity
                                ]}
                                onPress={() => setSelectedCommodity(commodity.name)}
                            >
                                <Text style={styles.commodityIcon}>{commodity.icon}</Text>
                                <Text style={[
                                    styles.commodityName,
                                    selectedCommodity === commodity.name && styles.selectedCommodityText
                                ]}>
                                    {commodity.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Current Prices */}
            {marketData && (
                <>
                    <View style={styles.pricesSection}>
                        <Text style={styles.sectionTitle}>Current Prices - {selectedCommodity}</Text>
                        {marketData.prices.map((price, index) => renderPriceCard(price, index))}
                    </View>

                    {/* Market Forecast */}
                    <View style={styles.forecastSection}>
                        <View style={styles.forecastHeader}>
                            <Ionicons name="analytics" size={24} color="#FF9800" />
                            <Text style={styles.sectionTitle}>Market Forecast</Text>
                        </View>
                        <View style={styles.forecastCard}>
                            <Text style={styles.forecastText}>{marketData.forecast.nextWeek}</Text>
                            <Text style={styles.forecastReason}>Reason: {marketData.forecast.reason}</Text>
                        </View>
                    </View>

                    {/* AI Advice */}
                    <View style={styles.adviceSection}>
                        <View style={styles.adviceHeader}>
                            <Ionicons name="bulb" size={24} color="#4CAF50" />
                            <Text style={styles.sectionTitle}>AI Recommendation</Text>
                        </View>
                        <View style={styles.adviceCard}>
                            <Text style={styles.adviceText}>{marketData.advice}</Text>
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.actionsSection}>
                        <Text style={styles.sectionTitle}>Quick Actions</Text>
                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="notifications" size={20} color="white" />
                                <Text style={styles.actionButtonText}>Price Alerts</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="location" size={20} color="white" />
                                <Text style={styles.actionButtonText}>Nearby Markets</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="share" size={20} color="white" />
                                <Text style={styles.actionButtonText}>Share Prices</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Historical Trend */}
                    <View style={styles.trendSection}>
                        <Text style={styles.sectionTitle}>7-Day Price Trend</Text>
                        <View style={styles.trendChart}>
                            <Text style={styles.trendNote}>
                                📈 Price trending upward for the past week
                            </Text>
                            <Text style={styles.trendDetails}>
                                Average increase: 8% | Peak: ₹48/kg | Low: ₹40/kg
                            </Text>
                        </View>
                    </View>
                </>
            )}
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
    lastUpdated: {
        fontSize: 12,
        color: 'white',
        opacity: 0.8,
        marginTop: 10,
    },
    commoditySection: {
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
        borderColor: '#4CAF50',
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
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    pricesSection: {
        padding: 20,
    },
    priceCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        elevation: 2,
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
    },
    priceAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    priceUnit: {
        fontSize: 14,
        color: '#666',
        marginLeft: 5,
    },
    forecastSection: {
        margin: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        elevation: 2,
    },
    forecastHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    forecastCard: {
        backgroundColor: '#fff3e0',
        padding: 15,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#FF9800',
    },
    forecastText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    forecastReason: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
    },
    adviceSection: {
        margin: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        elevation: 2,
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
    },
    actionsSection: {
        margin: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        elevation: 2,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        backgroundColor: '#2196F3',
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
    trendSection: {
        margin: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        elevation: 2,
        marginBottom: 20,
    },
    trendChart: {
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    trendNote: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    trendDetails: {
        fontSize: 12,
        color: '#666',
    },
});
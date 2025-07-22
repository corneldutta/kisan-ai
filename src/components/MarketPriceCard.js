import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function MarketPriceCard({
                                            priceData,
                                            onPress,
                                            showDetails = false,
                                            style
                                        }) {
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

    const getGradientColors = (trend) => {
        switch (trend) {
            case 'up':
                return ['#e8f5e8', '#f1f8e9'];
            case 'down':
                return ['#ffebee', '#fce4ec'];
            default:
                return ['#f5f5f5', '#fafafa'];
        }
    };

    const formatPrice = (price) => {
        if (price >= 1000) {
            return `₹${(price / 1000).toFixed(1)}K`;
        }
        return `₹${price}`;
    };

    const handleCardPress = () => {
        if (onPress) {
            onPress(priceData);
        } else {
            Alert.alert(
                priceData.market,
                `Current Price: ${formatPrice(priceData.price)}\nTrend: ${priceData.change}\nLast Updated: ${new Date().toLocaleTimeString()}`
            );
        }
    };

    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={handleCardPress}
            activeOpacity={0.7}
        >
            <LinearGradient
                colors={getGradientColors(priceData.trend)}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <View style={styles.marketInfo}>
                        <Text style={styles.marketName} numberOfLines={1}>
                            {priceData.market}
                        </Text>
                        <Text style={styles.commodity} numberOfLines={1}>
                            {priceData.commodity || 'Tomato'}
                        </Text>
                    </View>

                    <View style={[
                        styles.trendContainer,
                        { backgroundColor: getTrendColor(priceData.trend) + '20' }
                    ]}>
                        <Ionicons
                            name={getTrendIcon(priceData.trend)}
                            size={16}
                            color={getTrendColor(priceData.trend)}
                        />
                        <Text style={[
                            styles.changeText,
                            { color: getTrendColor(priceData.trend) }
                        ]}>
                            {priceData.change}
                        </Text>
                    </View>
                </View>

                <View style={styles.priceSection}>
                    <Text style={styles.price}>
                        {formatPrice(priceData.price)}
                    </Text>
                    <Text style={styles.unit}>
                        {priceData.unit || 'per kg'}
                    </Text>
                </View>

                {showDetails && (
                    <View style={styles.detailsSection}>
                        <View style={styles.detailRow}>
                            <Ionicons name="time-outline" size={14} color="#666" />
                            <Text style={styles.detailText}>
                                Updated: {new Date().toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                            </Text>
                        </View>

                        {priceData.volume && (
                            <View style={styles.detailRow}>
                                <Ionicons name="cube-outline" size={14} color="#666" />
                                <Text style={styles.detailText}>
                                    Volume: {priceData.volume} tonnes
                                </Text>
                            </View>
                        )}

                        {priceData.quality && (
                            <View style={styles.detailRow}>
                                <Ionicons name="star-outline" size={14} color="#666" />
                                <Text style={styles.detailText}>
                                    Quality: {priceData.quality}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                <View style={styles.footer}>
                    <View style={styles.statusIndicator}>
                        <View style={[
                            styles.statusDot,
                            { backgroundColor: getTrendColor(priceData.trend) }
                        ]} />
                        <Text style={styles.statusText}>Live</Text>
                    </View>

                    <TouchableOpacity style={styles.moreButton}>
                        <Ionicons name="chevron-forward" size={16} color="#666" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

// Compact version for dashboard
export function CompactMarketPriceCard({ priceData, onPress, style }) {
    const getTrendColor = (trend) => {
        switch (trend) {
            case 'up': return '#4CAF50';
            case 'down': return '#f44336';
            default: return '#9E9E9E';
        }
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up': return 'trending-up';
            case 'down': return 'trending-down';
            default: return 'remove';
        }
    };

    return (
        <TouchableOpacity
            style={[styles.compactContainer, style]}
            onPress={() => onPress && onPress(priceData)}
        >
            <View style={styles.compactContent}>
                <View style={styles.compactLeft}>
                    <Text style={styles.compactMarket} numberOfLines={1}>
                        {priceData.market}
                    </Text>
                    <Text style={styles.compactPrice}>
                        ₹{priceData.price}
                    </Text>
                </View>

                <View style={styles.compactRight}>
                    <View style={[
                        styles.compactTrend,
                        { backgroundColor: getTrendColor(priceData.trend) + '20' }
                    ]}>
                        <Ionicons
                            name={getTrendIcon(priceData.trend)}
                            size={12}
                            color={getTrendColor(priceData.trend)}
                        />
                        <Text style={[
                            styles.compactChange,
                            { color: getTrendColor(priceData.trend) }
                        ]}>
                            {priceData.change}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    gradient: {
        padding: 16,
        borderRadius: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    marketInfo: {
        flex: 1,
        marginRight: 10,
    },
    marketName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    commodity: {
        fontSize: 12,
        color: '#666',
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
    priceSection: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 12,
    },
    price: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    unit: {
        fontSize: 14,
        color: '#666',
        marginLeft: 6,
    },
    detailsSection: {
        marginBottom: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    detailText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 6,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusIndicator: {
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
        fontSize: 11,
        color: '#666',
        fontWeight: '500',
    },
    moreButton: {
        padding: 4,
    },
    // Compact styles
    compactContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        marginVertical: 4,
        marginHorizontal: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    compactContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    compactLeft: {
        flex: 1,
    },
    compactMarket: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 2,
    },
    compactPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    compactRight: {
        alignItems: 'flex-end',
    },
    compactTrend: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    compactChange: {
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 2,
    },
});
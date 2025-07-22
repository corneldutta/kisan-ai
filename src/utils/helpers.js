// helpers.js - Utility functions for the Project Kisan app
import { Alert, Linking, Platform } from 'react-native';
import { LANGUAGES, COLORS, ERROR_MESSAGES } from './constants';

// Language and localization helpers
export const detectLanguage = (text) => {
    const kannadaRegex = /[\u0C80-\u0CFF]/;
    const hindiRegex = /[\u0900-\u097F]/;

    if (kannadaRegex.test(text)) {
        return LANGUAGES.KANNADA.code;
    } else if (hindiRegex.test(text)) {
        return LANGUAGES.HINDI.code;
    }
    return LANGUAGES.ENGLISH.code;
};

export const getLocalizedText = (textObject, languageCode = 'en-IN') => {
    if (typeof textObject === 'string') return textObject;

    switch (languageCode) {
        case 'kn-IN':
            return textObject.kannada || textObject.english || textObject;
        case 'hi-IN':
            return textObject.hindi || textObject.english || textObject;
        default:
            return textObject.english || textObject;
    }
};

export const formatKannadaNumber = (number) => {
    const kannadaDigits = ['೦', '೧', '೨', '೩', '೪', '೫', '೬', '೭', '೮', '೯'];
    return number.toString().replace(/\d/g, (digit) => kannadaDigits[parseInt(digit)]);
};

// Date and time helpers
export const formatDateTime = (date, languageCode = 'en-IN') => {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    };

    const locale = languageCode === 'kn-IN' ? 'kn-IN' : 'en-IN';
    return new Date(date).toLocaleString(locale, options);
};

export const getTimeAgo = (date, languageCode = 'en-IN') => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));

    if (languageCode === 'kn-IN') {
        if (diffInMinutes < 1) return 'ಈಗ';
        if (diffInMinutes < 60) return `${diffInMinutes} ನಿಮಿಷಗಳ ಹಿಂದೆ`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ಗಂಟೆಗಳ ಹಿಂದೆ`;
        return `${Math.floor(diffInMinutes / 1440)} ದಿನಗಳ ಹಿಂದೆ`;
    }

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
};

export const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1; // 1-12

    if (month >= 6 && month <= 10) {
        return 'Kharif';
    } else if (month >= 11 || month <= 3) {
        return 'Rabi';
    } else {
        return 'Zaid';
    }
};

// Price and currency helpers
export const formatPrice = (price, currency = '₹') => {
    if (price >= 10000000) {
        return `${currency}${(price / 10000000).toFixed(1)}Cr`;
    } else if (price >= 100000) {
        return `${currency}${(price / 100000).toFixed(1)}L`;
    } else if (price >= 1000) {
        return `${currency}${(price / 1000).toFixed(1)}K`;
    }
    return `${currency}${price}`;
};

export const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
};

export const formatPercentage = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
};

// Image processing helpers
export const validateImageSize = (imageUri, maxSize = 5 * 1024 * 1024) => {
    // In a real app, you'd check the actual file size
    // This is a simplified version
    return true;
};

export const getImageFormat = (imageUri) => {
    const extension = imageUri.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png'].includes(extension) ? extension : null;
};

export const compressImage = async (imageUri, quality = 0.8) => {
    // In a real implementation, you'd use expo-image-manipulator
    // This is a placeholder
    return imageUri;
};

// Network and API helpers
export const isNetworkConnected = () => {
    // In a real app, you'd use @react-native-community/netinfo
    // This is a simplified check
    return true;
};

export const handleApiError = (error, showAlert = true) => {
    console.error('API Error:', error);

    let message = ERROR_MESSAGES.API_ERROR;

    if (error.message?.includes('Network')) {
        message = ERROR_MESSAGES.NETWORK_ERROR;
    } else if (error.response?.status === 401) {
        message = 'Authentication failed. Please check your API key.';
    } else if (error.response?.status === 429) {
        message = 'Too many requests. Please try again later.';
    }

    if (showAlert) {
        Alert.alert('Error', message);
    }

    return message;
};

export const retryApiCall = async (apiFunction, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await apiFunction();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
};

// Voice processing helpers
export const cleanVoiceInput = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s\u0C80-\u0CFF\u0900-\u097F]/g, ' ')
        .replace(/\s+/g, ' ');
};

export const extractIntent = (text, commands) => {
    const cleanText = cleanVoiceInput(text);

    for (const [intent, keywords] of Object.entries(commands)) {
        if (keywords.some(keyword => cleanText.includes(keyword.toLowerCase()))) {
            return intent;
        }
    }

    return 'unknown';
};

export const extractEntities = (text, entityTypes) => {
    const entities = {};
    const cleanText = cleanVoiceInput(text);

    // Extract numbers
    const numbers = cleanText.match(/\d+/g);
    if (numbers) {
        entities.numbers = numbers.map(Number);
    }

    // Extract crop names
    const cropKeywords = ['tomato', 'ಟೊಮೇಟೋ', 'onion', 'ಈರುಳ್ಳಿ', 'potato', 'ಆಲೂಗಡ್ಡೆ'];
    const foundCrops = cropKeywords.filter(crop => cleanText.includes(crop));
    if (foundCrops.length > 0) {
        entities.crops = foundCrops;
    }

    return entities;
};

// Location helpers
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

export const findNearestMarket = (userLocation, markets) => {
    if (!userLocation || !markets) return null;

    let nearest = null;
    let minDistance = Infinity;

    markets.forEach(market => {
        const distance = calculateDistance(
            userLocation.lat, userLocation.lng,
            market.location.lat, market.location.lng
        );

        if (distance < minDistance) {
            minDistance = distance;
            nearest = { ...market, distance };
        }
    });

    return nearest;
};

// Validation helpers
export const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phoneNumber);
};

export const validateAadhaar = (aadhaarNumber) => {
    const aadhaarRegex = /^\d{12}$/;
    return aadhaarRegex.test(aadhaarNumber);
};

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// UI helpers
export const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
        case 'active':
        case 'approved':
        case 'success':
            return COLORS.SUCCESS;
        case 'pending':
        case 'processing':
            return COLORS.WARNING;
        case 'rejected':
        case 'failed':
        case 'error':
            return COLORS.ERROR;
        default:
            return COLORS.GRAY_MEDIUM;
    }
};

export const truncateText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

// External app integration helpers
export const openExternalApp = async (url, appName) => {
    try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            Alert.alert(
                'App not found',
                `${appName} is not installed on your device.`
            );
        }
    } catch (error) {
        console.error('Error opening external app:', error);
        Alert.alert('Error', 'Unable to open the application.');
    }
};

export const makePhoneCall = async (phoneNumber) => {
    const url = `tel:${phoneNumber}`;
    await openExternalApp(url, 'Phone');
};

export const sendSMS = async (phoneNumber, message = '') => {
    const url = Platform.OS === 'ios'
        ? `sms:${phoneNumber}&body=${encodeURIComponent(message)}`
        : `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
    await openExternalApp(url, 'SMS');
};

export const openMaps = async (latitude, longitude, label = '') => {
    const url = Platform.OS === 'ios'
        ? `maps:${latitude},${longitude}?q=${encodeURIComponent(label)}`
        : `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodeURIComponent(label)})`;
    await openExternalApp(url, 'Maps');
};

// Data storage helpers
export const saveToStorage = async (key, data) => {
    try {
        // In a real app, you'd use AsyncStorage
        // This is a placeholder
        console.log(`Saving to storage: ${key}`, data);
        return true;
    } catch (error) {
        console.error('Storage save error:', error);
        return false;
    }
};

export const loadFromStorage = async (key, defaultValue = null) => {
    try {
        // In a real app, you'd use AsyncStorage
        // This is a placeholder
        console.log(`Loading from storage: ${key}`);
        return defaultValue;
    } catch (error) {
        console.error('Storage load error:', error);
        return defaultValue;
    }
};

export const removeFromStorage = async (key) => {
    try {
        // In a real app, you'd use AsyncStorage
        console.log(`Removing from storage: ${key}`);
        return true;
    } catch (error) {
        console.error('Storage remove error:', error);
        return false;
    }
};

// Data transformation helpers
export const groupByProperty = (array, property) => {
    return array.reduce((groups, item) => {
        const key = item[property];
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
        return groups;
    }, {});
};

export const sortByProperty = (array, property, direction = 'asc') => {
    return [...array].sort((a, b) => {
        const aVal = a[property];
        const bVal = b[property];

        if (direction === 'desc') {
            return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
    });
};

export const filterByKeywords = (array, searchText, properties) => {
    if (!searchText) return array;

    const keywords = searchText.toLowerCase().split(' ');

    return array.filter(item => {
        return keywords.every(keyword => {
            return properties.some(prop => {
                const value = item[prop];
                return value && value.toString().toLowerCase().includes(keyword);
            });
        });
    });
};

// Weather helpers
export const getWeatherIcon = (weatherCode) => {
    const iconMap = {
        clear: '☀️',
        sunny: '☀️',
        cloudy: '☁️',
        'partly-cloudy': '⛅',
        overcast: '☁️',
        rain: '🌧️',
        'light-rain': '🌦️',
        'heavy-rain': '⛈️',
        thunderstorm: '⛈️',
        snow: '❄️',
        fog: '🌫️',
        mist: '🌫️',
        haze: '🌫️',
    };

    return iconMap[weatherCode] || '🌤️';
};

export const getWeatherAdvice = (weatherData, languageCode = 'en-IN') => {
    const { temperature, humidity, description } = weatherData;

    const advice = [];

    if (temperature > 35) {
        advice.push(
            languageCode === 'kn-IN'
                ? 'ಹೆಚ್ಚಿನ ತಾಪಮಾನ. ಹೆಚ್ಚು ನೀರು ನೀಡಿ.'
                : 'High temperature. Increase watering frequency.'
        );
    }

    if (humidity > 80) {
        advice.push(
            languageCode === 'kn-IN'
                ? 'ಹೆಚ್ಚಿನ ಆರ್ದ್ರತೆ. ಶಿಲೀಂಧ್ರ ರೋಗಗಳನ್ನು ಗಮನಿಸಿ.'
                : 'High humidity. Watch for fungal diseases.'
        );
    }

    if (description.includes('rain')) {
        advice.push(
            languageCode === 'kn-IN'
                ? 'ಮಳೆ ಸಾಧ್ಯತೆ. ಸಿಂಪಡಿಸುವುದನ್ನು ತಪ್ಪಿಸಿ.'
                : 'Rain expected. Avoid spraying activities.'
        );
    }

    return advice;
};

// Market analysis helpers
export const calculateMovingAverage = (prices, period = 7) => {
    if (prices.length < period) return null;

    const recentPrices = prices.slice(-period);
    const sum = recentPrices.reduce((acc, price) => acc + price, 0);
    return sum / period;
};

export const detectPriceTrend = (prices, period = 7) => {
    if (prices.length < period + 1) return 'stable';

    const currentAvg = calculateMovingAverage(prices, period);
    const previousAvg = calculateMovingAverage(prices.slice(0, -1), period);

    if (!currentAvg || !previousAvg) return 'stable';

    const change = ((currentAvg - previousAvg) / previousAvg) * 100;

    if (change > 2) return 'up';
    if (change < -2) return 'down';
    return 'stable';
};

export const generatePriceAlert = (currentPrice, targetPrice, alertType, commodity) => {
    const triggered = alertType === 'above'
        ? currentPrice >= targetPrice
        : currentPrice <= targetPrice;

    if (!triggered) return null;

    return {
        id: Date.now(),
        commodity,
        currentPrice,
        targetPrice,
        alertType,
        message: `${commodity} price is ${alertType} ₹${targetPrice}. Current: ₹${currentPrice}`,
        timestamp: new Date(),
    };
};

// Crop management helpers
export const getCropStage = (plantingDate) => {
    const daysSincePlanting = Math.floor((new Date() - new Date(plantingDate)) / (1000 * 60 * 60 * 24));

    if (daysSincePlanting < 30) return 'seedling';
    if (daysSincePlanting < 60) return 'vegetative';
    if (daysSincePlanting < 90) return 'flowering';
    if (daysSincePlanting < 120) return 'fruiting';
    return 'harvest';
};

export const getIrrigationSchedule = (cropType, soilType, weather) => {
    // Simplified irrigation logic
    const baseFrequency = {
        tomato: 2, // days
        onion: 3,
        potato: 4,
    };

    let frequency = baseFrequency[cropType] || 3;

    // Adjust based on weather
    if (weather.temperature > 30) frequency -= 0.5;
    if (weather.humidity > 70) frequency += 0.5;
    if (weather.description.includes('rain')) frequency += 2;

    // Adjust based on soil
    if (soilType === 'sandy') frequency -= 0.5;
    if (soilType === 'clay') frequency += 0.5;

    return Math.max(1, Math.round(frequency));
};

export const getFertilizerRecommendation = (cropType, soilTest, growthStage) => {
    // Simplified fertilizer logic
    const recommendations = {
        tomato: {
            seedling: { N: 50, P: 30, K: 40 },
            vegetative: { N: 80, P: 40, K: 60 },
            flowering: { N: 60, P: 60, K: 80 },
            fruiting: { N: 40, P: 80, K: 100 },
        }
    };

    return recommendations[cropType]?.[growthStage] || { N: 50, P: 50, K: 50 };
};

// Error handling helpers
export const createErrorHandler = (context) => {
    return (error, customMessage) => {
        console.error(`Error in ${context}:`, error);

        const errorInfo = {
            context,
            message: error.message || 'Unknown error',
            timestamp: new Date().toISOString(),
            stack: error.stack,
        };

        // In a real app, you'd send this to error tracking service
        console.log('Error info:', errorInfo);

        return customMessage || ERROR_MESSAGES.API_ERROR;
    };
};

export const withErrorBoundary = (component, fallback) => {
    try {
        return component();
    } catch (error) {
        console.error('Component error:', error);
        return fallback || null;
    }
};

// Performance helpers
export const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
};

export const throttle = (func, limit) => {
    let lastFunc;
    let lastRan;
    return (...args) => {
        if (!lastRan) {
            func.apply(null, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(() => {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(null, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
};

export const memoize = (func) => {
    const cache = new Map();
    return (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = func.apply(null, args);
        cache.set(key, result);
        return result;
    };
};

// Analytics helpers
export const trackEvent = (eventName, parameters = {}) => {
    // In a real app, you'd use Firebase Analytics or similar
    console.log('Analytics Event:', eventName, parameters);
};

export const trackScreenView = (screenName) => {
    trackEvent('screen_view', { screen_name: screenName });
};

export const trackUserAction = (action, category = 'user_action') => {
    trackEvent('user_action', { action, category, timestamp: Date.now() });
};

// Export all helper functions
export default {
    detectLanguage,
    getLocalizedText,
    formatKannadaNumber,
    formatDateTime,
    getTimeAgo,
    getCurrentSeason,
    formatPrice,
    calculatePercentageChange,
    formatPercentage,
    validateImageSize,
    getImageFormat,
    compressImage,
    isNetworkConnected,
    handleApiError,
    retryApiCall,
    cleanVoiceInput,
    extractIntent,
    extractEntities,
    calculateDistance,
    findNearestMarket,
    validatePhoneNumber,
    validateAadhaar,
    validateEmail,
    getStatusColor,
    truncateText,
    capitalizeFirstLetter,
    openExternalApp,
    makePhoneCall,
    sendSMS,
    openMaps,
    saveToStorage,
    loadFromStorage,
    removeFromStorage,
    groupByProperty,
    sortByProperty,
    filterByKeywords,
    getWeatherIcon,
    getWeatherAdvice,
    calculateMovingAverage,
    detectPriceTrend,
    generatePriceAlert,
    getCropStage,
    getIrrigationSchedule,
    getFertilizerRecommendation,
    createErrorHandler,
    withErrorBoundary,
    debounce,
    throttle,
    memoize,
    trackEvent,
    trackScreenView,
    trackUserAction,
};
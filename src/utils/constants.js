// constants.js - Application constants and configuration
export const APP_CONFIG = {
    APP_NAME: 'Project Kisan',
    APP_NAME_KANNADA: 'ಪ್ರಾಜೆಕ್ಟ್ ಕಿಸಾನ್',
    VERSION: '1.0.0',
    API_TIMEOUT: 10000,
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    SUPPORTED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png'],
};

export const GOOGLE_CLOUD_CONFIG = {
    PROJECT_ID: 'project-kisan',
    REGION: 'us-central1',
    VISION_API_URL: 'https://vision.googleapis.com/v1',
    SPEECH_API_URL: 'https://speech.googleapis.com/v1',
    TEXT_TO_SPEECH_API_URL: 'https://texttospeech.googleapis.com/v1',
    VERTEX_AI_URL: 'https://us-central1-aiplatform.googleapis.com/v1',
};

export const LANGUAGES = {
    KANNADA: {
        code: 'kn-IN',
        name: 'Kannada',
        nativeName: 'ಕನ್ನಡ',
    },
    ENGLISH: {
        code: 'en-IN',
        name: 'English',
        nativeName: 'English',
    },
    HINDI: {
        code: 'hi-IN',
        name: 'Hindi',
        nativeName: 'हिंदी',
    },
};

export const COLORS = {
    PRIMARY: '#87CEEB',        // Light Sky Blue
    PRIMARY_DARK: '#4682B4',   // Steel Blue (darker shade)
    SECONDARY: '#2196F3',
    ACCENT: '#FF9800',
    ERROR: '#f44336',
    WARNING: '#FF9800',
    SUCCESS: '#4CAF50',
    INFO: '#2196F3',
    WHITE: '#FFFFFF',
    BLACK: '#000000',
    GRAY_LIGHT: '#f5f5f5',
    GRAY_MEDIUM: '#9E9E9E',
    GRAY_DARK: '#666666',
    TEXT_PRIMARY: '#333333',
    TEXT_SECONDARY: '#666666',
    BORDER: '#e0e0e0',
    BACKGROUND: '#f5f5f5'
};

export const CROP_DISEASES = {
    TOMATO: {
        EARLY_BLIGHT: {
            name: 'Early Blight',
            nameKannada: 'ಆರಂಭಿಕ ಬ್ಲೈಟ್',
            symptoms: ['Dark spots on leaves', 'Yellow halo around spots', 'Leaf yellowing'],
            causes: ['Alternaria solani fungus', 'High humidity', 'Poor air circulation'],
            treatment: ['Remove affected leaves', 'Apply fungicide', 'Improve drainage'],
            prevention: ['Crop rotation', 'Proper spacing', 'Disease-resistant varieties'],
        },
        LATE_BLIGHT: {
            name: 'Late Blight',
            nameKannada: 'ಕೊನೆಯ ಬ್ಲೈಟ್',
            symptoms: ['Water-soaked spots', 'White fuzzy growth', 'Rapid spreading'],
            causes: ['Phytophthora infestans', 'Cool wet weather', 'High humidity'],
            treatment: ['Immediate fungicide application', 'Remove infected plants', 'Improve ventilation'],
            prevention: ['Use resistant varieties', 'Avoid overhead watering', 'Monitor weather'],
        },
        BACTERIAL_WILT: {
            name: 'Bacterial Wilt',
            nameKannada: 'ಬ್ಯಾಕ್ಟೀರಿಯಾ ಕಳೆ',
            symptoms: ['Sudden wilting', 'Yellow leaves', 'Stem browning'],
            causes: ['Ralstonia solanacearum', 'Soil-borne bacteria', 'Wounded roots'],
            treatment: ['Remove infected plants', 'Soil solarization', 'Biological control'],
            prevention: ['Crop rotation', 'Clean tools', 'Resistant varieties'],
        },
    },
};

export const MARKET_DATA = {
    MAJOR_MARKETS: [
        {
            name: 'KR Market Bangalore',
            nameKannada: 'ಕೆ.ಆರ್. ಮಾರುಕಟ್ಟೆ ಬೆಂಗಳೂರು',
            location: { lat: 12.9716, lng: 77.5946 },
            contact: '+91 80 2222 3333',
            timings: '6:00 AM - 2:00 PM',
        },
        {
            name: 'Mysore APMC',
            nameKannada: 'ಮೈಸೂರು ಎಪಿಎಂಸಿ',
            location: { lat: 12.2958, lng: 76.6394 },
            contact: '+91 821 242 4242',
            timings: '7:00 AM - 1:00 PM',
        },
        {
            name: 'Hubli APMC',
            nameKannada: 'ಹುಬ್ಬಳ್ಳಿ ಎಪಿಎಂಸಿ',
            location: { lat: 15.3647, lng: 75.1240 },
            contact: '+91 836 235 6789',
            timings: '6:30 AM - 1:30 PM',
        },
    ],
    COMMODITIES: [
        {
            name: 'Tomato',
            nameKannada: 'ಟೊಮೇಟೋ',
            icon: '🍅',
            category: 'Vegetables',
            season: 'Rabi',
            varieties: ['Local', 'Hybrid', 'Cherry'],
        },
        {
            name: 'Onion',
            nameKannada: 'ಈರುಳ್ಳಿ',
            icon: '🧅',
            category: 'Vegetables',
            season: 'Rabi',
            varieties: ['Red', 'White', 'Small'],
        },
        {
            name: 'Potato',
            nameKannada: 'ಆಲೂಗಡ್ಡೆ',
            icon: '🥔',
            category: 'Vegetables',
            season: 'Rabi',
            varieties: ['Local', 'Processed', 'Seed'],
        },
    ],
};

export const GOVERNMENT_SCHEMES = {
    CATEGORIES: [
        { name: 'Financial Support', nameKannada: 'ಆರ್ಥಿಕ ಬೆಂಬಲ' },
        { name: 'Crop Insurance', nameKannada: 'ಬೆಳೆ ವಿಮೆ' },
        { name: 'Technology', nameKannada: 'ತಂತ್ರಜ್ಞಾನ' },
        { name: 'Subsidies', nameKannada: 'ಸಬ್ಸಿಡಿಗಳು' },
        { name: 'Training', nameKannada: 'ತರಬೇತಿ' },
    ],
    HELPLINES: {
        KISAN_CALL_CENTER: '1551',
        PM_KISAN: '011-24300606',
        CROP_INSURANCE: '14447',
        SOIL_HEALTH: '011-23382012',
    },
};

export const VOICE_COMMANDS = {
    WAKE_WORDS: ['hey kisan', 'ಹೇ ಕಿಸಾನ್', 'kisan'],
    CROP_DIAGNOSIS: ['crop disease', 'plant problem', 'ಬೆಳೆ ರೋಗ', 'ಸಸ್ಯ ಸಮಸ್ಯೆ'],
    MARKET_PRICES: ['market price', 'sell price', 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆ', 'ಮಾರಾಟ ಬೆಲೆ'],
    WEATHER: ['weather', 'climate', 'ಹವಾಮಾನ', 'ಹಿತ'],
    SCHEMES: ['government scheme', 'subsidy', 'ಸರ್ಕಾರಿ ಯೋಜನೆ', 'ಸಬ್ಸಿಡಿ'],
};

export const API_ENDPOINTS = {
    AGMARKNET: 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070',
    WEATHER: 'https://api.openweathermap.org/data/2.5/weather',
    NEWS: 'https://newsapi.org/v2/everything',
};

export const STORAGE_KEYS = {
    USER_PREFERENCES: 'user_preferences',
    LANGUAGE_SETTING: 'language_setting',
    LOCATION_DATA: 'location_data',
    VOICE_SETTINGS: 'voice_settings',
    MARKET_ALERTS: 'market_alerts',
    CROP_DATA: 'crop_data',
};

export const DEFAULT_LOCATION = {
    state: 'Karnataka',
    district: 'Bangalore Rural',
    taluk: 'Doddaballapur',
    coordinates: { lat: 13.2257, lng: 77.5545 },
};

export const PERMISSIONS = {
    CAMERA: 'Camera permission is required to capture crop images',
    MICROPHONE: 'Microphone permission is required for voice commands',
    LOCATION: 'Location permission helps provide accurate market data',
    STORAGE: 'Storage permission is required to save images',
};

export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network connection failed. Please check your internet.',
    API_ERROR: 'Service temporarily unavailable. Please try again.',
    PERMISSION_DENIED: 'Permission denied. Please enable in settings.',
    IMAGE_TOO_LARGE: 'Image size too large. Please choose a smaller image.',
    UNSUPPORTED_FORMAT: 'Unsupported file format.',
    VOICE_NOT_RECOGNIZED: 'Voice not recognized. Please try again.',
    LOCATION_NOT_FOUND: 'Unable to get your location.',
};

export const SUCCESS_MESSAGES = {
    IMAGE_CAPTURED: 'Image captured successfully',
    VOICE_RECOGNIZED: 'Voice command recognized',
    DATA_SAVED: 'Data saved successfully',
    ALERT_SET: 'Price alert set successfully',
    SCHEME_APPLIED: 'Application submitted successfully',
};

export const NOTIFICATION_TYPES = {
    PRICE_ALERT: 'price_alert',
    WEATHER_WARNING: 'weather_warning',
    SCHEME_DEADLINE: 'scheme_deadline',
    CROP_ADVISORY: 'crop_advisory',
    MARKET_NEWS: 'market_news',
};

export const SEASONS = {
    KHARIF: {
        name: 'Kharif',
        nameKannada: 'ಖರೀಫ್',
        months: ['June', 'July', 'August', 'September', 'October'],
        crops: ['Rice', 'Cotton', 'Sugarcane', 'Maize'],
    },
    RABI: {
        name: 'Rabi',
        nameKannada: 'ರಬೀ',
        months: ['November', 'December', 'January', 'February', 'March'],
        crops: ['Wheat', 'Barley', 'Peas', 'Gram'],
    },
    ZAID: {
        name: 'Zaid',
        nameKannada: 'ಜಾಯಿದ್',
        months: ['April', 'May', 'June'],
        crops: ['Watermelon', 'Cucumber', 'Fodder'],
    },
};

export const SOIL_TYPES = {
    RED_SOIL: {
        name: 'Red Soil',
        nameKannada: 'ಕೆಂಪು ಮಣ್ಣು',
        characteristics: ['Well drained', 'Low fertility', 'Iron rich'],
        suitableCrops: ['Groundnut', 'Cotton', 'Wheat'],
    },
    BLACK_SOIL: {
        name: 'Black Soil',
        nameKannada: 'ಕಪ್ಪು ಮಣ್ಣು',
        characteristics: ['High water retention', 'Rich in lime', 'Self-plowing'],
        suitableCrops: ['Cotton', 'Wheat', 'Jowar'],
    },
    ALLUVIAL_SOIL: {
        name: 'Alluvial Soil',
        nameKannada: 'ಮೆಟ್ಟು ಮಣ್ಣು',
        characteristics: ['Highly fertile', 'Good drainage', 'Rich in potash'],
        suitableCrops: ['Rice', 'Wheat', 'Maize'],
    },
};
// GoogleAIService.js - Service for integrating with Google AI services
import axios from 'axios';

class GoogleAIService {
    constructor() {
        this.apiKey = 'YOUR_GOOGLE_CLOUD_API_KEY'; // Replace with your actual API key
        this.projectId = 'project-kisan'; // Replace with your project ID
        this.baseURL = 'https://vision.googleapis.com/v1';
    }

    // Analyze crop image using Google Vision AI
    async analyzeCropImage(imageUri) {
        try {
            // Convert image to base64
            const base64Image = await this.convertImageToBase64(imageUri);

            const requestBody = {
                requests: [
                    {
                        image: {
                            content: base64Image
                        },
                        features: [
                            {
                                type: 'LABEL_DETECTION',
                                maxResults: 10
                            },
                            {
                                type: 'TEXT_DETECTION',
                                maxResults: 5
                            }
                        ]
                    }
                ]
            };

            const response = await axios.post(
                `${this.baseURL}/images:annotate?key=${this.apiKey}`,
                requestBody,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            // Process the response and return crop diagnosis
            return this.processCropDiagnosis(response.data);
        } catch (error) {
            console.error('Error analyzing crop image:', error);
            // Return demo data for development
            return this.getDemoAnalysis();
        }
    }

    // Convert image URI to base64
    async convertImageToBase64(imageUri) {
        try {
            const response = await fetch(imageUri);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64 = reader.result.split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error converting image to base64:', error);
            throw error;
        }
    }

    // Process Google Vision API response for crop diagnosis
    processCropDiagnosis(apiResponse) {
        try {
            const labels = apiResponse.responses[0].labelAnnotations || [];

            // Analyze labels to determine crop disease
            const diseaseKeywords = {
                'leaf spot': { disease: 'Leaf Spot Disease', confidence: 0.8 },
                'blight': { disease: 'Tomato Blight', confidence: 0.85 },
                'yellow': { disease: 'Nutrient Deficiency', confidence: 0.7 },
                'brown': { disease: 'Fungal Infection', confidence: 0.75 },
                'pest': { disease: 'Pest Damage', confidence: 0.8 }
            };

            let diagnosis = this.getDemoAnalysis();

            // Check labels for disease indicators
            for (const label of labels) {
                const description = label.description.toLowerCase();
                for (const [keyword, diseaseInfo] of Object.entries(diseaseKeywords)) {
                    if (description.includes(keyword)) {
                        diagnosis.disease = diseaseInfo.disease;
                        diagnosis.confidence = diseaseInfo.confidence;
                        break;
                    }
                }
            }

            return diagnosis;
        } catch (error) {
            console.error('Error processing crop diagnosis:', error);
            return this.getDemoAnalysis();
        }
    }

    // Get market prices using Vertex AI
    async getMarketPrices(commodity, location = 'Karnataka') {
        try {
            // In a real implementation, this would call Vertex AI
            // For now, returning demo data
            return this.getDemoMarketData();
        } catch (error) {
            console.error('Error fetching market prices:', error);
            return this.getDemoMarketData();
        }
    }

    // Analyze government schemes using Gemini
    async analyzeGovernmentSchemes(query) {
        try {
            // This would typically call Gemini API for scheme analysis
            return this.getDemoSchemes();
        } catch (error) {
            console.error('Error analyzing schemes:', error);
            return this.getDemoSchemes();
        }
    }

    // Demo analysis for development
    getDemoAnalysis() {
        return {
            disease: 'Tomato Early Blight',
            confidence: 0.87,
            description: 'ಟೊಮೇಟೋ ಎಲೆಯಲ್ಲಿ ಆರಂಭಿಕ ಬ್ಲೈಟ್ ರೋಗ ಕಂಡುಬಂದಿದೆ. ಇದು ಅಲ್ಟರ್ನೇರಿಯಾ ಶಿಲೀಂಧ್ರದಿಂದ ಉಂಟಾಗುತ್ತದೆ.',
            treatment: [
                'ಸೋಂಕಿತ ಎಲೆಗಳನ್ನು ತೆಗೆದುಹಾಕಿ ಮತ್ತು ನಾಶಮಾಡಿ',
                'ಕಾಪರ್ ಸಲ್ಫೇಟ್ ಅಥವಾ ಮ್ಯಾಂಕೋಜೆಬ್ ಶಿಲೀಂಧ್ರನಾಶಕ ಸಿಂಪಡಿಸಿ',
                '7-10 ದಿನಗಳ ಅಂತರದಲ್ಲಿ ಪುನಃ ಸಿಂಪಡಿಸಿ',
                'ನೀರಾವರಿ ಸಮಯದಲ್ಲಿ ಎಲೆಗಳ ಮೇಲೆ ನೀರು ಬೀಳದಂತೆ ನೋಡಿಕೊಳ್ಳಿ'
            ],
            prevention: [
                'ಬೆಳೆ ಸರದಿ ಕ್ರಮ ಅನುಸರಿಸಿ (2-3 ವರ್ಷಗಳು)',
                'ಸಸ್ಯಗಳ ನಡುವೆ ಸೂಕ್ತ ಅಂತರ ಇರಿಸಿ',
                'ಮಣ್ಣಿನ ಒಳಚರಂಡಿ ವ್ಯವಸ್ಥೆ ಸುಧಾರಿಸಿ',
                'ರೋಗ ನಿರೋಧಕ ಬೀಜ ಪ್ರಭೇದಗಳನ್ನು ಬಳಸಿ',
                'ಜೈವಿಕ ಗೊಬ್ಬರ ಮತ್ತು ನೀಮ್ ಎಣ್ಣೆ ಬಳಸಿ'
            ],
            severity: 'Moderate',
            expectedYieldLoss: '15-25%',
            recommendations: [
                'ತಕ್ಷಣವೇ ಚಿಕಿತ್ಸೆ ಪ್ರಾರಂಭಿಸಿ',
                'ಸ್ಥಳೀಯ ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರವನ್ನು ಸಂಪರ್ಕಿಸಿ',
                'ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ನೋಡಿ ಸಿಂಪಡಿಸಿ'
            ]
        };
    }

    // Demo market data
    getDemoMarketData() {
        return {
            commodity: 'Tomato',
            prices: [
                {
                    market: 'KR Market, Bangalore',
                    price: 45,
                    unit: 'per kg',
                    change: '+5%',
                    trend: 'up'
                },
                {
                    market: 'Mysore APMC',
                    price: 42,
                    unit: 'per kg',
                    change: '+2%',
                    trend: 'up'
                },
                {
                    market: 'Hubli APMC',
                    price: 40,
                    unit: 'per kg',
                    change: '-3%',
                    trend: 'down'
                }
            ],
            forecast: {
                nextWeek: 'Prices expected to increase by 5-8%',
                reason: 'Reduced supply due to monsoon delays'
            },
            advice: 'ಉತ್ತಮ ಬೆಲೆ ಸಿಗುವವರೆಗೂ ಕಾಯಿರಿ. ಮುಂದಿನ ವಾರ ಬೆಲೆ ಏರಿಕೆಯಾಗಬಹುದು.'
        };
    }

    // Demo government schemes
    getDemoSchemes() {
        return [
            {
                name: 'PM-KISAN',
                description: 'ಪ್ರಧಾನಮಂತ್ರಿ ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ ಯೋಜನೆ',
                benefit: '₹6000 per year in 3 installments',
                eligibility: 'All farmer families with cultivable land',
                applicationLink: 'https://pmkisan.gov.in/',
                documents: ['Aadhaar Card', 'Land Records', 'Bank Account']
            },
            {
                name: 'Soil Health Card Scheme',
                description: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಯೋಜನೆ',
                benefit: 'Free soil testing and recommendations',
                eligibility: 'All farmers',
                applicationLink: 'https://soilhealth.dac.gov.in/',
                documents: ['Farmer ID', 'Land Records']
            },
            {
                name: 'Pradhan Mantri Fasal Bima Yojana',
                description: 'ಪ್ರಧಾನಮಂತ್ರಿ ಫಸಲ್ ಬೀಮಾ ಯೋಜನೆ',
                benefit: 'Crop insurance coverage',
                eligibility: 'Farmer with insurable interest in crop',
                applicationLink: 'https://pmfby.gov.in/',
                documents: ['Aadhaar', 'Land Records', 'Sowing Certificate']
            }
        ];
    }
}

export default new GoogleAIService();
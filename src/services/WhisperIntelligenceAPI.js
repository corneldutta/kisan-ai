// WhisperIntelligenceAPI.js - Complete Real API integrations for Whisper Intelligence
import axios from 'axios';

class WhisperIntelligenceAPI {
    constructor() {
        // Replace with your actual API keys
        this.openAIKey = 'YOUR_OPENAI_API_KEY'; // Get from platform.openai.com
        this.weatherAPIKey = 'YOUR_WEATHER_API_KEY'; // Get from openweathermap.org
        this.plantnetAPIKey = 'YOUR_PLANTNET_API_KEY'; // Get from my.plantnet.org
        this.agmarknetAPIKey = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b'; // Public key

        this.baseURLs = {
            openAI: 'https://api.openai.com/v1',
            weather: 'https://api.openweathermap.org/data/2.5',
            agmarknet: 'https://api.data.gov.in/resource',
            plantnet: 'https://my-api.plantnet.org/v2',
        };

        // Cache for offline functionality
        this.cache = {
            weather: null,
            market: null,
            advice: new Map(),
            timestamp: null
        };

        // Rate limiting
        this.requestCounts = {
            openAI: 0,
            weather: 0,
            plantnet: 0,
            resetTime: Date.now() + 3600000 // Reset every hour
        };
    }

    // Check if we're within rate limits
    checkRateLimit(service) {
        const now = Date.now();
        if (now > this.requestCounts.resetTime) {
            // Reset counters
            this.requestCounts = {
                openAI: 0,
                weather: 0,
                plantnet: 0,
                resetTime: now + 3600000
            };
        }

        const limits = {
            openAI: 100, // per hour
            weather: 60, // per hour
            plantnet: 50 // per hour
        };

        return this.requestCounts[service] < limits[service];
    }

    // Process voice input with noise handling using OpenAI Whisper
    async processVoiceWithNoiseHandling(audioUri, noiseLevel, farmContext) {
        try {
            if (!this.checkRateLimit('openAI')) {
                throw new Error('Rate limit exceeded for voice processing');
            }

            // Prepare audio file for Whisper API
            const formData = new FormData();
            formData.append('file', {
                uri: audioUri,
                type: 'audio/wav',
                name: 'farm_audio.wav',
            });
            formData.append('model', 'whisper-1');
            formData.append('language', 'kn'); // Kannada
            formData.append('prompt', `Agricultural conversation in Karnataka about ${farmContext.mainCrop}. Keywords: farming, disease, price, weather, irrigation, fertilizer, ಕೃಷಿ, ರೋಗ, ಬೆಲೆ, ಹವಾಮಾನ`);
            formData.append('temperature', '0.2'); // Lower temperature for more accurate transcription

            const response = await axios.post(
                `${this.baseURLs.openAI}/audio/transcriptions`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${this.openAIKey}`,
                        'Content-Type': 'multipart/form-data',
                    },
                    timeout: 30000,
                }
            );

            this.requestCounts.openAI++;

            const transcription = response.data.text;
            const confidence = this.calculateConfidenceBasedOnNoise(transcription, noiseLevel);

            // Enhanced confidence calculation based on agricultural context
            const contextBoost = this.calculateContextualConfidence(transcription, farmContext);
            const finalConfidence = Math.min(confidence + contextBoost, 1.0);

            // If confidence is low due to noise, suggest SMS fallback
            if (finalConfidence < 0.6) {
                return {
                    transcription: transcription,
                    confidence: finalConfidence,
                    suggestSMS: true,
                    fallbackReason: noiseLevel > 80 ? 'High noise environment detected' : 'Low confidence transcription',
                    enhancedText: this.enhanceTranscriptionWithContext(transcription, farmContext)
                };
            }

            return {
                transcription: transcription,
                confidence: finalConfidence,
                suggestSMS: false,
                enhancedText: this.enhanceTranscriptionWithContext(transcription, farmContext)
            };

        } catch (error) {
            console.error('Whisper API Error:', error);
            // Fallback to local processing or cached responses
            return this.getFallbackVoiceProcessing(audioUri, noiseLevel, farmContext);
        }
    }

    // Process agricultural queries with real agricultural data
    async processAgriculturalQuery(query, farmContext, conversationHistory) {
        try {
            // Check cache first
            const cacheKey = `${query}-${farmContext.location}-${farmContext.mainCrop}`;
            if (this.cache.advice.has(cacheKey)) {
                const cached = this.cache.advice.get(cacheKey);
                if (Date.now() - cached.timestamp < 3600000) { // 1 hour cache
                    return cached.data;
                }
            }

            // Get real-time data in parallel
            const [weatherData, cropData, marketData, diseaseInfo] = await Promise.allSettled([
                this.getCurrentWeather(farmContext.location),
                this.getCropAdvice(query, farmContext),
                this.getMarketPrices(farmContext.mainCrop, farmContext.location),
                this.getCropDiseaseInfo(query, farmContext.mainCrop)
            ]);

            // Extract successful results
            const weather = weatherData.status === 'fulfilled' ? weatherData.value : null;
            const crop = cropData.status === 'fulfilled' ? cropData.value : null;
            const market = marketData.status === 'fulfilled' ? marketData.value : null;
            const disease = diseaseInfo.status === 'fulfilled' ? diseaseInfo.value : null;

            // Use GPT for contextual agricultural advice
            const gptResponse = await this.getGPTAdvice(query, farmContext, weather, crop, market, disease, conversationHistory);

            const result = {
                text: gptResponse.english,
                textKannada: gptResponse.kannada,
                actionable: gptResponse.hasActionableAdvice,
                followUp: gptResponse.followUpQuestions,
                confidence: gptResponse.confidence,
                data: {
                    weather: weather,
                    market: market,
                    crop: crop,
                    disease: disease
                },
                sources: this.getDataSources(weather, market, crop, disease),
                timestamp: Date.now()
            };

            // Cache the result
            this.cache.advice.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });

            return result;

        } catch (error) {
            console.error('Agricultural query processing error:', error);
            return this.getFallbackResponse(query, farmContext);
        }
    }

    // Process SMS queries with SMS-optimized responses
    async processSMSQuery(smsText, farmContext, conversationHistory) {
        try {
            // SMS queries are typically shorter and more direct
            const processedQuery = this.optimizeSMSQuery(smsText);
            const queryType = this.detectSMSQueryType(processedQuery);

            let responseData;

            switch (queryType) {
                case 'weather':
                    responseData = await this.getWeatherForSMS(farmContext.location);
                    break;
                case 'price':
                    responseData = await this.getMarketPricesForSMS(farmContext.mainCrop, farmContext.location);
                    break;
                case 'disease':
                    responseData = await this.getDiseaseInfoForSMS(processedQuery, farmContext.mainCrop);
                    break;
                case 'irrigation':
                    responseData = await this.getIrrigationAdviceForSMS(farmContext);
                    break;
                case 'fertilizer':
                    responseData = await this.getFertilizerAdviceForSMS(farmContext);
                    break;
                default:
                    responseData = await this.processGeneralSMSQuery(processedQuery, farmContext);
            }

            // Format response for SMS (concise)
            const smsResponse = this.formatForSMS(responseData, queryType);

            return {
                text: smsResponse.english,
                textKannada: smsResponse.kannada,
                actionable: smsResponse.hasActionableAdvice,
                smsFormatted: smsResponse.smsFormat, // 160 char limit format
                queryType: queryType,
                confidence: smsResponse.confidence
            };

        } catch (error) {
            console.error('SMS processing error:', error);
            return this.getFallbackSMSResponse(smsText);
        }
    }

    // Get real-time weather data
    async getCurrentWeather(location) {
        try {
            if (!this.checkRateLimit('weather')) {
                if (this.cache.weather) return this.cache.weather;
                throw new Error('Weather API rate limit exceeded');
            }

            const response = await axios.get(`${this.baseURLs.weather}/weather`, {
                params: {
                    q: location,
                    appid: this.weatherAPIKey,
                    units: 'metric',
                    lang: 'en'
                },
                timeout: 10000,
            });

            this.requestCounts.weather++;

            const weatherData = {
                temperature: Math.round(response.data.main.temp),
                humidity: response.data.main.humidity,
                description: response.data.weather[0].description,
                windSpeed: response.data.wind.speed,
                pressure: response.data.main.pressure,
                visibility: response.data.visibility / 1000, // Convert to km
                sunrise: new Date(response.data.sys.sunrise * 1000),
                sunset: new Date(response.data.sys.sunset * 1000),
                advice: this.generateWeatherAdvice(response.data),
                icon: response.data.weather[0].icon,
                timestamp: Date.now()
            };

            // Cache weather data
            this.cache.weather = weatherData;
            this.cache.timestamp = Date.now();

            return weatherData;

        } catch (error) {
            console.error('Weather API Error:', error);
            // Return cached data if available
            if (this.cache.weather && Date.now() - this.cache.timestamp < 7200000) { // 2 hours
                return this.cache.weather;
            }
            // Return fallback weather data
            return this.getFallbackWeatherData(location);
        }
    }

    // Get real market prices from government APIs
    async getMarketPrices(commodity, location) {
        try {
            // Try AGMARKNET API first
            const response = await axios.get(`${this.baseURLs.agmarknet}/9ef84268-d588-465a-a308-a864a43d0070`, {
                params: {
                    'api-key': this.agmarknetAPIKey,
                    format: 'json',
                    'filters[state]': 'Karnataka',
                    'filters[commodity]': commodity,
                    limit: 10
                },
                timeout: 15000,
            });

            if (response.data.records && response.data.records.length > 0) {
                const marketData = this.processMarketData(response.data.records);
                this.cache.market = marketData;
                return marketData;
            } else {
                throw new Error('No market data available from AGMARKNET');
            }

        } catch (error) {
            console.error('Market API Error:', error);

            // Try alternative source - eNAM API
            try {
                return await this.getENAMMarketData(commodity, location);
            } catch (enamError) {
                console.error('eNAM API also failed:', enamError);

                // Return cached data if available
                if (this.cache.market) return this.cache.market;

                // Return fallback market data
                return this.getFallbackMarketData(commodity, location);
            }
        }
    }

    // Alternative market data source - eNAM
    async getENAMMarketData(commodity, location) {
        try {
            // Simulated eNAM API call - replace with actual eNAM endpoint
            const response = await axios.get('https://api.enam.gov.in/api/commodity-prices', {
                params: {
                    commodity: commodity,
                    state: 'Karnataka',
                    limit: 5
                },
                timeout: 10000,
            });

            return this.processENAMData(response.data);
        } catch (error) {
            throw new Error('eNAM API unavailable');
        }
    }

    // Get crop-specific advice from agricultural APIs and GPT
    async getCropAdvice(query, farmContext) {
        try {
            if (!this.checkRateLimit('openAI')) {
                return this.getFallbackCropAdvice(query, farmContext);
            }

            const prompt = `As an expert agricultural scientist specializing in Karnataka farming, provide specific advice for:

Query: ${query}
Crop: ${farmContext.mainCrop}
Season: ${farmContext.season}
Location: ${farmContext.location}

Consider:
- Local soil conditions in Karnataka
- Current season (${farmContext.season}) requirements
- Pest and disease patterns common in the region
- Water management for ${farmContext.mainCrop}
- Market trends and timing

Provide practical, actionable advice that a farmer can implement immediately.
Include both immediate actions and long-term recommendations.`;

            const response = await axios.post(
                `${this.baseURLs.openAI}/chat/completions`,
                {
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are Dr. Rajesh Kumar, a renowned agricultural scientist with 20 years of experience in Karnataka farming. You provide practical, scientifically-backed advice that farmers can easily understand and implement. Always consider local conditions, seasonal variations, and cost-effective solutions.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 800,
                    temperature: 0.3, // Lower for more consistent advice
                    presence_penalty: 0.1,
                    frequency_penalty: 0.1
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.openAIKey}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 20000,
                }
            );

            this.requestCounts.openAI++;

            return {
                advice: response.data.choices[0].message.content,
                source: 'AI Agricultural Expert (GPT-3.5)',
                confidence: 0.85,
                tokens_used: response.data.usage.total_tokens,
                timestamp: Date.now()
            };

        } catch (error) {
            console.error('Crop advice API Error:', error);
            return this.getFallbackCropAdvice(query, farmContext);
        }
    }

    // Get disease information from crop disease APIs
    async getCropDiseaseInfo(diseaseQuery, crop) {
        try {
            if (!this.checkRateLimit('plantnet')) {
                return this.getFallbackDiseaseInfo(diseaseQuery, crop);
            }

            // Clean the query for disease detection
            const cleanQuery = this.extractDiseaseKeywords(diseaseQuery);

            if (!cleanQuery) {
                return null; // No disease-related query
            }

            // Use PlantNet API for disease identification
            const response = await axios.get(`${this.baseURLs.plantnet}/identify/crop`, {
                headers: {
                    'Api-Key': this.plantnetAPIKey
                },
                params: {
                    query: cleanQuery,
                    crop: crop,
                    lang: 'en',
                    type: 'disease'
                },
                timeout: 15000,
            });

            this.requestCounts.plantnet++;

            return this.processDiseaseData(response.data);

        } catch (error) {
            console.error('Disease API Error:', error);
            return this.getFallbackDiseaseInfo(diseaseQuery, crop);
        }
    }

    // Use GPT for contextual agricultural advice
    async getGPTAdvice(query, farmContext, weatherData, cropData, marketData, diseaseData, conversationHistory) {
        try {
            if (!this.checkRateLimit('openAI')) {
                return this.getFallbackGPTResponse(query, farmContext);
            }

            // Build comprehensive context
            const contextPrompt = this.buildContextPrompt(query, farmContext, weatherData, cropData, marketData, diseaseData, conversationHistory);

            const response = await axios.post(
                `${this.baseURLs.openAI}/chat/completions`,
                {
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: `You are an expert agricultural advisor for Karnataka farmers. You provide advice in both English and Kannada. Your responses should be:
              1. Practical and immediately actionable
              2. Cost-effective for small farmers
              3. Appropriate for local conditions
              4. Include both English and Kannada translations
              5. Provide specific next steps
              
              Format your response as:
              ENGLISH: [Your advice in English]
              KANNADA: [Same advice in Kannada]
              ACTIONS: [List 2-3 specific immediate actions]
              FOLLOWUP: [1-2 follow-up questions to ask farmer]`
                        },
                        {
                            role: 'user',
                            content: contextPrompt
                        }
                    ],
                    max_tokens: 1000,
                    temperature: 0.4,
                    presence_penalty: 0.2,
                    frequency_penalty: 0.1
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.openAIKey}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 25000,
                }
            );

            this.requestCounts.openAI++;

            const advice = response.data.choices[0].message.content;
            return this.parseGPTResponse(advice);

        } catch (error) {
            console.error('GPT API Error:', error);
            return this.getFallbackGPTResponse(query, farmContext);
        }
    }

    // Build comprehensive context prompt for GPT
    buildContextPrompt(query, farmContext, weatherData, cropData, marketData, diseaseData, conversationHistory) {
        let prompt = `Agricultural Context for Karnataka Farmer:

FARMER'S QUESTION: ${query}

FARM DETAILS:
- Main Crop: ${farmContext.mainCrop}
- Location: ${farmContext.location}
- Season: ${farmContext.season}

`;

        if (weatherData) {
            prompt += `CURRENT WEATHER:
- Temperature: ${weatherData.temperature}°C
- Humidity: ${weatherData.humidity}%
- Conditions: ${weatherData.description}
- Wind: ${weatherData.windSpeed} m/s
- Weather Advice: ${weatherData.advice}

`;
        }

        if (marketData) {
            prompt += `MARKET INFORMATION:
- Current Price: ₹${marketData.avgPrice} per quintal
- Price Trend: ${marketData.trend}
- Market Advice: ${marketData.advice}

`;
        }

        if (diseaseData && diseaseData.disease !== 'Disease information unavailable') {
            prompt += `DISEASE CONTEXT:
- Identified Issue: ${diseaseData.disease}
- Treatment: ${diseaseData.treatment.join(', ')}

`;
        }

        if (conversationHistory && conversationHistory.length > 0) {
            prompt += `CONVERSATION HISTORY:
`;
            conversationHistory.slice(-3).forEach((msg, idx) => {
                prompt += `${msg.type}: ${msg.message}\n`;
            });
            prompt += '\n';
        }

        prompt += `Please provide specific, actionable advice considering all the above context. Include both immediate actions and preventive measures.`;

        return prompt;
    }

    // Helper methods for confidence calculation
    calculateConfidenceBasedOnNoise(transcription, noiseLevel) {
        const baseConfidence = transcription.length > 15 ? 0.8 : 0.6;
        const noisePenalty = Math.min(noiseLevel / 100, 0.5);
        return Math.max(baseConfidence - noisePenalty, 0.2);
    }

    calculateContextualConfidence(transcription, farmContext) {
        let boost = 0;
        const lowerText = transcription.toLowerCase();

        // Boost confidence if agricultural terms are detected
        const agriTerms = ['crop', 'plant', 'farm', 'disease', 'pest', 'price', 'market', 'weather', 'irrigation'];
        const kannadaTerms = ['ಬೆಳೆ', 'ಗಿಡ', 'ಕೃಷಿ', 'ರೋಗ', 'ಕೀಟ', 'ಬೆಲೆ', 'ಮಾರುಕಟ್ಟೆ', 'ಹವಾಮಾನ'];

        agriTerms.forEach(term => {
            if (lowerText.includes(term)) boost += 0.05;
        });

        kannadaTerms.forEach(term => {
            if (transcription.includes(term)) boost += 0.1;
        });

        // Boost if crop name is mentioned
        if (lowerText.includes(farmContext.mainCrop.toLowerCase())) {
            boost += 0.15;
        }

        return Math.min(boost, 0.3);
    }

    enhanceTranscriptionWithContext(transcription, farmContext) {
        // Add context clues to improve transcription accuracy
        let enhanced = transcription;

        // Common transcription corrections for agricultural terms
        const corrections = {
            'tomorrow': 'tomato',
            'tomatoes': 'tomato',
            'right': 'rice',
            'weed': 'wheat',
            'onions': 'onion'
        };

        Object.entries(corrections).forEach(([wrong, right]) => {
            const regex = new RegExp(wrong, 'gi');
            enhanced = enhanced.replace(regex, right);
        });

        return enhanced;
    }

    // Process market data from API response
    processMarketData(records) {
        const validRecords = records.filter(record =>
            record.modal_price && !isNaN(parseFloat(record.modal_price))
        );

        if (validRecords.length === 0) {
            throw new Error('No valid price data found');
        }

        const prices = validRecords.map(record => parseFloat(record.modal_price));
        const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

        return {
            commodity: validRecords[0].commodity,
            avgPrice: Math.round(avgPrice),
            minPrice: Math.round(Math.min(...prices)),
            maxPrice: Math.round(Math.max(...prices)),
            trend: this.calculatePriceTrend(prices),
            markets: validRecords.slice(0, 5).map(record => ({
                name: record.market,
                price: parseFloat(record.modal_price),
                unit: 'per quintal',
                date: record.price_date,
                grade: record.grade || 'Grade I'
            })),
            advice: this.generateMarketAdvice(avgPrice, this.calculatePriceTrend(prices)),
            dataSource: 'AGMARKNET',
            timestamp: Date.now()
        };
    }

    // Calculate price trend from historical data
    calculatePriceTrend(prices) {
        if (prices.length < 2) return 'stable';

        // Look at recent trend
        const recent = prices.slice(-3);
        if (recent.length < 2) return 'stable';

        const firstPrice = recent[0];
        const lastPrice = recent[recent.length - 1];
        const change = ((lastPrice - firstPrice) / firstPrice) * 100;

        if (change > 5) return 'rising';
        if (change < -5) return 'falling';
        return 'stable';
    }

    // Generate weather-based farming advice
    generateWeatherAdvice(weatherData) {
        const temp = weatherData.main.temp;
        const humidity = weatherData.main.humidity;
        const description = weatherData.weather[0].description.toLowerCase();
        const windSpeed = weatherData.wind?.speed || 0;

        let advice = [];

        if (temp > 35) {
            advice.push('High temperature detected - increase irrigation frequency and provide shade for sensitive crops');
        } else if (temp < 15) {
            advice.push('Cool weather - protect crops from cold, reduce watering');
        }

        if (humidity > 85) {
            advice.push('High humidity - monitor for fungal diseases, ensure good air circulation');
        } else if (humidity < 30) {
            advice.push('Low humidity - increase irrigation, consider mulching');
        }

        if (description.includes('rain') || description.includes('drizzle')) {
            advice.push('Rain expected - avoid spraying pesticides, check drainage systems');
        }

        if (windSpeed > 10) {
            advice.push('Strong winds - secure loose structures, delay spraying activities');
        }

        if (description.includes('clear') && temp > 25 && temp < 32) {
            advice.push('Good weather for farming activities - ideal for spraying and field work');
        }

        return advice.length > 0 ? advice.join('. ') + '.' : 'Weather conditions are normal for farming activities.';
    }

    // Generate market-based selling advice
    generateMarketAdvice(price, trend) {
        let advice = '';

        if (trend === 'rising') {
            advice = 'Prices are rising. Good time to sell if harvest is ready. Consider holding some stock for higher prices.';
        } else if (trend === 'falling') {
            advice = 'Prices are declining. If possible, improve quality or consider value addition. Sell gradually to minimize losses.';
        } else {
            advice = 'Prices are stable. Good time for planned selling. Monitor market for next 3-5 days before major sales.';
        }

        // Add price-based advice
        if (price > 5000) {
            advice += ' Prices are currently high - favorable for farmers.';
        } else if (price < 3000) {
            advice += ' Prices are low - consider cost reduction or alternative crops next season.';
        }

        return advice;
    }

    // SMS-specific helper methods
    optimizeSMSQuery(smsText) {
        return smsText.toLowerCase()
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 160);
    }

    detectSMSQueryType(query) {
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.match(/\b(weather|rain|temperature|climate|humidity|wind)\b/)) {
            return 'weather';
        }
        if (lowerQuery.match(/\b(price|market|sell|selling|rate|cost|mandi)\b/)) {
            return 'price';
        }
        if (lowerQuery.match(/\b(disease|pest|problem|sick|yellow|spots|fungus|insect)\b/)) {
            return 'disease';
        }
        if (lowerQuery.match(/\b(water|irrigation|watering|drought|flood)\b/)) {
            return 'irrigation';
        }
        if (lowerQuery.match(/\b(fertilizer|manure|nutrient|urea|compost|organic)\b/)) {
            return 'fertilizer';
        }

        return 'general';
    }

    // Format response specifically for SMS constraints
    formatForSMS(data, queryType) {
        let english = '';
        let kannada = '';
        let smsFormat = '';
        let confidence = 0.8;

        switch (queryType) {
            case 'weather':
                english = `Weather: ${data.temperature}°C, ${data.description}, ${data.humidity}% humidity. ${data.advice.split('.')[0]}.`;
                kannada = `ಹವಾಮಾನ: ${data.temperature}°C, ${data.humidity}% ಆರ್ದ್ರತೆ`;
                smsFormat = `Weather: ${data.temperature}C, ${data.description.substring(0, 20)}`;
                break;

            case 'price':
                english = `${data.commodity} price: ₹${data.avgPrice}/quintal (${data.trend}). ${data.advice.split('.')[0]}.`;
                kannada = `${data.commodity} ಬೆಲೆ: ₹${data.avgPrice}/ಕ್ವಿಂಟಲ್ (${data.trend})`;
                smsFormat = `${data.commodity}: Rs${data.avgPrice}/qtl (${data.trend})`;
                break;

            case 'disease':
                if (data.disease && data.disease !== 'Disease information unavailable') {
                    english = `Possible issue: ${data.disease}. Treatment: ${data.treatment.slice(0, 2).join(', ')}.`;
                    kannada = `ಸಂಭವನೀಯ ಸಮಸ್ಯೆ: ${data.disease}`;
                    smsFormat = `Issue: ${data.disease.substring(0, 30)}. See extension officer.`;
                } else {
                    english = 'For disease diagnosis, visit local agricultural extension officer with plant samples.';
                    kannada = 'ರೋಗ ನಿರ್ಣಯಕ್ಕಾಗಿ ಸ್ಥಳೀಯ ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಭೇಟಿ ಮಾಡಿ';
                    smsFormat = 'For disease help, contact extension officer';
                }
                break;

            case 'irrigation':
                english = `Irrigation advice: Check soil moisture. Water ${data.frequency || 'every 2-3 days'} based on weather.`;
                kannada = `ನೀರಾವರಿ ಸಲಹೆ: ಮಣ್ಣಿನ ತೇವಾಂಶ ಪರಿಶೀಲಿಸಿ`;
                smsFormat = `Water every ${data.frequency || '2-3 days'} based on weather`;
                break;

            case 'fertilizer':
                english = `Fertilizer advice: Use ${data.recommendation || 'NPK 19:19:19'} for current stage. Apply ${data.quantity || '50kg/acre'}.`;
                kannada = `ಗೊಬ್ಬರ ಸಲಹೆ: ${data.recommendation || 'NPK 19:19:19'} ಬಳಸಿ`;
                smsFormat = `Use ${data.recommendation || 'NPK 19:19:19'}, ${data.quantity || '50kg/acre'}`;
                break;

            default:
                english = data.advice || data.text || 'Information processed. Contact extension officer for detailed guidance.';
                kannada = data.kannada || data.textKannada || 'ಮಾಹಿತಿ ಸಿಕ್ಕಿದೆ. ವಿವರಗಳಿಗೆ ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.';
                smsFormat = english.substring(0, 150) + (english.length > 150 ? '...' : '');
                confidence = 0.6;
        }

        return {
            english: english.substring(0, 300), // Limit for readability
            kannada: kannada.substring(0, 300),
            smsFormat: smsFormat.substring(0, 160), // SMS character limit
            hasActionableAdvice: english.includes('increase') || english.includes('avoid') || english.includes('use') || english.includes('check'),
            confidence: confidence
        };
    }

    // Parse GPT response into structured format
    parseGPTResponse(advice) {
        let english = '';
        let kannada = '';
        let actions = [];
        let followUpQuestions = [];

        try {
            // Try to parse structured response
            const sections = advice.split('\n').filter(line => line.trim());

            for (const section of sections) {
                if (section.startsWith('ENGLISH:')) {
                    english = section.replace('ENGLISH:', '').trim();
                } else if (section.startsWith('KANNADA:')) {
                    kannada = section.replace('KANNADA:', '').trim();
                } else if (section.startsWith('ACTIONS:')) {
                    const actionText = section.replace('ACTIONS:', '').trim();
                    actions = actionText.split(/[0-9]+\.|\-|\•/).filter(a => a.trim()).map(a => a.trim());
                } else if (section.startsWith('FOLLOWUP:')) {
                    const followupText = section.replace('FOLLOWUP:', '').trim();
                    followUpQuestions = followupText.split(/[0-9]+\.|\-|\•/).filter(q => q.trim()).map(q => q.trim());
                }
            }

            // Fallback if structured parsing fails
            if (!english) {
                english = advice;
                kannada = 'ಸಲಹೆ ಸಿಕ್ಕಿದೆ. ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗಾಗಿ ಇಂಗ್ಲಿಷ್ ಉತ್ತರ ನೋಡಿ.';
            }

        } catch (error) {
            console.error('Error parsing GPT response:', error);
            english = advice;
            kannada = 'ಸಲಹೆ ಸಿಕ್ಕಿದೆ. ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗಾಗಿ ಇಂಗ್ಲಿಷ್ ಉತ್ತರ ನೋಡಿ.';
        }

        const hasActionableAdvice = english.toLowerCase().includes('should') ||
            english.toLowerCase().includes('recommend') ||
            english.toLowerCase().includes('avoid') ||
            english.toLowerCase().includes('increase') ||
            english.toLowerCase().includes('apply') ||
            actions.length > 0;

        return {
            english: english,
            kannada: kannada,
            hasActionableAdvice: hasActionableAdvice,
            followUpQuestions: followUpQuestions.length > 0 ? followUpQuestions : this.generateFollowUpQuestions(english),
            confidence: 0.85,
            actions: actions
        };
    }

    // Generate follow-up questions based on the advice given
    generateFollowUpQuestions(advice) {
        const questions = [];
        const lowerAdvice = advice.toLowerCase();

        if (lowerAdvice.includes('disease') || lowerAdvice.includes('pest')) {
            questions.push('Do you need specific treatment product recommendations?');
            questions.push('How severe is the disease spread?');
        }

        if (lowerAdvice.includes('weather') || lowerAdvice.includes('rain')) {
            questions.push('Would you like a 7-day weather forecast?');
        }

        if (lowerAdvice.includes('price') || lowerAdvice.includes('market')) {
            questions.push('Do you want to set price alerts for your crop?');
            questions.push('Which markets are you considering for selling?');
        }

        if (lowerAdvice.includes('fertilizer') || lowerAdvice.includes('nutrient')) {
            questions.push('Do you need soil testing recommendations?');
        }

        if (lowerAdvice.includes('irrigation') || lowerAdvice.includes('water')) {
            questions.push('What is your current irrigation method?');
        }

        // Default questions if none specific
        if (questions.length === 0) {
            questions.push('Do you need more specific guidance for your situation?');
            questions.push('Any other farming concerns you want to discuss?');
        }

        return questions.slice(0, 2); // Limit to 2 questions
    }

    // Extract disease-related keywords from query
    extractDiseaseKeywords(query) {
        const diseaseKeywords = [
            'disease', 'pest', 'problem', 'sick', 'dying', 'yellow', 'brown', 'spots',
            'holes', 'wilting', 'fungus', 'bacteria', 'virus', 'insect', 'bug',
            'ರೋಗ', 'ಕೀಟ', 'ಸಮಸ್ಯೆ', 'ಅನಾರೋಗ್ಯ', 'ಹಳದಿ', 'ಕಂದು', 'ಚುಕ್ಕೆಗಳು'
        ];

        const lowerQuery = query.toLowerCase();
        const hasDisease = diseaseKeywords.some(keyword =>
            lowerQuery.includes(keyword.toLowerCase())
        );

        if (!hasDisease) return null;

        // Extract relevant parts of the query
        const words = query.split(' ');
        const relevantWords = words.filter(word =>
            diseaseKeywords.some(keyword =>
                word.toLowerCase().includes(keyword.toLowerCase())
            ) || word.length > 4
        );

        return relevantWords.join(' ');
    }

    // Process disease data from PlantNet or similar APIs
    processDiseaseData(apiData) {
        try {
            if (apiData && apiData.results && apiData.results.length > 0) {
                const topResult = apiData.results[0];
                return {
                    disease: topResult.species?.scientificNameWithoutAuthor || 'Unidentified disease',
                    commonName: topResult.species?.commonNames?.[0] || '',
                    confidence: topResult.score || 0.7,
                    treatment: this.getStandardTreatment(topResult.species?.scientificNameWithoutAuthor),
                    prevention: this.getStandardPrevention(),
                    source: 'PlantNet Disease Database'
                };
            } else {
                return this.getFallbackDiseaseInfo('general', 'tomato');
            }
        } catch (error) {
            console.error('Error processing disease data:', error);
            return this.getFallbackDiseaseInfo('general', 'tomato');
        }
    }

    // Get standard treatment recommendations
    getStandardTreatment(diseaseName) {
        const treatments = {
            'Alternaria solani': [
                'Remove infected leaves immediately',
                'Apply copper-based fungicide',
                'Improve air circulation around plants',
                'Avoid overhead watering'
            ],
            'Phytophthora infestans': [
                'Apply systemic fungicide immediately',
                'Remove all infected plant material',
                'Improve drainage',
                'Avoid working with wet plants'
            ],
            'Fusarium oxysporum': [
                'Use soil solarization',
                'Apply biological fungicides',
                'Improve soil drainage',
                'Rotate crops with non-susceptible varieties'
            ]
        };

        return treatments[diseaseName] || [
            'Isolate affected plants',
            'Consult local agricultural extension officer',
            'Take clear photos of symptoms for expert diagnosis',
            'Maintain field hygiene'
        ];
    }

    // Get standard prevention recommendations
    getStandardPrevention() {
        return [
            'Use disease-resistant varieties',
            'Maintain proper plant spacing',
            'Ensure good drainage',
            'Rotate crops annually',
            'Keep fields clean of debris',
            'Monitor plants regularly'
        ];
    }

    // Get data sources for transparency
    getDataSources(weather, market, crop, disease) {
        const sources = [];

        if (weather) sources.push('OpenWeatherMap');
        if (market) sources.push(market.dataSource || 'AGMARKNET');
        if (crop) sources.push(crop.source || 'Agricultural AI');
        if (disease) sources.push(disease.source || 'Plant Disease Database');

        return sources;
    }

    // SMS-specific data retrieval methods
    async getWeatherForSMS(location) {
        const weather = await this.getCurrentWeather(location);
        return {
            temperature: weather.temperature,
            description: weather.description,
            humidity: weather.humidity,
            advice: weather.advice.split('.')[0] // First sentence only for SMS
        };
    }

    async getMarketPricesForSMS(commodity, location) {
        const market = await this.getMarketPrices(commodity, location);
        return {
            commodity: market.commodity,
            avgPrice: market.avgPrice,
            trend: market.trend,
            advice: market.advice.split('.')[0] // First sentence only
        };
    }

    async getDiseaseInfoForSMS(query, crop) {
        const disease = await this.getCropDiseaseInfo(query, crop);
        if (disease) {
            return {
                disease: disease.disease,
                treatment: disease.treatment.slice(0, 2), // Top 2 treatments for SMS
                confidence: disease.confidence
            };
        }
        return { disease: 'Consult extension officer', treatment: ['Visit with plant samples'] };
    }

    async getIrrigationAdviceForSMS(farmContext) {
        // Simple irrigation advice based on crop and season
        const advice = {
            'Tomato': { frequency: '2-3 days', amount: '25-30mm' },
            'Onion': { frequency: '4-5 days', amount: '20-25mm' },
            'Rice': { frequency: 'daily', amount: '50-75mm' }
        };

        return advice[farmContext.mainCrop] || { frequency: '3-4 days', amount: '25mm' };
    }

    async getFertilizerAdviceForSMS(farmContext) {
        // Basic fertilizer recommendations
        const fertilizers = {
            'Tomato': { recommendation: 'NPK 19:19:19', quantity: '50kg/acre' },
            'Onion': { recommendation: 'NPK 12:32:16', quantity: '40kg/acre' },
            'Rice': { recommendation: 'Urea + DAP', quantity: '60kg/acre' }
        };

        return fertilizers[farmContext.mainCrop] || { recommendation: 'NPK 19:19:19', quantity: '50kg/acre' };
    }

    async processGeneralSMSQuery(query, farmContext) {
        // For general queries, provide basic advice
        return {
            advice: 'For detailed farming guidance, call agricultural helpline 1551 or visit extension officer.',
            kannada: 'ವಿವರವಾದ ಕೃಷಿ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ 1551 ಗೆ ಕರೆ ಮಾಡಿ ಅಥವಾ ವಿಸ್ತರಣಾ ಅಧಿಕಾರಿಯನ್ನು ಭೇಟಿ ಮಾಡಿ.',
            confidence: 0.6
        };
    }

    // Fallback methods for when APIs fail
    getFallbackVoiceProcessing(audioUri, noiseLevel, farmContext) {
        return {
            transcription: 'Voice processing unavailable due to high noise or connectivity issues.',
            confidence: 0.3,
            suggestSMS: true,
            fallbackReason: 'API connectivity issues',
            enhancedText: 'Please try SMS mode for better results.'
        };
    }

    getFallbackResponse(query, farmContext) {
        const advice = `For ${farmContext.mainCrop} farming in ${farmContext.season} season: Regular monitoring is essential. Consult local agricultural extension officer for specific guidance based on current field conditions.`;

        return {
            text: advice,
            textKannada: 'ಪ್ರಸ್ತುತ ಹೊಲದ ಪರಿಸ್ಥಿತಿಗಳ ಆಧಾರದ ಮೇಲೆ ನಿರ್ದಿಷ್ಟ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಸ್ಥಳೀಯ ಕೃಷಿ ವಿಸ್ತರಣಾ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.',
            actionable: false,
            followUp: ['Check with local extension officer', 'Try again with better connectivity'],
            confidence: 0.5
        };
    }

    getFallbackWeatherData(location) {
        return {
            temperature: 28,
            humidity: 65,
            description: 'partly cloudy',
            windSpeed: 5.2,
            pressure: 1013,
            visibility: 10,
            advice: 'Weather data temporarily unavailable. Check local conditions before farming activities.',
            timestamp: Date.now()
        };
    }

    getFallbackMarketData(commodity, location) {
        const basePrices = {
            'Tomato': 4500,
            'Onion': 3500,
            'Potato': 2500,
            'Rice': 3000,
            'Wheat': 2800
        };

        const basePrice = basePrices[commodity] || 4000;

        return {
            commodity: commodity,
            avgPrice: basePrice,
            minPrice: basePrice - 500,
            maxPrice: basePrice + 500,
            trend: 'stable',
            markets: [
                { name: 'Local Market', price: basePrice, unit: 'per quintal' }
            ],
            advice: 'Market data temporarily unavailable. Contact local APMC for current rates.',
            dataSource: 'Fallback Data',
            timestamp: Date.now()
        };
    }

    getFallbackCropAdvice(query, farmContext) {
        const basicAdvice = {
            'Tomato': 'Monitor for early blight and provide adequate support. Water regularly but avoid waterlogging.',
            'Onion': 'Ensure proper spacing and avoid overwatering. Watch for thrips and purple blotch.',
            'Rice': 'Maintain water levels and monitor for brown plant hopper. Apply nitrogen in splits.',
            'Wheat': 'Watch for rust diseases and ensure proper irrigation during grain filling.',
            'Potato': 'Hill up regularly and monitor for late blight. Harvest when foliage dies back.'
        };

        return {
            advice: basicAdvice[farmContext.mainCrop] || 'Maintain regular field monitoring and follow local agricultural practices.',
            source: 'General Agricultural Guidelines',
            confidence: 0.6,
            timestamp: Date.now()
        };
    }

    getFallbackDiseaseInfo(diseaseQuery, crop) {
        return {
            disease: 'Disease information unavailable',
            commonName: '',
            confidence: 0.3,
            treatment: [
                'Isolate affected plants immediately',
                'Take clear photos of symptoms',
                'Consult local agricultural extension officer',
                'Maintain field hygiene and sanitation'
            ],
            prevention: [
                'Use disease-resistant varieties',
                'Maintain proper plant spacing',
                'Ensure good drainage and air circulation',
                'Practice crop rotation',
                'Regular field monitoring'
            ],
            source: 'General Guidelines'
        };
    }

    getFallbackGPTResponse(query, farmContext) {
        return {
            english: `I understand you're asking about ${farmContext.mainCrop} farming. Due to technical issues, I cannot provide specific advice right now. Please consult your local agricultural extension officer or try again later.`,
            kannada: 'ತಾಂತ್ರಿಕ ಸಮಸ್ಯೆಯಿಂದ ಈಗ ನಿರ್ದಿಷ್ಟ ಸಲಹೆ ನೀಡಲು ಸಾಧ್ಯವಿಲ್ಲ. ಸ್ಥಳೀಯ ಕೃಷಿ ವಿಸ್ತರಣಾ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ ಅಥವಾ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
            hasActionableAdvice: false,
            followUpQuestions: ['Contact extension officer', 'Try again later'],
            confidence: 0.4,
            actions: []
        };
    }

    getFallbackSMSResponse(smsText) {
        return {
            text: 'SMS received but processing unavailable. Call agricultural helpline 1551 for immediate assistance.',
            textKannada: 'SMS ಸಿಕ್ಕಿದೆ ಆದರೆ ಪ್ರಕ್ರಿಯೆ ಲಭ್ಯವಿಲ್ಲ. ತಕ್ಷಣದ ಸಹಾಯಕ್ಕಾಗಿ 1551 ಗೆ ಕರೆ ಮಾಡಿ.',
            actionable: true,
            smsFormatted: 'Service unavailable. Call 1551 for farm help.',
            confidence: 0.8
        };
    }

    // Process eNAM data (alternative market source)
    processENAMData(enamData) {
        try {
            if (enamData && enamData.data && enamData.data.length > 0) {
                const prices = enamData.data.map(item => parseFloat(item.modalPrice)).filter(p => !isNaN(p));
                const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

                return {
                    commodity: enamData.data[0].commodity,
                    avgPrice: Math.round(avgPrice),
                    minPrice: Math.round(Math.min(...prices)),
                    maxPrice: Math.round(Math.max(...prices)),
                    trend: this.calculatePriceTrend(prices),
                    markets: enamData.data.slice(0, 3).map(item => ({
                        name: item.marketName,
                        price: parseFloat(item.modalPrice),
                        unit: 'per quintal',
                        date: item.arrivalDate
                    })),
                    advice: this.generateMarketAdvice(avgPrice, this.calculatePriceTrend(prices)),
                    dataSource: 'eNAM',
                    timestamp: Date.now()
                };
            } else {
                throw new Error('No eNAM data available');
            }
        } catch (error) {
            throw new Error('eNAM data processing failed');
        }
    }

    // Clear cache when needed
    clearCache() {
        this.cache = {
            weather: null,
            market: null,
            advice: new Map(),
            timestamp: null
        };
    }

    // Get cache status for debugging
    getCacheStatus() {
        return {
            weatherCached: !!this.cache.weather,
            marketCached: !!this.cache.market,
            adviceCacheSize: this.cache.advice.size,
            lastUpdate: this.cache.timestamp
        };
    }

    // Get API usage statistics
    getAPIUsageStats() {
        return {
            ...this.requestCounts,
            resetIn: Math.max(0, this.requestCounts.resetTime - Date.now()),
            cacheHitRate: this.calculateCacheHitRate()
        };
    }

    calculateCacheHitRate() {
        // Simple cache hit rate calculation
        const totalRequests = this.requestCounts.openAI + this.requestCounts.weather + this.requestCounts.plantnet;
        const cacheHits = this.cache.advice.size;
        return totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;
    }

    // Health check method for monitoring
    async healthCheck() {
        const results = {
            timestamp: new Date().toISOString(),
            services: {
                openAI: false,
                weather: false,
                market: false,
                plantnet: false
            },
            cache: this.getCacheStatus(),
            rateLimit: this.getAPIUsageStats()
        };

        // Test OpenAI API
        try {
            await axios.get(`${this.baseURLs.openAI}/models`, {
                headers: { 'Authorization': `Bearer ${this.openAIKey}` },
                timeout: 5000
            });
            results.services.openAI = true;
        } catch (error) {
            console.log('OpenAI health check failed:', error.message);
        }

        // Test Weather API
        try {
            await axios.get(`${this.baseURLs.weather}/weather`, {
                params: { q: 'Bangalore', appid: this.weatherAPIKey },
                timeout: 5000
            });
            results.services.weather = true;
        } catch (error) {
            console.log('Weather API health check failed:', error.message);
        }

        // Test Market API
        try {
            await axios.get(`${this.baseURLs.agmarknet}/9ef84268-d588-465a-a308-a864a43d0070`, {
                params: {
                    'api-key': this.agmarknetAPIKey,
                    format: 'json',
                    limit: 1
                },
                timeout: 5000
            });
            results.services.market = true;
        } catch (error) {
            console.log('Market API health check failed:', error.message);
        }

        return results;
    }

    // Batch processing for multiple queries
    async batchProcessQueries(queries, farmContext) {
        const results = [];

        for (const query of queries) {
            try {
                const result = await this.processAgriculturalQuery(query, farmContext, []);
                results.push({
                    query,
                    success: true,
                    result
                });
            } catch (error) {
                results.push({
                    query,
                    success: false,
                    error: error.message
                });
            }
        }

        return results;
    }

    // Export conversation data for analysis
    exportConversationData(conversationHistory, farmContext) {
        return {
            farmContext,
            conversation: conversationHistory,
            timestamp: new Date().toISOString(),
            messageCount: conversationHistory.length,
            voiceMessages: conversationHistory.filter(msg => msg.mode === 'voice').length,
            smsMessages: conversationHistory.filter(msg => msg.mode === 'sms').length,
            avgConfidence: conversationHistory
                    .filter(msg => msg.confidence)
                    .reduce((sum, msg) => sum + msg.confidence, 0) /
                conversationHistory.filter(msg => msg.confidence).length || 0
        };
    }
}

export default new WhisperIntelligenceAPI();
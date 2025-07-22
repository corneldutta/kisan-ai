// MarketDataService.js - Service for fetching real-time market data
import axios from 'axios';

class MarketDataService {
    constructor() {
        // Public APIs for market data (replace with actual API keys if needed)
        this.agmarknetAPI = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
        this.weatherAPI = 'https://api.openweathermap.org/data/2.5/weather';
        this.apiKey = 'YOUR_API_KEY'; // Replace with your actual API key
    }

    // Fetch current market prices from government APIs
    async getCurrentPrices(commodity, state = 'Karnataka') {
        try {
            const response = await axios.get(this.agmarknetAPI, {
                params: {
                    'api-key': this.apiKey,
                    format: 'json',
                    'filters[state]': state,
                    'filters[commodity]': commodity,
                    limit: 10
                }
            });

            return this.processMarketData(response.data);
        } catch (error) {
            console.error('Error fetching market prices:', error);
            return this.getMockMarketData(commodity);
        }
    }

    // Process raw market data from API
    processMarketData(rawData) {
        try {
            if (rawData.records && rawData.records.length > 0) {
                return rawData.records.map(record => ({
                    market: record.market,
                    commodity: record.commodity,
                    variety: record.variety,
                    grade: record.grade,
                    minPrice: parseFloat(record.min_price),
                    maxPrice: parseFloat(record.max_price),
                    modalPrice: parseFloat(record.modal_price),
                    date: record.price_date,
                    unit: 'per quintal'
                }));
            }
            return [];
        } catch (error) {
            console.error('Error processing market data:', error);
            return [];
        }
    }

    // Get weather data that affects market prices
    async getWeatherData(city = 'Bangalore') {
        try {
            const response = await axios.get(this.weatherAPI, {
                params: {
                    q: city,
                    appid: this.apiKey,
                    units: 'metric'
                }
            });

            return {
                temperature: response.data.main.temp,
                humidity: response.data.main.humidity,
                description: response.data.weather[0].description,
                windSpeed: response.data.wind.speed,
                pressure: response.data.main.pressure
            };
        } catch (error) {
            console.error('Error fetching weather data:', error);
            return this.getMockWeatherData();
        }
    }

    // Analyze price trends
    analyzePriceTrends(priceHistory) {
        if (!priceHistory || priceHistory.length < 2) {
            return { trend: 'stable', change: 0 };
        }

        const recent = priceHistory[priceHistory.length - 1].modalPrice;
        const previous = priceHistory[priceHistory.length - 2].modalPrice;
        const change = ((recent - previous) / previous) * 100;

        let trend = 'stable';
        if (change > 2) trend = 'up';
        else if (change < -2) trend = 'down';

        return {
            trend,
            change: change.toFixed(1),
            recent,
            previous
        };
    }

    // Get price predictions using simple algorithms
    getPricePrediction(priceHistory, weatherData) {
        try {
            if (!priceHistory || priceHistory.length === 0) {
                return this.getDefaultPrediction();
            }

            const avgPrice = priceHistory.reduce((sum, record) => sum + record.modalPrice, 0) / priceHistory.length;
            const trend = this.analyzePriceTrends(priceHistory);

            // Simple prediction based on trend and weather
            let prediction = avgPrice;

            // Adjust based on trend
            if (trend.trend === 'up') {
                prediction *= 1.05; // 5% increase
            } else if (trend.trend === 'down') {
                prediction *= 0.95; // 5% decrease
            }

            // Adjust based on weather (simplified)
            if (weatherData && weatherData.humidity > 80) {
                prediction *= 1.03; // High humidity might increase prices
            }

            return {
                predictedPrice: Math.round(prediction),
                confidence: 0.75,
                factors: [
                    `Current trend: ${trend.trend}`,
                    `Weather impact: ${weatherData ? 'considered' : 'not available'}`,
                    `Historical average: ₹${Math.round(avgPrice)}`
                ],
                timeframe: '7 days'
            };
        } catch (error) {
            console.error('Error in price prediction:', error);
            return this.getDefaultPrediction();
        }
    }

    // Get default prediction when data is unavailable
    getDefaultPrediction() {
        return {
            predictedPrice: 4500,
            confidence: 0.6,
            factors: ['Limited data available', 'Based on seasonal patterns'],
            timeframe: '7 days'
        };
    }

    // Mock market data for development/testing
    getMockMarketData(commodity = 'Tomato') {
        const markets = [
            'KR Market Bangalore',
            'Mysore APMC',
            'Hubli APMC',
            'Bellary Market',
            'Davangere APMC'
        ];

        return markets.map((market, index) => ({
            market: market,
            commodity: commodity,
            variety: 'Local',
            grade: 'Grade I',
            minPrice: 4000 + (index * 200),
            maxPrice: 4800 + (index * 200),
            modalPrice: 4400 + (index * 200),
            date: new Date().toISOString().split('T')[0],
            unit: 'per quintal',
            trend: index % 3 === 0 ? 'up' : index % 3 === 1 ? 'down' : 'stable',
            change: (Math.random() * 10 - 5).toFixed(1) + '%'
        }));
    }

    // Mock weather data
    getMockWeatherData() {
        return {
            temperature: 28,
            humidity: 65,
            description: 'partly cloudy',
            windSpeed: 5.2,
            pressure: 1013
        };
    }

    // Get nearby markets based on location
    async getNearbyMarkets(latitude, longitude, radius = 50) {
        // In a real implementation, this would use geolocation APIs
        return [
            {
                name: 'KR Market Bangalore',
                distance: 15,
                coordinates: { lat: 12.9716, lng: 77.5946 },
                contact: '+91 80 2222 3333',
                timings: '6:00 AM - 2:00 PM'
            },
            {
                name: 'Mysore APMC',
                distance: 35,
                coordinates: { lat: 12.2958, lng: 76.6394 },
                contact: '+91 821 242 4242',
                timings: '7:00 AM - 1:00 PM'
            },
            {
                name: 'Electronic City Market',
                distance: 8,
                coordinates: { lat: 12.8456, lng: 77.6603 },
                contact: '+91 80 2783 4567',
                timings: '5:30 AM - 12:00 PM'
            }
        ];
    }

    // Set up price alerts
    setupPriceAlert(commodity, targetPrice, alertType = 'above') {
        // This would typically integrate with push notification services
        return {
            id: Date.now(),
            commodity,
            targetPrice,
            alertType,
            isActive: true,
            createdAt: new Date()
        };
    }

    // Get historical price data
    async getHistoricalPrices(commodity, days = 30) {
        try {
            // Generate mock historical data
            const endDate = new Date();
            const data = [];

            for (let i = days; i >= 0; i--) {
                const date = new Date(endDate);
                date.setDate(date.getDate() - i);

                // Generate realistic price variations
                const basePrice = 4400;
                const variation = (Math.sin(i / 7) * 200) + (Math.random() * 400 - 200);
                const price = Math.max(3800, basePrice + variation);

                data.push({
                    date: date.toISOString().split('T')[0],
                    price: Math.round(price),
                    volume: Math.round(100 + Math.random() * 50) // tonnes
                });
            }

            return data;
        } catch (error) {
            console.error('Error fetching historical prices:', error);
            return [];
        }
    }

    // Calculate market insights
    calculateMarketInsights(priceData, weatherData) {
        const insights = [];

        if (priceData && priceData.length > 0) {
            const avgPrice = priceData.reduce((sum, item) => sum + item.modalPrice, 0) / priceData.length;
            insights.push(`Average market price: ₹${Math.round(avgPrice)} per quintal`);

            const maxPrice = Math.max(...priceData.map(item => item.modalPrice));
            const minPrice = Math.min(...priceData.map(item => item.modalPrice));
            insights.push(`Price range: ₹${Math.round(minPrice)} - ₹${Math.round(maxPrice)}`);
        }

        if (weatherData) {
            if (weatherData.humidity > 80) {
                insights.push('High humidity may affect storage and transport costs');
            }
            if (weatherData.temperature > 35) {
                insights.push('High temperature may reduce crop quality');
            }
        }

        return insights;
    }
}

export default new MarketDataService();
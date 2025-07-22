# COMPONENT 3: MARKET INTELLIGENCE SERVICE
**Component Version**: 1.0  
**Priority**: P0 (Core Feature)  
**Team**: Backend/Data Team

## 1. COMPONENT OVERVIEW

### 1.1 Purpose
The Market Intelligence Service provides real-time crop price information and selling guidance to Karnataka farmers, enabling informed decisions about when and where to sell their produce for maximum profit.

### 1.2 Key Responsibilities
- **Real-Time Price Aggregation**: Collect current prices from multiple mandis across Karnataka
- **Trend Analysis**: Identify price patterns and predict optimal selling windows
- **Market Recommendations**: Suggest best markets and timing for crop sales
- **Regional Price Comparison**: Compare prices across nearby mandis and markets
- **Seasonal Intelligence**: Provide historical price trends for better planning

### 1.3 Success Criteria
- Price data accuracy > 95% compared to actual mandi rates
- Market recommendations increase farmer income by average 15%
- Real-time data freshness < 4 hours from source
- Price trend predictions achieve 80% directional accuracy

## 2. FUNCTIONAL REQUIREMENTS

### 2.1 Price Data Aggregation
**FR-01**: Integrate with Agmarknet API for government mandi prices
**FR-02**: Collect prices from private market platforms and traders
**FR-03**: Support major Karnataka crops (tomato, onion, potato, rice, sugarcane)
**FR-04**: Update price data every 2-4 hours during market hours
**FR-05**: Validate and clean price data for outliers and errors

### 2.2 Market Analysis Engine
**FR-06**: Calculate price trends over multiple time periods (daily, weekly, monthly)
**FR-07**: Identify price volatility and stability patterns
**FR-08**: Compare prices across different market types (wholesale, retail, direct)
**FR-09**: Factor in transportation costs for market distance analysis
**FR-10**: Generate market demand indicators and supply predictions

### 2.3 Intelligent Recommendations
**FR-11**: Suggest optimal selling timing based on price trends
**FR-12**: Recommend best markets within farmer's transportation range
**FR-13**: Provide price alerts when crops reach target prices
**FR-14**: Offer negotiation guidance with current market rates
**FR-15**: Consider crop quality grades and their price implications

### 2.4 Regional Intelligence
**FR-16**: Map prices by Karnataka districts and taluks
**FR-17**: Calculate transportation costs and net profit scenarios
**FR-18**: Track regional demand patterns and festival pricing
**FR-19**: Identify emerging markets and new buyer opportunities
**FR-20**: Monitor government procurement schemes and MSP rates

### 2.5 Query Processing
**FR-21**: Handle natural language price queries in Kannada
**FR-22**: Support crop-specific and general market inquiries
**FR-23**: Provide comparative analysis between multiple crops
**FR-24**: Generate summary reports for selling decisions
**FR-25**: Format responses for both voice and SMS channels

## 3. TECHNICAL REQUIREMENTS

### 3.1 Performance Requirements
**TR-01**: Price query response time < 3 seconds
**TR-02**: Market analysis generation < 5 seconds
**TR-03**: Support 1000+ concurrent price queries
**TR-04**: Data synchronization delay < 15 minutes

### 3.2 Data Freshness Requirements
**TR-05**: Critical crops (tomato, onion) updated every 2 hours
**TR-06**: Secondary crops updated every 4 hours
**TR-07**: Price trend calculations updated daily
**TR-08**: Market recommendations refreshed every 6 hours

### 3.3 Accuracy Requirements
**TR-09**: Price data accuracy > 95% vs actual mandi rates
**TR-10**: Trend prediction accuracy > 80% directional
**TR-11**: Transportation cost calculations within 10% variance
**TR-12**: Market recommendations validated by farmer outcomes

### 3.4 Storage Requirements
**TR-13**: Maintain 2 years of historical price data
**TR-14**: Store regional market patterns and seasonal trends
**TR-15**: Cache frequently requested price queries
**TR-16**: Backup critical market data with 99.9% availability

## 4. HIGH-LEVEL DESIGN

### 4.1 Component Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                  MARKET INTELLIGENCE SERVICE                   │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  │   Price Data    │    │   Market        │    │  Intelligence   │
│  │   Aggregator    │    │  Analysis       │    │  Recommender    │
│  │                 │    │   Engine        │    │                 │
│  │ • Agmarknet     │    │ • Trend Calc   │    │ • Sell Timing   │
│  │ • Private APIs  │    │ • Volatility    │    │ • Best Markets  │
│  │ • Web Scraping  │    │ • Seasonality   │    │ • Profit Max    │
│  │ • Data Cleaning │    │ • Forecasting   │    │ • Negotiation   │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘
│           │                       │                       │
│           │                       │                       │
│           └───────────┬───────────────────────┬───────────┘
│                       │                       │
│                       ▼                       ▼
│  ┌─────────────────────────────────────────────────────────────┐
│  │              REGIONAL MARKET MAPPER                        │
│  │                                                             │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  │ Karnataka   │  │ Transport   │  │   Market Access     │ │
│  │  │  Markets    │  │   Costs     │  │   & Logistics       │ │
│  │  │             │  │             │  │                     │ │
│  │  │ • Mandis    │  │ • Distance  │  │ • Road Conditions   │ │
│  │  │ • Warehouses│  │ • Fuel      │  │ • Market Timings    │ │
│  │  │ • Direct    │  │ • Labor     │  │ • Payment Terms     │ │
│  │  │ • Online    │  │ • Loading   │  │ • Quality Standards │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│  └─────────────────────────────────────────────────────────────┘
│                                 │
│                                 ▼
│  ┌─────────────────────────────────────────────────────────────┐
│  │            QUERY PROCESSOR & RESPONSE ENGINE               │
│  │                                                             │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  │ Natural     │  │  Kannada    │  │   Multi-Format      │ │
│  │  │ Language    │  │ Processing  │  │   Response Gen      │ │
│  │  │ Understanding│  │             │  │                     │ │
│  │  │ • Price Query│  │ • Crop Names│  │ • Voice Summary     │ │
│  │  │ • Market Ask │  │ • Numbers   │  │ • SMS Tables        │ │
│  │  │ • Comparison │  │ • Units     │  │ • Visual Charts     │ │
│  │  │ • Trends     │  │ • Markets   │  │ • Recommendations   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│  └─────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Data Pipeline Architecture
```
[External APIs] → [Data Validator] → [Price Normalizer] → [Market DB]
       │                                                      │
       │                                                      ▼
[Web Scrapers] → [Quality Check] → [Duplicate Filter] → [Historical Store]
       │                                                      │
       │                                                      ▼
[Manual Updates] → [Admin Panel] → [Override Rules] → [Trend Analyzer]
                                                             │
                                                             ▼
[User Query] → [NLP Processor] → [Market Intelligence] → [Response Gen]
                                        │
                                        ▼
                                [Recommendation Engine]
                                        │
                                        ▼
                                [Kannada Localizer]
```

### 4.3 Market Data Schema
```javascript
{
  marketData: {
    priceId: "string",
    crop: "tomato|onion|potato|rice",
    variety: "string",
    quality: "grade1|grade2|grade3",
    price: "number",
    unit: "quintal|kg|ton",
    market: {
      name: "string",
      type: "mandi|wholesale|retail|online",
      location: {
        district: "string",
        taluk: "string",
        coordinates: {lat: "number", lng: "number"}
      }
    },
    timestamp: "datetime",
    source: "agmarknet|private|scraper",
    reliability: "high|medium|low",
    volume: "number",
    trend: {
      daily: "up|down|stable",
      weekly: "up|down|stable",
      monthly: "up|down|stable"
    }
  },
  marketAnalysis: {
    analysisId: "string",
    crop: "string",
    region: "string",
    timeframe: "1d|1w|1m|3m",
    priceRange: {min: "number", max: "number", avg: "number"},
    volatility: "low|medium|high",
    seasonality: "peak|moderate|low",
    demandIndicators: {
      festival: "boolean",
      weather: "favorable|unfavorable",
      export: "high|medium|low"
    },
    recommendations: {
      sellTiming: "immediate|wait_1week|wait_1month",
      bestMarkets: ["string"],
      negotiationTips: ["string"],
      expectedPrice: "number",
      confidence: "number"
    }
  }
}
```

## 5. APIS & INTERFACES

### 5.1 Price Query API
```javascript
// POST /market/price-query
{
  "query": "What is tomato price today?",
  "language": "kn|en",
  "userLocation": {
    "district": "string",
    "coordinates": {lat: "number", lng: "number"}
  },
  "crops": ["tomato", "onion"],
  "maxDistance": "number" // km
}

// Response
{
  "queryId": "string",
  "crops": [
    {
      "crop": "string",
      "currentPrice": {
        "price": "number",
        "unit": "string",
        "market": "string",
        "asOf": "timestamp"
      },
      "nearbyMarkets": [
        {
          "market": "string",
          "price": "number",
          "distance": "number",
          "transportCost": "number",
          "netPrice": "number"
        }
      ],
      "trend": {
        "direction": "up|down|stable",
        "change": "number",
        "period": "1d|1w"
      }
    }
  ],
  "recommendation": "string",
  "confidence": "number"
}
```

### 5.2 Market Intelligence API
```javascript
// POST /market/intelligence
{
  "crop": "tomato",
  "quantity": "number",
  "quality": "grade1|grade2|grade3",
  "userLocation": "object",
  "sellUrgency": "immediate|flexible|planning",
  "transportCapacity": "number"
}

// Response
{
  "intelligenceId": "string",
  "recommendations": {
    "optimalTiming": {
      "immediate": {
        "expectedPrice": "number",
        "confidence": "number",
        "bestMarkets": ["object"]
      },
      "wait1Week": {
        "expectedPrice": "number",
        "confidence": "number",
        "priceIncrease": "number"
      },
      "wait1Month": {
        "expectedPrice": "number",
        "confidence": "number",
        "risks": ["string"]
      }
    },
    "bestMarkets": [
      {
        "market": "string",
        "expectedPrice": "number",
        "netProfit": "number",
        "transportCost": "number",
        "paymentTerms": "string",
        "riskFactors": ["string"]
      }
    ],
    "negotiationTips": ["string"],
    "marketIntelligence": "string"
  }
}
```

### 5.3 Price Alert API
```javascript
// POST /market/set-alert
{
  "userId": "string",
  "crop": "string",
  "targetPrice": "number",
  "condition": "above|below|equals",
  "duration": "number", // days
  "notificationMethod": "sms|voice|both"
}

// Response
{
  "alertId": "string",
  "created": "boolean",
  "monitoringUntil": "timestamp"
}
```

## 6. DATA SOURCES & INTEGRATION

### 6.1 Primary Data Sources
- **Agmarknet**: Government mandi prices across India
- **Karnataka State Marketing Board**: Local mandi rates
- **Agricultural Produce Market Committee (APMC)**: Regional prices
- **Private Trading Platforms**: Online marketplace rates

### 6.2 Secondary Data Sources
- **Weather APIs**: Impact on crop prices and demand
- **Transportation APIs**: Fuel costs and route optimization
- **Festival Calendar**: Demand spike predictions
- **Export-Import Data**: Market demand indicators

### 6.3 Data Validation Rules
- Price range validation against historical bounds
- Cross-source verification for critical crops
- Temporal consistency checks (no sudden unexplained spikes)
- Regional price correlation analysis

## 7. TESTING STRATEGY

### 7.1 Data Accuracy Testing
- Compare aggregated prices with actual mandi visits
- Validate transportation cost calculations
- Test recommendation accuracy through farmer feedback
- Cross-verify trend predictions with market outcomes

### 7.2 Performance Testing
- API response time under various load conditions
- Data aggregation pipeline performance
- Concurrent user query handling
- Cache hit ratio optimization

### 7.3 Integration Testing
- External API reliability and failover
- Data synchronization across sources
- Price alert delivery accuracy
- Multi-language response formatting

## 8. DEPENDENCIES

### 8.1 Internal Dependencies
- **Kannada Language Processor**: For query understanding and response formatting
- **Intelligent Channel Orchestrator**: For multi-channel price delivery
- **Mobile Application Framework**: For price display and alerts

### 8.2 External Dependencies
- **Agmarknet API**: Primary government price source
- **Transportation APIs**: For cost calculations
- **Weather APIs**: For demand prediction
- **SMS Gateway**: For price alerts

## 9. DEPLOYMENT CONSIDERATIONS

### 9.1 Data Pipeline Setup
- Scheduled data collection jobs (every 2-4 hours)
- Real-time price update webhooks where available
- Data quality monitoring and alerting
- Backup data sources for critical crops

### 9.2 Caching Strategy
- Frequently queried prices cached for 1 hour
- Market analysis cached for 6 hours
- Historical trends cached for 24 hours
- Regional data cached by district

## 10. MONITORING & ANALYTICS

### 10.1 Key Metrics
- Price data freshness and accuracy
- Query response time and success rate
- Recommendation effectiveness (farmer feedback)
- Market prediction accuracy

### 10.2 Business Intelligence
- Most queried crops by region
- Price volatility patterns
- Farmer selling decision patterns
- Market recommendation success rates

## 11. RISKS & MITIGATION

### 11.1 Data Quality Risks
| Risk | Impact | Mitigation |
|------|---------|------------|
| Inaccurate price data | High | Multiple source validation, farmer feedback |
| Delayed price updates | Medium | Multiple API sources, cache warming |
| Missing regional data | Medium | Manual data entry capability, crowdsourcing |

### 11.2 Technical Risks
| Risk | Impact | Mitigation |
|------|---------|------------|
| API source failures | High | Fallback sources, cached responses |
| Price prediction errors | Medium | Confidence scoring, risk disclaimers |
| Transportation cost variations | Low | Regular calibration, user input |

This component provides critical economic value to farmers and requires robust data validation and continuous accuracy monitoring to maintain trust and effectiveness.
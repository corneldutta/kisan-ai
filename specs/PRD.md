# PROJECT KISAN - PRODUCT REQUIREMENT DOCUMENT
**Document Version**: 1.0
**Team**: Project Kisan Development Team  
**Approval**: Ready for Development

## Hackathon Scope (30 Hours)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Product Vision
Project Kisan is an AI-powered agricultural assistant designed specifically for Karnataka farmers, featuring a breakthrough SMS-Voice hybrid architecture that ensures reliable communication in challenging farm environments.

### 1.2 Target User
- **Primary**: Small-scale farmers in Karnataka (2-5 hectare holdings)
- **Language**: Kannada-speaking with basic smartphone literacy
- **Environment**: Rural areas with poor connectivity and high ambient noise

### 1.3 Core Value Proposition
- **Never-Fail Communication**: Automatic SMS fallback when voice processing fails
- **Real-World Reliability**: Designed for noisy farm environments
- **Cultural Integration**: Native Kannada support with agricultural terminology

### 1.4 Success Metrics
- **Demo Reliability**: 100% success rate in presentation scenarios
- **Feature Completeness**: All P0 features functional
- **User Experience**: Seamless voice-to-SMS transitions
- **Technical Innovation**: Clear differentiation from existing solutions

---

## 2. PRODUCT OVERVIEW

### 2.1 Problem Statement
Existing agricultural AI solutions fail in real farm environments due to:
- Poor voice recognition in noisy conditions (tractors, animals, wind)
- Lack of SMS fallback for connectivity issues
- Absence of local language support with agricultural context
- Design for office environments rather than field conditions

### 2.2 Solution Approach
**SMS-Voice Hybrid Architecture** that:
- Automatically switches communication channels based on environmental conditions
- Maintains conversation context across voice and SMS interactions
- Provides agricultural expertise in native Kannada language
- Works reliably in challenging rural connectivity scenarios

### 2.3 Key Differentiators
1. **Intelligent Channel Switching**: Only agricultural AI with automatic SMS fallback
2. **Noise-Resilient Design**: Built for actual farm environments
3. **Cultural Integration**: Kannada-first approach with agricultural terminology
4. **Context Preservation**: Seamless conversation flow across communication modes

---

## 3. USER STORIES & USE CASES

### 3.1 Primary User Stories

**US-01: Voice Disease Detection**
- **As a** farmer inspecting crops
- **I want to** take a photo and describe symptoms via voice
- **So that** I can get instant disease diagnosis and treatment advice

**US-02: SMS Fallback Communication**
- **As a** farmer in noisy field conditions
- **I want** the system to automatically switch to SMS when voice fails
- **So that** I never lose access to agricultural expertise

**US-03: Market Price Inquiry**
- **As a** farmer planning to sell crops
- **I want to** ask current market prices in Kannada
- **So that** I can make informed selling decisions

**US-04: Kannada Language Support**
- **As a** Kannada-speaking farmer
- **I want** all interactions in my native language
- **So that** I can understand and act on the advice provided

### 3.2 Use Case Scenarios

**UC-01: Successful Voice Interaction**
1. Farmer opens app and taps voice button
2. Speaks query in Kannada about crop disease
3. System processes with high confidence (>70%)
4. Returns voice response with treatment advice
5. Farmer can ask follow-up questions

**UC-02: Voice-to-SMS Fallback**
1. Farmer attempts voice query in noisy environment
2. System detects low confidence (<70%) or background noise
3. App automatically prompts for SMS fallback
4. Farmer sends structured SMS with crop issue
5. System responds via SMS with treatment advice

**UC-03: Market Price Lookup**
1. Farmer asks "What is tomato price today?" via voice or SMS
2. System fetches current market data
3. Responds with local mandi prices in Kannada
4. Provides additional context on price trends

---

## 4. FUNCTIONAL REQUIREMENTS

### 4.1 Core Features (P0 - Must Have)

#### 4.1.1 Voice Processing System
- **FR-01**: Record and process Kannada voice input
- **FR-02**: Generate confidence scores for voice recognition
- **FR-03**: Trigger SMS fallback when confidence < 70%
- **FR-04**: Provide voice responses in Kannada using TTS

#### 4.1.2 SMS Integration System
- **FR-05**: Send and receive SMS through Twilio gateway
- **FR-06**: Parse structured SMS commands (e.g., "DISEASE tomato spots")
- **FR-07**: Format responses appropriately for SMS length limits
- **FR-08**: Maintain conversation context across SMS exchanges

#### 4.1.3 Disease Detection System
- **FR-09**: Capture and upload plant images
- **FR-10**: Analyze images using Gemini Vision API
- **FR-11**: Identify common crop diseases with confidence scores
- **FR-12**: Provide treatment recommendations in Kannada

#### 4.1.4 Market Price System
- **FR-13**: Fetch current crop prices from agricultural APIs
- **FR-14**: Process price queries in Kannada
- **FR-15**: Return formatted price information with local context
- **FR-16**: Support major crops (tomato, onion, potato, rice)

### 4.2 Supporting Features (P1 - Should Have)

#### 4.2.1 User Interface
- **FR-17**: Large, farmer-friendly buttons and icons
- **FR-18**: Clear visual feedback for voice recording
- **FR-19**: Simple navigation with minimal text
- **FR-20**: Offline capability indicators

#### 4.2.2 Data Management
- **FR-21**: Store conversation history locally
- **FR-22**: Sync data when connectivity available
- **FR-23**: Cache common responses for offline access
- **FR-24**: User authentication and profile management

---

## 5. TECHNICAL REQUIREMENTS

### 5.1 Performance Requirements
- **TR-01**: Voice recognition response time < 3 seconds
- **TR-02**: SMS fallback trigger time < 2 seconds
- **TR-03**: Image analysis completion < 10 seconds
- **TR-04**: App startup time < 5 seconds

### 5.2 Reliability Requirements
- **TR-05**: 99% uptime for core voice processing
- **TR-06**: 100% SMS fallback success rate
- **TR-07**: Graceful degradation when APIs are unavailable
- **TR-08**: Data persistence across app restarts

### 5.3 Platform Requirements
- **TR-09**: Android 8.0+ support (primary platform)
- **TR-10**: iOS 12.0+ support (secondary)
- **TR-11**: Minimum 2GB RAM for optimal performance
- **TR-12**: Camera and microphone permissions required

### 5.4 Security Requirements
- **TR-13**: End-to-end encryption for voice data
- **TR-14**: Secure API key management
- **TR-15**: User data privacy compliance
- **TR-16**: No storage of sensitive farmer information

---

## 6. SYSTEM ARCHITECTURE

### 6.1 High-Level Architecture - "Whisper Intelligence" System

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           MOBILE APP (React Native)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Voice UI  │  │  Camera     │  │ SMS Interface│  │ Kannada     │            │
│  │ • Recording │  │ • Capture   │  │ • Send/Recv │  │ • Text Render│            │
│  │ • Playback  │  │ • Preview   │  │ • Commands  │  │ • Voice Synth│            │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                        │                                        │
│         ┌──────────────────────────────┼────────────────────────────────┐       │
│         │        INTELLIGENT CHANNEL ORCHESTRATOR (Our Core USP)       │       │
│         │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │       │
│         │  │   Noise     │  │ Confidence  │  │  Channel    │          │       │
│         │  │  Detector   │  │  Monitor    │  │  Selector   │          │       │
│         │  │             │  │             │  │             │          │       │
│         │  │ • 60dB+     │  │ • 70% Score │  │ • Voice/SMS │          │       │
│         │  │ • Tractor   │  │ • Real-time │  │ • Auto-Switch│         │       │
│         │  │ • Animal    │  │ • Trigger   │  │ • Seamless  │          │       │
│         │  └─────────────┘  └─────────────┘  └─────────────┘          │       │
│         └────────────────────────────────────────────────────────────┘       │
│                                        │                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Context   │  │  Edge Cache │  │ SMS Parser  │  │ Response    │            │
│  │ Preservation│  │ • Offline   │  │ • Structured│  │ Formatter   │            │
│  │ • Voice↔SMS │  │ • 30-day    │  │ • DISEASE   │  │ • Kannada   │            │
│  │ • History   │  │ • Sync      │  │ • PRICE     │  │ • Cultural  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            FIREBASE BACKEND SERVICES                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ Realtime DB │  │ Auth        │  │ Storage     │  │ Functions   │            │
│  │ • Offline   │  │ • Phone     │  │ • Images    │  │ • Webhooks  │            │
│  │ • Sync      │  │ • Profile   │  │ • Audio     │  │ • Processing│            │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          GOOGLE CLOUD AI SERVICES                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ Gemini 2.0  │  │ Vertex AI   │  │ Vertex AI   │  │ Cloud TTS   │            │
│  │ Flash       │  │ Speech-to-  │  │ Agent       │  │ • Kannada   │            │
│  │ • Vision    │  │ Text        │  │ Builder     │  │ • Natural   │            │
│  │ • Disease   │  │ • Kannada   │  │ • Intents   │  │ • Cultural  │            │
│  │ • Treatment │  │ • Confidence│  │ • Context   │  │ • Dialects  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL INTEGRATIONS                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ Twilio SMS  │  │ Market APIs │  │ Weather APIs│  │ Govt APIs   │            │
│  │ Gateway     │  │ • Agmarknet │  │ • OpenWeather│  │ • PM-KISAN  │            │
│  │ • Fallback  │  │ • RealTime  │  │ • Forecast  │  │ • Bhoomi    │            │
│  │ • Reliable  │  │ • Karnataka │  │ • Alerts    │  │ • Schemes   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Data Flow Architecture - "Whisper Intelligence" Processing

```
[Farmer Voice Input] → [Noise Detector] → [Environmental Analysis]
         │                    │                    │
         │                    ▼                    ▼
         │            [60dB+ Noise?] ──YES──► [Auto SMS Mode]
         │                    │                    │
         │                    NO                   │
         │                    │                    │
         ▼                    ▼                    │
[Voice Processing] → [Confidence Monitor] ────────┘
         │                    │
         │                    ▼
         │            [Confidence >= 70%?]
         │                    │
         │          ┌─────────┼─────────┐
         │          │         │         │
         │         YES        NO        │
         │          │         │         │
         │          ▼         ▼         │
         │    [Gemini API] [SMS Trigger] │
         │          │         │         │
         │          ▼         ▼         │
         │    [Voice Response] │        │
         │          │         │         │
         │          └─────────┼─────────┘
         │                    │
         │                    ▼
         │            [SMS Gateway] ←───────────────┘
         │                    │
         │                    ▼
         │            [SMS Parser]
         │                    │
         │     ┌──────────────┼──────────────┐
         │     │              │              │
         │     ▼              ▼              ▼
         │ [DISEASE]      [PRICE]      [GENERAL]
         │     │              │              │
         │     ▼              ▼              ▼
         │ [Image Req]   [Market API]   [Gemini API]
         │     │              │              │
         │     └──────────────┼──────────────┘
         │                    │
         │                    ▼
         │            [Response Formatter]
         │                    │
         │                    ▼
         │            [Kannada Converter]
         │                    │
         │                    ▼
         │            [Cultural Context]
         │                    │
         │                    ▼
         └────────────► [Context Preservation] ◄─────────────
                              │
                              ▼
                      [Firebase Storage]
                              │
                              ▼
                      [Conversation History]
                              │
                              ▼
                      [Learning & Improvement]
```

### 6.3 Component Architecture

### 6.3 Component Architecture - "Whisper Intelligence" Components

#### 6.3.1 Frontend Components (Mobile App)
**Core USP Components:**
- **IntelligentChannelOrchestrator**: Decision engine for voice vs SMS
- **NoiseDetector**: Environmental audio analysis (60dB+ detection)
- **ConfidenceMonitor**: Real-time voice processing confidence scoring
- **ContextPreservationManager**: Maintains conversation state across channels
- **KannadaCulturalProcessor**: Handles local language and cultural context

**Supporting Components:**
- **VoiceRecorder**: Handles audio capture and playback
- **CameraCapture**: Manages image capture and preview
- **SMSInterface**: Displays SMS interactions with structured commands
- **KannadaRenderer**: Handles Kannada text display and fonts
- **OfflineCapabilityManager**: Manages local cache and sync

#### 6.3.2 Backend Services (Firebase + Cloud Functions)
**Core USP Services:**
- **HybridChannelProcessor**: Orchestrates voice-SMS switching logic
- **EnvironmentalAnalysisService**: Processes noise and connectivity data
- **ContextSynchronizationService**: Maintains conversation state across channels
- **KannadaLanguageService**: Handles translation and cultural adaptation
- **StructuredSMSParser**: Parses farmer-friendly SMS commands

**Supporting Services:**
- **ImageAnalysisService**: Processes plant disease images
- **MarketDataService**: Fetches current crop prices
- **WeatherIntegrationService**: Provides agricultural weather data
- **GovernmentAPIService**: Integrates with scheme databases

#### 6.3.3 Integration Layer (Google Cloud AI + External APIs)
**Core USP Integrations:**
- **GeminiMultimodalConnector**: Handles voice, image, and text processing
- **ConfidenceBasedResponseGenerator**: Adapts responses based on AI confidence
- **CulturalContextEnhancer**: Adds Karnataka farming context to responses
- **SMS-VoiceStateManager**: Manages conversation state across channels

**Supporting Integrations:**
- **TwilioSMSConnector**: Manages SMS gateway communications
- **FirebaseRealtimeConnector**: Handles data persistence and sync
- **MarketAPIOrchestrator**: Coordinates multiple price data sources
- **WeatherAPIConnector**: Fetches environmental data for predictions

---

## 7. PROCESS FLOW DIAGRAMS

### 7.1 Main User Interaction Flow

```
[App Launch] → [User Authentication] → [Home Screen]
     │                                       │
     │                                       ▼
     │                              [Voice Button Tap]
     │                                       │
     │                                       ▼
     │                              [Voice Recording]
     │                                       │
     │                                       ▼
     │                              [Confidence Check]
     │                                       │
     │                    ┌─────────────────┴─────────────────┐
     │                    │                                   │
     │                    ▼                                   ▼
     │            [High Confidence]                   [Low Confidence]
     │                    │                                   │
     │                    ▼                                   ▼
     │            [Voice Processing]                  [SMS Fallback]
     │                    │                                   │
     │                    ▼                                   ▼
     │            [Voice Response]                    [SMS Processing]
     │                    │                                   │
     │                    └─────────────────┬─────────────────┘
     │                                      │
     │                                      ▼
     └──────────────────────────────► [Response Display]
```

### 7.2 Disease Detection Process Flow

```
[Image Capture] → [Image Upload] → [Gemini Vision API] → [Disease Analysis]
     │                                                           │
     │                                                           ▼
     │                                                   [Confidence Score]
     │                                                           │
     │                                    ┌─────────────────────┼─────────────────────┐
     │                                    │                     │                     │
     │                                    ▼                     ▼                     ▼
     │                            [High Confidence]     [Medium Confidence]   [Low Confidence]
     │                                    │                     │                     │
     │                                    ▼                     ▼                     ▼
     │                            [Disease Identified]  [Multiple Options]   [General Advice]
     │                                    │                     │                     │
     │                                    ▼                     ▼                     ▼
     │                            [Treatment Advice]    [User Clarification] [Symptom Questions]
     │                                    │                     │                     │
     │                                    └─────────────────────┼─────────────────────┘
     │                                                          │
     │                                                          ▼
     └──────────────────────────────────────────────── [Response Delivery]
```

### 7.3 SMS Fallback Process Flow

```
[Voice Input] → [Noise Detection] → [Confidence < 70%] → [SMS Trigger]
     │                                                          │
     │                                                          ▼
     │                                                  [SMS Prompt Display]
     │                                                          │
     │                                                          ▼
     │                                                  [User SMS Send]
     │                                                          │
     │                                                          ▼
     │                                                  [SMS Received]
     │                                                          │
     │                                                          ▼
     │                                                  [Structure Parse]
     │                                                          │
     │                                    ┌─────────────────────┼─────────────────────┐
     │                                    │                     │                     │
     │                                    ▼                     ▼                     ▼
     │                            [Disease Query]        [Price Query]         [General Query]
     │                                    │                     │                     │
     │                                    ▼                     ▼                     ▼
     │                            [Image Request]       [Market API Call]     [Gemini Processing]
     │                                    │                     │                     │
     │                                    ▼                     ▼                     ▼
     │                            [Analysis Response]   [Price Response]      [General Response]
     │                                    │                     │                     │
     │                                    └─────────────────────┼─────────────────────┘
     │                                                          │
     │                                                          ▼
     └──────────────────────────────────────────────── [SMS Response Send]
```

---

## 8. DATA MODELS

### 8.1 User Profile
```javascript
{
  userId: "string",
  phoneNumber: "string",
  language: "kn|en",
  location: {
    district: "string",
    taluk: "string",
    coordinates: {lat: number, lng: number}
  },
  farmingProfile: {
    landSize: "number",
    mainCrops: ["string"],
    experienceLevel: "beginner|intermediate|advanced"
  },
  preferences: {
    preferredChannel: "voice|sms|both",
    notificationSettings: "object"
  },
  createdAt: "timestamp",
  lastActive: "timestamp"
}
```

### 8.2 Conversation History
```javascript
{
  conversationId: "string",
  userId: "string",
  messages: [
    {
      messageId: "string",
      timestamp: "timestamp",
      type: "voice|sms|image",
      channel: "voice|sms",
      content: "string",
      confidence: "number",
      response: "string",
      responseTime: "number"
    }
  ],
  context: {
    currentTopic: "disease|price|general",
    cropType: "string",
    lastImageUrl: "string"
  },
  status: "active|completed|failed"
}
```

### 8.3 Disease Detection Result
```javascript
{
  analysisId: "string",
  userId: "string",
  imageUrl: "string",
  timestamp: "timestamp",
  results: {
    disease: "string",
    confidence: "number",
    symptoms: ["string"],
    severity: "low|medium|high",
    treatment: {
      organic: ["string"],
      chemical: ["string"],
      preventive: ["string"]
    },
    estimatedCost: "number"
  },
  feedback: {
    helpful: "boolean",
    comments: "string"
  }
}
```

### 8.4 Market Price Data
```javascript
{
  priceId: "string",
  crop: "string",
  market: "string",
  price: "number",
  unit: "string",
  date: "timestamp",
  source: "string",
  trend: "rising|falling|stable",
  lastUpdated: "timestamp"
}
```

---

## 9. API SPECIFICATIONS

### 9.1 Voice Processing API
```javascript
// POST /api/voice/process
{
  "audioData": "base64_encoded_audio",
  "userId": "string",
  "language": "kn",
  "context": {
    "previousTopic": "string",
    "cropType": "string"
  }
}

// Response
{
  "transcript": "string",
  "confidence": "number",
  "intent": "string",
  "response": "string",
  "audioResponse": "base64_encoded_audio",
  "fallbackTriggered": "boolean"
}
```

### 9.2 SMS Processing API
```javascript
// POST /api/sms/process
{
  "message": "string",
  "phoneNumber": "string",
  "userId": "string",
  "conversationId": "string"
}

// Response
{
  "intent": "string",
  "response": "string",
  "requiresImage": "boolean",
  "followUpQuestions": ["string"]
}
```

### 9.3 Disease Detection API
```javascript
// POST /api/disease/analyze
{
  "imageData": "base64_encoded_image",
  "userId": "string",
  "cropType": "string",
  "symptoms": "string"
}

// Response
{
  "disease": "string",
  "confidence": "number",
  "treatment": {
    "organic": ["string"],
    "chemical": ["string"],
    "cost": "number"
  },
  "severity": "string",
  "preventive": ["string"]
}
```

---

## 10. DEVELOPMENT TIMELINE

### 10.1 Phase 1: Foundation (Hours 0-6)
- **Hour 0-2**: Project setup, Firebase configuration
- **Hour 2-4**: Basic React Native app structure
- **Hour 4-6**: Voice recording and SMS gateway setup

### 10.2 Phase 2: Core Features (Hours 6-18)
- **Hour 6-9**: Gemini API integration
- **Hour 9-12**: Voice processing with confidence scoring
- **Hour 12-15**: SMS fallback implementation
- **Hour 15-18**: Disease detection system

### 10.3 Phase 3: Integration (Hours 18-24)
- **Hour 18-21**: Market price API integration
- **Hour 21-24**: Kannada language processing

### 10.4 Phase 4: Polish & Demo (Hours 24-30)
- **Hour 24-27**: End-to-end testing
- **Hour 27-30**: Demo preparation and bug fixes

---

## 11. RISK MITIGATION

### 11.1 Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Voice API reliability | Medium | High | SMS fallback + cached responses |
| SMS gateway failure | Low | High | Multiple SMS providers |
| Image processing slow | Medium | Medium | Compressed images + progress indicators |
| Kannada translation issues | High | Medium | Hybrid translation approach |

### 11.2 Demo Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Network failure | Medium | High | Offline mode + mobile hotspot |
| Voice recognition fails | Medium | High | Pre-recorded scenarios |
| API rate limiting | Low | High | Cached responses for demo |
| App crashes | Low | High | Extensive testing + backup device |

---

## 12. SUCCESS CRITERIA

### 12.1 Functional Success
- ✅ Voice recording and processing works in controlled environment
- ✅ SMS fallback triggers automatically when voice fails
- ✅ Disease detection provides reasonable results for common crops
- ✅ Market price lookup returns current data
- ✅ All interactions available in Kannada

### 12.2 Demo Success
- ✅ 5-minute presentation runs smoothly without technical issues
- ✅ Key differentiators (SMS fallback, noise resilience) clearly demonstrated
- ✅ Judges understand technical innovation and practical value
- ✅ Q&A session handled confidently with technical depth

### 12.3 Technical Innovation
- ✅ SMS-voice hybrid architecture working end-to-end
- ✅ Context preservation across communication channels
- ✅ Kannada language processing with agricultural terminology
- ✅ Clear competitive differentiation from existing solutions

---

## 13. APPENDICES

### 13.1 Kannada Agricultural Vocabulary
```
Disease Terms:
- ಕೊಳೆತ (Rot/Decay)
- ಹಳದಿ ಚುಕ್ಕೆ (Yellow spots)
- ಎಲೆ ಸುರುಳಿ (Leaf curl)
- ಬಿಳಿ ಬಣ್ಣ (White color/fungus)

Crop Names:
- ಟೊಮೇಟೋ (Tomato)
- ಆಲೂಗಡ್ಡೆ (Potato)
- ಈರುಳ್ಳಿ (Onion)
- ಬತ್ತ (Rice)

Actions:
- ಸಿಂಪಡಿಸು (Spray)
- ನೀರು ಹಾಕು (Water/Irrigate)
- ಕೊಯ್ಲು (Harvest)
- ಬೀಜ ಬಿತ್ತು (Sow seeds)
```

### 13.2 Demo Scenarios
1. **Noise Resilience Demo**: Play tractor sounds while using voice
2. **SMS Fallback Demo**: Simulate voice failure and show SMS switch
3. **Disease Detection Demo**: Upload plant image and get diagnosis
4. **Market Price Demo**: Ask for current crop prices in Kannada

### 13.3 Backup Plans
- **Plan A**: Full implementation with all features
- **Plan B**: Core features with simulated advanced capabilities
- **Plan C**: Demo with pre-recorded responses and manual triggers

---
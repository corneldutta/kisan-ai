# PROJECT KISAN - UML SEQUENCE DIAGRAMS

## 1. Main User Interaction Flow

```
title Main User Interaction Flow - Project Kisan

participant Farmer
participant MobileApp
participant VoiceProcessor
participant ConfidenceMonitor
participant SMSManager
participant GeminiAPI
participant ResponseGenerator

Farmer->MobileApp: Launch App
MobileApp->Farmer: Display Home Screen
Farmer->MobileApp: Tap Voice Button
MobileApp->VoiceProcessor: Start Recording
VoiceProcessor->Farmer: Show Recording Indicator

Farmer->VoiceProcessor: Speak Query (Kannada)
VoiceProcessor->ConfidenceMonitor: Analyze Audio Quality
ConfidenceMonitor->ConfidenceMonitor: Calculate Confidence Score

alt Confidence >= 70%
    ConfidenceMonitor->VoiceProcessor: High Confidence
    VoiceProcessor->GeminiAPI: Send Audio + Context
    GeminiAPI->VoiceProcessor: Return Transcript + Response
    VoiceProcessor->ResponseGenerator: Generate Voice Response
    ResponseGenerator->MobileApp: Voice Response (Kannada)
    MobileApp->Farmer: Play Voice Response
else Confidence < 70%
    ConfidenceMonitor->SMSManager: Trigger SMS Fallback
    SMSManager->MobileApp: Show SMS Prompt
    MobileApp->Farmer: "Voice unclear, switching to SMS"
    Farmer->SMSManager: Send SMS Query
    SMSManager->GeminiAPI: Process SMS Text
    GeminiAPI->SMSManager: Return Response
    SMSManager->Farmer: Send SMS Response
end

Farmer->MobileApp: View Response
MobileApp->MobileApp: Store Conversation History
```

## 2. Disease Detection Process Flow

```
title Disease Detection Process Flow - Project Kisan

participant Farmer
participant MobileApp
participant CameraModule
participant ImageProcessor
participant GeminiVisionAPI
participant DiseaseAnalyzer
participant TreatmentAdvisor
participant ResponseFormatter

Farmer->MobileApp: Select Disease Detection
MobileApp->CameraModule: Open Camera
CameraModule->Farmer: Show Camera Preview
Farmer->CameraModule: Capture Plant Image
CameraModule->ImageProcessor: Process Image

ImageProcessor->ImageProcessor: Optimize Image Size
ImageProcessor->GeminiVisionAPI: Upload Image + Crop Context
GeminiVisionAPI->DiseaseAnalyzer: Analyze Plant Disease

DiseaseAnalyzer->DiseaseAnalyzer: Identify Disease Patterns
DiseaseAnalyzer->DiseaseAnalyzer: Calculate Confidence Score

alt Confidence >= 80%
    DiseaseAnalyzer->TreatmentAdvisor: High Confidence Disease ID
    TreatmentAdvisor->TreatmentAdvisor: Get Treatment Options
    TreatmentAdvisor->ResponseFormatter: Format Treatment Advice
    ResponseFormatter->MobileApp: Disease + Treatment (Kannada)
    MobileApp->Farmer: Show Disease Details
else Confidence 50-80%
    DiseaseAnalyzer->TreatmentAdvisor: Medium Confidence
    TreatmentAdvisor->ResponseFormatter: Multiple Possibilities
    ResponseFormatter->MobileApp: Ask Clarifying Questions
    MobileApp->Farmer: Show Symptom Options
    Farmer->MobileApp: Select Additional Symptoms
    MobileApp->DiseaseAnalyzer: Provide Additional Context
    DiseaseAnalyzer->TreatmentAdvisor: Refined Analysis
    TreatmentAdvisor->ResponseFormatter: Final Treatment Advice
    ResponseFormatter->MobileApp: Treatment Recommendation
else Confidence < 50%
    DiseaseAnalyzer->TreatmentAdvisor: Low Confidence
    TreatmentAdvisor->ResponseFormatter: General Advice
    ResponseFormatter->MobileApp: General Plant Care Tips
    MobileApp->Farmer: Show General Advice + Expert Contact
end

Farmer->MobileApp: Rate Response Helpfulness
MobileApp->MobileApp: Store Feedback for Learning
```

## 3. SMS Fallback Process Flow

```
title SMS Fallback Process Flow - Project Kisan

participant Farmer
participant MobileApp
participant VoiceProcessor
participant NoiseDetector
participant ConfidenceMonitor
participant SMSGateway
participant SMSParser
participant GeminiAPI
participant ResponseFormatter

Farmer->MobileApp: Attempt Voice Input
MobileApp->VoiceProcessor: Start Voice Recording
VoiceProcessor->NoiseDetector: Analyze Audio Environment
NoiseDetector->NoiseDetector: Detect Background Noise Level

alt High Noise Environment (>60dB)
    NoiseDetector->ConfidenceMonitor: High Noise Detected
    ConfidenceMonitor->MobileApp: Auto-trigger SMS Mode
    MobileApp->Farmer: "Noisy environment detected"
else Normal Environment
    NoiseDetector->VoiceProcessor: Continue Voice Processing
    VoiceProcessor->ConfidenceMonitor: Send Confidence Score
    
    alt Confidence < 70%
        ConfidenceMonitor->MobileApp: Low Confidence Alert
        MobileApp->Farmer: "Voice unclear, try SMS"
    else Confidence >= 70%
        ConfidenceMonitor->GeminiAPI: Process Voice Normally
        Note right of GeminiAPI: Normal voice flow continues
    end
end

Farmer->SMSGateway: Send SMS Query
SMSGateway->SMSParser: Receive SMS Message
SMSParser->SMSParser: Parse Message Structure

alt Disease Query Pattern
    SMSParser->GeminiAPI: "DISEASE [crop] [symptoms]"
    GeminiAPI->ResponseFormatter: Disease Analysis
    ResponseFormatter->SMSGateway: Treatment SMS (Kannada)
    SMSGateway->Farmer: Send Treatment Advice
else Price Query Pattern
    SMSParser->GeminiAPI: "PRICE [crop] [location]"
    GeminiAPI->ResponseFormatter: Market Price Data
    ResponseFormatter->SMSGateway: Price SMS (Kannada)
    SMSGateway->Farmer: Send Price Information
else General Query Pattern
    SMSParser->GeminiAPI: General Agricultural Question
    GeminiAPI->ResponseFormatter: General Advice
    ResponseFormatter->SMSGateway: Advice SMS (Kannada)
    SMSGateway->Farmer: Send General Response
else Unrecognized Pattern
    SMSParser->ResponseFormatter: Pattern Not Recognized
    ResponseFormatter->SMSGateway: Help Message
    SMSGateway->Farmer: Send Help Commands
end

Farmer->MobileApp: Switch Back to Voice Mode
MobileApp->VoiceProcessor: Resume Voice Processing
VoiceProcessor->MobileApp: Restore Previous Context
MobileApp->MobileApp: Maintain Conversation History
```

## Diagram Review & Key Elements

### 1. Main User Interaction Flow
- **Key Feature**: Shows the core voice-SMS hybrid decision making
- **Decision Point**: Confidence score determines communication channel
- **Context Preservation**: Conversation history maintained across channels

### 2. Disease Detection Process Flow
- **Key Feature**: Multi-level confidence scoring for disease identification
- **Progressive Enhancement**: Different responses based on confidence levels
- **User Feedback Loop**: Includes rating system for continuous improvement

### 3. SMS Fallback Process Flow
- **Key Feature**: Demonstrates automatic and manual SMS triggering
- **Pattern Recognition**: Shows structured SMS command parsing
- **Seamless Transition**: Context restoration when switching back to voice

## Technical Validation

✅ **Proper UML Elements**: Uses correct sequence diagram syntax
✅ **Actor Interactions**: Clear participant roles and message flows
✅ **Decision Logic**: Alt/else blocks for conditional flows
✅ **Error Handling**: Includes fallback scenarios and error cases
✅ **Context Awareness**: Shows how conversation state is maintained

## Presentation Tips

1. **Use Diagram 1** to show overall system architecture
2. **Use Diagram 2** to demonstrate AI-powered disease detection
3. **Use Diagram 3** to highlight unique SMS fallback innovation
4. **Emphasize decision points** where your solution differs from competitors
5. **Point out context preservation** across communication channels

These diagrams effectively communicate the technical innovation of your SMS-voice hybrid architecture while showing practical implementation details for the hackathon scope.
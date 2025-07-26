# Kisan AI - Complete Setup Guide
## Stage 2: Gemini Live API Integration

This guide will walk you through setting up Kisan AI with real-time voice chat and image analysis using Google's Gemini Live API.

## 📋 Prerequisites

- Computer with Node.js 18+ and Python 3.11+
- Google Account with billing enabled
- Android device or iOS device for testing (recommended)
- Basic command line knowledge

## 🏗️ Architecture Overview

```
React Native App (Expo) ↔ WebSocket ↔ Python Backend ↔ Gemini Live API
                                    ↔ Vertex AI Vision ↔ Google Cloud
```

## 📦 What We're Building

- **Voice Chat**: Real-time voice-to-voice conversation with Gemini
- **Image Analysis**: Crop disease detection using Gemini Vision
- **Live Transcription**: Real-time speech-to-text display
- **Conversation Sync**: Unified chat across voice and text modes

---

## PART 1: Google Cloud Platform Setup

### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project**:
   - Click "Select a project" → "New Project"
   - Project name: `kisan-ai-production` (or your choice)
   - Note your Project ID (you'll need this) - kisan-ai-production (Project Number - 645090261484)
3. **Enable billing**: 
   - Go to Billing → Link a billing account
   - You need billing enabled for Gemini API usage

### Step 2: Enable Required APIs

Run these commands in Cloud Shell or your terminal:

```bash
# Set your project ID (replace with your actual project ID)
export PROJECT_ID="kisan-ai-production"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    secretmanager.googleapis.com \
    aiplatform.googleapis.com \
    container.googleapis.com
```

### Step 3: Get Gemini API Key

1. **Go to Google AI Studio**: https://makersuite.google.com/app/apikey
2. **Create API Key**:
   - Click "Create API Key" - AIzaSyBT-GVRbWLF8Jg3GqlbxA4MI3Z7RAyxzFA
   - Select your project
   - Copy the API key (save it securely)

### Step 4: Set Up Service Account

```bash
# Create service account
gcloud iam service-accounts create kisan-ai-backend \
    --description="Service account for Kisan AI backend" \
    --display-name="Kisan AI Backend"

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:kisan-ai-backend@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:kisan-ai-backend@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"
```

### Step 5: Store API Keys in Secret Manager

```bash
# Store Gemini API key
echo -n "AIzaSyBT-GVRbWLF8Jg3GqlbxA4MI3Z7RAyxzFA" | \
    gcloud secrets create GOOGLE_API_KEY \
    --data-file=- \
    --replication-policy="automatic"

# Create another secret for the same key (backend expects both)
echo -n "AIzaSyBT-GVRbWLF8Jg3GqlbxA4MI3Z7RAyxzFA" | \
    gcloud secrets create GEMINI_API_KEY \
    --data-file=- \
    --replication-policy="automatic"
```

---

## PART 2: Backend Deployment

### Step 6: Deploy Backend to Cloud Run

1. **Navigate to your backend directory**:
```bash
cd backend/
```

2. **Update the server URL in your mobile app**:
   - Open `app/(tabs)/voice-chat.tsx`
   - Update line 17: Replace `'wss://your-backend-url.run.app'` with your actual URL (you'll get this after deployment)
   - Same for `app/(tabs)/image-search.tsx` line 10

3. **Deploy using Cloud Build**:
```bash
# Deploy the backend
gcloud builds submit --config cloudbuild.yaml

# Note the service URL from the output - you'll need this for the mobile app
```

4. **Get your backend URL**:
```bash
gcloud run services describe kisan-ai-backend --region=us-central1 --format="value(status.url)"
```

Copy this URL - you'll need it for the mobile app configuration.

---

## PART 3: Mobile App Setup

### Step 7: Install Dependencies

1. **Navigate to your project root**:
```bash
cd ..  # Go back to project root
```

2. **Install additional dependencies**:
```bash
npm install events
```

3. **Update app configuration**:
   - Open `app/(tabs)/voice-chat.tsx`
   - Line 17: Replace `'wss://your-backend-url.run.app'` with your actual Cloud Run URL
   - Change `https://` to `wss://` for WebSocket connection
   
   - Open `app/(tabs)/image-search.tsx`
   - Line 10: Update with the same URL

### Step 8: Test the Application

1. **Start the development server**:
```bash
npx expo start
```

2. **Test on device**:
   - Scan QR code with Expo Go app
   - Grant microphone and camera permissions
   - Test voice chat functionality
   - Test image analysis with a crop photo

---

## PART 4: Troubleshooting

### Common Issues and Solutions

#### Issue: "Connection Failed" in mobile app
**Solution**: 
- Check backend logs: `gcloud logs tail --service=kisan-ai-backend`
- Verify WebSocket URL format: should be `wss://` not `https://`
- Ensure backend is deployed and running

#### Issue: "Microphone permission denied"
**Solution**:
- Android: Settings → Apps → Expo Go → Permissions → Microphone
- iOS: Settings → Privacy → Microphone → Expo Go

#### Issue: "Gemini API quota exceeded"
**Solution**:
- Check your API usage in Google Cloud Console
- Gemini Live API has rate limits: 3 concurrent sessions per API key
- Wait a few minutes and try again

#### Issue: "Image analysis failed"
**Solution**:
- Ensure image is clear and well-lit
- Check backend logs for specific error messages
- Verify Secret Manager permissions

### Backend Logs Commands

```bash
# View real-time logs
gcloud logs tail --service=kisan-ai-backend

# View recent logs
gcloud logs read --service=kisan-ai-backend --limit=50

# Filter error logs
gcloud logs read --service=kisan-ai-backend --filter="severity>=ERROR"
```

### Testing WebSocket Connection

```bash
# Test WebSocket endpoint
curl -i -N -H "Connection: Upgrade" \
    -H "Upgrade: websocket" \
    -H "Sec-WebSocket-Key: test" \
    -H "Sec-WebSocket-Version: 13" \
    https://your-backend-url.run.app
```

---

## PART 5: Advanced Configuration

### Scaling and Performance

1. **Adjust Cloud Run settings**:
```bash
gcloud run services update kisan-ai-backend \
    --region=us-central1 \
    --memory=4Gi \
    --cpu=4 \
    --max-instances=20 \
    --concurrency=50
```

2. **Monitor performance**:
   - Go to Cloud Console → Cloud Run → kisan-ai-backend
   - Check Metrics tab for CPU/Memory usage
   - Monitor request latency

### Security Enhancements

1. **Restrict API access** (optional):
```bash
# Remove public access
gcloud run services remove-iam-policy-binding kisan-ai-backend \
    --region=us-central1 \
    --member="allUsers" \
    --role="roles/run.invoker"
```

2. **Set up custom domain** (optional):
   - Go to Cloud Run → Manage Custom Domains
   - Add your domain and follow verification steps

### Environment Variables

For local development, create `backend/.env`:
```bash
# Copy the template
cd backend
python -c "from config.config import get_env_template; print(get_env_template())" > .env

# Edit with your values
nano .env
```

---

## PART 6: Usage Guide

### Voice Chat Features

1. **Start Voice Chat**:
   - Tap microphone button to start recording
   - Speak clearly in English or Hindi
   - Release to send audio to Gemini

2. **Real-time Features**:
   - Live transcription shows your speech
   - Gemini responds with both voice and text
   - Interrupt by starting to speak while Gemini is talking

3. **Voice Commands**:
   - "Analyze this crop disease"
   - "What treatment do you recommend?"
   - "Tell me about government schemes"

### Image Analysis Features

1. **Capture or Select Image**:
   - Use camera to take photo of affected crops
   - Or select from gallery
   - Ensure good lighting and clear focus

2. **Analysis Results**:
   - Disease identification with confidence score
   - Severity assessment (mild/moderate/severe)
   - Treatment recommendations
   - Preventive measures

3. **Follow-up Actions**:
   - Tap "Discuss with Voice Chat" to continue conversation
   - Share results with other farmers
   - Save analysis for future reference

---

## PART 7: Cost Management

### Expected Costs

- **Cloud Run**: ~$5-20/month (depends on usage)
- **Gemini API**: ~$10-50/month (depends on usage)
- **Cloud Storage**: ~$1-5/month
- **Networking**: ~$1-10/month

### Cost Optimization

1. **Set budget alerts**:
```bash
# Create budget alert
gcloud billing budgets create \
    --billing-account=YOUR_BILLING_ACCOUNT_ID \
    --display-name="Kisan AI Budget" \
    --budget-amount=50USD \
    --threshold-rules=percent=50,percent=90
```

2. **Monitor usage**:
   - Go to Cloud Console → Billing
   - Check usage by service
   - Set up alerts for unexpected spikes

3. **Optimize resources**:
   - Reduce Cloud Run memory/CPU if not needed
   - Implement request caching
   - Use CDN for static assets

---

## 🎉 Success Checklist

- [ ] Google Cloud project created and configured
- [ ] APIs enabled and service account set up
- [ ] Secrets stored in Secret Manager
- [ ] Backend deployed to Cloud Run
- [ ] Mobile app updated with backend URL
- [ ] Voice chat working with real-time transcription
- [ ] Image analysis functioning properly
- [ ] Conversation syncing across tabs
- [ ] Error handling and reconnection working

## 📞 Support

If you encounter issues:

1. **Check logs**: Use the troubleshooting commands above
2. **Verify configuration**: Ensure all environment variables are set
3. **Test incrementally**: Test each component separately
4. **Review permissions**: Check service account permissions
5. **Monitor costs**: Keep an eye on your billing dashboard

## 🔄 Updates and Maintenance

### Regular Maintenance Tasks

1. **Update dependencies** (monthly):
```bash
# Backend
cd backend && pip install --upgrade -r requirements.txt

# Frontend
cd .. && npm update
```

2. **Check for security updates**:
```bash
npm audit --audit-level moderate
pip-audit
```

3. **Monitor performance**:
   - Check Cloud Run metrics
   - Review error rates
   - Monitor response times

4. **Backup configuration**:
   - Export environment variables
   - Document any custom configurations
   - Keep deployment scripts updated

---

## 🚀 Next Steps

Once everything is working:

1. **Add more languages**: Configure multilingual support
2. **Enhance UI**: Improve mobile app design
3. **Add features**: Market prices, weather integration
4. **Scale up**: Increase concurrent users
5. **Monetize**: Add premium features

Your Kisan AI with Gemini Live API integration is now ready! Farmers can now have natural voice conversations about their crops and get instant image analysis powered by Google's most advanced AI. 
# Kisan AI Backend

This directory contains the Python WebSocket server that provides Gemini Live API integration for the Kisan AI mobile app.

## 🚀 Quick Start

### Automated Setup (Recommended)

```bash
cd backend/
./setup.sh
```

The script will:
- Set up Google Cloud Project
- Enable required APIs
- Create service account
- Store API keys in Secret Manager
- Deploy to Cloud Run
- Update mobile app configuration

### Manual Setup

1. **Install dependencies**:
```bash
pip install -r requirements.txt
```

2. **Set environment variables**:
```bash
cp .env.example .env
# Edit .env with your values
```

3. **Run locally**:
```bash
python server.py
```

4. **Deploy to Cloud Run**:
```bash
gcloud builds submit --config cloudbuild.yaml
```

## 📁 Project Structure

```
backend/
├── server.py              # Main WebSocket server
├── core/
│   ├── gemini_client.py    # Gemini Live API client
│   ├── session_manager.py  # Session management
│   └── image_processor.py  # Image analysis
├── config/
│   └── config.py           # Configuration loader
├── requirements.txt        # Python dependencies
├── Dockerfile             # Container configuration
├── cloudbuild.yaml        # Cloud Build configuration
└── setup.sh              # Automated setup script
```

## 🔧 Configuration

### Environment Variables

- `GOOGLE_CLOUD_PROJECT`: Your GCP project ID
- `GOOGLE_API_KEY`: Your Gemini API key
- `PORT`: Server port (default: 8081)
- `DEBUG`: Enable debug mode (default: false)

### Local Development

Create `.env` file:
```bash
python -c "from config.config import get_env_template; print(get_env_template())" > .env
```

## 📊 Monitoring

### View Logs
```bash
# Real-time logs
gcloud logs tail --service=kisan-ai-backend

# Recent logs
gcloud logs read --service=kisan-ai-backend --limit=50
```

### Health Check
```bash
curl https://your-service-url.run.app/health
```

## 🔌 API Endpoints

- **WebSocket**: `/` - Main WebSocket endpoint for real-time communication
- **Health**: `/health` - Health check endpoint
- **Status**: `/status` - Service status information

## 🛠️ Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
black .
flake8 .
```

### Local Testing
```bash
# Install dependencies
pip install -r requirements.txt

# Run server
python server.py

# Test WebSocket connection
wscat -c ws://localhost:8081
```

## 🚨 Troubleshooting

### Common Issues

1. **"Module not found" errors**: Ensure all dependencies are installed
2. **"Permission denied" errors**: Check service account permissions
3. **"API key invalid" errors**: Verify API key in Secret Manager
4. **WebSocket connection fails**: Check firewall and port settings

### Debug Mode

Enable debug logging by setting `DEBUG=true` in your environment variables.

## 📈 Performance

- **Memory**: 2GB recommended
- **CPU**: 2 vCPU recommended
- **Concurrency**: 100 requests per instance
- **Max instances**: 10 (adjustable)

## 🔐 Security

- API keys stored in Google Secret Manager
- Service account with minimal required permissions
- HTTPS/WSS encryption for all communications
- Input validation and sanitization 
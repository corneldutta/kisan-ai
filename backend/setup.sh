#!/bin/bash

# Kisan AI Backend Setup Script
# This script automates the GCP setup and deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v gcloud &> /dev/null; then
        log_error "gcloud CLI is not installed. Please install it first:"
        echo "https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 is not installed"
        exit 1
    fi
    
    if ! command -v pip3 &> /dev/null; then
        log_error "pip3 is not installed"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Get project ID from user
get_project_info() {
    echo
    log_info "Setting up GCP project information..."
    
    if [ -z "$PROJECT_ID" ]; then
        echo -n "Enter your GCP Project ID: "
        read PROJECT_ID
    fi
    
    if [ -z "$GEMINI_API_KEY" ]; then
        echo -n "Enter your Gemini API Key: "
        read -s GEMINI_API_KEY
        echo
    fi
    
    # Set project
    gcloud config set project $PROJECT_ID
    log_success "Project set to: $PROJECT_ID"
}

# Enable required APIs
enable_apis() {
    log_info "Enabling required APIs..."
    
    gcloud services enable \
        run.googleapis.com \
        cloudbuild.googleapis.com \
        secretmanager.googleapis.com \
        aiplatform.googleapis.com \
        container.googleapis.com
    
    log_success "APIs enabled successfully"
}

# Set up service account
setup_service_account() {
    log_info "Setting up service account..."
    
    # Create service account (ignore error if already exists)
    gcloud iam service-accounts create kisan-ai-backend \
        --description="Service account for Kisan AI backend" \
        --display-name="Kisan AI Backend" 2>/dev/null || true
    
    # Grant permissions
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:kisan-ai-backend@$PROJECT_ID.iam.gserviceaccount.com" \
        --role="roles/secretmanager.secretAccessor" \
        --quiet
    
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:kisan-ai-backend@$PROJECT_ID.iam.gserviceaccount.com" \
        --role="roles/aiplatform.user" \
        --quiet
    
    log_success "Service account configured"
}

# Store secrets
store_secrets() {
    log_info "Storing API keys in Secret Manager..."
    
    # Delete existing secrets if they exist
    gcloud secrets delete GOOGLE_API_KEY --quiet 2>/dev/null || true
    gcloud secrets delete GEMINI_API_KEY --quiet 2>/dev/null || true
    
    # Create new secrets
    echo -n "$GEMINI_API_KEY" | \
        gcloud secrets create GOOGLE_API_KEY \
        --data-file=- \
        --replication-policy="automatic"
    
    echo -n "$GEMINI_API_KEY" | \
        gcloud secrets create GEMINI_API_KEY \
        --data-file=- \
        --replication-policy="automatic"
    
    log_success "Secrets stored successfully"
}

# Install Python dependencies
install_dependencies() {
    log_info "Installing Python dependencies..."
    
    if [ ! -f "requirements.txt" ]; then
        log_error "requirements.txt not found. Are you in the backend directory?"
        exit 1
    fi
    
    pip3 install -r requirements.txt
    log_success "Dependencies installed"
}

# Deploy to Cloud Run
deploy_backend() {
    log_info "Deploying backend to Cloud Run..."
    
    # Build and deploy
    gcloud builds submit --config cloudbuild.yaml
    
    # Get the service URL
    SERVICE_URL=$(gcloud run services describe kisan-ai-backend --region=us-central1 --format="value(status.url)")
    
    log_success "Backend deployed successfully!"
    log_info "Service URL: $SERVICE_URL"
    
    # Save URL to file for mobile app configuration
    echo "$SERVICE_URL" > ../BACKEND_URL.txt
    log_info "Backend URL saved to ../BACKEND_URL.txt"
}

# Test the deployment
test_deployment() {
    log_info "Testing deployment..."
    
    SERVICE_URL=$(gcloud run services describe kisan-ai-backend --region=us-central1 --format="value(status.url)" 2>/dev/null)
    
    if [ -z "$SERVICE_URL" ]; then
        log_error "Could not get service URL"
        return 1
    fi
    
    # Test health endpoint
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL/health" || echo "000")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        log_success "Health check passed"
    else
        log_warning "Health check failed (HTTP $HTTP_STATUS). Service might still be starting."
    fi
}

# Update mobile app configuration
update_mobile_config() {
    log_info "Updating mobile app configuration..."
    
    SERVICE_URL=$(gcloud run services describe kisan-ai-backend --region=us-central1 --format="value(status.url)" 2>/dev/null)
    
    if [ -z "$SERVICE_URL" ]; then
        log_error "Could not get service URL"
        return 1
    fi
    
    # Convert HTTP to WebSocket URL
    WS_URL=${SERVICE_URL/https:/wss:}
    
    # Update voice-chat.tsx
    if [ -f "../app/(tabs)/voice-chat.tsx" ]; then
        sed -i.bak "s|wss://your-backend-url.run.app|$WS_URL|g" "../app/(tabs)/voice-chat.tsx" 2>/dev/null || \
        sed -i "s|wss://your-backend-url.run.app|$WS_URL|g" "../app/(tabs)/voice-chat.tsx"
        log_success "Updated voice-chat.tsx"
    fi
    
    # Update image-search.tsx
    if [ -f "../app/(tabs)/image-search.tsx" ]; then
        sed -i.bak "s|wss://your-backend-url.run.app|$WS_URL|g" "../app/(tabs)/image-search.tsx" 2>/dev/null || \
        sed -i "s|wss://your-backend-url.run.app|$WS_URL|g" "../app/(tabs)/image-search.tsx"
        log_success "Updated image-search.tsx"
    fi
    
    echo "$WS_URL" > ../WEBSOCKET_URL.txt
    log_info "WebSocket URL saved to ../WEBSOCKET_URL.txt"
}

# Show final instructions
show_final_instructions() {
    echo
    echo "=================================="
    log_success "Setup Complete!"
    echo "=================================="
    echo
    log_info "Next steps:"
    echo "1. Go to your project root: cd .."
    echo "2. Install mobile app dependencies: npm install events"
    echo "3. Start the development server: npx expo start"
    echo "4. Test on your mobile device"
    echo
    log_info "Useful commands:"
    echo "- View logs: gcloud logs tail --service=kisan-ai-backend"
    echo "- Update service: gcloud builds submit --config cloudbuild.yaml"
    echo "- Check status: gcloud run services describe kisan-ai-backend --region=us-central1"
    echo
    log_info "Backend URL: $(cat ../BACKEND_URL.txt 2>/dev/null || echo 'Not found')"
    log_info "WebSocket URL: $(cat ../WEBSOCKET_URL.txt 2>/dev/null || echo 'Not found')"
    echo
}

# Main execution
main() {
    echo "========================================="
    echo "       Kisan AI Backend Setup Script    "
    echo "========================================="
    echo
    
    check_prerequisites
    get_project_info
    enable_apis
    setup_service_account
    store_secrets
    install_dependencies
    deploy_backend
    test_deployment
    update_mobile_config
    show_final_instructions
}

# Handle script arguments
case "${1:-}" in
    --deploy-only)
        log_info "Running deployment only..."
        deploy_backend
        test_deployment
        update_mobile_config
        ;;
    --test-only)
        log_info "Running tests only..."
        test_deployment
        ;;
    --help)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --deploy-only    Only deploy (skip GCP setup)"
        echo "  --test-only      Only test deployment"
        echo "  --help           Show this help message"
        echo ""
        echo "Environment variables:"
        echo "  PROJECT_ID       GCP Project ID"
        echo "  GEMINI_API_KEY   Your Gemini API Key"
        ;;
    *)
        main
        ;;
esac 
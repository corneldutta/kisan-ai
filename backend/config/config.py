import os
import logging
from typing import Dict, Any, Optional
import json
from google.cloud import secretmanager

logger = logging.getLogger(__name__)

def load_config() -> Dict[str, Any]:
    """Load configuration from environment variables and GCP Secret Manager"""
    
    # Determine if we're running in GCP or locally
    is_gcp = os.getenv('GOOGLE_CLOUD_PROJECT') is not None
    project_id = os.getenv('GOOGLE_CLOUD_PROJECT', 'your-project-id')
    
    config = {
        'server': {
            'host': os.getenv('HOST', '0.0.0.0'),
            'port': int(os.getenv('PORT', 8081)),
            'debug': os.getenv('DEBUG', 'false').lower() == 'true',
        },
        'gcp': {
            'project_id': project_id,
            'location': os.getenv('GOOGLE_CLOUD_LOCATION', 'us-central1'),
        },
        'gemini': {
            'model': os.getenv('GEMINI_MODEL', 'gemini-2.0-flash-live-001'),
            'max_tokens': int(os.getenv('GEMINI_MAX_TOKENS', 4000)),
            'temperature': float(os.getenv('GEMINI_TEMPERATURE', 0.7)),
        },
        'session': {
            'timeout_minutes': int(os.getenv('SESSION_TIMEOUT_MINUTES', 30)),
            'max_concurrent': int(os.getenv('MAX_CONCURRENT_SESSIONS', 100)),
        }
    }
    
    # Load API keys from Secret Manager if in GCP, otherwise from env vars
    if is_gcp:
        try:
            config['api_keys'] = load_secrets_from_gcp(project_id)
        except Exception as e:
            logger.warning(f"Failed to load secrets from GCP: {e}")
            config['api_keys'] = load_secrets_from_env()
    else:
        config['api_keys'] = load_secrets_from_env()
    
    return config

def load_secrets_from_gcp(project_id: str) -> Dict[str, str]:
    """Load secrets from Google Cloud Secret Manager"""
    try:
        client = secretmanager.SecretManagerServiceClient()
        
        secrets = {}
        secret_names = [
            'GOOGLE_API_KEY',
            'GEMINI_API_KEY',
        ]
        
        for secret_name in secret_names:
            try:
                secret_path = f"projects/{project_id}/secrets/{secret_name}/versions/latest"
                response = client.access_secret_version(request={"name": secret_path})
                secrets[secret_name] = response.payload.data.decode('UTF-8')
                logger.info(f"Loaded secret: {secret_name}")
            except Exception as e:
                logger.warning(f"Failed to load secret {secret_name}: {e}")
                # Fallback to environment variable
                secrets[secret_name] = os.getenv(secret_name, '')
        
        return secrets
        
    except Exception as e:
        logger.error(f"Error accessing Secret Manager: {e}")
        return load_secrets_from_env()

def load_secrets_from_env() -> Dict[str, str]:
    """Load secrets from environment variables"""
    return {
        'GOOGLE_API_KEY': os.getenv('GOOGLE_API_KEY', ''),
        'GEMINI_API_KEY': os.getenv('GEMINI_API_KEY', ''),
    }

def validate_config(config: Dict[str, Any]) -> bool:
    """Validate configuration completeness"""
    required_keys = [
        'gcp.project_id',
        'api_keys.GOOGLE_API_KEY',
    ]
    
    missing_keys = []
    
    for key_path in required_keys:
        keys = key_path.split('.')
        current = config
        
        for key in keys:
            if key not in current:
                missing_keys.append(key_path)
                break
            current = current[key]
            
        # Check if the final value is empty
        if isinstance(current, str) and not current.strip():
            missing_keys.append(key_path)
    
    if missing_keys:
        logger.error(f"Missing required configuration keys: {missing_keys}")
        return False
    
    logger.info("Configuration validation passed")
    return True

def get_env_template() -> str:
    """Get environment variable template for local development"""
    return """
# Kisan AI Backend Configuration
# Copy this to .env and fill in your values

# Server Configuration
HOST=0.0.0.0
PORT=8081
DEBUG=true

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1

# API Keys (use Secret Manager in production)
GOOGLE_API_KEY=your-google-api-key
GEMINI_API_KEY=your-gemini-api-key

# Gemini Configuration
GEMINI_MODEL=gemini-2.0-flash-live-001
GEMINI_MAX_TOKENS=4000
GEMINI_TEMPERATURE=0.7

# Session Configuration
SESSION_TIMEOUT_MINUTES=30
MAX_CONCURRENT_SESSIONS=100
""" 
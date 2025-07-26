# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""
Gemini Live API client for Kisan AI
"""

import os
import logging
from google.genai import Client

logger = logging.getLogger(__name__)

async def create_gemini_session():
    """Create a new Gemini Live API session."""
    try:
        # Get API key from environment or Secret Manager
        api_key = os.getenv('GOOGLE_API_KEY')
        
        # Also check for GEMINI_API_KEY (backup)
        if not api_key:
            api_key = os.getenv('GEMINI_API_KEY')
            if api_key:
                logger.info("Both GOOGLE_API_KEY and GEMINI_API_KEY are set. Using GOOGLE_API_KEY.")
        
        if not api_key:
            # Try to get from Secret Manager if running in GCP
            try:
                from google.cloud import secretmanager
                client = secretmanager.SecretManagerServiceClient()
                project_id = os.getenv('GOOGLE_CLOUD_PROJECT')
                if project_id:
                    name = f"projects/{project_id}/secrets/GOOGLE_API_KEY/versions/latest"
                    response = client.access_secret_version(request={"name": name})
                    api_key = response.payload.data.decode("UTF-8")
            except Exception as e:
                logger.warning(f"Could not get API key from Secret Manager: {e}")
        
        if not api_key:
            raise ValueError("No GOOGLE_API_KEY found in environment or Secret Manager")
        
        # Create client
        client = Client(api_key=api_key)
        
        # Use the correct Live API models from official documentation
        models_to_try = [
            "gemini-2.5-flash-preview-native-audio-dialog",  # Native audio model (preferred)
            "gemini-live-2.5-flash-preview",                 # Half-cascade model  
            "gemini-2.0-flash-live-001"                      # Fallback Live model
        ]
        
        session_manager = None
        last_error = None
        
        for model_name in models_to_try:
            try:
                logger.info(f"Trying Live API model: {model_name}")
                
                # Correct configuration format based on official documentation
                config = {
                    "response_modalities": ["AUDIO"],  # Live API supports AUDIO output
                    "system_instruction": """You are Kisan Mitra, an AI assistant specialized in crop disease detection and agricultural guidance for farmers.

Key capabilities:
- Analyze crop images for diseases, pests, nutrient deficiencies, and other issues
- Provide specific disease identification with confidence levels
- Recommend treatment using locally available and affordable solutions
- Suggest prevention strategies for future crop protection
- Offer advice on farming techniques, crop care, and agricultural best practices
- Share information about government schemes and subsidies for farmers

Guidelines:
- Be helpful, accurate, and provide actionable advice
- Use simple language that farmers can understand
- Prioritize cost-effective and locally available solutions
- Always ask for clarification if the image or question is unclear
- Provide step-by-step instructions for treatments
- Include timing recommendations for interventions"""
                }
                
                # Create live session - this returns an async context manager
                session_manager = client.aio.live.connect(
                    model=model_name,
                    config=config
                )
                
                logger.info(f"Successfully created session manager with model: {model_name}")
                break
                
            except Exception as e:
                last_error = e
                logger.warning(f"Model {model_name} failed: {e}")
                continue
        
        if session_manager is None:
            raise Exception(f"All Live API models failed. Last error: {last_error}")
        
        logger.info("Successfully created Gemini Live API session")
        return session_manager
        
    except Exception as e:
        logger.error(f"Failed to create Gemini Live API session: {e}")
        raise
 
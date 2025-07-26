import asyncio
import json
import logging
import base64
from typing import Any, Dict, Optional, AsyncGenerator
from dataclasses import dataclass
from datetime import datetime
import aiohttp
import websockets
from google import genai
from google.genai.types import LiveConnectConfig, Modality

logger = logging.getLogger(__name__)

@dataclass
class GeminiResponse:
    type: str
    data: Optional[bytes] = None
    text: Optional[str] = None
    is_final: bool = False
    function_data: Optional[Dict[str, Any]] = None

class GeminiSession:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.session = None
        self.is_connected = False
        self.conversation_history = []
        
    async def connect(self) -> bool:
        """Connect to Gemini Live API"""
        try:
            # Initialize Gemini client
            client = genai.Client(
                vertexai=True,
                project=self.config['gcp']['project_id'],
                location=self.config['gcp']['location']
            )
            
            # Configure for Kisan AI use case
            config = LiveConnectConfig(
                response_modalities=[Modality.AUDIO, Modality.TEXT],
                system_instruction=(
                    "You are Kisan Mitra, an AI assistant for farmers in India. "
                    "You provide expert advice on crop diseases, pest control, "
                    "market prices, and government schemes for farmers. "
                    "Always respond in a helpful, practical manner with actionable advice. "
                    "If analyzing crop images, provide specific disease identification "
                    "and treatment recommendations using locally available solutions."
                ),
            )
            
            # Connect to Live API
            self.session = await client.aio.live.connect(
                model="gemini-2.0-flash-live-001",
                config=config
            )
            
            self.is_connected = True
            logger.info("Connected to Gemini Live API")
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to Gemini Live API: {e}")
            return False
    
    async def send_audio_chunk(self, audio_data: bytes):
        """Send audio chunk to Gemini Live API"""
        if not self.is_connected or not self.session:
            raise RuntimeError("Not connected to Gemini Live API")
        
        try:
            # Convert audio to format expected by Gemini
            audio_content = genai.types.Content(
                role="user",
                parts=[genai.types.Part(
                    inline_data=genai.types.Blob(
                        mime_type="audio/pcm;rate=16000",
                        data=audio_data
                    )
                )]
            )
            
            await self.session.send_client_content(
                turns=audio_content
            )
            
        except Exception as e:
            logger.error(f"Error sending audio chunk: {e}")
            raise
    
    async def send_image_with_text(self, image_data: str, prompt: str):
        """Send image with text prompt to Gemini"""
        if not self.is_connected or not self.session:
            raise RuntimeError("Not connected to Gemini Live API")
        
        try:
            # Decode base64 image
            image_bytes = base64.b64decode(image_data)
            
            # Create multimodal content
            content = genai.types.Content(
                role="user",
                parts=[
                    genai.types.Part(text=prompt),
                    genai.types.Part(
                        inline_data=genai.types.Blob(
                            mime_type="image/jpeg",
                            data=image_bytes
                        )
                    )
                ]
            )
            
            await self.session.send_client_content(
                turns=content,
                turn_complete=True
            )
            
        except Exception as e:
            logger.error(f"Error sending image: {e}")
            raise
    
    async def send_text(self, text: str):
        """Send text message to Gemini"""
        if not self.is_connected or not self.session:
            raise RuntimeError("Not connected to Gemini Live API")
        
        try:
            content = genai.types.Content(
                role="user",
                parts=[genai.types.Part(text=text)]
            )
            
            await self.session.send_client_content(
                turns=content,
                turn_complete=True
            )
            
        except Exception as e:
            logger.error(f"Error sending text: {e}")
            raise
    
    async def interrupt(self):
        """Interrupt current Gemini response"""
        if not self.is_connected or not self.session:
            return
        
        try:
            # Implementation depends on the specific Gemini Live API method
            # This is a placeholder for the interrupt functionality
            logger.info("Interrupting Gemini response")
            
        except Exception as e:
            logger.error(f"Error interrupting: {e}")
    
    async def listen(self) -> AsyncGenerator[GeminiResponse, None]:
        """Listen for responses from Gemini Live API"""
        if not self.is_connected or not self.session:
            raise RuntimeError("Not connected to Gemini Live API")
        
        try:
            async for message in self.session.receive():
                if message.server_content:
                    # Handle server content (model responses)
                    if message.server_content.model_turn:
                        for part in message.server_content.model_turn.parts:
                            if part.inline_data:
                                # Audio response
                                yield GeminiResponse(
                                    type="audio",
                                    data=part.inline_data.data
                                )
                            elif part.text:
                                # Text response
                                yield GeminiResponse(
                                    type="text",
                                    text=part.text
                                )
                    
                    if message.server_content.turn_complete:
                        yield GeminiResponse(type="turn_complete")
                
                # Handle other message types
                if hasattr(message, 'input_transcription') and message.input_transcription:
                    yield GeminiResponse(
                        type="transcription",
                        text=message.input_transcription.text,
                        is_final=message.input_transcription.finished
                    )
                
        except Exception as e:
            logger.error(f"Error listening to Gemini responses: {e}")
            raise
    
    async def close(self):
        """Close the Gemini session"""
        if self.session:
            try:
                await self.session.close()
                logger.info("Gemini session closed")
            except Exception as e:
                logger.error(f"Error closing Gemini session: {e}")
        
        self.is_connected = False
        self.session = None

class GeminiClient:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        
    async def create_live_session(self) -> GeminiSession:
        """Create a new Gemini Live session"""
        session = GeminiSession(self.config)
        
        if await session.connect():
            return session
        else:
            raise RuntimeError("Failed to create Gemini Live session")
    
    async def analyze_image(self, image_data: str, prompt: str) -> Dict[str, Any]:
        """Analyze image using Gemini (non-live API for quick analysis)"""
        try:
            # Initialize standard Gemini client for image analysis
            client = genai.Client(
                vertexai=True,
                project=self.config['gcp']['project_id'],
                location=self.config['gcp']['location']
            )
            
            # Decode image
            image_bytes = base64.b64decode(image_data)
            
            # Create content for analysis
            content = genai.types.Content(
                role="user",
                parts=[
                    genai.types.Part(text=prompt),
                    genai.types.Part(
                        inline_data=genai.types.Blob(
                            mime_type="image/jpeg",
                            data=image_bytes
                        )
                    )
                ]
            )
            
            # Generate response
            model = client.models.generate_content(
                model="gemini-2.0-flash-001",
                contents=[content]
            )
            
            response_text = ""
            for chunk in model:
                if chunk.text:
                    response_text += chunk.text
            
            return {
                "analysis": response_text,
                "confidence": 0.85,  # Placeholder confidence score
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing image: {e}")
            return {
                "error": str(e),
                "analysis": "Unable to analyze image at this time",
                "confidence": 0.0,
                "timestamp": datetime.now().isoformat()
            } 
#!/usr/bin/env python3

import asyncio
import json
import logging
import os
import sys
import websockets
import base64
from datetime import datetime
from typing import Any, Dict, Optional, List
import traceback
from contextlib import asynccontextmanager

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.gemini_client import GeminiClient
from core.session_manager import SessionManager
from core.image_processor import ImageProcessor
from config.config import load_config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class KisanAIServer:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.session_manager = SessionManager()
        self.gemini_client = GeminiClient(config)
        self.image_processor = ImageProcessor(config)
        self.active_connections: Dict[str, websockets.WebSocketServerProtocol] = {}

    async def handle_client(self, websocket: websockets.WebSocketServerProtocol, path: str):
        """Handle a new client connection"""
        client_id = f"client_{id(websocket)}"
        self.active_connections[client_id] = websocket
        
        logger.info(f"New client connected: {client_id}")
        
        try:
            # Create session for this client
            session = await self.session_manager.create_session(client_id)
            
            # Initialize Gemini Live API connection
            gemini_session = await self.gemini_client.create_live_session()
            session.gemini_session = gemini_session
            
            # Send ready message to client
            await self.send_message(websocket, {
                "type": "ready",
                "data": {
                    "session_id": client_id,
                    "timestamp": datetime.now().isoformat()
                }
            })
            
            # Handle messages from client
            await self.handle_client_messages(websocket, session)
            
        except websockets.exceptions.ConnectionClosed:
            logger.info(f"Client {client_id} disconnected")
        except Exception as e:
            logger.error(f"Error handling client {client_id}: {e}")
            logger.error(traceback.format_exc())
            await self.send_error(websocket, {
                "message": "Server error occurred",
                "error_type": "server_error"
            })
        finally:
            # Cleanup
            if client_id in self.active_connections:
                del self.active_connections[client_id]
            await self.session_manager.remove_session(client_id)

    async def handle_client_messages(self, websocket: websockets.WebSocketServerProtocol, session):
        """Handle incoming messages from client"""
        try:
            async for message in websocket:
                await self.process_client_message(websocket, session, message)
        except websockets.exceptions.ConnectionClosed:
            logger.info(f"Client connection closed for session {session.session_id}")
        except Exception as e:
            logger.error(f"Error in message handling: {e}")
            raise

    async def process_client_message(self, websocket: websockets.WebSocketServerProtocol, session, raw_message: str):
        """Process individual client message"""
        try:
            message = json.loads(raw_message)
            message_type = message.get('type')
            
            logger.debug(f"Received message type: {message_type}")
            
            if message_type == 'audio_chunk':
                await self.handle_audio_chunk(websocket, session, message)
            elif message_type == 'image':
                await self.handle_image_analysis(websocket, session, message)
            elif message_type == 'text':
                await self.handle_text_message(websocket, session, message)
            elif message_type == 'interrupt':
                await self.handle_interrupt(websocket, session, message)
            else:
                logger.warning(f"Unknown message type: {message_type}")
                
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON received: {e}")
            await self.send_error(websocket, {
                "message": "Invalid JSON format",
                "error_type": "json_error"
            })
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            await self.send_error(websocket, {
                "message": "Error processing message",
                "error_type": "processing_error"
            })

    async def handle_audio_chunk(self, websocket: websockets.WebSocketServerProtocol, session, message):
        """Handle real-time audio chunks from client"""
        try:
            audio_data = message['data']
            timestamp = message.get('timestamp', datetime.now().timestamp())
            
            # Convert base64 audio to format expected by Gemini Live API
            audio_bytes = base64.b64decode(audio_data)
            
            # Send audio chunk to Gemini Live API
            await session.gemini_session.send_audio_chunk(audio_bytes)
            
            # Start listening for Gemini responses if not already
            if not session.is_listening_to_gemini:
                session.is_listening_to_gemini = True
                asyncio.create_task(self.listen_to_gemini_responses(websocket, session))
                
        except Exception as e:
            logger.error(f"Error handling audio chunk: {e}")
            await self.send_error(websocket, {
                "message": "Error processing audio",
                "error_type": "audio_error"
            })

    async def handle_image_analysis(self, websocket: websockets.WebSocketServerProtocol, session, message):
        """Handle image analysis requests"""
        try:
            image_data = message['data']['image']
            prompt = message['data'].get('prompt', 'Analyze this crop image for diseases or issues')
            
            # Process image for crop disease detection
            analysis_result = await self.image_processor.analyze_crop_image(
                image_data, prompt
            )
            
            # Send analysis result back to client
            await self.send_message(websocket, {
                "type": "image_analysis",
                "data": analysis_result
            })
            
            # Also add to conversation context
            if session.gemini_session:
                await session.gemini_session.send_image_with_text(
                    image_data, prompt
                )
                
        except Exception as e:
            logger.error(f"Error handling image analysis: {e}")
            await self.send_error(websocket, {
                "message": "Error analyzing image",
                "error_type": "image_error"
            })

    async def handle_text_message(self, websocket: websockets.WebSocketServerProtocol, session, message):
        """Handle text messages from client"""
        try:
            text = message['data']
            
            # Send text to Gemini Live API
            if session.gemini_session:
                await session.gemini_session.send_text(text)
                
                # Start listening for responses if not already
                if not session.is_listening_to_gemini:
                    session.is_listening_to_gemini = True
                    asyncio.create_task(self.listen_to_gemini_responses(websocket, session))
                    
        except Exception as e:
            logger.error(f"Error handling text message: {e}")
            await self.send_error(websocket, {
                "message": "Error processing text",
                "error_type": "text_error"
            })

    async def handle_interrupt(self, websocket: websockets.WebSocketServerProtocol, session, message):
        """Handle interrupt requests from client"""
        try:
            if session.gemini_session:
                await session.gemini_session.interrupt()
                
            await self.send_message(websocket, {
                "type": "interrupted",
                "data": {
                    "message": "Conversation interrupted"
                }
            })
            
        except Exception as e:
            logger.error(f"Error handling interrupt: {e}")

    async def listen_to_gemini_responses(self, websocket: websockets.WebSocketServerProtocol, session):
        """Listen for responses from Gemini Live API and forward to client"""
        try:
            async for response in session.gemini_session.listen():
                if response.type == 'audio':
                    await self.send_message(websocket, {
                        "type": "audio",
                        "data": base64.b64encode(response.data).decode('utf-8')
                    })
                elif response.type == 'text':
                    await self.send_message(websocket, {
                        "type": "text",
                        "data": response.text
                    })
                elif response.type == 'turn_complete':
                    await self.send_message(websocket, {
                        "type": "turn_complete"
                    })
                elif response.type == 'transcription':
                    await self.send_message(websocket, {
                        "type": "transcription",
                        "data": {
                            "text": response.text,
                            "is_final": response.is_final
                        }
                    })
                elif response.type == 'function_call':
                    await self.send_message(websocket, {
                        "type": "function_call",
                        "data": response.function_data
                    })
                    
        except Exception as e:
            logger.error(f"Error listening to Gemini responses: {e}")
            session.is_listening_to_gemini = False

    async def send_message(self, websocket: websockets.WebSocketServerProtocol, message: Dict[str, Any]):
        """Send message to client"""
        try:
            await websocket.send(json.dumps(message))
        except websockets.exceptions.ConnectionClosed:
            logger.warning("Attempted to send message to closed connection")
        except Exception as e:
            logger.error(f"Error sending message: {e}")

    async def send_error(self, websocket: websockets.WebSocketServerProtocol, error_data: Dict[str, Any]):
        """Send error message to client"""
        await self.send_message(websocket, {
            "type": "error",
            "data": error_data
        })

async def health_check(path, request_headers):
    """Health check endpoint"""
    if path == "/health":
        return 200, [("Content-Type", "text/plain")], b"OK"

async def main():
    """Main server function"""
    try:
        # Load configuration
        config = load_config()
        
        # Initialize server
        server = KisanAIServer(config)
        
        # Server configuration
        host = config.get('server', {}).get('host', '0.0.0.0')
        port = config.get('server', {}).get('port', 8081)
        
        logger.info(f"Starting Kisan AI WebSocket server on {host}:{port}")
        
        # Start WebSocket server
        async with websockets.serve(
            server.handle_client,
            host,
            port,
            process_request=health_check,
            ping_interval=30,
            ping_timeout=10,
            close_timeout=10
        ):
            logger.info(f"Kisan AI server running on ws://{host}:{port}")
            logger.info("Health check available at http://{0}:{1}/health".format(host, port))
            
            # Keep server running
            await asyncio.Future()  # Run forever
            
    except KeyboardInterrupt:
        logger.info("Server shutdown requested")
    except Exception as e:
        logger.error(f"Server error: {e}")
        logger.error(traceback.format_exc())
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main()) 
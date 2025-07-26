#!/usr/bin/env python3
"""
Kisan AI Gemini Live API WebSocket Server
Based on project-livewire architecture for real-time multimodal streaming
"""

import asyncio
import json
import logging
import os
import sys
import websockets
from typing import Any

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.websocket_handler import handle_client

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO').upper()),
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Suppress Google API client logs while keeping application debug messages
for logger_name in [
    'google',
    'google.auth',
    'google.auth.transport',
    'google.auth.transport.requests',
    'urllib3.connectionpool',
    'google.generativeai',
    'websockets.client',
    'websockets.protocol',
    'httpx',
    'httpcore',
]:
    logging.getLogger(logger_name).setLevel(logging.ERROR)

logger = logging.getLogger(__name__)

async def health_check(path, request_headers):
    """Health check endpoint"""
    if path == "/health":
        return 200, [("Content-Type", "text/plain")], b"OK"

async def main() -> None:
    """Starts the WebSocket server."""
    port = int(os.getenv('PORT', 8081))
    host = os.getenv('HOST', '0.0.0.0')
    
    async with websockets.serve(
        handle_client,
        host,
        port,
        process_request=health_check,
        ping_interval=30,
        ping_timeout=10,
    ):
        logger.info(f"Kisan AI Gemini Live server running on {host}:{port}...")
        logger.info(f"Health check available at http://{host}:{port}/health")
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main()) 
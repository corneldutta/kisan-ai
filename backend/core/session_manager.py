import asyncio
import logging
from typing import Dict, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

@dataclass
class ClientSession:
    session_id: str
    created_at: datetime = field(default_factory=datetime.now)
    last_activity: datetime = field(default_factory=datetime.now)
    gemini_session: Optional[Any] = None
    is_listening_to_gemini: bool = False
    conversation_context: list = field(default_factory=list)
    client_info: Dict[str, Any] = field(default_factory=dict)
    
    def update_activity(self):
        """Update last activity timestamp"""
        self.last_activity = datetime.now()
    
    def add_to_context(self, message: Dict[str, Any]):
        """Add message to conversation context"""
        self.conversation_context.append({
            **message,
            "timestamp": datetime.now().isoformat()
        })
        
        # Keep only last 50 messages to manage memory
        if len(self.conversation_context) > 50:
            self.conversation_context = self.conversation_context[-50:]
    
    def get_session_duration(self) -> timedelta:
        """Get session duration"""
        return datetime.now() - self.created_at
    
    def is_expired(self, timeout_minutes: int = 30) -> bool:
        """Check if session is expired"""
        timeout = timedelta(minutes=timeout_minutes)
        return (datetime.now() - self.last_activity) > timeout

class SessionManager:
    def __init__(self, session_timeout_minutes: int = 30):
        self.sessions: Dict[str, ClientSession] = {}
        self.session_timeout_minutes = session_timeout_minutes
        self.cleanup_task: Optional[asyncio.Task] = None
        self._start_cleanup_task()
    
    def _start_cleanup_task(self):
        """Start background task to cleanup expired sessions"""
        if self.cleanup_task is None or self.cleanup_task.done():
            self.cleanup_task = asyncio.create_task(self._cleanup_expired_sessions())
    
    async def _cleanup_expired_sessions(self):
        """Background task to cleanup expired sessions"""
        while True:
            try:
                await asyncio.sleep(300)  # Check every 5 minutes
                
                expired_sessions = []
                for session_id, session in self.sessions.items():
                    if session.is_expired(self.session_timeout_minutes):
                        expired_sessions.append(session_id)
                
                for session_id in expired_sessions:
                    logger.info(f"Cleaning up expired session: {session_id}")
                    await self.remove_session(session_id)
                    
            except asyncio.CancelledError:
                logger.info("Session cleanup task cancelled")
                break
            except Exception as e:
                logger.error(f"Error in session cleanup: {e}")
    
    async def create_session(self, session_id: str, client_info: Optional[Dict[str, Any]] = None) -> ClientSession:
        """Create a new client session"""
        if session_id in self.sessions:
            # Update existing session
            session = self.sessions[session_id]
            session.update_activity()
            logger.info(f"Updated existing session: {session_id}")
        else:
            # Create new session
            session = ClientSession(
                session_id=session_id,
                client_info=client_info or {}
            )
            self.sessions[session_id] = session
            logger.info(f"Created new session: {session_id}")
        
        return session
    
    async def get_session(self, session_id: str) -> Optional[ClientSession]:
        """Get session by ID"""
        session = self.sessions.get(session_id)
        if session:
            session.update_activity()
        return session
    
    async def remove_session(self, session_id: str) -> bool:
        """Remove session and cleanup resources"""
        session = self.sessions.get(session_id)
        if not session:
            return False
        
        try:
            # Close Gemini session if exists
            if session.gemini_session:
                await session.gemini_session.close()
            
            # Remove from sessions dict
            del self.sessions[session_id]
            
            logger.info(f"Removed session: {session_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error removing session {session_id}: {e}")
            return False
    
    def get_active_sessions_count(self) -> int:
        """Get count of active sessions"""
        return len(self.sessions)
    
    def get_session_info(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session information"""
        session = self.sessions.get(session_id)
        if not session:
            return None
        
        return {
            "session_id": session.session_id,
            "created_at": session.created_at.isoformat(),
            "last_activity": session.last_activity.isoformat(),
            "duration": str(session.get_session_duration()),
            "context_messages": len(session.conversation_context),
            "is_listening_to_gemini": session.is_listening_to_gemini,
            "client_info": session.client_info
        }
    
    def get_all_sessions_info(self) -> Dict[str, Dict[str, Any]]:
        """Get information for all active sessions"""
        return {
            session_id: self.get_session_info(session_id)
            for session_id in self.sessions.keys()
        }
    
    async def cleanup_all_sessions(self):
        """Cleanup all sessions (called on server shutdown)"""
        logger.info("Cleaning up all sessions...")
        
        for session_id in list(self.sessions.keys()):
            await self.remove_session(session_id)
        
        if self.cleanup_task and not self.cleanup_task.done():
            self.cleanup_task.cancel()
            try:
                await self.cleanup_task
            except asyncio.CancelledError:
                pass
        
        logger.info("All sessions cleaned up")
    
    async def update_session_context(self, session_id: str, message: Dict[str, Any]):
        """Update session conversation context"""
        session = await self.get_session(session_id)
        if session:
            session.add_to_context(message)
    
    async def get_session_context(self, session_id: str, last_n: Optional[int] = None) -> list:
        """Get session conversation context"""
        session = await self.get_session(session_id)
        if not session:
            return []
        
        context = session.conversation_context
        if last_n:
            context = context[-last_n:]
        
        return context 
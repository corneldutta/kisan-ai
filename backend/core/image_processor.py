import asyncio
import logging
import base64
from typing import Dict, Any, Optional
from datetime import datetime
import json
from .gemini_client import GeminiClient

logger = logging.getLogger(__name__)

class ImageProcessor:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.gemini_client = GeminiClient(config)
        
        # Predefined crop disease detection prompts
        self.crop_analysis_prompt = """
        You are an expert agricultural pathologist. Analyze this crop image and provide:
        
        1. **Disease/Issue Identification**: What specific disease, pest, or problem do you see?
        2. **Confidence Level**: How confident are you in this diagnosis (high/medium/low)?
        3. **Affected Plant Parts**: Which parts of the plant are affected?
        4. **Severity Assessment**: Rate the severity (mild/moderate/severe)
        5. **Treatment Recommendations**: 
           - Immediate actions to take
           - Specific treatments/pesticides/fungicides to use
           - Preventive measures for the future
        6. **Timeline**: When should the farmer see improvement?
        7. **Additional Advice**: Any other relevant farming advice
        
        Focus on practical, actionable advice using treatments and products commonly available in India.
        If you cannot identify the specific issue, suggest general plant health improvement measures.
        
        Format your response in a clear, structured way that a farmer can easily understand and act upon.
        """
    
    async def analyze_crop_image(self, image_data: str, custom_prompt: Optional[str] = None) -> Dict[str, Any]:
        """
        Analyze crop image for diseases and issues
        
        Args:
            image_data: Base64 encoded image data
            custom_prompt: Optional custom prompt (defaults to crop analysis prompt)
        
        Returns:
            Dictionary containing analysis results
        """
        try:
            # Use custom prompt or default crop analysis prompt
            prompt = custom_prompt or self.crop_analysis_prompt
            
            # Analyze image using Gemini
            analysis_result = await self.gemini_client.analyze_image(image_data, prompt)
            
            # Parse and structure the response
            structured_result = self._structure_analysis_result(analysis_result)
            
            logger.info(f"Successfully analyzed crop image")
            return structured_result
            
        except Exception as e:
            logger.error(f"Error analyzing crop image: {e}")
            return {
                "success": False,
                "error": str(e),
                "analysis": {
                    "disease": "Analysis failed",
                    "confidence": "low",
                    "severity": "unknown",
                    "treatment": "Please consult a local agricultural expert",
                    "prevention": "Maintain good crop hygiene and monitor regularly"
                },
                "timestamp": datetime.now().isoformat()
            }
    
    def _structure_analysis_result(self, raw_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Structure the raw analysis result into a standardized format
        """
        try:
            analysis_text = raw_result.get("analysis", "")
            
            # Extract structured information from the analysis text
            # This is a simplified parser - in production, you might use more sophisticated NLP
            structured_data = self._extract_structured_data(analysis_text)
            
            return {
                "success": True,
                "analysis": structured_data,
                "raw_analysis": analysis_text,
                "confidence_score": raw_result.get("confidence", 0.0),
                "timestamp": raw_result.get("timestamp", datetime.now().isoformat()),
                "recommendations": self._extract_recommendations(analysis_text)
            }
            
        except Exception as e:
            logger.error(f"Error structuring analysis result: {e}")
            return {
                "success": False,
                "error": f"Failed to structure analysis: {str(e)}",
                "raw_analysis": raw_result.get("analysis", ""),
                "timestamp": datetime.now().isoformat()
            }
    
    def _extract_structured_data(self, analysis_text: str) -> Dict[str, Any]:
        """
        Extract structured data from analysis text
        """
        # This is a simplified extraction - you could use more sophisticated NLP
        # or train a custom model for better extraction
        
        structured_data = {
            "disease": "Unknown condition",
            "confidence": "medium",
            "severity": "moderate",
            "affected_parts": "leaves",
            "treatment": "Consult local agricultural expert",
            "prevention": "Regular monitoring and good crop hygiene",
            "timeline": "Monitor progress over 1-2 weeks"
        }
        
        # Simple keyword-based extraction
        text_lower = analysis_text.lower()
        
        # Extract disease/issue
        disease_keywords = [
            "blight", "rust", "mildew", "wilt", "spot", "rot", "mosaic",
            "aphid", "thrips", "mite", "caterpillar", "fungus", "bacterial",
            "viral", "nutrient deficiency", "water stress"
        ]
        
        for keyword in disease_keywords:
            if keyword in text_lower:
                structured_data["disease"] = keyword.title()
                break
        
        # Extract confidence
        if "high confidence" in text_lower or "very confident" in text_lower:
            structured_data["confidence"] = "high"
        elif "low confidence" in text_lower or "uncertain" in text_lower:
            structured_data["confidence"] = "low"
        
        # Extract severity
        if "severe" in text_lower or "critical" in text_lower:
            structured_data["severity"] = "severe"
        elif "mild" in text_lower or "minor" in text_lower:
            structured_data["severity"] = "mild"
        
        return structured_data
    
    def _extract_recommendations(self, analysis_text: str) -> Dict[str, Any]:
        """
        Extract actionable recommendations from analysis text
        """
        recommendations = {
            "immediate_actions": [],
            "treatments": [],
            "preventive_measures": [],
            "monitoring_schedule": "Check daily for the next week"
        }
        
        # Split text into sections and extract recommendations
        sections = analysis_text.split('\n')
        
        current_section = None
        for line in sections:
            line_lower = line.lower().strip()
            
            if "immediate" in line_lower or "urgent" in line_lower:
                current_section = "immediate_actions"
            elif "treatment" in line_lower or "remedy" in line_lower:
                current_section = "treatments"
            elif "prevent" in line_lower or "future" in line_lower:
                current_section = "preventive_measures"
            elif line_lower.startswith(('-', '•', '*')) and current_section:
                # Extract bullet point recommendations
                recommendation = line.strip().lstrip('-•* ')
                if recommendation and current_section in recommendations:
                    recommendations[current_section].append(recommendation)
        
        return recommendations
    
    async def get_crop_health_summary(self, recent_analyses: list) -> Dict[str, Any]:
        """
        Generate a crop health summary based on recent image analyses
        """
        try:
            if not recent_analyses:
                return {
                    "summary": "No recent analyses available",
                    "overall_health": "unknown",
                    "trends": []
                }
            
            # Analyze trends in recent diagnoses
            diseases = [analysis.get('analysis', {}).get('disease', 'unknown') 
                       for analysis in recent_analyses]
            severities = [analysis.get('analysis', {}).get('severity', 'unknown') 
                         for analysis in recent_analyses]
            
            # Calculate overall health trend
            severe_count = severities.count('severe')
            moderate_count = severities.count('moderate')
            mild_count = severities.count('mild')
            
            if severe_count > len(recent_analyses) * 0.3:
                overall_health = "poor"
            elif moderate_count > len(recent_analyses) * 0.5:
                overall_health = "moderate"
            else:
                overall_health = "good"
            
            # Generate summary
            summary = f"Based on {len(recent_analyses)} recent analyses, "
            summary += f"crop health appears to be {overall_health}. "
            
            if diseases:
                most_common_disease = max(set(diseases), key=diseases.count)
                if most_common_disease != 'unknown':
                    summary += f"Most common issue: {most_common_disease}. "
            
            return {
                "summary": summary,
                "overall_health": overall_health,
                "total_analyses": len(recent_analyses),
                "disease_distribution": dict(zip(*np.unique(diseases, return_counts=True))) if diseases else {},
                "severity_distribution": dict(zip(*np.unique(severities, return_counts=True))) if severities else {},
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating crop health summary: {e}")
            return {
                "summary": "Unable to generate health summary",
                "overall_health": "unknown",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }

# Import numpy only if available (not critical for basic functionality)
try:
    import numpy as np
except ImportError:
    # Fallback implementation without numpy
    def unique_with_counts(arr):
        unique_items = list(set(arr))
        counts = [arr.count(item) for item in unique_items]
        return unique_items, counts
    
    class np:
        @staticmethod
        def unique(arr, return_counts=False):
            if return_counts:
                return unique_with_counts(arr)
            return list(set(arr)) 
"""
Modeled Hair Engine - REST API
==============================

This module provides the REST API for the Modeled Hair Engine
using FastAPI.
"""

import io
import base64
import logging
from datetime import datetime
from typing import Optional, Dict, Any
import uuid

from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

# Local imports
import sys
sys.path.append('..')
from core.hair_engine import HairEngine, create_engine
from models.data_models import (
    HairAnalysisResult, AnalysisRequest, AnalysisResponse, FeedbackRequest
)
from config.settings import api_config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Modeled Hair Engine API",
    description="Proprietary hair analysis API using Amazon Rekognition and custom ML models",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Hair Engine
hair_engine: Optional[HairEngine] = None

# In-memory storage for analysis results (use database in production)
analysis_store: Dict[str, HairAnalysisResult] = {}


# =============================================================================
# Startup and Shutdown Events
# =============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize the Hair Engine on startup."""
    global hair_engine
    logger.info("Initializing Hair Engine...")
    hair_engine = create_engine(use_rekognition=True, use_custom_model=False)
    logger.info("Hair Engine initialized successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down Hair Engine API")


# =============================================================================
# API Models
# =============================================================================

class ImageUploadRequest(BaseModel):
    """Request model for image upload analysis."""
    user_id: Optional[str] = Field(None, description="User identifier")
    options: Optional[Dict[str, bool]] = Field(
        None, description="Analysis options"
    )


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    timestamp: str


class AnalysisSummary(BaseModel):
    """Summary of analysis results."""
    analysis_id: str
    curl_pattern: Optional[str]
    hair_length: Optional[str]
    hair_color: Optional[str]
    confidence: float


# =============================================================================
# API Endpoints
# =============================================================================

@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint - health check."""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        timestamp=datetime.utcnow().isoformat()
    )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy" if hair_engine else "initializing",
        version="1.0.0",
        timestamp=datetime.utcnow().isoformat()
    )


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_image(
    file: UploadFile = File(...),
    user_id: Optional[str] = None
):
    """
    Analyze hair from an uploaded image.
    
    Args:
        file: Image file (JPEG, PNG, WebP)
        user_id: Optional user identifier
        
    Returns:
        Analysis results
    """
    if not hair_engine:
        raise HTTPException(status_code=503, detail="Hair Engine not initialized")
    
    # Validate file type
    if file.content_type not in ['image/jpeg', 'image/png', 'image/webp']:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. Supported: JPEG, PNG, WebP"
        )
    
    # Read file
    try:
        image_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")
    
    # Check file size
    if len(image_bytes) > api_config.max_image_size_mb * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {api_config.max_image_size_mb}MB"
        )
    
    # Perform analysis
    start_time = datetime.utcnow()
    try:
        result = hair_engine.analyze(image_bytes, user_id=user_id)
        processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        # Store result
        analysis_store[result.analysis_id] = result
        
        return AnalysisResponse(
            success=True,
            analysis=result,
            processing_time_ms=processing_time
        )
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/analyze/base64", response_model=AnalysisResponse)
async def analyze_base64_image(request: AnalysisRequest):
    """
    Analyze hair from a base64-encoded image.
    
    Args:
        request: Analysis request with base64 image data
        
    Returns:
        Analysis results
    """
    if not hair_engine:
        raise HTTPException(status_code=503, detail="Hair Engine not initialized")
    
    if not request.image_base64:
        raise HTTPException(status_code=400, detail="image_base64 is required")
    
    # Decode base64
    try:
        # Remove data URL prefix if present
        if ',' in request.image_base64:
            request.image_base64 = request.image_base64.split(',')[1]
        
        image_bytes = base64.b64decode(request.image_base64)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 data: {str(e)}")
    
    # Perform analysis
    start_time = datetime.utcnow()
    try:
        result = hair_engine.analyze(
            image_bytes,
            user_id=request.user_id,
            options=request.analysis_options
        )
        processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        # Store result
        analysis_store[result.analysis_id] = result
        
        return AnalysisResponse(
            success=True,
            analysis=result,
            processing_time_ms=processing_time
        )
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.get("/analysis/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(analysis_id: str):
    """
    Retrieve a previous analysis result.
    
    Args:
        analysis_id: Analysis identifier
        
    Returns:
        Analysis results
    """
    if analysis_id not in analysis_store:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return AnalysisResponse(
        success=True,
        analysis=analysis_store[analysis_id]
    )


@app.post("/feedback")
async def submit_feedback(request: FeedbackRequest, background_tasks: BackgroundTasks):
    """
    Submit user feedback on an analysis.
    
    This feedback is used to improve the model over time.
    
    Args:
        request: Feedback request with corrections
        
    Returns:
        Confirmation message
    """
    if request.analysis_id not in analysis_store:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    # Update the stored analysis with feedback
    analysis = analysis_store[request.analysis_id]
    analysis.user_feedback = request.corrections
    
    # Queue background task to process feedback for model improvement
    background_tasks.add_task(process_feedback, request)
    
    return {"message": "Feedback received", "analysis_id": request.analysis_id}


async def process_feedback(request: FeedbackRequest):
    """
    Background task to process user feedback.
    
    In production, this would:
    1. Store feedback in a database
    2. Queue the data for model retraining
    3. Update analytics
    """
    logger.info(f"Processing feedback for analysis {request.analysis_id}")
    # TODO: Implement feedback processing pipeline
    pass


@app.get("/analysis/{analysis_id}/summary", response_model=AnalysisSummary)
async def get_analysis_summary(analysis_id: str):
    """
    Get a summary of an analysis result.
    
    Returns a simplified view suitable for display.
    """
    if analysis_id not in analysis_store:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    analysis = analysis_store[analysis_id]
    
    # Calculate overall confidence
    confidences = list(analysis.confidence_scores.values())
    avg_confidence = sum(confidences) / len(confidences) if confidences else 0
    
    return AnalysisSummary(
        analysis_id=analysis_id,
        curl_pattern=analysis.profile.curl_pattern_basic.value if analysis.profile.curl_pattern_basic else None,
        hair_length=analysis.appearance.length.value if analysis.appearance.length else None,
        hair_color=analysis.color.natural_color.value if analysis.color.natural_color else None,
        confidence=avg_confidence
    )


# =============================================================================
# Taxonomy Endpoints
# =============================================================================

@app.get("/taxonomy/curl-patterns")
async def get_curl_patterns():
    """Get all available curl pattern classifications."""
    from config.settings import CurlPattern, CurlPatternBasic
    
    return {
        "basic": [e.value for e in CurlPatternBasic],
        "detailed": [e.value for e in CurlPattern],
        "descriptions": {
            "1A": "Straight (fine) - Hard to hold a curl",
            "1B": "Straight (medium) - Has much body",
            "1C": "Straight (coarse) - Hard to curl",
            "2A": "Wavy (loose waves) - Loose S pattern",
            "2B": "Wavy (defined waves) - Defined S pattern",
            "2C": "Wavy (wide waves) - Wider waves",
            "3A": "Curly (loose curls) - Thick and full",
            "3B": "Curly (tight curls) - Medium curl spacing",
            "3C": "Curly (corkscrews) - Tight corkscrews",
            "4A": "Kinky-coily (defined coil) - O-shaped pattern",
            "4B": "Kinky-coily (z coil) - Z-shaped pattern",
            "4C": "Kinky-coily (tight coil) - Very tight O-shaped"
        }
    }


@app.get("/taxonomy/hair-colors")
async def get_hair_colors():
    """Get all available hair color classifications."""
    from config.settings import HairColor
    
    return {
        "colors": [e.value for e in HairColor],
        "depth_scale": {
            1: "Black",
            2: "Darkest Brown",
            3: "Dark Brown",
            4: "Medium Brown",
            5: "Light Brown",
            6: "Dark Blonde",
            7: "Medium Blonde",
            8: "Light Blonde",
            9: "Very Light Blonde",
            10: "Lightest Blonde"
        }
    }


@app.get("/taxonomy/all")
async def get_full_taxonomy():
    """Get the complete hair taxonomy."""
    from config.settings import (
        CurlPattern, CurlPatternBasic, HairLength, HairColor,
        StrandThickness, HairDensity, Porosity, HairTexture,
        StyleState, FrizzLevel, ScalpCondition
    )
    
    return {
        "curl_patterns": {
            "basic": [e.value for e in CurlPatternBasic],
            "detailed": [e.value for e in CurlPattern]
        },
        "hair_length": [e.value for e in HairLength],
        "hair_color": [e.value for e in HairColor],
        "strand_thickness": [e.value for e in StrandThickness],
        "hair_density": [e.value for e in HairDensity],
        "porosity": [e.value for e in Porosity],
        "hair_texture": [e.value for e in HairTexture],
        "style_state": [e.value for e in StyleState],
        "frizz_level": [e.value for e in FrizzLevel],
        "scalp_condition": [e.value for e in ScalpCondition]
    }


# =============================================================================
# Run Server
# =============================================================================

def run_server(host: str = "0.0.0.0", port: int = 8000):
    """Run the API server."""
    uvicorn.run(app, host=host, port=port)


if __name__ == "__main__":
    run_server()

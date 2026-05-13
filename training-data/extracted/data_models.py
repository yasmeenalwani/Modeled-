"""
Modeled Hair Engine - Data Models
==================================

This module defines the Pydantic data models for the Modeled Hair Engine,
representing the comprehensive hair taxonomy and analysis results.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum

# Import enumerations from settings
import sys
sys.path.append('..')
from config.settings import (
    CurlPattern, CurlPatternBasic, HairLength, HairColor,
    StrandThickness, HairDensity, Porosity, HairTexture,
    StyleState, FrizzLevel, ScalpCondition
)


# =============================================================================
# Core Hair Profile Models
# =============================================================================

class HairProfile(BaseModel):
    """
    Core hair profile classification based on the FIA system.
    This represents the primary classification of the hair.
    """
    curl_pattern: Optional[CurlPattern] = Field(
        None, description="Andre Walker curl pattern (1A-4C)"
    )
    curl_pattern_basic: Optional[CurlPatternBasic] = Field(
        None, description="Simplified curl pattern (straight/wavy/curly/coily)"
    )
    strand_thickness: Optional[StrandThickness] = Field(
        None, description="Diameter of individual hair strands"
    )
    hair_density: Optional[HairDensity] = Field(
        None, description="Overall thickness/volume of hair"
    )
    
    class Config:
        use_enum_values = True


class HairMorphology(BaseModel):
    """
    Physical characteristics of the hair strands.
    Provides a more granular, scientific view of hair properties.
    """
    cross_sectional_shape: Optional[str] = Field(
        None, description="Shape of hair strand cross-section (round/oval/elliptical/flat)"
    )
    diameter_micrometers: Optional[float] = Field(
        None, description="Measured thickness of hair strand in micrometers"
    )
    porosity: Optional[Porosity] = Field(
        None, description="Hair's ability to absorb and retain moisture"
    )
    elasticity: Optional[str] = Field(
        None, description="Hair's ability to stretch and return (low/medium/high)"
    )
    tensile_strength: Optional[str] = Field(
        None, description="Resistance to breaking under tension (weak/normal/strong)"
    )
    
    class Config:
        use_enum_values = True


class HairAppearance(BaseModel):
    """
    Visual characteristics of the hair.
    """
    length: Optional[HairLength] = Field(
        None, description="Overall length of the hair"
    )
    volume: Optional[str] = Field(
        None, description="Visual fullness (flat/moderate/high/very_high)"
    )
    texture: Optional[HairTexture] = Field(
        None, description="LOIS texture classification"
    )
    shine: Optional[str] = Field(
        None, description="Light reflection (matte/natural/glossy/high_shine)"
    )
    frizz_level: Optional[FrizzLevel] = Field(
        None, description="Degree of hair strand misalignment"
    )
    flyaways: Optional[str] = Field(
        None, description="Presence of stray hairs (none/some/many)"
    )
    split_ends: Optional[str] = Field(
        None, description="Condition of hair tips (none/mild/moderate/severe)"
    )
    
    class Config:
        use_enum_values = True


class HairColorProfile(BaseModel):
    """
    Natural and artificial color characteristics of the hair.
    """
    natural_color: Optional[HairColor] = Field(
        None, description="Naturally occurring hair color"
    )
    artificial_color_type: Optional[str] = Field(
        None, description="Type of artificial coloring (none/single-process/highlights/balayage/ombre/fantasy)"
    )
    color_depth: Optional[int] = Field(
        None, ge=1, le=10, description="Lightness scale from 1 (black) to 10 (lightest blonde)"
    )
    undertone: Optional[str] = Field(
        None, description="Underlying tone (cool/neutral/warm)"
    )
    dominant_rgb: Optional[List[int]] = Field(
        None, description="Dominant RGB color values [R, G, B]"
    )
    
    class Config:
        use_enum_values = True


class HairHealth(BaseModel):
    """
    Indicators of the hair's overall health and condition.
    """
    cuticle_condition: Optional[str] = Field(
        None, description="Condition of outermost hair layer (smooth/slightly_raised/raised/damaged)"
    )
    breakage: Optional[str] = Field(
        None, description="Extent of hair strand breakage (none/mild/moderate/severe)"
    )
    hydration: Optional[str] = Field(
        None, description="Moisture level (dry/balanced/moisturized)"
    )
    heat_damage: Optional[str] = Field(
        None, description="Heat damage indicators (none/mild/moderate/severe)"
    )
    chemical_damage: Optional[str] = Field(
        None, description="Chemical damage indicators (none/mild/moderate/severe)"
    )
    
    class Config:
        use_enum_values = True


class ScalpAndRoot(BaseModel):
    """
    Condition of the scalp and hair at the roots.
    """
    scalp_condition: Optional[ScalpCondition] = Field(
        None, description="Health and appearance of the scalp"
    )
    root_lift: Optional[str] = Field(
        None, description="Volume at the roots (flat/moderate/high)"
    )
    regrowth_visibility: Optional[str] = Field(
        None, description="Visibility of natural roots after coloring (none/mild/strong)"
    )
    
    class Config:
        use_enum_values = True


class StyleAndState(BaseModel):
    """
    Current styling and condition of the hair.
    """
    style_state: Optional[StyleState] = Field(
        None, description="Current styling or protective state"
    )
    product_presence: Optional[List[str]] = Field(
        None, description="Styling products visible or inferred"
    )
    manipulation_level: Optional[str] = Field(
        None, description="Degree of styling applied (low/medium/high)"
    )
    
    class Config:
        use_enum_values = True


class ImageContext(BaseModel):
    """
    Contextual factors related to the image that can influence analysis.
    """
    lighting: Optional[str] = Field(
        None, description="Lighting condition (natural/artificial/backlit/overexposed/underexposed)"
    )
    image_quality: Optional[str] = Field(
        None, description="Image clarity (sharp/slightly_blurry/blurry)"
    )
    obstructions: Optional[List[str]] = Field(
        None, description="Visual obstructions affecting analysis"
    )
    hair_visible: bool = Field(
        True, description="Whether hair is visible in the image"
    )


# =============================================================================
# Comprehensive Hair Analysis Result
# =============================================================================

class HairAnalysisResult(BaseModel):
    """
    Complete hair analysis result combining all taxonomy categories.
    This is the primary output of the Modeled Hair Engine.
    """
    # Metadata
    analysis_id: str = Field(..., description="Unique identifier for this analysis")
    user_id: Optional[str] = Field(None, description="User identifier")
    image_id: str = Field(..., description="Image identifier")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    engine_version: str = Field("1.0.0", description="Version of the Hair Engine")
    
    # Analysis Results
    profile: HairProfile = Field(default_factory=HairProfile)
    morphology: HairMorphology = Field(default_factory=HairMorphology)
    appearance: HairAppearance = Field(default_factory=HairAppearance)
    color: HairColorProfile = Field(default_factory=HairColorProfile)
    health: HairHealth = Field(default_factory=HairHealth)
    scalp: ScalpAndRoot = Field(default_factory=ScalpAndRoot)
    style: StyleAndState = Field(default_factory=StyleAndState)
    context: ImageContext = Field(default_factory=ImageContext)
    
    # Confidence Scores
    confidence_scores: Dict[str, float] = Field(
        default_factory=dict,
        description="Confidence scores for each classification"
    )
    
    # User Feedback (for model improvement)
    user_feedback: Optional[Dict[str, Any]] = Field(
        None, description="User-provided corrections to the analysis"
    )
    
    # Raw Data (for debugging and analysis)
    raw_rekognition_response: Optional[Dict[str, Any]] = Field(
        None, description="Raw response from Amazon Rekognition"
    )
    
    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


# =============================================================================
# API Request/Response Models
# =============================================================================

class AnalysisRequest(BaseModel):
    """Request model for hair analysis."""
    image_url: Optional[str] = Field(None, description="URL of the image to analyze")
    image_base64: Optional[str] = Field(None, description="Base64-encoded image data")
    user_id: Optional[str] = Field(None, description="User identifier")
    analysis_options: Optional[Dict[str, bool]] = Field(
        None, description="Options to enable/disable specific analyses"
    )


class AnalysisResponse(BaseModel):
    """Response model for hair analysis."""
    success: bool
    analysis: Optional[HairAnalysisResult] = None
    error: Optional[str] = None
    processing_time_ms: Optional[float] = None


class FeedbackRequest(BaseModel):
    """Request model for user feedback on analysis."""
    analysis_id: str
    user_id: str
    corrections: Dict[str, Any] = Field(
        ..., description="User-provided corrections (e.g., {'curl_pattern': '3C'})"
    )


# =============================================================================
# Training Data Models
# =============================================================================

class TrainingImage(BaseModel):
    """Model for a labeled training image."""
    image_id: str
    s3_uri: str
    labels: Dict[str, str] = Field(
        ..., description="Labels for this image (e.g., {'curl_pattern': '3B', 'length': 'medium'})"
    )
    annotator_id: Optional[str] = None
    annotation_timestamp: Optional[datetime] = None
    verified: bool = False


class TrainingDataset(BaseModel):
    """Model for a training dataset."""
    dataset_id: str
    name: str
    description: Optional[str] = None
    images: List[TrainingImage]
    label_categories: List[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

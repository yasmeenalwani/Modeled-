"""
Modeled Hair Engine - Configuration Settings
=============================================

This module contains all configuration settings for the Modeled Hair Engine,
including AWS credentials, model parameters, and classification thresholds.
"""

import os
from dataclasses import dataclass
from typing import Dict, List, Tuple
from enum import Enum


# =============================================================================
# AWS Configuration
# =============================================================================

@dataclass
class AWSConfig:
    """AWS service configuration settings."""
    region: str = os.getenv("AWS_REGION", "us-east-1")
    rekognition_project_arn: str = os.getenv("REKOGNITION_PROJECT_ARN", "")
    rekognition_model_arn: str = os.getenv("REKOGNITION_MODEL_ARN", "")
    s3_bucket: str = os.getenv("S3_BUCKET", "modeled-hair-engine")
    sagemaker_endpoint: str = os.getenv("SAGEMAKER_ENDPOINT", "")


# =============================================================================
# Hair Classification Enumerations
# =============================================================================

class CurlPattern(str, Enum):
    """Andre Walker Hair Typing System - Curl Pattern Classifications."""
    TYPE_1A = "1A"  # Straight (fine)
    TYPE_1B = "1B"  # Straight (medium)
    TYPE_1C = "1C"  # Straight (coarse)
    TYPE_2A = "2A"  # Wavy (loose waves)
    TYPE_2B = "2B"  # Wavy (defined waves)
    TYPE_2C = "2C"  # Wavy (wide waves)
    TYPE_3A = "3A"  # Curly (loose curls)
    TYPE_3B = "3B"  # Curly (tight curls)
    TYPE_3C = "3C"  # Curly (corkscrews)
    TYPE_4A = "4A"  # Kinky-coily (defined coil)
    TYPE_4B = "4B"  # Kinky-coily (z coil)
    TYPE_4C = "4C"  # Kinky-coily (tight coil)


class CurlPatternBasic(str, Enum):
    """Simplified curl pattern for MVP."""
    STRAIGHT = "straight"
    WAVY = "wavy"
    CURLY = "curly"
    COILY = "coily"


class HairLength(str, Enum):
    """Hair length classifications."""
    BUZZED = "buzzed"
    SHORT = "short"
    MEDIUM = "medium"
    LONG = "long"
    EXTRA_LONG = "extra_long"


class HairColor(str, Enum):
    """Basic hair color classifications."""
    BLACK = "black"
    DARK_BROWN = "dark_brown"
    LIGHT_BROWN = "light_brown"
    BLONDE = "blonde"
    RED = "red"
    GRAY = "gray"
    WHITE = "white"
    FANTASY = "fantasy"


class StrandThickness(str, Enum):
    """Hair strand thickness classifications."""
    FINE = "fine"
    MEDIUM = "medium"
    COARSE = "coarse"


class HairDensity(str, Enum):
    """Hair density classifications."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Porosity(str, Enum):
    """Hair porosity classifications."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class HairTexture(str, Enum):
    """LOIS System - Hair texture classifications."""
    THREADY = "thready"
    WIRY = "wiry"
    COTTONY = "cottony"
    SPONGY = "spongy"
    SILKY = "silky"


class StyleState(str, Enum):
    """Current styling state of the hair."""
    NATURAL = "natural"
    BLOWOUT = "blowout"
    SILK_PRESS = "silk_press"
    BRAIDS = "braids"
    TWISTS = "twists"
    LOCS = "locs"
    WIG = "wig"
    WEAVE = "weave"
    EXTENSIONS = "extensions"
    UPDO = "updo"
    PONYTAIL = "ponytail"
    PROTECTIVE_STYLE = "protective_style"


class FrizzLevel(str, Enum):
    """Frizz level classifications."""
    NONE = "none"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class ScalpCondition(str, Enum):
    """Scalp condition classifications."""
    NORMAL = "normal"
    DRY = "dry"
    OILY = "oily"
    FLAKY = "flaky"
    IRRITATED = "irritated"


# =============================================================================
# Classification Thresholds (Rule-Based System)
# =============================================================================

@dataclass
class LengthThresholds:
    """
    Thresholds for rule-based hair length classification.
    Based on the ratio of hair mask height to face bounding box height.
    """
    buzzed_max: float = 0.3
    short_max: float = 0.8
    medium_max: float = 1.5
    long_max: float = 2.5
    # Above long_max is classified as extra_long


@dataclass
class CurlPatternThresholds:
    """
    Thresholds for rule-based curl pattern classification.
    Based on edge density and texture variance within the hair mask.
    """
    # Edge density thresholds (edges per 100x100 pixel area)
    straight_edge_max: float = 50.0
    wavy_edge_max: float = 120.0
    curly_edge_max: float = 200.0
    # Above curly_edge_max is classified as coily
    
    # Texture variance thresholds
    straight_variance_max: float = 500.0
    wavy_variance_max: float = 1200.0
    curly_variance_max: float = 2000.0


@dataclass
class ColorRanges:
    """
    HSV color ranges for hair color classification.
    Format: (H_min, S_min, V_min, H_max, S_max, V_max)
    """
    black: Tuple[int, ...] = (0, 0, 0, 180, 255, 50)
    dark_brown: Tuple[int, ...] = (0, 30, 20, 30, 180, 100)
    light_brown: Tuple[int, ...] = (10, 30, 80, 30, 150, 180)
    blonde: Tuple[int, ...] = (15, 20, 150, 40, 150, 255)
    red: Tuple[int, ...] = (0, 100, 50, 15, 255, 200)
    gray: Tuple[int, ...] = (0, 0, 80, 180, 30, 200)
    white: Tuple[int, ...] = (0, 0, 200, 180, 30, 255)
    # Fantasy colors are detected by high saturation in non-natural hue ranges


# =============================================================================
# Model Configuration
# =============================================================================

@dataclass
class ModelConfig:
    """Configuration for machine learning models."""
    # Rekognition Custom Labels
    min_confidence: float = 0.7
    max_labels: int = 10
    
    # Custom model settings
    input_image_size: Tuple[int, int] = (224, 224)
    batch_size: int = 32
    
    # Training settings
    epochs: int = 50
    learning_rate: float = 0.001
    validation_split: float = 0.2
    
    # Minimum images per label for training
    min_images_per_label: int = 20


# =============================================================================
# API Configuration
# =============================================================================

@dataclass
class APIConfig:
    """API configuration settings."""
    max_image_size_mb: int = 10
    allowed_image_formats: List[str] = None
    
    def __post_init__(self):
        if self.allowed_image_formats is None:
            self.allowed_image_formats = ["jpg", "jpeg", "png", "webp"]


# =============================================================================
# Default Configuration Instance
# =============================================================================

aws_config = AWSConfig()
length_thresholds = LengthThresholds()
curl_thresholds = CurlPatternThresholds()
color_ranges = ColorRanges()
model_config = ModelConfig()
api_config = APIConfig()

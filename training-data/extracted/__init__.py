"""
Modeled Hair Engine
===================

A proprietary hair analysis engine using Amazon Rekognition
and custom machine learning models.

Author: Modeled Team
Version: 1.0.0
"""

__version__ = "1.0.0"
__author__ = "Modeled Team"

from .core.hair_engine import HairEngine, create_engine, analyze_image
from .models.data_models import HairAnalysisResult, HairProfile

__all__ = [
    "HairEngine",
    "create_engine",
    "analyze_image",
    "HairAnalysisResult",
    "HairProfile"
]

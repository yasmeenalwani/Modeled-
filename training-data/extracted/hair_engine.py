"""
Modeled Hair Engine - Core Analysis Engine
==========================================

This module contains the main HairEngine class that orchestrates
the hair analysis pipeline, integrating Amazon Rekognition with
custom classification algorithms.
"""

import io
import uuid
import logging
from datetime import datetime
from typing import Optional, Dict, Any, Tuple
from PIL import Image
import numpy as np

# AWS SDK
import boto3
from botocore.exceptions import ClientError

# Local imports
import sys
sys.path.append('..')
from config.settings import (
    aws_config, length_thresholds, curl_thresholds, color_ranges, model_config,
    CurlPatternBasic, HairLength, HairColor
)
from models.data_models import (
    HairAnalysisResult, HairProfile, HairAppearance, HairColorProfile,
    ImageContext
)
from utils.image_processing import ImageProcessor
from utils.color_analysis import ColorAnalyzer
from utils.curl_pattern_analyzer import CurlPatternAnalyzer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class HairEngine:
    """
    Main hair analysis engine that orchestrates the analysis pipeline.
    
    This engine combines:
    1. Amazon Rekognition for face detection and general labels
    2. Hair segmentation for isolating hair regions
    3. Rule-based classification for MVP attributes
    4. Custom ML models for advanced classification (when available)
    """
    
    def __init__(
        self,
        use_rekognition: bool = True,
        use_custom_model: bool = False,
        custom_model_arn: Optional[str] = None
    ):
        """
        Initialize the Hair Engine.
        
        Args:
            use_rekognition: Whether to use Amazon Rekognition for analysis
            use_custom_model: Whether to use a custom Rekognition Custom Labels model
            custom_model_arn: ARN of the custom model (required if use_custom_model is True)
        """
        self.use_rekognition = use_rekognition
        self.use_custom_model = use_custom_model
        self.custom_model_arn = custom_model_arn or aws_config.rekognition_model_arn
        
        # Initialize AWS clients
        if use_rekognition:
            self.rekognition_client = boto3.client(
                'rekognition',
                region_name=aws_config.region
            )
        
        # Initialize utility classes
        self.image_processor = ImageProcessor()
        self.color_analyzer = ColorAnalyzer()
        self.curl_analyzer = CurlPatternAnalyzer()
        
        logger.info("HairEngine initialized successfully")
    
    def analyze(
        self,
        image_bytes: bytes,
        user_id: Optional[str] = None,
        options: Optional[Dict[str, bool]] = None
    ) -> HairAnalysisResult:
        """
        Perform comprehensive hair analysis on an image.
        
        Args:
            image_bytes: Raw image bytes
            user_id: Optional user identifier
            options: Analysis options to enable/disable specific features
        
        Returns:
            HairAnalysisResult containing all analysis results
        """
        start_time = datetime.utcnow()
        analysis_id = str(uuid.uuid4())
        image_id = str(uuid.uuid4())
        
        logger.info(f"Starting hair analysis: {analysis_id}")
        
        # Default options
        options = options or {
            'analyze_color': True,
            'analyze_curl': True,
            'analyze_length': True,
            'analyze_health': False,  # Advanced feature, disabled by default
        }
        
        # Initialize result
        result = HairAnalysisResult(
            analysis_id=analysis_id,
            user_id=user_id,
            image_id=image_id,
            timestamp=start_time
        )
        
        try:
            # Step 1: Load and preprocess image
            image = self.image_processor.load_image(image_bytes)
            image_np = np.array(image)
            
            # Step 2: Get face detection from Rekognition
            face_data = None
            rekognition_labels = []
            if self.use_rekognition:
                face_data = self._detect_faces(image_bytes)
                rekognition_labels = self._detect_labels(image_bytes)
                result.raw_rekognition_response = {
                    'faces': face_data,
                    'labels': rekognition_labels
                }
            
            # Step 3: Segment hair region
            hair_mask = self.image_processor.segment_hair(image_np)
            
            # Check if hair is visible
            hair_visible = np.sum(hair_mask) > 0
            result.context.hair_visible = hair_visible
            
            if not hair_visible:
                logger.warning("No hair detected in image")
                return result
            
            # Step 4: Analyze hair attributes
            confidence_scores = {}
            
            # Analyze length
            if options.get('analyze_length', True) and face_data:
                length, length_conf = self._analyze_length(hair_mask, face_data)
                result.appearance.length = length
                confidence_scores['length'] = length_conf
            
            # Analyze color
            if options.get('analyze_color', True):
                color_result = self._analyze_color(image_np, hair_mask)
                result.color = color_result['profile']
                confidence_scores['color'] = color_result['confidence']
            
            # Analyze curl pattern
            if options.get('analyze_curl', True):
                curl_result = self._analyze_curl_pattern(image_np, hair_mask)
                result.profile.curl_pattern_basic = curl_result['pattern']
                confidence_scores['curl_pattern'] = curl_result['confidence']
            
            # Use custom model if available
            if self.use_custom_model and self.custom_model_arn:
                custom_results = self._analyze_with_custom_model(image_bytes)
                self._merge_custom_results(result, custom_results, confidence_scores)
            
            result.confidence_scores = confidence_scores
            
            # Calculate processing time
            processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000
            logger.info(f"Analysis completed in {processing_time:.2f}ms")
            
        except Exception as e:
            logger.error(f"Error during analysis: {str(e)}")
            raise
        
        return result
    
    def _detect_faces(self, image_bytes: bytes) -> Optional[Dict[str, Any]]:
        """
        Use Amazon Rekognition to detect faces in the image.
        
        Returns face bounding box and landmarks for hair analysis context.
        """
        try:
            response = self.rekognition_client.detect_faces(
                Image={'Bytes': image_bytes},
                Attributes=['ALL']
            )
            
            if response['FaceDetails']:
                # Return the first (largest) face
                face = response['FaceDetails'][0]
                return {
                    'bounding_box': face['BoundingBox'],
                    'landmarks': face.get('Landmarks', []),
                    'confidence': face['Confidence']
                }
            return None
            
        except ClientError as e:
            logger.error(f"Rekognition DetectFaces error: {e}")
            return None
    
    def _detect_labels(self, image_bytes: bytes) -> list:
        """
        Use Amazon Rekognition to detect general labels in the image.
        
        These labels can provide hints about hair characteristics.
        """
        try:
            response = self.rekognition_client.detect_labels(
                Image={'Bytes': image_bytes},
                MaxLabels=model_config.max_labels,
                MinConfidence=model_config.min_confidence * 100
            )
            
            # Filter for hair-related labels
            hair_related = ['Hair', 'Long Hair', 'Short Hair', 'Curly Hair',
                          'Blonde', 'Brunette', 'Black Hair', 'Red Hair']
            
            relevant_labels = [
                {'name': label['Name'], 'confidence': label['Confidence']}
                for label in response['Labels']
                if any(hr.lower() in label['Name'].lower() for hr in hair_related)
            ]
            
            return relevant_labels
            
        except ClientError as e:
            logger.error(f"Rekognition DetectLabels error: {e}")
            return []
    
    def _analyze_length(
        self,
        hair_mask: np.ndarray,
        face_data: Dict[str, Any]
    ) -> Tuple[HairLength, float]:
        """
        Analyze hair length based on hair mask and face bounding box.
        
        Uses the ratio of hair mask extent to face height for classification.
        """
        # Get face bounding box dimensions
        bbox = face_data['bounding_box']
        image_height = hair_mask.shape[0]
        image_width = hair_mask.shape[1]
        
        face_top = int(bbox['Top'] * image_height)
        face_height = int(bbox['Height'] * image_height)
        face_bottom = face_top + face_height
        
        # Find the extent of the hair mask
        hair_rows = np.any(hair_mask > 0, axis=1)
        if not np.any(hair_rows):
            return HairLength.SHORT, 0.5
        
        hair_top = np.argmax(hair_rows)
        hair_bottom = len(hair_rows) - np.argmax(hair_rows[::-1])
        
        # Calculate hair length relative to face
        hair_extent_below_face = max(0, hair_bottom - face_bottom)
        length_ratio = hair_extent_below_face / face_height
        
        # Also consider total hair height
        total_hair_height = hair_bottom - hair_top
        total_ratio = total_hair_height / face_height
        
        # Classify based on thresholds
        if total_ratio < length_thresholds.buzzed_max:
            return HairLength.BUZZED, 0.85
        elif total_ratio < length_thresholds.short_max:
            return HairLength.SHORT, 0.80
        elif length_ratio < length_thresholds.medium_max:
            return HairLength.MEDIUM, 0.75
        elif length_ratio < length_thresholds.long_max:
            return HairLength.LONG, 0.70
        else:
            return HairLength.EXTRA_LONG, 0.65
    
    def _analyze_color(
        self,
        image: np.ndarray,
        hair_mask: np.ndarray
    ) -> Dict[str, Any]:
        """
        Analyze hair color using the hair mask to isolate the region.
        """
        return self.color_analyzer.analyze(image, hair_mask)
    
    def _analyze_curl_pattern(
        self,
        image: np.ndarray,
        hair_mask: np.ndarray
    ) -> Dict[str, Any]:
        """
        Analyze curl pattern using texture analysis within the hair mask.
        """
        return self.curl_analyzer.analyze(image, hair_mask)
    
    def _analyze_with_custom_model(
        self,
        image_bytes: bytes
    ) -> Dict[str, Any]:
        """
        Use Amazon Rekognition Custom Labels for advanced classification.
        
        This method is used when a custom model has been trained and deployed.
        """
        try:
            response = self.rekognition_client.detect_custom_labels(
                ProjectVersionArn=self.custom_model_arn,
                Image={'Bytes': image_bytes},
                MinConfidence=model_config.min_confidence * 100
            )
            
            results = {}
            for label in response.get('CustomLabels', []):
                results[label['Name']] = {
                    'value': label['Name'],
                    'confidence': label['Confidence'] / 100
                }
            
            return results
            
        except ClientError as e:
            logger.error(f"Rekognition Custom Labels error: {e}")
            return {}
    
    def _merge_custom_results(
        self,
        result: HairAnalysisResult,
        custom_results: Dict[str, Any],
        confidence_scores: Dict[str, float]
    ):
        """
        Merge results from custom model with rule-based results.
        
        Custom model results take precedence when confidence is higher.
        """
        # Map custom labels to result fields
        label_mapping = {
            'curl_1A': ('profile', 'curl_pattern', '1A'),
            'curl_1B': ('profile', 'curl_pattern', '1B'),
            'curl_1C': ('profile', 'curl_pattern', '1C'),
            'curl_2A': ('profile', 'curl_pattern', '2A'),
            'curl_2B': ('profile', 'curl_pattern', '2B'),
            'curl_2C': ('profile', 'curl_pattern', '2C'),
            'curl_3A': ('profile', 'curl_pattern', '3A'),
            'curl_3B': ('profile', 'curl_pattern', '3B'),
            'curl_3C': ('profile', 'curl_pattern', '3C'),
            'curl_4A': ('profile', 'curl_pattern', '4A'),
            'curl_4B': ('profile', 'curl_pattern', '4B'),
            'curl_4C': ('profile', 'curl_pattern', '4C'),
            # Add more mappings as needed
        }
        
        for label_name, label_data in custom_results.items():
            if label_name in label_mapping:
                category, field, value = label_mapping[label_name]
                confidence = label_data['confidence']
                
                # Update if confidence is higher than existing
                existing_conf = confidence_scores.get(field, 0)
                if confidence > existing_conf:
                    if category == 'profile':
                        setattr(result.profile, field, value)
                    confidence_scores[field] = confidence


# =============================================================================
# Convenience Functions
# =============================================================================

def create_engine(
    use_rekognition: bool = True,
    use_custom_model: bool = False
) -> HairEngine:
    """
    Factory function to create a HairEngine instance.
    """
    return HairEngine(
        use_rekognition=use_rekognition,
        use_custom_model=use_custom_model
    )


def analyze_image(image_path: str, **kwargs) -> HairAnalysisResult:
    """
    Convenience function to analyze an image from a file path.
    """
    with open(image_path, 'rb') as f:
        image_bytes = f.read()
    
    engine = create_engine(**kwargs)
    return engine.analyze(image_bytes)

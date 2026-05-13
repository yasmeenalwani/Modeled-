"""
Modeled Hair Engine - Curl Pattern Analysis Utilities
======================================================

This module provides curl pattern analysis utilities using
texture analysis and edge detection within the hair region.
"""

import logging
from typing import Dict, Any, Tuple, Optional
import numpy as np
import cv2
from scipy import ndimage
from scipy.fft import fft2, fftshift

# Local imports
import sys
sys.path.append('..')
from config.settings import CurlPatternBasic, CurlPattern, curl_thresholds

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CurlPatternAnalyzer:
    """
    Analyzes curl pattern from images using texture analysis.
    
    Uses a combination of:
    1. Edge density analysis
    2. Local variance (texture roughness)
    3. Frequency domain analysis
    4. Curvature estimation
    """
    
    def __init__(self):
        """Initialize the CurlPatternAnalyzer."""
        self.thresholds = curl_thresholds
    
    def analyze(
        self,
        image: np.ndarray,
        hair_mask: np.ndarray
    ) -> Dict[str, Any]:
        """
        Analyze curl pattern from an image using the hair mask.
        
        Args:
            image: Input image as numpy array (H, W, C) in RGB
            hair_mask: Binary mask for hair region
            
        Returns:
            Dictionary containing curl pattern analysis results
        """
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        # Apply mask
        masked_gray = gray.copy()
        masked_gray[hair_mask == 0] = 0
        
        # Calculate various texture metrics
        edge_density = self._calculate_edge_density(masked_gray, hair_mask)
        texture_variance = self._calculate_texture_variance(masked_gray, hair_mask)
        frequency_features = self._analyze_frequency_domain(masked_gray, hair_mask)
        curvature_score = self._estimate_curvature(masked_gray, hair_mask)
        
        # Combine metrics for classification
        pattern, confidence = self._classify_curl_pattern(
            edge_density,
            texture_variance,
            frequency_features,
            curvature_score
        )
        
        return {
            'pattern': pattern,
            'confidence': confidence,
            'metrics': {
                'edge_density': edge_density,
                'texture_variance': texture_variance,
                'frequency_features': frequency_features,
                'curvature_score': curvature_score
            }
        }
    
    def _calculate_edge_density(
        self,
        gray_image: np.ndarray,
        mask: np.ndarray
    ) -> float:
        """
        Calculate edge density within the hair region.
        
        Curly hair tends to have higher edge density due to
        the many curves and overlapping strands.
        """
        # Apply Canny edge detection
        edges = cv2.Canny(gray_image, 50, 150)
        
        # Apply mask
        masked_edges = edges.copy()
        masked_edges[mask == 0] = 0
        
        # Calculate density (edges per unit area)
        hair_area = np.sum(mask > 0)
        if hair_area == 0:
            return 0.0
        
        edge_count = np.sum(masked_edges > 0)
        
        # Normalize to edges per 100x100 pixel area
        normalized_density = (edge_count / hair_area) * 10000
        
        return normalized_density
    
    def _calculate_texture_variance(
        self,
        gray_image: np.ndarray,
        mask: np.ndarray
    ) -> float:
        """
        Calculate local variance (texture roughness) within the hair region.
        
        Higher variance indicates more texture variation, typical of curly hair.
        """
        # Calculate local variance using a sliding window
        kernel_size = 5
        
        # Calculate local mean
        local_mean = cv2.blur(gray_image.astype(np.float32), (kernel_size, kernel_size))
        
        # Calculate local variance
        local_sq_mean = cv2.blur(
            (gray_image.astype(np.float32) ** 2),
            (kernel_size, kernel_size)
        )
        local_variance = local_sq_mean - (local_mean ** 2)
        
        # Apply mask and calculate mean variance
        masked_variance = local_variance.copy()
        masked_variance[mask == 0] = 0
        
        hair_area = np.sum(mask > 0)
        if hair_area == 0:
            return 0.0
        
        mean_variance = np.sum(masked_variance) / hair_area
        
        return mean_variance
    
    def _analyze_frequency_domain(
        self,
        gray_image: np.ndarray,
        mask: np.ndarray
    ) -> Dict[str, float]:
        """
        Analyze the frequency domain characteristics of the hair texture.
        
        Curly hair tends to have more high-frequency components due to
        the rapid changes in intensity from curl patterns.
        """
        # Apply mask
        masked_image = gray_image.copy().astype(np.float32)
        masked_image[mask == 0] = np.mean(masked_image[mask > 0]) if np.any(mask > 0) else 0
        
        # Compute 2D FFT
        f_transform = fft2(masked_image)
        f_shift = fftshift(f_transform)
        magnitude_spectrum = np.abs(f_shift)
        
        # Analyze frequency distribution
        center = np.array(magnitude_spectrum.shape) // 2
        
        # Create radial frequency bands
        y, x = np.ogrid[:magnitude_spectrum.shape[0], :magnitude_spectrum.shape[1]]
        r = np.sqrt((x - center[1])**2 + (y - center[0])**2)
        
        # Calculate energy in different frequency bands
        low_freq_mask = r < min(center) * 0.2
        mid_freq_mask = (r >= min(center) * 0.2) & (r < min(center) * 0.5)
        high_freq_mask = r >= min(center) * 0.5
        
        total_energy = np.sum(magnitude_spectrum)
        if total_energy == 0:
            return {'low_freq_ratio': 0.33, 'mid_freq_ratio': 0.33, 'high_freq_ratio': 0.33}
        
        low_freq_energy = np.sum(magnitude_spectrum[low_freq_mask]) / total_energy
        mid_freq_energy = np.sum(magnitude_spectrum[mid_freq_mask]) / total_energy
        high_freq_energy = np.sum(magnitude_spectrum[high_freq_mask]) / total_energy
        
        return {
            'low_freq_ratio': low_freq_energy,
            'mid_freq_ratio': mid_freq_energy,
            'high_freq_ratio': high_freq_energy
        }
    
    def _estimate_curvature(
        self,
        gray_image: np.ndarray,
        mask: np.ndarray
    ) -> float:
        """
        Estimate the average curvature of hair strands.
        
        Uses gradient orientation analysis to detect curves.
        """
        # Calculate gradients
        sobelx = cv2.Sobel(gray_image, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray_image, cv2.CV_64F, 0, 1, ksize=3)
        
        # Calculate gradient magnitude and orientation
        magnitude = np.sqrt(sobelx**2 + sobely**2)
        orientation = np.arctan2(sobely, sobelx)
        
        # Apply mask
        magnitude[mask == 0] = 0
        
        # Calculate orientation variance (higher variance = more curves)
        valid_orientations = orientation[mask > 0]
        if len(valid_orientations) == 0:
            return 0.0
        
        # Use circular variance for orientation
        sin_sum = np.sum(np.sin(valid_orientations))
        cos_sum = np.sum(np.cos(valid_orientations))
        r = np.sqrt(sin_sum**2 + cos_sum**2) / len(valid_orientations)
        
        # Circular variance: 1 - r (higher = more spread out orientations = more curvy)
        circular_variance = 1 - r
        
        return circular_variance
    
    def _classify_curl_pattern(
        self,
        edge_density: float,
        texture_variance: float,
        frequency_features: Dict[str, float],
        curvature_score: float
    ) -> Tuple[CurlPatternBasic, float]:
        """
        Classify curl pattern based on computed metrics.
        
        Returns:
            Tuple of (CurlPatternBasic, confidence)
        """
        # Compute a combined score
        # Higher scores indicate curlier hair
        
        # Normalize metrics to 0-1 range
        edge_score = min(1.0, edge_density / 300)  # Normalize based on expected max
        variance_score = min(1.0, texture_variance / 3000)
        high_freq_score = frequency_features.get('high_freq_ratio', 0)
        
        # Combined curliness score
        curliness = (
            edge_score * 0.3 +
            variance_score * 0.3 +
            high_freq_score * 0.2 +
            curvature_score * 0.2
        )
        
        # Classify based on thresholds
        if curliness < 0.2:
            pattern = CurlPatternBasic.STRAIGHT
            confidence = 1.0 - (curliness / 0.2)
        elif curliness < 0.4:
            pattern = CurlPatternBasic.WAVY
            confidence = 1.0 - abs(curliness - 0.3) / 0.1
        elif curliness < 0.65:
            pattern = CurlPatternBasic.CURLY
            confidence = 1.0 - abs(curliness - 0.5) / 0.15
        else:
            pattern = CurlPatternBasic.COILY
            confidence = min(1.0, (curliness - 0.65) / 0.35 + 0.5)
        
        # Ensure confidence is in valid range
        confidence = max(0.5, min(1.0, confidence))
        
        return pattern, confidence
    
    def analyze_detailed_curl_type(
        self,
        image: np.ndarray,
        hair_mask: np.ndarray,
        basic_pattern: CurlPatternBasic
    ) -> Tuple[Optional[CurlPattern], float]:
        """
        Attempt to classify into more detailed curl types (1A-4C).
        
        This is a more advanced analysis that requires additional
        metrics and ideally a trained ML model.
        
        Args:
            image: Input image
            hair_mask: Hair mask
            basic_pattern: Basic pattern classification
            
        Returns:
            Tuple of (CurlPattern, confidence) or (None, 0) if unable to classify
        """
        # This is a simplified heuristic approach
        # For production, this should use a trained ML model
        
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        masked_gray = gray.copy()
        masked_gray[hair_mask == 0] = 0
        
        # Calculate additional metrics for sub-classification
        edge_density = self._calculate_edge_density(masked_gray, hair_mask)
        texture_variance = self._calculate_texture_variance(masked_gray, hair_mask)
        
        # Map basic pattern to detailed types based on metrics
        if basic_pattern == CurlPatternBasic.STRAIGHT:
            if texture_variance < 200:
                return CurlPattern.TYPE_1A, 0.7
            elif texture_variance < 400:
                return CurlPattern.TYPE_1B, 0.65
            else:
                return CurlPattern.TYPE_1C, 0.6
        
        elif basic_pattern == CurlPatternBasic.WAVY:
            if edge_density < 80:
                return CurlPattern.TYPE_2A, 0.65
            elif edge_density < 120:
                return CurlPattern.TYPE_2B, 0.6
            else:
                return CurlPattern.TYPE_2C, 0.55
        
        elif basic_pattern == CurlPatternBasic.CURLY:
            if edge_density < 150:
                return CurlPattern.TYPE_3A, 0.6
            elif edge_density < 200:
                return CurlPattern.TYPE_3B, 0.55
            else:
                return CurlPattern.TYPE_3C, 0.5
        
        elif basic_pattern == CurlPatternBasic.COILY:
            if texture_variance < 1500:
                return CurlPattern.TYPE_4A, 0.55
            elif texture_variance < 2500:
                return CurlPattern.TYPE_4B, 0.5
            else:
                return CurlPattern.TYPE_4C, 0.45
        
        return None, 0.0


class AdvancedCurlAnalyzer:
    """
    Advanced curl pattern analyzer using deep learning features.
    
    This class is designed to work with pre-trained feature extractors
    for more accurate curl pattern classification.
    """
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize the advanced analyzer.
        
        Args:
            model_path: Path to a trained classification model
        """
        self.model = None
        self.model_path = model_path
        
        if model_path:
            self._load_model(model_path)
    
    def _load_model(self, model_path: str):
        """Load the trained model."""
        # Placeholder for model loading
        logger.info(f"Loading curl pattern model from {model_path}")
        pass
    
    def predict(
        self,
        image: np.ndarray,
        hair_mask: np.ndarray
    ) -> Tuple[CurlPattern, float]:
        """
        Predict curl pattern using the trained model.
        
        Args:
            image: Input image
            hair_mask: Hair mask
            
        Returns:
            Tuple of (CurlPattern, confidence)
        """
        if self.model is None:
            raise ValueError("Model not loaded")
        
        # Placeholder for model prediction
        # In production, this would:
        # 1. Preprocess the image
        # 2. Extract the hair region
        # 3. Run through the model
        # 4. Return the prediction
        
        return CurlPattern.TYPE_3B, 0.5

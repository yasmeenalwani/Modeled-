"""
Modeled Hair Engine - Color Analysis Utilities
===============================================

This module provides color analysis utilities for determining
hair color from images using the segmented hair region.
"""

import logging
from typing import Dict, Any, List, Tuple, Optional
import numpy as np
import cv2
from collections import Counter

# Local imports
import sys
sys.path.append('..')
from config.settings import HairColor, color_ranges

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ColorAnalyzer:
    """
    Analyzes hair color from images using color space analysis.
    
    Uses HSV and LAB color spaces for robust color classification
    across different lighting conditions.
    """
    
    def __init__(self):
        """Initialize the ColorAnalyzer."""
        # Define color ranges in HSV space
        # Format: (H_min, S_min, V_min, H_max, S_max, V_max)
        self.color_definitions = {
            HairColor.BLACK: {
                'hsv_ranges': [(0, 0, 0, 180, 255, 50)],
                'lab_l_range': (0, 40),
                'description': 'Very dark, minimal light reflection'
            },
            HairColor.DARK_BROWN: {
                'hsv_ranges': [(0, 30, 20, 30, 180, 100)],
                'lab_l_range': (30, 60),
                'description': 'Dark brown with warm undertones'
            },
            HairColor.LIGHT_BROWN: {
                'hsv_ranges': [(10, 30, 80, 30, 150, 180)],
                'lab_l_range': (50, 80),
                'description': 'Medium to light brown'
            },
            HairColor.BLONDE: {
                'hsv_ranges': [(15, 20, 150, 40, 150, 255)],
                'lab_l_range': (70, 100),
                'description': 'Light yellow to golden tones'
            },
            HairColor.RED: {
                'hsv_ranges': [(0, 100, 50, 15, 255, 200), (160, 100, 50, 180, 255, 200)],
                'lab_l_range': (40, 80),
                'description': 'Red, auburn, or ginger tones'
            },
            HairColor.GRAY: {
                'hsv_ranges': [(0, 0, 80, 180, 30, 200)],
                'lab_l_range': (60, 90),
                'description': 'Gray or silver tones'
            },
            HairColor.WHITE: {
                'hsv_ranges': [(0, 0, 200, 180, 30, 255)],
                'lab_l_range': (90, 100),
                'description': 'White or platinum'
            },
            HairColor.FANTASY: {
                'hsv_ranges': [(90, 100, 50, 150, 255, 255)],  # Blue/green/purple range
                'lab_l_range': (30, 90),
                'description': 'Unnatural colors (blue, green, pink, purple)'
            }
        }
    
    def analyze(
        self,
        image: np.ndarray,
        hair_mask: np.ndarray
    ) -> Dict[str, Any]:
        """
        Analyze hair color from an image using the hair mask.
        
        Args:
            image: Input image as numpy array (H, W, C) in RGB
            hair_mask: Binary mask for hair region
            
        Returns:
            Dictionary containing color analysis results
        """
        # Convert to different color spaces
        bgr = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
        lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)
        
        # Extract hair pixels
        hair_pixels_rgb = image[hair_mask > 0]
        hair_pixels_hsv = hsv[hair_mask > 0]
        hair_pixels_lab = lab[hair_mask > 0]
        
        if len(hair_pixels_rgb) == 0:
            return {
                'profile': self._create_empty_profile(),
                'confidence': 0.0
            }
        
        # Calculate dominant color
        dominant_rgb = self._calculate_dominant_color(hair_pixels_rgb)
        
        # Classify color
        color_class, confidence = self._classify_color(
            hair_pixels_hsv, hair_pixels_lab
        )
        
        # Determine color depth (1-10 scale)
        color_depth = self._calculate_color_depth(hair_pixels_lab)
        
        # Determine undertone
        undertone = self._determine_undertone(hair_pixels_lab)
        
        # Check for fantasy colors
        is_fantasy, fantasy_confidence = self._detect_fantasy_color(hair_pixels_hsv)
        if is_fantasy and fantasy_confidence > confidence:
            color_class = HairColor.FANTASY
            confidence = fantasy_confidence
        
        from models.data_models import HairColorProfile
        
        return {
            'profile': HairColorProfile(
                natural_color=color_class,
                color_depth=color_depth,
                undertone=undertone,
                dominant_rgb=dominant_rgb.tolist()
            ),
            'confidence': confidence
        }
    
    def _calculate_dominant_color(
        self,
        pixels: np.ndarray,
        k: int = 3
    ) -> np.ndarray:
        """
        Calculate the dominant color using k-means clustering.
        
        Args:
            pixels: Array of pixel values (N, 3)
            k: Number of clusters
            
        Returns:
            Dominant color as RGB array
        """
        if len(pixels) < k:
            return np.mean(pixels, axis=0).astype(np.uint8)
        
        # Use k-means to find dominant colors
        pixels_float = pixels.astype(np.float32)
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2)
        
        try:
            _, labels, centers = cv2.kmeans(
                pixels_float, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS
            )
            
            # Find the most common cluster
            label_counts = Counter(labels.flatten())
            dominant_label = label_counts.most_common(1)[0][0]
            
            return centers[dominant_label].astype(np.uint8)
        except Exception as e:
            logger.warning(f"K-means clustering failed: {e}")
            return np.mean(pixels, axis=0).astype(np.uint8)
    
    def _classify_color(
        self,
        hsv_pixels: np.ndarray,
        lab_pixels: np.ndarray
    ) -> Tuple[HairColor, float]:
        """
        Classify hair color based on HSV and LAB values.
        
        Args:
            hsv_pixels: Hair pixels in HSV color space
            lab_pixels: Hair pixels in LAB color space
            
        Returns:
            Tuple of (HairColor, confidence)
        """
        # Calculate statistics
        mean_hsv = np.mean(hsv_pixels, axis=0)
        mean_lab = np.mean(lab_pixels, axis=0)
        
        h, s, v = mean_hsv
        l, a, b = mean_lab
        
        scores = {}
        
        for color, definition in self.color_definitions.items():
            score = 0.0
            
            # Check HSV ranges
            for hsv_range in definition['hsv_ranges']:
                h_min, s_min, v_min, h_max, s_max, v_max = hsv_range
                
                # Calculate how well the pixel fits in this range
                h_score = self._range_score(h, h_min, h_max)
                s_score = self._range_score(s, s_min, s_max)
                v_score = self._range_score(v, v_min, v_max)
                
                range_score = (h_score + s_score + v_score) / 3
                score = max(score, range_score)
            
            # Check LAB L (lightness) range
            l_min, l_max = definition['lab_l_range']
            l_score = self._range_score(l, l_min, l_max)
            
            # Combine scores
            final_score = (score * 0.7) + (l_score * 0.3)
            scores[color] = final_score
        
        # Get best match
        best_color = max(scores, key=scores.get)
        confidence = scores[best_color]
        
        return best_color, confidence
    
    def _range_score(
        self,
        value: float,
        min_val: float,
        max_val: float
    ) -> float:
        """
        Calculate how well a value fits within a range.
        
        Returns 1.0 if perfectly within range, decreasing as it moves outside.
        """
        if min_val <= value <= max_val:
            return 1.0
        
        if value < min_val:
            distance = min_val - value
        else:
            distance = value - max_val
        
        # Decay based on distance
        range_size = max_val - min_val
        if range_size == 0:
            range_size = 1
        
        normalized_distance = distance / range_size
        return max(0, 1 - normalized_distance)
    
    def _calculate_color_depth(self, lab_pixels: np.ndarray) -> int:
        """
        Calculate color depth on a 1-10 scale based on LAB lightness.
        
        Level 1 = Black, Level 10 = Lightest blonde
        """
        mean_l = np.mean(lab_pixels[:, 0])
        
        # Map L (0-100) to depth (1-10)
        # Invert because lower L = darker = lower depth number
        depth = int(10 - (mean_l / 100 * 9))
        return max(1, min(10, depth))
    
    def _determine_undertone(self, lab_pixels: np.ndarray) -> str:
        """
        Determine the undertone of the hair color.
        
        Uses the a* and b* channels of LAB color space.
        - Positive a* = red/warm
        - Negative a* = green/cool
        - Positive b* = yellow/warm
        - Negative b* = blue/cool
        """
        mean_a = np.mean(lab_pixels[:, 1]) - 128  # Center around 0
        mean_b = np.mean(lab_pixels[:, 2]) - 128
        
        warmth_score = (mean_a + mean_b) / 2
        
        if warmth_score > 10:
            return "warm"
        elif warmth_score < -10:
            return "cool"
        else:
            return "neutral"
    
    def _detect_fantasy_color(
        self,
        hsv_pixels: np.ndarray
    ) -> Tuple[bool, float]:
        """
        Detect if the hair has fantasy/unnatural colors.
        
        Fantasy colors typically have high saturation and hues
        outside the natural hair color range.
        """
        mean_hsv = np.mean(hsv_pixels, axis=0)
        h, s, v = mean_hsv
        
        # Fantasy colors: high saturation + unusual hue
        # Natural hair hues are typically 0-40 (red/orange/yellow)
        # Fantasy hues: 40-160 (green, blue, purple)
        
        is_unusual_hue = 40 < h < 160
        is_high_saturation = s > 100
        
        if is_unusual_hue and is_high_saturation:
            # Calculate confidence based on how far from natural range
            hue_distance = min(abs(h - 40), abs(h - 160))
            confidence = min(1.0, (s / 255) * (hue_distance / 60))
            return True, confidence
        
        return False, 0.0
    
    def _create_empty_profile(self):
        """Create an empty HairColorProfile."""
        from models.data_models import HairColorProfile
        return HairColorProfile()
    
    def get_color_histogram(
        self,
        image: np.ndarray,
        hair_mask: np.ndarray,
        bins: int = 32
    ) -> Dict[str, np.ndarray]:
        """
        Calculate color histograms for the hair region.
        
        Useful for more detailed color analysis and visualization.
        """
        bgr = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
        
        # Calculate histograms
        h_hist = cv2.calcHist([hsv], [0], hair_mask, [bins], [0, 180])
        s_hist = cv2.calcHist([hsv], [1], hair_mask, [bins], [0, 256])
        v_hist = cv2.calcHist([hsv], [2], hair_mask, [bins], [0, 256])
        
        # Normalize
        h_hist = h_hist.flatten() / h_hist.sum()
        s_hist = s_hist.flatten() / s_hist.sum()
        v_hist = v_hist.flatten() / v_hist.sum()
        
        return {
            'hue': h_hist,
            'saturation': s_hist,
            'value': v_hist
        }

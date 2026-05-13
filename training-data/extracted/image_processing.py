"""
Modeled Hair Engine - Image Processing Utilities
=================================================

This module provides image processing utilities including
hair segmentation, preprocessing, and mask operations.
"""

import io
import logging
from typing import Tuple, Optional
import numpy as np
from PIL import Image
import cv2

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ImageProcessor:
    """
    Image processing utilities for the Hair Engine.
    
    Handles image loading, preprocessing, and hair segmentation.
    """
    
    def __init__(self, target_size: Tuple[int, int] = (512, 512)):
        """
        Initialize the ImageProcessor.
        
        Args:
            target_size: Target size for image processing (width, height)
        """
        self.target_size = target_size
        self.hair_segmentation_model = None
        
    def load_image(self, image_bytes: bytes) -> Image.Image:
        """
        Load an image from bytes.
        
        Args:
            image_bytes: Raw image bytes
            
        Returns:
            PIL Image object
        """
        return Image.open(io.BytesIO(image_bytes)).convert('RGB')
    
    def preprocess(
        self,
        image: np.ndarray,
        target_size: Optional[Tuple[int, int]] = None
    ) -> np.ndarray:
        """
        Preprocess an image for analysis.
        
        Args:
            image: Input image as numpy array (H, W, C)
            target_size: Optional target size for resizing
            
        Returns:
            Preprocessed image as numpy array
        """
        target_size = target_size or self.target_size
        
        # Resize while maintaining aspect ratio
        h, w = image.shape[:2]
        target_w, target_h = target_size
        
        scale = min(target_w / w, target_h / h)
        new_w = int(w * scale)
        new_h = int(h * scale)
        
        resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)
        
        # Pad to target size
        pad_w = (target_w - new_w) // 2
        pad_h = (target_h - new_h) // 2
        
        padded = np.zeros((target_h, target_w, 3), dtype=np.uint8)
        padded[pad_h:pad_h+new_h, pad_w:pad_w+new_w] = resized
        
        return padded
    
    def segment_hair(self, image: np.ndarray) -> np.ndarray:
        """
        Segment hair region from the image.
        
        This method uses a combination of techniques:
        1. Color-based segmentation (for initial mask)
        2. GrabCut refinement (for cleaner boundaries)
        
        For production, this should be replaced with a trained
        deep learning model (e.g., U-Net) for better accuracy.
        
        Args:
            image: Input image as numpy array (H, W, C) in RGB
            
        Returns:
            Binary mask where hair pixels are 255, others are 0
        """
        # Convert to BGR for OpenCV
        bgr = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        
        # Convert to different color spaces for analysis
        hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
        lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)
        
        # Create initial mask based on color characteristics
        # Hair typically has low saturation and specific value ranges
        
        # Method 1: HSV-based detection
        # Most hair colors fall within these ranges
        lower_dark = np.array([0, 0, 0])
        upper_dark = np.array([180, 255, 100])  # Dark hair
        
        lower_medium = np.array([0, 20, 50])
        upper_medium = np.array([30, 150, 200])  # Brown/blonde hair
        
        mask_dark = cv2.inRange(hsv, lower_dark, upper_dark)
        mask_medium = cv2.inRange(hsv, lower_medium, upper_medium)
        
        # Combine masks
        combined_mask = cv2.bitwise_or(mask_dark, mask_medium)
        
        # Method 2: Use face detection to estimate hair region
        # Assume hair is above and around the face
        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(faces) > 0:
            # Use the largest face
            x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
            
            # Create a region of interest above and around the face
            roi_mask = np.zeros(image.shape[:2], dtype=np.uint8)
            
            # Hair region: above face and extending to sides
            hair_top = max(0, y - int(h * 0.8))
            hair_bottom = y + int(h * 1.5)  # Include some area below face for long hair
            hair_left = max(0, x - int(w * 0.3))
            hair_right = min(image.shape[1], x + w + int(w * 0.3))
            
            roi_mask[hair_top:hair_bottom, hair_left:hair_right] = 255
            
            # Combine with color-based mask
            combined_mask = cv2.bitwise_and(combined_mask, roi_mask)
        
        # Apply morphological operations to clean up the mask
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_CLOSE, kernel)
        combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_OPEN, kernel)
        
        # Optional: Use GrabCut for refinement if we have a good initial mask
        if np.sum(combined_mask) > 1000:  # Only if we have a reasonable mask
            try:
                combined_mask = self._refine_with_grabcut(bgr, combined_mask)
            except Exception as e:
                logger.warning(f"GrabCut refinement failed: {e}")
        
        return combined_mask
    
    def _refine_with_grabcut(
        self,
        image: np.ndarray,
        initial_mask: np.ndarray,
        iterations: int = 3
    ) -> np.ndarray:
        """
        Refine segmentation mask using GrabCut algorithm.
        
        Args:
            image: Input image in BGR format
            initial_mask: Initial binary mask
            iterations: Number of GrabCut iterations
            
        Returns:
            Refined binary mask
        """
        # Prepare mask for GrabCut
        # 0 = background, 1 = foreground, 2 = probable background, 3 = probable foreground
        mask = np.where(initial_mask > 0, cv2.GC_PR_FGD, cv2.GC_PR_BGD).astype(np.uint8)
        
        # Initialize models
        bgd_model = np.zeros((1, 65), np.float64)
        fgd_model = np.zeros((1, 65), np.float64)
        
        # Run GrabCut
        cv2.grabCut(image, mask, None, bgd_model, fgd_model, iterations, cv2.GC_INIT_WITH_MASK)
        
        # Create final mask
        final_mask = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
        
        return final_mask
    
    def extract_hair_region(
        self,
        image: np.ndarray,
        mask: np.ndarray
    ) -> np.ndarray:
        """
        Extract the hair region from an image using a mask.
        
        Args:
            image: Input image as numpy array
            mask: Binary mask for hair region
            
        Returns:
            Image with only hair region visible (black background)
        """
        # Ensure mask is binary
        mask_binary = (mask > 0).astype(np.uint8)
        
        # Apply mask
        if len(image.shape) == 3:
            mask_3d = np.stack([mask_binary] * 3, axis=-1)
            return image * mask_3d
        else:
            return image * mask_binary
    
    def get_hair_bounding_box(
        self,
        mask: np.ndarray
    ) -> Optional[Tuple[int, int, int, int]]:
        """
        Get the bounding box of the hair region.
        
        Args:
            mask: Binary mask for hair region
            
        Returns:
            Tuple of (x, y, width, height) or None if no hair detected
        """
        # Find contours
        contours, _ = cv2.findContours(
            mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )
        
        if not contours:
            return None
        
        # Get bounding box of all contours combined
        all_points = np.vstack(contours)
        x, y, w, h = cv2.boundingRect(all_points)
        
        return (x, y, w, h)
    
    def calculate_hair_area_ratio(
        self,
        mask: np.ndarray
    ) -> float:
        """
        Calculate the ratio of hair pixels to total image pixels.
        
        Args:
            mask: Binary mask for hair region
            
        Returns:
            Ratio of hair pixels (0.0 to 1.0)
        """
        total_pixels = mask.shape[0] * mask.shape[1]
        hair_pixels = np.sum(mask > 0)
        return hair_pixels / total_pixels


class DeepLearningSegmenter:
    """
    Deep learning-based hair segmentation using a U-Net model.
    
    This class provides a more accurate segmentation method
    compared to the traditional image processing approach.
    
    Note: Requires a trained model to be loaded.
    """
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize the deep learning segmenter.
        
        Args:
            model_path: Path to the trained model weights
        """
        self.model = None
        self.model_path = model_path
        self.input_size = (256, 256)
        
        if model_path:
            self._load_model(model_path)
    
    def _load_model(self, model_path: str):
        """
        Load the trained segmentation model.
        
        This is a placeholder for loading a trained U-Net or similar model.
        """
        try:
            # Placeholder for model loading
            # In production, this would load a TensorFlow/PyTorch model
            logger.info(f"Loading segmentation model from {model_path}")
            # self.model = tf.keras.models.load_model(model_path)
            pass
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    def segment(self, image: np.ndarray) -> np.ndarray:
        """
        Segment hair using the deep learning model.
        
        Args:
            image: Input image as numpy array (H, W, C)
            
        Returns:
            Binary mask where hair pixels are 255, others are 0
        """
        if self.model is None:
            raise ValueError("Model not loaded. Call _load_model first.")
        
        # Preprocess
        original_size = image.shape[:2]
        resized = cv2.resize(image, self.input_size)
        normalized = resized.astype(np.float32) / 255.0
        batch = np.expand_dims(normalized, axis=0)
        
        # Predict
        # prediction = self.model.predict(batch)[0]
        
        # Post-process
        # mask = (prediction > 0.5).astype(np.uint8) * 255
        # mask = cv2.resize(mask, (original_size[1], original_size[0]))
        
        # Placeholder return
        return np.zeros(original_size, dtype=np.uint8)

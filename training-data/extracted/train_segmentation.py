"""
Modeled Hair Engine - Hair Segmentation Model Training
=======================================================

This module provides the training pipeline for a custom U-Net
hair segmentation model using TensorFlow/Keras.
"""

import os
import logging
from typing import Tuple, List, Optional, Generator
from pathlib import Path
import numpy as np

# TensorFlow imports
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, Model
from tensorflow.keras.callbacks import (
    ModelCheckpoint, EarlyStopping, ReduceLROnPlateau, TensorBoard
)

# Image processing
import cv2
from PIL import Image

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# =============================================================================
# U-Net Model Architecture
# =============================================================================

def conv_block(
    inputs: tf.Tensor,
    filters: int,
    kernel_size: int = 3,
    batch_norm: bool = True
) -> tf.Tensor:
    """
    Convolutional block with two conv layers.
    
    Args:
        inputs: Input tensor
        filters: Number of filters
        kernel_size: Kernel size
        batch_norm: Whether to use batch normalization
        
    Returns:
        Output tensor
    """
    x = layers.Conv2D(
        filters, kernel_size, padding='same', kernel_initializer='he_normal'
    )(inputs)
    if batch_norm:
        x = layers.BatchNormalization()(x)
    x = layers.Activation('relu')(x)
    
    x = layers.Conv2D(
        filters, kernel_size, padding='same', kernel_initializer='he_normal'
    )(x)
    if batch_norm:
        x = layers.BatchNormalization()(x)
    x = layers.Activation('relu')(x)
    
    return x


def encoder_block(
    inputs: tf.Tensor,
    filters: int,
    pool_size: Tuple[int, int] = (2, 2)
) -> Tuple[tf.Tensor, tf.Tensor]:
    """
    Encoder block with conv block and max pooling.
    
    Returns:
        Tuple of (pooled output, skip connection)
    """
    conv = conv_block(inputs, filters)
    pool = layers.MaxPooling2D(pool_size)(conv)
    return pool, conv


def decoder_block(
    inputs: tf.Tensor,
    skip: tf.Tensor,
    filters: int
) -> tf.Tensor:
    """
    Decoder block with upsampling and concatenation.
    """
    up = layers.Conv2DTranspose(
        filters, (2, 2), strides=(2, 2), padding='same'
    )(inputs)
    concat = layers.Concatenate()([up, skip])
    conv = conv_block(concat, filters)
    return conv


def build_unet(
    input_shape: Tuple[int, int, int] = (256, 256, 3),
    num_classes: int = 1,
    filters: List[int] = None
) -> Model:
    """
    Build a U-Net model for hair segmentation.
    
    Args:
        input_shape: Input image shape (H, W, C)
        num_classes: Number of output classes (1 for binary segmentation)
        filters: List of filter sizes for each level
        
    Returns:
        Keras Model
    """
    if filters is None:
        filters = [64, 128, 256, 512, 1024]
    
    inputs = layers.Input(shape=input_shape)
    
    # Encoder path
    skip_connections = []
    x = inputs
    
    for i, f in enumerate(filters[:-1]):
        x, skip = encoder_block(x, f)
        skip_connections.append(skip)
    
    # Bridge
    x = conv_block(x, filters[-1])
    
    # Decoder path
    for i, f in enumerate(reversed(filters[:-1])):
        skip = skip_connections[-(i+1)]
        x = decoder_block(x, skip, f)
    
    # Output layer
    if num_classes == 1:
        outputs = layers.Conv2D(1, (1, 1), activation='sigmoid')(x)
    else:
        outputs = layers.Conv2D(num_classes, (1, 1), activation='softmax')(x)
    
    model = Model(inputs, outputs, name='UNet_Hair_Segmentation')
    
    return model


def build_efficient_unet(
    input_shape: Tuple[int, int, int] = (256, 256, 3),
    num_classes: int = 1
) -> Model:
    """
    Build a U-Net with EfficientNetB0 encoder for better performance.
    
    Uses transfer learning from ImageNet pretrained weights.
    """
    # Load EfficientNetB0 as encoder
    base_model = keras.applications.EfficientNetB0(
        include_top=False,
        weights='imagenet',
        input_shape=input_shape
    )
    
    # Get skip connection layers
    layer_names = [
        'block2a_expand_activation',  # 64x64
        'block3a_expand_activation',  # 32x32
        'block4a_expand_activation',  # 16x16
        'block6a_expand_activation',  # 8x8
    ]
    
    skip_outputs = [base_model.get_layer(name).output for name in layer_names]
    
    # Encoder output
    encoder_output = base_model.output
    
    # Decoder
    x = encoder_output
    
    decoder_filters = [256, 128, 64, 32]
    
    for i, (skip, filters) in enumerate(zip(reversed(skip_outputs), decoder_filters)):
        x = layers.Conv2DTranspose(filters, (2, 2), strides=(2, 2), padding='same')(x)
        x = layers.Concatenate()([x, skip])
        x = conv_block(x, filters)
    
    # Final upsampling to match input size
    x = layers.Conv2DTranspose(16, (2, 2), strides=(2, 2), padding='same')(x)
    x = conv_block(x, 16)
    
    # Output
    outputs = layers.Conv2D(num_classes, (1, 1), activation='sigmoid')(x)
    
    model = Model(base_model.input, outputs, name='EfficientUNet_Hair_Segmentation')
    
    return model


# =============================================================================
# Data Loading and Augmentation
# =============================================================================

class HairSegmentationDataset:
    """
    Dataset class for hair segmentation training.
    """
    
    def __init__(
        self,
        image_dir: str,
        mask_dir: str,
        image_size: Tuple[int, int] = (256, 256),
        augment: bool = True
    ):
        """
        Initialize the dataset.
        
        Args:
            image_dir: Directory containing input images
            mask_dir: Directory containing mask images
            image_size: Target image size
            augment: Whether to apply data augmentation
        """
        self.image_dir = Path(image_dir)
        self.mask_dir = Path(mask_dir)
        self.image_size = image_size
        self.augment = augment
        
        # Get list of images
        self.image_paths = sorted(list(self.image_dir.glob('*.jpg')) + 
                                  list(self.image_dir.glob('*.png')))
        
        logger.info(f"Found {len(self.image_paths)} images")
    
    def __len__(self) -> int:
        return len(self.image_paths)
    
    def load_image(self, path: Path) -> np.ndarray:
        """Load and preprocess an image."""
        img = cv2.imread(str(path))
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, self.image_size)
        img = img.astype(np.float32) / 255.0
        return img
    
    def load_mask(self, path: Path) -> np.ndarray:
        """Load and preprocess a mask."""
        mask = cv2.imread(str(path), cv2.IMREAD_GRAYSCALE)
        mask = cv2.resize(mask, self.image_size)
        mask = (mask > 127).astype(np.float32)
        mask = np.expand_dims(mask, axis=-1)
        return mask
    
    def augment_pair(
        self,
        image: np.ndarray,
        mask: np.ndarray
    ) -> Tuple[np.ndarray, np.ndarray]:
        """Apply data augmentation to image-mask pair."""
        # Random horizontal flip
        if np.random.random() > 0.5:
            image = np.fliplr(image)
            mask = np.fliplr(mask)
        
        # Random rotation
        if np.random.random() > 0.5:
            angle = np.random.uniform(-15, 15)
            h, w = image.shape[:2]
            M = cv2.getRotationMatrix2D((w/2, h/2), angle, 1.0)
            image = cv2.warpAffine(image, M, (w, h))
            mask = cv2.warpAffine(mask, M, (w, h))
        
        # Random brightness/contrast
        if np.random.random() > 0.5:
            alpha = np.random.uniform(0.8, 1.2)  # Contrast
            beta = np.random.uniform(-0.1, 0.1)  # Brightness
            image = np.clip(alpha * image + beta, 0, 1)
        
        return image, mask
    
    def generator(
        self,
        batch_size: int = 8,
        shuffle: bool = True
    ) -> Generator:
        """
        Generate batches of (image, mask) pairs.
        """
        indices = np.arange(len(self.image_paths))
        
        while True:
            if shuffle:
                np.random.shuffle(indices)
            
            for start_idx in range(0, len(indices), batch_size):
                batch_indices = indices[start_idx:start_idx + batch_size]
                
                images = []
                masks = []
                
                for idx in batch_indices:
                    image_path = self.image_paths[idx]
                    mask_path = self.mask_dir / image_path.name
                    
                    # Handle different mask extensions
                    if not mask_path.exists():
                        mask_path = self.mask_dir / (image_path.stem + '.png')
                    
                    if not mask_path.exists():
                        logger.warning(f"Mask not found for {image_path}")
                        continue
                    
                    image = self.load_image(image_path)
                    mask = self.load_mask(mask_path)
                    
                    if self.augment:
                        image, mask = self.augment_pair(image, mask)
                    
                    images.append(image)
                    masks.append(mask)
                
                if images:
                    yield np.array(images), np.array(masks)
    
    def create_tf_dataset(
        self,
        batch_size: int = 8,
        shuffle: bool = True
    ) -> tf.data.Dataset:
        """
        Create a TensorFlow Dataset.
        """
        def generator_fn():
            for image, mask in self.generator(batch_size=1, shuffle=shuffle):
                yield image[0], mask[0]
        
        dataset = tf.data.Dataset.from_generator(
            generator_fn,
            output_signature=(
                tf.TensorSpec(shape=(*self.image_size, 3), dtype=tf.float32),
                tf.TensorSpec(shape=(*self.image_size, 1), dtype=tf.float32)
            )
        )
        
        dataset = dataset.batch(batch_size)
        dataset = dataset.prefetch(tf.data.AUTOTUNE)
        
        return dataset


# =============================================================================
# Loss Functions
# =============================================================================

def dice_loss(y_true: tf.Tensor, y_pred: tf.Tensor) -> tf.Tensor:
    """
    Dice loss for segmentation.
    """
    smooth = 1e-6
    y_true_f = tf.reshape(y_true, [-1])
    y_pred_f = tf.reshape(y_pred, [-1])
    intersection = tf.reduce_sum(y_true_f * y_pred_f)
    return 1 - (2. * intersection + smooth) / (
        tf.reduce_sum(y_true_f) + tf.reduce_sum(y_pred_f) + smooth
    )


def bce_dice_loss(y_true: tf.Tensor, y_pred: tf.Tensor) -> tf.Tensor:
    """
    Combined binary cross-entropy and dice loss.
    """
    bce = keras.losses.binary_crossentropy(y_true, y_pred)
    dice = dice_loss(y_true, y_pred)
    return bce + dice


def iou_metric(y_true: tf.Tensor, y_pred: tf.Tensor) -> tf.Tensor:
    """
    Intersection over Union metric.
    """
    smooth = 1e-6
    y_pred_binary = tf.cast(y_pred > 0.5, tf.float32)
    intersection = tf.reduce_sum(y_true * y_pred_binary)
    union = tf.reduce_sum(y_true) + tf.reduce_sum(y_pred_binary) - intersection
    return (intersection + smooth) / (union + smooth)


# =============================================================================
# Training Pipeline
# =============================================================================

class HairSegmentationTrainer:
    """
    Training pipeline for hair segmentation model.
    """
    
    def __init__(
        self,
        model_type: str = 'unet',
        input_shape: Tuple[int, int, int] = (256, 256, 3),
        output_dir: str = './models'
    ):
        """
        Initialize the trainer.
        
        Args:
            model_type: 'unet' or 'efficient_unet'
            input_shape: Input image shape
            output_dir: Directory to save models
        """
        self.model_type = model_type
        self.input_shape = input_shape
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.model = None
    
    def build_model(self) -> Model:
        """Build the segmentation model."""
        if self.model_type == 'unet':
            self.model = build_unet(self.input_shape)
        elif self.model_type == 'efficient_unet':
            self.model = build_efficient_unet(self.input_shape)
        else:
            raise ValueError(f"Unknown model type: {self.model_type}")
        
        logger.info(f"Built {self.model_type} model")
        self.model.summary()
        
        return self.model
    
    def compile_model(
        self,
        learning_rate: float = 1e-4,
        loss: str = 'bce_dice'
    ):
        """Compile the model."""
        if self.model is None:
            self.build_model()
        
        optimizer = keras.optimizers.Adam(learning_rate=learning_rate)
        
        if loss == 'bce_dice':
            loss_fn = bce_dice_loss
        elif loss == 'dice':
            loss_fn = dice_loss
        else:
            loss_fn = 'binary_crossentropy'
        
        self.model.compile(
            optimizer=optimizer,
            loss=loss_fn,
            metrics=['accuracy', iou_metric]
        )
        
        logger.info("Model compiled")
    
    def train(
        self,
        train_dataset: HairSegmentationDataset,
        val_dataset: Optional[HairSegmentationDataset] = None,
        epochs: int = 100,
        batch_size: int = 8,
        patience: int = 10
    ) -> keras.callbacks.History:
        """
        Train the model.
        
        Args:
            train_dataset: Training dataset
            val_dataset: Validation dataset
            epochs: Number of epochs
            batch_size: Batch size
            patience: Early stopping patience
            
        Returns:
            Training history
        """
        if self.model is None:
            self.compile_model()
        
        # Calculate steps
        steps_per_epoch = len(train_dataset) // batch_size
        validation_steps = len(val_dataset) // batch_size if val_dataset else None
        
        # Callbacks
        callbacks = [
            ModelCheckpoint(
                str(self.output_dir / 'best_model.h5'),
                monitor='val_loss' if val_dataset else 'loss',
                save_best_only=True,
                mode='min'
            ),
            EarlyStopping(
                monitor='val_loss' if val_dataset else 'loss',
                patience=patience,
                restore_best_weights=True
            ),
            ReduceLROnPlateau(
                monitor='val_loss' if val_dataset else 'loss',
                factor=0.5,
                patience=5,
                min_lr=1e-7
            ),
            TensorBoard(
                log_dir=str(self.output_dir / 'logs'),
                histogram_freq=1
            )
        ]
        
        # Train
        history = self.model.fit(
            train_dataset.generator(batch_size),
            steps_per_epoch=steps_per_epoch,
            epochs=epochs,
            validation_data=val_dataset.generator(batch_size) if val_dataset else None,
            validation_steps=validation_steps,
            callbacks=callbacks
        )
        
        # Save final model
        self.model.save(str(self.output_dir / 'final_model.h5'))
        
        return history
    
    def evaluate(
        self,
        test_dataset: HairSegmentationDataset,
        batch_size: int = 8
    ) -> dict:
        """Evaluate the model on test data."""
        steps = len(test_dataset) // batch_size
        results = self.model.evaluate(
            test_dataset.generator(batch_size, shuffle=False),
            steps=steps
        )
        
        metrics = dict(zip(self.model.metrics_names, results))
        logger.info(f"Evaluation results: {metrics}")
        
        return metrics
    
    def predict(self, image: np.ndarray) -> np.ndarray:
        """
        Predict hair mask for a single image.
        
        Args:
            image: Input image (H, W, 3) normalized to [0, 1]
            
        Returns:
            Predicted mask (H, W, 1)
        """
        if self.model is None:
            raise ValueError("Model not loaded")
        
        # Add batch dimension
        batch = np.expand_dims(image, axis=0)
        
        # Predict
        pred = self.model.predict(batch)[0]
        
        return pred


# =============================================================================
# Example Usage
# =============================================================================

def train_hair_segmentation():
    """
    Example training workflow for hair segmentation.
    """
    # Initialize trainer
    trainer = HairSegmentationTrainer(
        model_type='efficient_unet',
        input_shape=(256, 256, 3),
        output_dir='./models/hair_segmentation'
    )
    
    # Build and compile model
    trainer.build_model()
    trainer.compile_model(learning_rate=1e-4)
    
    # Create datasets
    train_dataset = HairSegmentationDataset(
        image_dir='./data/train/images',
        mask_dir='./data/train/masks',
        image_size=(256, 256),
        augment=True
    )
    
    val_dataset = HairSegmentationDataset(
        image_dir='./data/val/images',
        mask_dir='./data/val/masks',
        image_size=(256, 256),
        augment=False
    )
    
    # Train
    history = trainer.train(
        train_dataset=train_dataset,
        val_dataset=val_dataset,
        epochs=100,
        batch_size=8,
        patience=15
    )
    
    return trainer, history


if __name__ == "__main__":
    train_hair_segmentation()

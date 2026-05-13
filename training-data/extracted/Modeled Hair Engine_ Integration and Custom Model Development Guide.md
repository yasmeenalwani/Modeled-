
# Modeled Hair Engine: Integration and Custom Model Development Guide

## 1. Introduction

This guide provides a technical deep-dive into the architecture of the Modeled Hair Engine, detailing how to integrate essential third-party services and how to approach the development and training of your own proprietary machine learning models. It is intended to be a practical companion to the provided source code, enabling your development team to build, maintain, and evolve the hair analysis platform.

The engine is designed with a modular and phased architecture, allowing for a gradual transition from a simple, rule-based Minimum Viable Product (MVP) to a sophisticated, AI-driven system. This document will cover the key integrations and the model development lifecycle corresponding to the phases outlined in the main roadmap.

### Key Integrations Covered:

*   **Amazon Rekognition:** For foundational image analysis, including face detection, landmark identification, and custom model training for classification tasks.
*   **Custom Hair Segmentation:** The critical first step of isolating the hair region in an image for focused analysis.
*   **Amazon SageMaker:** For advanced model development, providing the flexibility and power needed for complex analysis beyond simple classification.

### Custom Model Development Lifecycle:

This guide will walk you through the process of building your own models, from data collection and labeling to training and deployment, ensuring your Hair Engine becomes a unique and valuable piece of intellectual property.

## 2. Core Integrations: The Building Blocks of the Engine

### 2.1. Amazon Rekognition: The AI Vision Foundation

Amazon Rekognition serves as the primary AI service for the initial phases of the Hair Engine, providing powerful, pre-trained models that accelerate development.

**Role in the MVP (Phase 1):**

*   **Face Detection (`DetectFaces`):** This is the most critical initial step. The engine uses the `DetectFaces` API to identify the location of the face in an image. The bounding box of the face serves as a crucial anchor point for the rule-based algorithms, particularly for estimating hair length.
*   **General Label Detection (`DetectLabels`):** The `DetectLabels` API provides a set of general labels for the image (e.g., "long hair," "blonde"). While not precise enough for primary classification, these labels serve as valuable "weak hints" that can be used to corroborate or adjust the results of the rule-based system.

**Integration (as seen in `core/hair_engine.py`):**

The `HairEngine` class uses the `boto3` library to interact with the Rekognition API. The `_detect_faces` and `_detect_labels` methods encapsulate the API calls.

**Role in V2 (Phase 2):**

*   **Custom Classification (Rekognition Custom Labels):** This is the first major step towards a proprietary model. You will use your own labeled dataset to train a custom classification model on Rekognition. This allows you to move beyond the generic labels and create a model that understands your specific taxonomy (e.g., classifying curl patterns from 1A to 4C).

The `training/train_classifier.py` script provides a complete pipeline for this process, including creating a project, preparing a manifest file, and training the model.

### 2.2. Hair Segmentation: Isolating the Area of Interest

Hair segmentation is the process of creating a binary mask that separates the hair pixels from the rest of the image. This is a fundamental step, as all subsequent analysis is performed only on the hair region.

**MVP Approach (`utils/image_processing.py`):**

The initial implementation uses traditional computer vision techniques (color-based segmentation and GrabCut) as a placeholder. This approach is fast to implement but has limitations in accuracy, especially with complex backgrounds or lighting.

**Production-Ready Approach (Custom U-Net Model):**

For accurate and reliable segmentation, you must train your own deep learning model. The recommended architecture is a **U-Net**, which is specifically designed for image segmentation tasks.

The `training/train_segmentation.py` script provides a complete pipeline for training a U-Net model using TensorFlow/Keras. It includes:

*   The U-Net model architecture (and a more advanced `EfficientUNet` version).
*   A data generator for loading and augmenting images and masks.
*   Custom loss functions (Dice Loss) for better segmentation training.

To train this model, you will need a dataset of images and their corresponding segmentation masks. You can create this dataset using an annotation tool (e.g., Labelbox, VGG Image Annotator) or find publicly available datasets (e.g., the LFW Part Labels database).

### 2.3. Amazon SageMaker: For Advanced Custom Models

As you move into Phase 3 and beyond, you will encounter analysis tasks that are too complex for Rekognition Custom Labels (e.g., detecting split ends, analyzing scalp condition, classifying hair texture).

**Amazon SageMaker** is the recommended platform for these advanced models. It provides a fully managed environment for building, training, and deploying machine learning models at scale.

The `training/train_classifier.py` script includes a `SageMakerTrainer` class that demonstrates how to:

*   Create a SageMaker training job.
*   Define the model architecture and hyperparameters.
*   Deploy the trained model to an endpoint for real-time inference.

Using SageMaker gives you complete control over the model architecture, training process, and deployment environment, which is essential for building a truly state-of-the-art hair analysis engine.

## 3. Custom Model Development Lifecycle

Building your own proprietary models is what will ultimately differentiate your Hair Engine. This section outlines the lifecycle for developing these models, from data acquisition to deployment.

### Step 1: Data Collection and Labeling

This is the most critical and time-consuming part of the process. The quality of your models will be directly proportional to the quality of your data.

**Data Sources:**

*   **User Submissions:** The best source of data will be images submitted by your users. Ensure you have the necessary permissions and privacy policies in place to use this data for model training.
*   **Stock Photography:** Websites like Getty Images or Shutterstock can be a source for high-quality, diverse images of hair.
*   **Public Datasets:** Academic datasets (e.g., LFW, CelebA) can be used, but may require significant filtering and cleaning.

**Labeling Process:**

1.  **Define Your Labeling Schema:** Use the `hair_taxonomy.md` document as your ground truth. For each image, you will need to create a set of labels corresponding to the taxonomy.
2.  **Choose a Labeling Tool:** For segmentation masks, tools like **Labelbox**, **CVAT**, or even open-source options like the **VGG Image Annotator (VIA)** are excellent choices. For classification labels, a simple spreadsheet or internal tool can work.
3.  **Train Your Annotators:** Consistency is key. Your human annotators must have a clear understanding of the taxonomy and labeling guidelines to ensure high-quality, consistent labels.
4.  **Iterative Refinement:** Start with a small batch of images, train a baseline model, and then use the model's predictions to identify areas of weakness. This is an "active learning" approach that can help you focus your labeling efforts on the most challenging examples.

### Step 2: Training the Hair Segmentation Model (U-Net)

As discussed, a custom segmentation model is essential for accuracy. The `training/train_segmentation.py` script is your starting point.

**Workflow:**

1.  **Prepare Your Dataset:** Organize your data into the following directory structure:

    ```
    /data/
    ├── train/
    │   ├── images/
    │   │   ├── 0001.jpg
    │   │   └── ...
    │   └── masks/
    │       ├── 0001.png
    │       └── ...
    └── val/
        ├── images/
        │   └── ...
        └── masks/
            └── ...
    ```

2.  **Run the Training Script:** From the `training` directory, you can run the script. You may need to install TensorFlow and other dependencies first (`pip install tensorflow opencv-python`).

    ```bash
    python3.11 train_segmentation.py
    ```

3.  **Monitor and Evaluate:** The script will save the best model to `models/hair_segmentation/best_model.h5`. Use TensorBoard to monitor the training progress (`tensorboard --logdir models/hair_segmentation/logs`). The IOU (Intersection over Union) metric is the most important indicator of performance.

4.  **Integrate the Model:** Once you have a trained model, you can modify the `ImageProcessor` class in `utils/image_processing.py` to use your new model instead of the basic computer vision techniques.

### Step 3: Training the Hair Classification Model (Rekognition Custom Labels)

For Phase 2, you will train a multi-label classification model to recognize attributes like curl pattern, length, and color.

**Workflow (using `training/train_classifier.py`):**

1.  **Prepare Your Labeled Data:** You will need a list of image paths and their corresponding labels. For example:

    ```python
    labeled_data = [
        ("/path/to/image1.jpg", ["curl_3A", "length_medium"]),
        ("/path/to/image2.jpg", ["curl_4B", "length_short"]),
    ]
    ```

2.  **Use the `RekognitionCustomLabelsTrainer`:** The `example_training_workflow` function in the script demonstrates the end-to-end process:
    *   It uploads your images to an S3 bucket.
    *   It generates the required manifest file.
    *   It creates a Rekognition Custom Labels project and dataset.
    *   It starts the training job.

3.  **Deploy and Integrate:** Once the model is trained and deployed, you will get a model ARN. Update the `rekognition_model_arn` in your `config/settings.py` file and set `use_custom_model=True` when initializing the `HairEngine`. The engine will then automatically use your custom model for analysis.

### Step 4: Advanced Model Training with SageMaker

For more complex tasks (e.g., detecting damage, analyzing porosity), you will need the full power of Amazon SageMaker.

The `SageMakerTrainer` class in `training/train_classifier.py` provides a template for this. The process is similar to the Rekognition training, but you have more control:

*   You can define your own model architecture (e.g., a ResNet for classification, a more complex U-Net for fine-grained segmentation).
*   You can use custom training scripts and Docker containers.
*   You have full control over the training hyperparameters and instance types.

This is the path to building a truly unique and powerful AI system that goes far beyond what is possible with pre-built services.

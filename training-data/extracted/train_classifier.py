"""
Modeled Hair Engine - Training Pipeline
========================================

This module provides the training pipeline for custom hair
classification models using Amazon Rekognition Custom Labels
and Amazon SageMaker.
"""

import os
import json
import logging
import time
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path
import boto3
from botocore.exceptions import ClientError

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# =============================================================================
# Amazon Rekognition Custom Labels Training
# =============================================================================

class RekognitionCustomLabelsTrainer:
    """
    Training pipeline for Amazon Rekognition Custom Labels.
    
    This class handles the end-to-end process of training a custom
    image classification model using Rekognition Custom Labels.
    """
    
    def __init__(
        self,
        project_name: str,
        region: str = "us-east-1",
        s3_bucket: str = "modeled-hair-engine"
    ):
        """
        Initialize the trainer.
        
        Args:
            project_name: Name for the Rekognition Custom Labels project
            region: AWS region
            s3_bucket: S3 bucket for storing training data
        """
        self.project_name = project_name
        self.region = region
        self.s3_bucket = s3_bucket
        
        self.rekognition = boto3.client('rekognition', region_name=region)
        self.s3 = boto3.client('s3', region_name=region)
        
        self.project_arn = None
        self.dataset_arn = None
        self.model_arn = None
    
    def create_project(self) -> str:
        """
        Create a new Rekognition Custom Labels project.
        
        Returns:
            Project ARN
        """
        try:
            response = self.rekognition.create_project(
                ProjectName=self.project_name
            )
            self.project_arn = response['ProjectArn']
            logger.info(f"Created project: {self.project_arn}")
            return self.project_arn
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceInUseException':
                # Project already exists, get its ARN
                response = self.rekognition.describe_projects(
                    ProjectNames=[self.project_name]
                )
                self.project_arn = response['ProjectDescriptions'][0]['ProjectArn']
                logger.info(f"Project already exists: {self.project_arn}")
                return self.project_arn
            raise
    
    def prepare_manifest(
        self,
        labeled_images: List[Dict[str, Any]],
        output_path: str
    ) -> str:
        """
        Prepare a manifest file for Rekognition Custom Labels.
        
        Args:
            labeled_images: List of dicts with 'image_s3_uri' and 'labels'
            output_path: Local path to save the manifest
            
        Returns:
            Path to the manifest file
        """
        manifest_lines = []
        
        for image_data in labeled_images:
            # Create manifest entry for each label
            for label in image_data['labels']:
                entry = {
                    "source-ref": image_data['image_s3_uri'],
                    "hair-classification": label,
                    "hair-classification-metadata": {
                        "confidence": 1.0,
                        "job-name": "modeled-hair-labeling",
                        "class-name": label,
                        "human-annotated": "yes",
                        "creation-date": datetime.utcnow().isoformat(),
                        "type": "groundtruth/image-classification"
                    }
                }
                manifest_lines.append(json.dumps(entry))
        
        # Write manifest file
        with open(output_path, 'w') as f:
            f.write('\n'.join(manifest_lines))
        
        logger.info(f"Created manifest with {len(manifest_lines)} entries")
        return output_path
    
    def upload_manifest_to_s3(
        self,
        manifest_path: str,
        s3_key: str
    ) -> str:
        """
        Upload manifest file to S3.
        
        Returns:
            S3 URI of the manifest
        """
        self.s3.upload_file(manifest_path, self.s3_bucket, s3_key)
        s3_uri = f"s3://{self.s3_bucket}/{s3_key}"
        logger.info(f"Uploaded manifest to {s3_uri}")
        return s3_uri
    
    def create_dataset(
        self,
        manifest_s3_uri: str,
        dataset_type: str = "TRAIN"
    ) -> str:
        """
        Create a dataset from a manifest file.
        
        Args:
            manifest_s3_uri: S3 URI of the manifest file
            dataset_type: "TRAIN" or "TEST"
            
        Returns:
            Dataset ARN
        """
        if not self.project_arn:
            raise ValueError("Project not created. Call create_project first.")
        
        response = self.rekognition.create_dataset(
            DatasetType=dataset_type,
            ProjectArn=self.project_arn,
            DatasetSource={
                'GroundTruthManifest': {
                    'S3Object': {
                        'Bucket': self.s3_bucket,
                        'Name': manifest_s3_uri.replace(f"s3://{self.s3_bucket}/", "")
                    }
                }
            }
        )
        
        dataset_arn = response['DatasetArn']
        logger.info(f"Created {dataset_type} dataset: {dataset_arn}")
        
        # Wait for dataset to be created
        self._wait_for_dataset(dataset_arn)
        
        return dataset_arn
    
    def _wait_for_dataset(self, dataset_arn: str, timeout: int = 300):
        """Wait for dataset creation to complete."""
        start_time = time.time()
        while time.time() - start_time < timeout:
            response = self.rekognition.describe_dataset(DatasetArn=dataset_arn)
            status = response['DatasetDescription']['Status']
            
            if status == 'CREATE_COMPLETE':
                logger.info(f"Dataset ready: {dataset_arn}")
                return
            elif status == 'CREATE_FAILED':
                raise Exception(f"Dataset creation failed: {response}")
            
            logger.info(f"Dataset status: {status}")
            time.sleep(10)
        
        raise TimeoutError("Dataset creation timed out")
    
    def train_model(
        self,
        output_s3_uri: str,
        training_dataset_arn: str,
        test_dataset_arn: Optional[str] = None
    ) -> str:
        """
        Train a custom model.
        
        Args:
            output_s3_uri: S3 URI for model output
            training_dataset_arn: ARN of the training dataset
            test_dataset_arn: ARN of the test dataset (optional)
            
        Returns:
            Model version ARN
        """
        if not self.project_arn:
            raise ValueError("Project not created. Call create_project first.")
        
        version_name = f"v{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        
        training_data = {
            'Assets': [{'GroundTruthManifest': {'S3Object': {'Bucket': '', 'Name': ''}}}]
        }
        
        response = self.rekognition.create_project_version(
            ProjectArn=self.project_arn,
            VersionName=version_name,
            OutputConfig={
                'S3Bucket': self.s3_bucket,
                'S3KeyPrefix': output_s3_uri.replace(f"s3://{self.s3_bucket}/", "")
            }
        )
        
        self.model_arn = response['ProjectVersionArn']
        logger.info(f"Started training model: {self.model_arn}")
        
        return self.model_arn
    
    def wait_for_training(self, timeout: int = 7200) -> Dict[str, Any]:
        """
        Wait for model training to complete.
        
        Args:
            timeout: Maximum time to wait in seconds (default 2 hours)
            
        Returns:
            Training results including evaluation metrics
        """
        if not self.model_arn:
            raise ValueError("Model not created. Call train_model first.")
        
        start_time = time.time()
        while time.time() - start_time < timeout:
            response = self.rekognition.describe_project_versions(
                ProjectArn=self.project_arn,
                VersionNames=[self.model_arn.split('/')[-1]]
            )
            
            version = response['ProjectVersionDescriptions'][0]
            status = version['Status']
            
            if status == 'TRAINING_COMPLETED':
                logger.info("Training completed successfully!")
                return {
                    'status': 'success',
                    'model_arn': self.model_arn,
                    'evaluation': version.get('EvaluationResult', {})
                }
            elif status == 'TRAINING_FAILED':
                raise Exception(f"Training failed: {version.get('StatusMessage')}")
            
            logger.info(f"Training status: {status}")
            time.sleep(60)
        
        raise TimeoutError("Training timed out")
    
    def start_model(self, min_inference_units: int = 1) -> None:
        """
        Start the trained model for inference.
        
        Args:
            min_inference_units: Minimum number of inference units
        """
        if not self.model_arn:
            raise ValueError("Model not created. Call train_model first.")
        
        self.rekognition.start_project_version(
            ProjectVersionArn=self.model_arn,
            MinInferenceUnits=min_inference_units
        )
        
        logger.info(f"Starting model: {self.model_arn}")
        
        # Wait for model to start
        while True:
            response = self.rekognition.describe_project_versions(
                ProjectArn=self.project_arn,
                VersionNames=[self.model_arn.split('/')[-1]]
            )
            status = response['ProjectVersionDescriptions'][0]['Status']
            
            if status == 'RUNNING':
                logger.info("Model is running!")
                break
            elif status == 'FAILED':
                raise Exception("Model failed to start")
            
            logger.info(f"Model status: {status}")
            time.sleep(30)
    
    def stop_model(self) -> None:
        """Stop the running model."""
        if not self.model_arn:
            raise ValueError("Model not created")
        
        self.rekognition.stop_project_version(
            ProjectVersionArn=self.model_arn
        )
        logger.info(f"Stopping model: {self.model_arn}")


# =============================================================================
# Data Preparation Utilities
# =============================================================================

class DatasetPreparator:
    """
    Utilities for preparing training datasets.
    """
    
    def __init__(self, s3_bucket: str, region: str = "us-east-1"):
        """Initialize the preparator."""
        self.s3_bucket = s3_bucket
        self.s3 = boto3.client('s3', region_name=region)
    
    def upload_images(
        self,
        image_paths: List[str],
        s3_prefix: str = "training-images/"
    ) -> List[str]:
        """
        Upload images to S3.
        
        Args:
            image_paths: List of local image paths
            s3_prefix: S3 prefix for uploaded images
            
        Returns:
            List of S3 URIs
        """
        s3_uris = []
        
        for path in image_paths:
            filename = os.path.basename(path)
            s3_key = f"{s3_prefix}{filename}"
            
            self.s3.upload_file(path, self.s3_bucket, s3_key)
            s3_uri = f"s3://{self.s3_bucket}/{s3_key}"
            s3_uris.append(s3_uri)
            
            logger.info(f"Uploaded {filename} to {s3_uri}")
        
        return s3_uris
    
    def create_labeled_dataset(
        self,
        image_label_pairs: List[Tuple[str, List[str]]]
    ) -> List[Dict[str, Any]]:
        """
        Create a labeled dataset structure.
        
        Args:
            image_label_pairs: List of (image_path, labels) tuples
            
        Returns:
            List of dicts ready for manifest creation
        """
        dataset = []
        
        for image_path, labels in image_label_pairs:
            # Upload image
            s3_uris = self.upload_images([image_path])
            
            dataset.append({
                'image_s3_uri': s3_uris[0],
                'labels': labels
            })
        
        return dataset
    
    def split_dataset(
        self,
        dataset: List[Dict[str, Any]],
        test_ratio: float = 0.2
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Split dataset into training and test sets.
        
        Args:
            dataset: Full dataset
            test_ratio: Ratio of data to use for testing
            
        Returns:
            Tuple of (training_set, test_set)
        """
        import random
        random.shuffle(dataset)
        
        split_idx = int(len(dataset) * (1 - test_ratio))
        
        return dataset[:split_idx], dataset[split_idx:]


# =============================================================================
# SageMaker Training Pipeline
# =============================================================================

class SageMakerTrainer:
    """
    Training pipeline for Amazon SageMaker.
    
    Used for more advanced custom models that require
    more control over the training process.
    """
    
    def __init__(
        self,
        role_arn: str,
        region: str = "us-east-1",
        s3_bucket: str = "modeled-hair-engine"
    ):
        """
        Initialize the SageMaker trainer.
        
        Args:
            role_arn: IAM role ARN for SageMaker
            region: AWS region
            s3_bucket: S3 bucket for training data and outputs
        """
        self.role_arn = role_arn
        self.region = region
        self.s3_bucket = s3_bucket
        
        self.sagemaker = boto3.client('sagemaker', region_name=region)
    
    def create_training_job(
        self,
        job_name: str,
        training_image: str,
        hyperparameters: Dict[str, str],
        training_data_s3: str,
        output_s3: str,
        instance_type: str = "ml.p3.2xlarge",
        instance_count: int = 1,
        max_runtime: int = 86400
    ) -> str:
        """
        Create a SageMaker training job.
        
        Args:
            job_name: Name for the training job
            training_image: Docker image URI for training
            hyperparameters: Training hyperparameters
            training_data_s3: S3 URI for training data
            output_s3: S3 URI for model output
            instance_type: EC2 instance type
            instance_count: Number of instances
            max_runtime: Maximum runtime in seconds
            
        Returns:
            Training job ARN
        """
        response = self.sagemaker.create_training_job(
            TrainingJobName=job_name,
            AlgorithmSpecification={
                'TrainingImage': training_image,
                'TrainingInputMode': 'File'
            },
            RoleArn=self.role_arn,
            InputDataConfig=[
                {
                    'ChannelName': 'training',
                    'DataSource': {
                        'S3DataSource': {
                            'S3DataType': 'S3Prefix',
                            'S3Uri': training_data_s3,
                            'S3DataDistributionType': 'FullyReplicated'
                        }
                    }
                }
            ],
            OutputDataConfig={
                'S3OutputPath': output_s3
            },
            ResourceConfig={
                'InstanceType': instance_type,
                'InstanceCount': instance_count,
                'VolumeSizeInGB': 50
            },
            StoppingCondition={
                'MaxRuntimeInSeconds': max_runtime
            },
            HyperParameters=hyperparameters
        )
        
        logger.info(f"Created training job: {job_name}")
        return response['TrainingJobArn']
    
    def create_model(
        self,
        model_name: str,
        model_data_s3: str,
        inference_image: str
    ) -> str:
        """
        Create a SageMaker model from trained artifacts.
        
        Returns:
            Model ARN
        """
        response = self.sagemaker.create_model(
            ModelName=model_name,
            PrimaryContainer={
                'Image': inference_image,
                'ModelDataUrl': model_data_s3
            },
            ExecutionRoleArn=self.role_arn
        )
        
        logger.info(f"Created model: {model_name}")
        return response['ModelArn']
    
    def create_endpoint(
        self,
        endpoint_name: str,
        model_name: str,
        instance_type: str = "ml.m5.large",
        instance_count: int = 1
    ) -> str:
        """
        Create a SageMaker endpoint for inference.
        
        Returns:
            Endpoint ARN
        """
        # Create endpoint config
        config_name = f"{endpoint_name}-config"
        self.sagemaker.create_endpoint_config(
            EndpointConfigName=config_name,
            ProductionVariants=[
                {
                    'VariantName': 'AllTraffic',
                    'ModelName': model_name,
                    'InstanceType': instance_type,
                    'InitialInstanceCount': instance_count
                }
            ]
        )
        
        # Create endpoint
        response = self.sagemaker.create_endpoint(
            EndpointName=endpoint_name,
            EndpointConfigName=config_name
        )
        
        logger.info(f"Creating endpoint: {endpoint_name}")
        return response['EndpointArn']


# =============================================================================
# Example Usage
# =============================================================================

def example_training_workflow():
    """
    Example workflow for training a hair classification model.
    """
    # Initialize trainer
    trainer = RekognitionCustomLabelsTrainer(
        project_name="modeled-hair-classifier",
        s3_bucket="modeled-hair-engine"
    )
    
    # Create project
    project_arn = trainer.create_project()
    
    # Prepare dataset
    preparator = DatasetPreparator(s3_bucket="modeled-hair-engine")
    
    # Example labeled data
    labeled_data = [
        # (image_path, [labels])
        ("/path/to/image1.jpg", ["curl_3A", "length_medium"]),
        ("/path/to/image2.jpg", ["curl_4B", "length_short"]),
        # ... more images
    ]
    
    # Upload and prepare dataset
    dataset = preparator.create_labeled_dataset(labeled_data)
    train_set, test_set = preparator.split_dataset(dataset)
    
    # Create manifests
    trainer.prepare_manifest(train_set, "/tmp/train_manifest.json")
    trainer.prepare_manifest(test_set, "/tmp/test_manifest.json")
    
    # Upload manifests
    train_manifest_uri = trainer.upload_manifest_to_s3(
        "/tmp/train_manifest.json",
        "manifests/train_manifest.json"
    )
    test_manifest_uri = trainer.upload_manifest_to_s3(
        "/tmp/test_manifest.json",
        "manifests/test_manifest.json"
    )
    
    # Create datasets
    train_dataset_arn = trainer.create_dataset(train_manifest_uri, "TRAIN")
    test_dataset_arn = trainer.create_dataset(test_manifest_uri, "TEST")
    
    # Train model
    model_arn = trainer.train_model(
        output_s3_uri="s3://modeled-hair-engine/models/",
        training_dataset_arn=train_dataset_arn,
        test_dataset_arn=test_dataset_arn
    )
    
    # Wait for training
    results = trainer.wait_for_training()
    print(f"Training results: {results}")
    
    # Start model for inference
    trainer.start_model()
    
    return model_arn


if __name__ == "__main__":
    # Run example workflow
    example_training_workflow()

# prepare_other_datasets.py
"""
This script provides functions to download and prepare various
free datasets for the Modeled Hair Engine.
"""

import os
import requests
import zipfile
import tarfile
from pathlib import Path

# --- Configuration ---
DATA_DIR = Path("/home/ubuntu/datasets")

# --- Figaro1k ---
def download_figaro1k():
    """
    Downloads the Figaro1k dataset from OSF.
    Note: The dataset is hosted on OSF and requires manual download or
    using the OSF API. This function provides guidance.
    """
    figaro_dir = DATA_DIR / "figaro1k"
    figaro_dir.mkdir(parents=True, exist_ok=True)
    
    print("--- Figaro1k Dataset ---")
    print("The Figaro1k dataset is hosted on OSF (Open Science Framework).")
    print("To download:")
    print("1. Visit: https://osf.io/wg5u2/")
    print("2. Download 'Figaro1k.zip' and 'Patch-F1k.zip'")
    print(f"3. Extract them to: {figaro_dir}")
    print("\nAlternatively, use the OSF CLI:")
    print("  pip install osfclient")
    print("  osf -p wg5u2 clone figaro1k")
    print("\nDataset Structure after extraction:")
    print("  figaro1k/")
    print("    ├── Original/  (1050 original images)")
    print("    ├── GT/        (1050 ground truth hair masks)")
    print("    └── Patch-F1k/ (Hair/Non-hair patches)")
    print("\nClasses (7 hairstyles, 150 images each):")
    print("  - Straight (frame00001-00150)")
    print("  - Wavy (frame00151-00300)")
    print("  - Curly (frame00301-00450)")
    print("  - Kinky (frame00451-00600)")
    print("  - Braids (frame00601-00750)")
    print("  - Dreadlocks (frame00751-00900)")
    print("  - Short-men (frame00901-01050)")

# --- Roboflow Black Hair Dataset ---
def download_roboflow_black_hair():
    """
    Downloads the Black Hair Detection dataset from Roboflow.
    Requires a Roboflow account (free tier available).
    """
    roboflow_dir = DATA_DIR / "black_hair_roboflow"
    roboflow_dir.mkdir(parents=True, exist_ok=True)
    
    print("\n--- Black Hair Detection Dataset (Roboflow) ---")
    print("This dataset is CC BY 4.0 licensed - COMMERCIAL USE ALLOWED!")
    print("\nTo download:")
    print("1. Create a free Roboflow account: https://roboflow.com/")
    print("2. Visit: https://universe.roboflow.com/aishas-workspace/black-hair-detection")
    print("3. Click 'Download Dataset' and select your preferred format (YOLO, COCO, etc.)")
    print(f"4. Extract to: {roboflow_dir}")
    print("\nAlternatively, use the Roboflow Python SDK:")
    print("  pip install roboflow")
    print("  from roboflow import Roboflow")
    print("  rf = Roboflow(api_key='YOUR_API_KEY')")
    print("  project = rf.workspace('aishas-workspace').project('black-hair-detection')")
    print("  dataset = project.version(1).download('yolov8')")
    print("\nClasses (10 inclusive hairstyles):")
    print("  afro, bantu_knots, bob, braids, cornrows,")
    print("  fade, locs, long, sisterlocs, twa")

# --- FairFace Dataset ---
def download_fairface():
    """
    Downloads the FairFace dataset from GitHub/Hugging Face.
    """
    fairface_dir = DATA_DIR / "fairface"
    fairface_dir.mkdir(parents=True, exist_ok=True)
    
    print("\n--- FairFace Dataset ---")
    print("FairFace provides balanced race, gender, and age annotations.")
    print("License: Apache 2.0 - COMMERCIAL USE ALLOWED!")
    print("\nTo download from Hugging Face:")
    print("  pip install datasets")
    print("  from datasets import load_dataset")
    print("  dataset = load_dataset('HuggingFaceM4/FairFace')")
    print(f"  # Save to {fairface_dir}")
    print("\nOr download directly from GitHub:")
    print("  git clone https://github.com/joojs/fairface.git")
    print("  # Follow instructions in the repo to download images")
    print("\nRace Categories (7):")
    print("  White, Black, Indian, East Asian,")
    print("  Southeast Asian, Middle Eastern, Latino_Hispanic")
    print("\nAge Groups (9):")
    print("  0-2, 3-9, 10-19, 20-29, 30-39, 40-49, 50-59, 60-69, 70+")

# --- UTKFace Dataset ---
def download_utkface():
    """
    Downloads the UTKFace dataset from Kaggle.
    """
    utkface_dir = DATA_DIR / "utkface"
    utkface_dir.mkdir(parents=True, exist_ok=True)
    
    print("\n--- UTKFace Dataset ---")
    print("UTKFace provides age, gender, and ethnicity annotations.")
    print("License: Non-Commercial Research Only")
    print("\nTo download from Kaggle:")
    print("  pip install kaggle")
    print("  kaggle datasets download -d jangedoo/utkface-new")
    print(f"  # Extract to {utkface_dir}")
    print("\nFile naming convention: [age]_[gender]_[race]_[date&time].jpg")
    print("  Gender: 0=Male, 1=Female")
    print("  Race: 0=White, 1=Black, 2=Asian, 3=Indian, 4=Others")

# --- LIP (Look Into Person) Dataset ---
def download_lip():
    """
    Downloads the LIP dataset from SYSU-HCP.
    """
    lip_dir = DATA_DIR / "lip"
    lip_dir.mkdir(parents=True, exist_ok=True)
    
    print("\n--- LIP (Look Into Person) Dataset ---")
    print("LIP provides full-body human parsing with hair segmentation.")
    print("License: Research Use Only")
    print("\nTo download:")
    print("1. Visit: https://www.sysu-hcp.net/resources/datasets/")
    print("2. Request access and download the LIP dataset")
    print(f"3. Extract to: {lip_dir}")
    print("\nKey Labels (20 categories including):")
    print("  Background, Hat, HAIR, Glove, Sunglasses,")
    print("  Upper-clothes, Dress, Coat, Socks, Pants, etc.")

# --- Kaggle Hair Datasets ---
def download_kaggle_hair_datasets():
    """
    Provides instructions for downloading various Kaggle hair datasets.
    """
    kaggle_dir = DATA_DIR / "kaggle_hair"
    kaggle_dir.mkdir(parents=True, exist_ok=True)
    
    print("\n--- Kaggle Hair Datasets ---")
    print("Multiple hair-related datasets are available on Kaggle.")
    print("First, set up Kaggle API:")
    print("  pip install kaggle")
    print("  # Place kaggle.json in ~/.kaggle/")
    print("\nRecommended datasets:")
    print("\n1. Hair Type Dataset:")
    print("   kaggle datasets download -d kavyasreeb/hair-type-dataset")
    print("\n2. Hair Detection & Segmentation Dataset:")
    print("   kaggle datasets download -d trainingdatapro/hair-detection-and-segmentation-dataset")
    print("\n3. Hair Segmentation Dataset (from CelebAMask-HQ):")
    print("   kaggle datasets download -d siddhantkulkarni73/hair-segmentation-dataset")
    print("\n4. The Three Hair Types:")
    print("   kaggle datasets download -d vyombhatia/the-three-hair-types")
    print(f"\nExtract all to: {kaggle_dir}")

# --- FFHQ Dataset ---
def download_ffhq():
    """
    Provides instructions for downloading the FFHQ dataset.
    """
    ffhq_dir = DATA_DIR / "ffhq"
    ffhq_dir.mkdir(parents=True, exist_ok=True)
    
    print("\n--- FFHQ (Flickr-Faces-HQ) Dataset ---")
    print("FFHQ provides 70,000 high-quality face images at 1024x1024.")
    print("License: Varies by image (Creative Commons)")
    print("\nTo download:")
    print("1. From Kaggle (512x512 version):")
    print("   kaggle datasets download -d arnaud58/flickrfaceshq-dataset-ffhq")
    print("\n2. From Archive.org (full 1024x1024):")
    print("   https://archive.org/download/ffhq-dataset")
    print("\n3. From NVIDIA GitHub (with download script):")
    print("   git clone https://github.com/NVlabs/ffhq-dataset.git")
    print("   python download_ffhq.py --tfrecords")
    print(f"\nExtract to: {ffhq_dir}")

# --- Main Execution ---
if __name__ == "__main__":
    print("=" * 60)
    print("MODELED HAIR ENGINE - DATASET DOWNLOAD GUIDE")
    print("=" * 60)
    
    download_figaro1k()
    download_roboflow_black_hair()
    download_fairface()
    download_utkface()
    download_lip()
    download_kaggle_hair_datasets()
    download_ffhq()
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"\nAll datasets should be downloaded to: {DATA_DIR}")
    print("\nCommercially-usable datasets (prioritize these!):")
    print("  - Black Hair Detection (Roboflow) - CC BY 4.0")
    print("  - FairFace - Apache 2.0")
    print("\nResearch-only datasets (use for prototyping):")
    print("  - CelebA / CelebAMask-HQ")
    print("  - Figaro1k")
    print("  - UTKFace")
    print("  - LIP")

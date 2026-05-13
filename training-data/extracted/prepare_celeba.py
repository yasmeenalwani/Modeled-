# prepare_celeba.py

import os
import gdown
import zipfile
import tarfile
import pandas as pd
from PIL import Image

# --- Configuration ---
DATA_DIR = "/home/ubuntu/datasets"
CELEBA_DIR = os.path.join(DATA_DIR, "celeba")
CELEBAMASK_DIR = os.path.join(DATA_DIR, "celebamask_hq")

# Google Drive File IDs
CELEBA_IMG_ID = "1_ee_0u7vcNLOfNLegJRHmJd84sEve465"
CELEBA_ATTR_ID = "1_LR_i1CBL140o7o2HEwJ1jmgtS72hFpA"
CELEBAMASK_DATA_ID = "1badu11NqxR_X3x3Ea3c22Hw2d22-s-3_"

# --- Helper Functions ---
def download_and_unzip(file_id, output_dir, filename):
    """Downloads a file from Google Drive and unzips it."""
    os.makedirs(output_dir, exist_ok=True)
    zip_path = os.path.join(output_dir, filename)
    
    if not os.path.exists(zip_path):
        print(f"Downloading {filename}...")
        gdown.download(id=file_id, output=zip_path, quiet=False)
    else:
        print(f"{filename} already downloaded.")

    if zip_path.endswith(".zip"):
        print(f"Unzipping {filename}...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(output_dir)
        print("Unzip complete.")
    elif zip_path.endswith(".tar.gz"):
        print(f"Extracting {filename}...")
        with tarfile.open(zip_path, "r:gz") as tar:
            tar.extractall(path=output_dir)
        print("Extraction complete.")

def process_celeba_attributes(attr_path, output_path):
    """Processes the CelebA attribute file into a clean CSV."""
    if os.path.exists(output_path):
        print("CelebA attributes already processed.")
        return

    print("Processing CelebA attributes...")
    # The first two lines are headers, so we skip them
    df = pd.read_csv(attr_path, sep="\s+", header=1)
    df.index.name = 'image_id'
    # Convert -1/1 to 0/1 for binary attributes
    df.replace(-1, 0, inplace=True)
    df.to_csv(output_path)
    print(f"Cleaned attributes saved to {output_path}")

def process_celebamask_hq(mask_dir):
    """Separates hair masks from the other segmentation masks."""
    hair_mask_dir = os.path.join(mask_dir, "hair_masks")
    os.makedirs(hair_mask_dir, exist_ok=True)
    
    label_dir = os.path.join(mask_dir, "CelebAMask-HQ-mask-anno")
    # The labels are in subdirectories, so we need to walk through them
    image_count = len(os.listdir(os.path.join(mask_dir, "CelebA-HQ-img")))
    processed_count = len(os.listdir(hair_mask_dir))

    if processed_count == image_count:
        print("CelebAMask-HQ hair masks already processed.")
        return

    print("Processing CelebAMask-HQ masks to extract hair...")
    # Mapping from label index to part name
    # Hair is label 13
    hair_label_index = 13

    for i in range(15): # 15 subdirectories for masks
        sub_dir = os.path.join(label_dir, str(i))
        if not os.path.isdir(sub_dir):
            continue
        
        for mask_file in os.listdir(sub_dir):
            if not mask_file.endswith(".png"):
                continue
            
            mask_path = os.path.join(sub_dir, mask_file)
            output_hair_mask_path = os.path.join(hair_mask_dir, mask_file)

            if os.path.exists(output_hair_mask_path):
                continue

            mask = Image.open(mask_path).convert("L")
            # Create a binary mask where only hair pixels are white
            hair_mask = mask.point(lambda p: 255 if p == hair_label_index else 0)
            hair_mask.save(output_hair_mask_path)

    print("Hair mask extraction complete.")

# --- Main Execution ---
if __name__ == "__main__":
    # 1. Download and prepare CelebA
    print("--- Processing CelebA ---")
    download_and_unzip(CELEBA_IMG_ID, CELEBA_DIR, "img_align_celeba.zip")
    download_and_unzip(CELEBA_ATTR_ID, CELEBA_DIR, "list_attr_celeba.txt")
    process_celeba_attributes(
        os.path.join(CELEBA_DIR, "list_attr_celeba.txt"),
        os.path.join(CELEBA_DIR, "celeba_attributes_clean.csv")
    )

    # 2. Download and prepare CelebAMask-HQ
    print("\n--- Processing CelebAMask-HQ ---")
    download_and_unzip(CELEBAMASK_DATA_ID, CELEBAMASK_DIR, "CelebAMask-HQ.tar.gz")
    process_celebamask_hq(CELEBAMASK_DIR)

    print("\nAll datasets prepared successfully!")

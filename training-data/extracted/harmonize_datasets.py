# harmonize_datasets.py
"""
This script harmonizes multiple hair datasets into a unified format
aligned with the Modeled Hair Engine taxonomy.
"""

import os
import json
import pandas as pd
from pathlib import Path
from PIL import Image
import shutil

# --- Configuration ---
DATA_DIR = Path("/home/ubuntu/datasets")
OUTPUT_DIR = Path("/home/ubuntu/datasets/unified_hair_dataset")

# --- Master Taxonomy Mappings ---
# These mappings translate source dataset labels to our master taxonomy

CURL_PATTERN_MAP = {
    # Figaro1k mappings
    "straight": "TYPE_1",
    "wavy": "TYPE_2",
    "curly": "TYPE_3",
    "kinky": "TYPE_4",
    "braids": "PROTECTIVE_BRAIDS",
    "dreadlocks": "PROTECTIVE_LOCS",
    "short-men": "SHORT",
    
    # CelebA mappings (binary attributes)
    "Straight_Hair": "TYPE_1",
    "Wavy_Hair": "TYPE_2",
}

HAIR_COLOR_MAP = {
    # CelebA mappings
    "Black_Hair": "LEVEL_1_2_BLACK",
    "Brown_Hair": "LEVEL_4_5_BROWN",
    "Blond_Hair": "LEVEL_8_9_BLONDE",
    "Gray_Hair": "GRAY_SILVER",
    "Bald": "BALD",
}

HAIRSTYLE_MAP = {
    # Black Hair Dataset (Roboflow) mappings
    "afro": "AFRO",
    "bantu_knots": "BANTU_KNOTS",
    "bob": "BOB",
    "braids": "BRAIDS",
    "cornrows": "CORNROWS",
    "fade": "FADE",
    "locs": "LOCS",
    "long": "LONG",
    "sisterlocs": "SISTERLOCS",
    "twa": "TWA",
}

# --- Helper Functions ---
def create_unified_structure():
    """Creates the directory structure for the unified dataset."""
    dirs = [
        OUTPUT_DIR / "images",
        OUTPUT_DIR / "masks",
        OUTPUT_DIR / "annotations",
    ]
    for d in dirs:
        d.mkdir(parents=True, exist_ok=True)
    print(f"Created unified dataset structure at: {OUTPUT_DIR}")

def process_celeba_to_unified(celeba_dir, celebamask_dir, limit=None):
    """
    Processes CelebA and CelebAMask-HQ into the unified format.
    
    Args:
        celeba_dir: Path to CelebA dataset
        celebamask_dir: Path to CelebAMask-HQ dataset
        limit: Optional limit on number of images to process
    """
    print("\n--- Processing CelebA + CelebAMask-HQ ---")
    
    # Load CelebA attributes
    attr_path = celeba_dir / "celeba_attributes_clean.csv"
    if not attr_path.exists():
        print(f"Warning: {attr_path} not found. Run prepare_celeba.py first.")
        return []
    
    df = pd.read_csv(attr_path, index_col=0)
    
    # CelebAMask-HQ uses a subset of CelebA images (first 30,000)
    mask_dir = celebamask_dir / "hair_masks"
    img_dir = celebamask_dir / "CelebA-HQ-img"
    
    if not mask_dir.exists():
        print(f"Warning: {mask_dir} not found. Run prepare_celeba.py first.")
        return []
    
    records = []
    mask_files = sorted(os.listdir(mask_dir))[:limit] if limit else sorted(os.listdir(mask_dir))
    
    for i, mask_file in enumerate(mask_files):
        if i % 1000 == 0:
            print(f"  Processing {i}/{len(mask_files)}...")
        
        # Extract image index from mask filename
        # CelebAMask-HQ mask files are named like "00000_hair.png"
        img_idx = int(mask_file.split("_")[0])
        
        # Find corresponding CelebA attributes
        celeba_img_name = f"{img_idx:06d}.jpg"
        if celeba_img_name not in df.index:
            continue
        
        attrs = df.loc[celeba_img_name]
        
        # Map attributes to our taxonomy
        hair_colors = []
        for celeba_attr, our_label in HAIR_COLOR_MAP.items():
            if celeba_attr in attrs and attrs[celeba_attr] == 1:
                hair_colors.append(our_label)
        
        curl_patterns = []
        for celeba_attr, our_label in CURL_PATTERN_MAP.items():
            if celeba_attr in attrs and attrs[celeba_attr] == 1:
                curl_patterns.append(our_label)
        
        # Create unified record
        unified_id = f"celeba_{img_idx:06d}"
        record = {
            "id": unified_id,
            "source": "CelebAMask-HQ",
            "original_filename": celeba_img_name,
            "image_path": str(OUTPUT_DIR / "images" / f"{unified_id}.jpg"),
            "mask_path": str(OUTPUT_DIR / "masks" / f"{unified_id}_hair.png"),
            "hair_colors": hair_colors,
            "curl_patterns": curl_patterns,
            "hairstyles": [],
            "has_bangs": bool(attrs.get("Bangs", 0)),
            "is_bald": bool(attrs.get("Bald", 0)),
            "license": "non-commercial",
        }
        records.append(record)
        
        # Copy files to unified directory
        src_img = img_dir / f"{img_idx}.jpg"
        src_mask = mask_dir / mask_file
        
        if src_img.exists():
            shutil.copy(src_img, record["image_path"])
        if src_mask.exists():
            shutil.copy(src_mask, record["mask_path"])
    
    print(f"  Processed {len(records)} images from CelebAMask-HQ")
    return records

def process_figaro1k_to_unified(figaro_dir, limit=None):
    """
    Processes Figaro1k into the unified format.
    """
    print("\n--- Processing Figaro1k ---")
    
    original_dir = figaro_dir / "Original"
    gt_dir = figaro_dir / "GT"
    
    if not original_dir.exists():
        print(f"Warning: {original_dir} not found. Download Figaro1k first.")
        return []
    
    records = []
    
    # Figaro1k class mapping based on frame numbers
    class_ranges = [
        (1, 150, "straight"),
        (151, 300, "wavy"),
        (301, 450, "curly"),
        (451, 600, "kinky"),
        (601, 750, "braids"),
        (751, 900, "dreadlocks"),
        (901, 1050, "short-men"),
    ]
    
    for start, end, class_name in class_ranges:
        for frame_num in range(start, end + 1):
            if limit and len(records) >= limit:
                break
            
            img_file = f"frame{frame_num:05d}.jpg"
            mask_file = f"frame{frame_num:05d}.pbm"
            
            src_img = original_dir / img_file
            src_mask = gt_dir / mask_file
            
            if not src_img.exists():
                continue
            
            unified_id = f"figaro_{frame_num:05d}"
            curl_pattern = CURL_PATTERN_MAP.get(class_name, "UNKNOWN")
            
            record = {
                "id": unified_id,
                "source": "Figaro1k",
                "original_filename": img_file,
                "image_path": str(OUTPUT_DIR / "images" / f"{unified_id}.jpg"),
                "mask_path": str(OUTPUT_DIR / "masks" / f"{unified_id}_hair.png"),
                "hair_colors": [],
                "curl_patterns": [curl_pattern] if curl_pattern != "UNKNOWN" else [],
                "hairstyles": [class_name.upper()],
                "has_bangs": None,
                "is_bald": False,
                "license": "non-commercial",
            }
            records.append(record)
            
            # Copy and convert files
            shutil.copy(src_img, record["image_path"])
            if src_mask.exists():
                # Convert PBM to PNG
                mask = Image.open(src_mask).convert("L")
                mask.save(record["mask_path"])
    
    print(f"  Processed {len(records)} images from Figaro1k")
    return records

def save_unified_annotations(records):
    """Saves all records to a unified JSON annotation file."""
    output_path = OUTPUT_DIR / "annotations" / "unified_annotations.json"
    
    with open(output_path, "w") as f:
        json.dump(records, f, indent=2)
    
    print(f"\nSaved {len(records)} records to {output_path}")
    
    # Also create a CSV summary
    df = pd.DataFrame(records)
    csv_path = OUTPUT_DIR / "annotations" / "unified_summary.csv"
    df.to_csv(csv_path, index=False)
    print(f"Saved summary CSV to {csv_path}")

def generate_statistics(records):
    """Generates and prints statistics about the unified dataset."""
    print("\n" + "=" * 50)
    print("UNIFIED DATASET STATISTICS")
    print("=" * 50)
    
    df = pd.DataFrame(records)
    
    print(f"\nTotal images: {len(df)}")
    print(f"\nBy source:")
    print(df["source"].value_counts().to_string())
    
    print(f"\nBy license:")
    print(df["license"].value_counts().to_string())
    
    # Count curl patterns
    all_patterns = []
    for patterns in df["curl_patterns"]:
        all_patterns.extend(patterns)
    print(f"\nCurl pattern distribution:")
    print(pd.Series(all_patterns).value_counts().to_string())
    
    # Count hair colors
    all_colors = []
    for colors in df["hair_colors"]:
        all_colors.extend(colors)
    print(f"\nHair color distribution:")
    print(pd.Series(all_colors).value_counts().to_string())

# --- Main Execution ---
if __name__ == "__main__":
    print("=" * 60)
    print("MODELED HAIR ENGINE - DATASET HARMONIZATION")
    print("=" * 60)
    
    # Create unified structure
    create_unified_structure()
    
    all_records = []
    
    # Process each dataset (use limit for testing)
    LIMIT = 100  # Set to None for full processing
    
    celeba_records = process_celeba_to_unified(
        DATA_DIR / "celeba",
        DATA_DIR / "celebamask_hq",
        limit=LIMIT
    )
    all_records.extend(celeba_records)
    
    figaro_records = process_figaro1k_to_unified(
        DATA_DIR / "figaro1k",
        limit=LIMIT
    )
    all_records.extend(figaro_records)
    
    # Save unified annotations
    if all_records:
        save_unified_annotations(all_records)
        generate_statistics(all_records)
    else:
        print("\nNo records processed. Please download the datasets first.")

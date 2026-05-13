
# A Practical Guide to Leveraging Free Datasets for the Modeled Hair Engine

**Date:** December 22, 2025
**Author:** Manus AI

## Introduction

To accelerate the development of the **Modeled Hair Engine**, leveraging existing public and academic datasets is an essential and cost-effective strategy. These datasets provide hundreds of thousands of images that can be used for initial model training, prototyping, and identifying the unique data requirements for your proprietary system. However, navigating the landscape of free datasets requires a strategic approach to handle challenges such as licensing, data quality, and inherent biases.

This guide provides a comprehensive, step-by-step walkthrough for integrating these free resources into your development pipeline. It covers the strategic considerations you must be aware of, provides practical Python code for downloading and processing the data, and offers a clear path for harmonizing disparate data sources into a unified, high-quality training set that aligns with your proprietary taxonomy.

### Master Dataset Summary

This table provides a high-level overview of the key free datasets identified for this project. The subsequent sections will delve into the technical details of integrating each one.

| Dataset Name | Total Images | Key Hair Features | License Type | Commercial Use? |
| :--- | :--- | :--- | :--- | :--- |
| **CelebA** | ~202,000 | Color (4), Type (2), Bangs | Non-Commercial | **No** |
| **CelebAMask-HQ** | 30,000 | **Hair Segmentation Masks** | Non-Commercial | **No** |
| **Figaro1k** | 1,050 | Hair Segmentation, Type (7) | Non-Commercial | **No** |
| **LFW Hair** | ~2,000 | Hair Segmentation Masks | Fair Use (Gray Area) | **Not Recommended** |
| **UTKFace** | ~20,000 | Demographics (Age, Gender) | Non-Commercial | **No** |
| **Black Hair (Roboflow)** | ~700 | **Inclusive Styles (10)** | **CC BY 4.0** | **Yes (with attribution)** |
| **FFHQ** | 70,000 | High-Resolution Faces | Varies (CC) | Varies (Requires Filtering) |
| **FairFace** | ~108,000 | **Balanced Demographics** | Apache 2.0 | **Yes** |
| **LIP Dataset** | ~50,000 | Full Body Parsing (Hair) | Research Use | **No** |
| **Kaggle Datasets** | Varies | Various (Type, Segmentation) | Varies | Varies |

---


## 2. Integrating CelebA and CelebAMask-HQ

**CelebA** is the cornerstone dataset for facial attributes, while its high-quality counterpart, **CelebAMask-HQ**, provides the essential segmentation masks needed to isolate the hair region. Integrating them is the first and most critical step.

### 2.1. Automated Download and Preparation

To streamline this process, we have created a Python script that automates the downloading, extraction, and initial processing of both datasets. This script will:

1.  Download the aligned and cropped images from CelebA.
2.  Download the 40 binary attribute annotations.
3.  Process the raw attribute file into a clean, usable CSV format, converting the `(-1, 1)` labels to `(0, 1)`.
4.  Download the complete CelebAMask-HQ dataset, which includes the high-resolution images and the multi-class segmentation masks.
5.  Iterate through all 30,000 segmentation masks and extract a **binary hair mask** for each image, saving it to a separate directory. This is crucial for isolating the hair for analysis.

### 2.2. How to Use the Script

The script, `prepare_celeba.py`, is included in the `dataset_processing_scripts` directory. Before running, ensure you have the necessary Python packages installed:

```bash
# It is highly recommended to use a virtual environment
python3.11 -m venv venv
source venv/bin/activate

pip3 install pandas gdown Pillow
```

Once the packages are installed, you can run the script directly from the terminal:

```bash
python3.11 /home/ubuntu/project_guides/dataset_processing_scripts/prepare_celeba.py
```

The script will create a `/home/ubuntu/datasets` directory and populate it with the processed data. The final directory structure will look like this:

```
/home/ubuntu/datasets/
├── celeba/
│   ├── img_align_celeba/ (202,599 images)
│   ├── list_attr_celeba.txt
│   └── celeba_attributes_clean.csv  <-- Your main attribute file
└── celebamask_hq/
    ├── CelebA-HQ-img/ (30,000 images)
    ├── CelebAMask-HQ-mask-anno/ (Raw masks)
    └── hair_masks/ (30,000 binary hair masks) <-- Your hair segmentation masks
```

### 2.3. Strategic Application

- **Attribute Data (`celeba_attributes_clean.csv`):** This file will be your primary source for training the initial attribute classifiers, especially for the four basic hair colors (`Black_Hair`, `Blond_Hair`, `Brown_Hair`, `Gray_Hair`) and styles (`Straight_Hair`, `Wavy_Hair`).
- **Hair Masks (`hair_masks/`):** These masks are essential for training your hair segmentation model (e.g., a U-Net). They allow the model to learn to accurately separate the hair from the background and the face, which is a prerequisite for any further analysis.

**Important Consideration:** Remember that this data is for **non-commercial use only**. It is perfect for building and testing your prototype, but you must replace it with your own commercially-licensed data for your final product.

---


## 3. Integrating Other Key Datasets

Beyond CelebA and CelebAMask-HQ, several other datasets provide complementary data that can significantly enhance your model's capabilities and fairness. The script `prepare_other_datasets.py` provides detailed instructions for downloading each of these.

### 3.1. Figaro1k (Hair Segmentation & Classification)

Figaro1k is a specialized dataset for hair analysis, containing 1,050 images with both segmentation masks and hairstyle class labels. It is particularly valuable because it includes explicit labels for curl patterns and protective styles.

**Key Features:**
- Seven hairstyle classes: Straight, Wavy, Curly, Kinky, Braids, Dreadlocks, Short-men.
- Ground truth segmentation masks for each image.
- Includes an auxiliary `Patch-F1k` dataset for training hair detection at the patch level.

**Download:** The dataset is hosted on OSF (Open Science Framework). Visit `https://osf.io/wg5u2/` to download.

### 3.2. Black Hair Detection Dataset (Roboflow) - **Commercially Usable**

This dataset is a critical resource for building an inclusive hair engine. It focuses specifically on hairstyles common in the Black community, which are often underrepresented in mainstream datasets.

**Key Features:**
- **CC BY 4.0 License:** This dataset can be used for commercial purposes with proper attribution.
- Ten inclusive hairstyle classes: Afro, Bantu Knots, Bob, Braids, Cornrows, Fade, Locs, Long, Sisterlocs, TWA.
- Pre-trained YOLOv8 model available with 91.1% mAP.

**Download:** Create a free Roboflow account and download from `https://universe.roboflow.com/aishas-workspace/black-hair-detection`.

### 3.3. FairFace (Balanced Demographics) - **Commercially Usable**

FairFace is designed to address the demographic bias present in many face datasets. It provides balanced representation across seven race groups, nine age groups, and two genders.

**Key Features:**
- **Apache 2.0 License:** Commercially usable.
- Over 108,000 images with balanced demographics.
- Ideal for training models that need to perform fairly across different skin tones and ethnicities.

**Download:** Available via Hugging Face (`HuggingFaceM4/FairFace`) or the official GitHub repository.

### 3.4. LIP (Look Into Person) Dataset

LIP is a large-scale human parsing dataset that includes hair as one of its 20 semantic categories. It is useful for training models that need to identify hair in full-body images, not just close-up portraits.

**Key Features:**
- Over 50,000 images with pixel-level annotations.
- Includes hair, face, and various clothing categories.
- Useful for applications where the user might upload a full-body photo.

**Download:** Request access from the SYSU-HCP Lab website.

---

## 4. Harmonizing Datasets into a Unified Format

A critical step in building a robust model is to **harmonize** the disparate datasets into a single, unified format. Each dataset uses different label names, file structures, and annotation formats. The `harmonize_datasets.py` script addresses this by:

1.  **Mapping Labels to a Master Taxonomy:** The script contains dictionaries that map the original labels from each dataset (e.g., `Straight_Hair` from CelebA, `straight` from Figaro1k) to a single, consistent label in our master taxonomy (e.g., `TYPE_1`).
2.  **Standardizing File Formats:** Images are copied to a central `images/` directory, and masks are converted to a standard PNG format in a `masks/` directory.
3.  **Creating a Unified Annotation File:** All metadata is compiled into a single JSON file (`unified_annotations.json`) that contains the image path, mask path, source dataset, and all mapped labels for each image.

### 4.1. The Unified Data Schema

Each record in the unified annotation file follows this schema:

```json
{
  "id": "celeba_000001",
  "source": "CelebAMask-HQ",
  "original_filename": "000001.jpg",
  "image_path": "/home/ubuntu/datasets/unified_hair_dataset/images/celeba_000001.jpg",
  "mask_path": "/home/ubuntu/datasets/unified_hair_dataset/masks/celeba_000001_hair.png",
  "hair_colors": ["LEVEL_4_5_BROWN"],
  "curl_patterns": ["TYPE_2"],
  "hairstyles": [],
  "has_bangs": true,
  "is_bald": false,
  "license": "non-commercial"
}
```

This unified format allows you to easily load and iterate through the combined dataset during model training, regardless of the original source.

---

## 5. Strategic Recommendations for Data Usage

Based on the licensing and characteristics of each dataset, here is a recommended strategy for using them throughout your development lifecycle:

| Development Phase | Recommended Datasets | Rationale |
| :--- | :--- | :--- |
| **Phase 1: MVP Prototyping** | CelebA, CelebAMask-HQ, Figaro1k | Large volume of data for initial model training and testing. Non-commercial use is acceptable for internal R&D. |
| **Phase 2: Fairness & Inclusion Testing** | FairFace, Black Hair (Roboflow) | Evaluate model performance across demographics. Identify biases and data gaps. |
| **Phase 3: Transfer Learning Foundation** | CelebAMask-HQ (for segmentation), CelebA (for attributes) | Pre-train models on large non-commercial datasets. The learned features can be transferred to your proprietary model. |
| **Phase 4: Commercial Product Training** | **Your Proprietary Dataset**, Black Hair (Roboflow), FairFace | Fine-tune your models on commercially-licensed data. The pre-trained weights from Phase 3 will accelerate training. |

---

## 6. Conclusion

Leveraging free datasets is a powerful accelerator for the development of the Modeled Hair Engine. By following this guide, you can efficiently download, process, and harmonize these resources into a unified training set. However, always remain mindful of the licensing restrictions. The ultimate goal is to use these free resources to inform and bootstrap the creation of your own proprietary, commercially-licensed dataset, which will be the true foundation of your competitive advantage.

The provided scripts (`prepare_celeba.py`, `prepare_other_datasets.py`, `harmonize_datasets.py`) are designed to be run sequentially and can be easily extended to incorporate new datasets as they become available.

---

## References

1.  CelebA Dataset: [https://mmlab.ie.cuhk.edu.hk/projects/CelebA.html](https://mmlab.ie.cuhk.edu.hk/projects/CelebA.html)
2.  CelebAMask-HQ: [https://github.com/switchablenorms/CelebAMask-HQ](https://github.com/switchablenorms/CelebAMask-HQ)
3.  Figaro1k: [https://www.michelesvanera.org/figaro-1k/](https://www.michelesvanera.org/figaro-1k/)
4.  Black Hair Detection (Roboflow): [https://universe.roboflow.com/aishas-workspace/black-hair-detection](https://universe.roboflow.com/aishas-workspace/black-hair-detection)
5.  FairFace: [https://github.com/joojs/fairface](https://github.com/joojs/fairface)
6.  UTKFace: [https://susanqq.github.io/UTKFace/](https://susanqq.github.io/UTKFace/)
7.  LIP Dataset: [https://www.sysu-hcp.net/resources/datasets/](https://www.sysu-hcp.net/resources/datasets/)
8.  FFHQ: [https://github.com/NVlabs/ffhq-dataset](https://github.com/NVlabs/ffhq-dataset)
